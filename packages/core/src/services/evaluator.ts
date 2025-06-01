/**
 * Evaluator V2 - Refactored to use Strategy pattern for operators
 */

import { ObjectDiscovery } from "@root/services/object-discovery";
import { operatorRegistry } from "@root/operators/registry";
import { ConditionTypes } from "@root/enums";
import { isStringOperator } from "@root/operators";
import type {
  RuleType,
  EvaluationResult,
  EngineResult,
  CriteriaObject,
  Criteria,
  Constraint,
  Condition,
} from "@root/types";
import type { OperatorContext } from "@root/operators/base";

export class Evaluator<T = any> {
  private readonly discovery = new ObjectDiscovery<T>();

  /**
   * Evaluates a rule against a single criteria object and returns a single result.
   *
   * @param rule The rule to evaluate.
   * @param criteria The criteria object to evaluate the rule against.
   * @returns {EvaluationResult} The result of the rule evaluation.
   */
  evaluate(rule: RuleType, criteria: CriteriaObject<T>): EvaluationResult<T>;

  /**
   * Evaluates a rule against an array of criteria and returns an array of results.
   *
   * @param rule The rule to evaluate.
   * @param criteria The array of criteria to evaluate the rule against.
   * @returns {Array<EvaluationResult>} An array of rule evaluation results.
   */
  evaluate(rule: RuleType, criteria: Array<T>): Array<EvaluationResult<T>>;

  /**
   * Evaluates a rule against a set of criteria and returns the result.
   * If the criteria is an array (indicating multiple criteria to test),
   * the rule will be evaluated against each item in the array and
   * an array of results will be returned.
   *
   * @param rule The rule to evaluate.
   * @param criteria The criteria to evaluate the rule against.
   * @returns {EvaluationResult} The result of the rule evaluation.
   */
  evaluate(
    rule: RuleType,
    criteria: Criteria,
  ): EvaluationResult<T> | Array<EvaluationResult<T>> {
    // Cater for the case where the condition property is not an array.
    const conditions = this.discovery.getConditions(rule);

    if (Array.isArray(criteria)) {
      const result: Array<EvaluationResult<T>> = [];
      for (const $criteria of criteria) {
        result.push(this.evaluateRule(conditions, $criteria, rule?.default));
      }

      return result;
    }

    return this.evaluateRule(conditions, criteria, rule?.default);
  }

  /**
   * Evaluates a rule against a set of criteria and returns the result.
   * If no conditions pass, the default result is returned.
   * If no default result is provided, false is returned.
   *
   * @param conditions The conditions to evaluate.
   * @param criteria The criteria to evaluate the conditions against.
   * @param defaultResult The default result to return if no conditions pass.
   * @returns {EvaluationResult} The result of the rule evaluation.
   */
  private evaluateRule(
    conditions: Array<Condition<T>>,
    criteria: Criteria,
    defaultResult?: EngineResult<T>,
  ): EvaluationResult<T> {
    // We should evaluate all conditions and return the result
    // of the first condition that passes.
    let lastErrorMessage: string | undefined;

    for (const condition of conditions) {
      const evaluationResult = this.evaluateCondition(condition, criteria);
      if (evaluationResult.isPassed) {
        const message = (condition?.result as EvaluationResult)?.message;
        return this.mutateResultMessage(
          {
            value: evaluationResult.value,
            isPassed: evaluationResult.isPassed,
            message,
          },
          criteria,
          true,
        );
      }
      // Don't return early on validation errors - continue evaluating other conditions
      // Store the last error message to return if no conditions pass
      if (evaluationResult.message) {
        lastErrorMessage = evaluationResult.message;
      }
    }

    const message =
      lastErrorMessage || (defaultResult as EvaluationResult)?.message;
    // If no conditions pass, we should return the default result of
    // the rule or false if no default result is provided.
    return this.mutateResultMessage(
      {
        value: defaultResult?.value as T,
        isPassed: false,
        message,
      },
      criteria,
      false,
    );
  }

  /**
   * Evaluates a condition against a set of criteria and returns the result.
   * Uses recursion to evaluate nested conditions.
   * @param condition The condition to evaluate.
   * @param criteria The criteria to evaluate the condition against.
   */
  private evaluateCondition(
    condition: Condition<T>,
    criteria: Criteria,
  ): EvaluationResult<T> {
    // The condition must have an 'any' or 'all' property.
    const conditionType = this.discovery.conditionType(condition);
    if (!conditionType) {
      return {
        value: false as T,
        isPassed: false,
        message: `Invalid condition type. Please provide a valid condition type. The condition type is case-sensitive.`,
      };
    }

    // If the type is 'and' or 'none', we should set the initial
    // result to true, otherwise we should set it to false.
    let isPassed = [ConditionTypes.AND, ConditionTypes.NONE].includes(
      conditionType,
    );
    // The result of the condition evaluation.
    // Defaults to the initial value.
    // This is used to store the result of the condition evaluation.
    let value = isPassed as T;
    // The result message. Defaults to an empty string. This is used to store the result message.
    let message: string | undefined;

    // Check each node in the condition.
    processLoop: for (const node of condition[conditionType]!) {
      const isCondition = this.discovery.isCondition(node);
      const isConstraint = this.discovery.isConstraint(node);
      value = isCondition
        ? (node.result?.value as T)
        : (condition.result?.value as T);

      // Process the node based on its type.
      // If the node is a condition, we should evaluate it.
      // If it is a constraint, we should check it.
      switch (conditionType) {
        // If the condition type is 'or', we should return true if any of the conditions pass.
        case ConditionTypes.OR: {
          if (isCondition) {
            const evaluation = this.evaluateCondition(node, criteria);
            isPassed ||= evaluation.isPassed;
          }
          if (isConstraint) {
            const evaluation = this.evaluateConstraint(node, criteria);
            isPassed ||= evaluation.isPassed;

            if (!evaluation.isPassed) {
              message = evaluation.message;
            } else {
               
              break processLoop;
            }
          }
          break;
        }
        // If the condition type is 'and', we should return true if all the conditions pass.
        case ConditionTypes.AND: {
          if (isCondition) {
            const evaluation = this.evaluateCondition(node, criteria);
            isPassed &&= evaluation.isPassed;

            if (!evaluation.isPassed && evaluation.message) {
              message = evaluation.message;
               
              break processLoop;
            }
          }
          if (isConstraint) {
            const evaluation = this.evaluateConstraint(node, criteria);
            isPassed &&= evaluation.isPassed;

            if (!evaluation.isPassed) {
              message = evaluation.message;
               
              break processLoop;
            }
          }
          break;
        }
        // If the condition type is 'none', we should return true if none of the conditions pass.
        case ConditionTypes.NONE: {
          if (isCondition) {
            const evaluation = this.evaluateCondition(node, criteria);
            isPassed &&= !evaluation.isPassed;
          }
          if (isConstraint) {
            const evaluation = this.evaluateConstraint(node, criteria);
            isPassed &&= !evaluation.isPassed;

            if (!evaluation.isPassed) {
              message = evaluation.message;
            }
          }
          break;
        }
      }
    }

    return {
      message,
      value,
      isPassed,
    };
  }

  /**
   * Checks a constraint against a set of criteria and returns true whenever the constraint passes. Otherwise, false is returned.
   * Uses the Strategy pattern to evaluate operators.
   *
   * @param constraint The constraint to evaluate.
   * @param criteria The criteria to evaluate the constraint with.
   */
  private evaluateConstraint(
    constraint: Constraint,
    criteria: Criteria,
  ): EvaluationResult<T> {
    // Resolve field value
    const fieldValue = this.discovery.resolveProperty(
      constraint.field,
      criteria,
    );

    // Resolve constraint value (handle self-references)
    const constraintValue = this.resolveConstraintValue(
      constraint.value,
      criteria,
    );

    // Get operator strategy from registry
    const operatorStrategy = operatorRegistry.get(constraint.operator);
    if (!operatorStrategy) {
      return {
        value: false as T,
        isPassed: false,
        message: `Invalid operator: ${constraint.operator}. Please provide a valid operator. The operator is case-sensitive.`,
      };
    }

    // Create operator context
    const context: OperatorContext = {
      fieldValue,
      constraintValue,
      criteria,
      fieldPath: constraint.field,
    };

    // Validate inputs
    const validation = operatorStrategy.validate(context);
    if (!validation.isValid) {
      return {
        value: false as T,
        isPassed: false,
        message:
          validation.error ||
          `Validation failed for operator: ${constraint.operator}`,
      };
    }

    // Evaluate operator
    const isPassed = operatorStrategy.evaluate(context);
    const value = isPassed as T;

    // Format message if provided
    let formattedMessage: string | undefined;
    if (constraint.message) {
      formattedMessage = operatorStrategy.formatMessage
        ? operatorStrategy.formatMessage(constraint.message, context)
        : constraint.message;

      formattedMessage = this.mutateResultMessage(
        {
          value,
          isPassed,
          message: formattedMessage,
        },
        {
          ...criteria,
          self: {
            value: constraint.value,
            input: fieldValue,
          },
        },
        isPassed,
      ).message;
    }

    return {
      value,
      isPassed,
      message: formattedMessage,
    };
  }

  /**
   * Resolves constraint value, handling self-references
   */
  private resolveConstraintValue(value: any, criteria: Criteria): any {
    if (Array.isArray(value)) {
      return value.map((x) =>
        typeof x === "string" && x.includes("$.")
          ? this.discovery.resolveProperty(x, criteria)
          : x,
      );
    }

    if (typeof value === "string" && value.includes("$.")) {
      return this.discovery.resolveProperty(value, criteria);
    }

    return value;
  }

  /**
   * Mutates the result message by resolving any text path expressions.
   * If the result is falsy, the default value is returned.
   * If the result does not have a message property, the result is returned as is.
   * The criteria object is used to resolve the text path expressions.
   * The result is mutated in place.
   *
   * @param payload The result to mutate.
   * @param criteria The criteria object to resolve the text path expressions.
   * @param defaultValue The default value to return if the result is falsy.
   * @returns The mutated result.
   * @example
   * ```typescript
   * const result = {
   *  result: false,
   *  message: "Password is valid and contains username($.username), name($.name) and family($.family)",
   * };
   * const criteria = {
   *  username: "johndoe",
   *  name: "john",
   *  family: "doe",
   * };
   * const resolvedResult = evaluator.mutateResultMessage(result, criteria);
   * console.log(resolvedResult); // { result: false, message: "Password is valid and contains username(john-doe), name(john) and family(doe)" }
   * ```
   */
  mutateResultMessage(
    payload: EvaluationResult<T>,
    criteria: Criteria,
    defaultValue: boolean,
  ): EvaluationResult<T> {
    if (
      payload?.message &&
      isStringOperator(payload.message) &&
      payload.message.includes("$.")
    ) {
      return {
        isPassed: payload.isPassed,
        value: (payload.value ?? defaultValue) as T,
        message: this.discovery.resolveTextPathExpressions(
          payload.message!,
          criteria,
        ),
      };
    }

    return Object.assign(
      {},
      {
        isPassed: payload.isPassed,
        value: (payload.value ?? defaultValue) as T,
        message: payload.message,
      },
    );
  }
}
