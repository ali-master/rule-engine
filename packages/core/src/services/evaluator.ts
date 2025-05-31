import { ObjectDiscovery } from "@root/services/object-discovery";
// Operators
import {
  selfContainsNoneOperator,
  selfContainsAnyOperator,
  selfContainsAllOperator,
  matchesOperator,
  likeOperator,
  lessThanOrEqualsOperator,
  lessThanOperator,
  isZeroOperator,
  isUuidOperator,
  isUrlOperator,
  isUpperCaseOperator,
  isTruthyOperator,
  isTimeEqualsOperator,
  isTimeBetweenOperator,
  isTimeBeforeOrEqualsOperator,
  isTimeBeforeOperator,
  isTimeAfterOrEqualsOperator,
  isTimeAfterOperator,
  isStringOperator,
  isPositiveOperator,
  isPersianAlphaOperator,
  isPersianAlphaNumericOperator,
  isObjectOperator,
  isNumericOperator,
  isNumberOperator,
  isNumberBetweenOperator,
  isNullOrWhiteSpaceOperator,
  isNullOrUndefinedOperator,
  isNegativeOperator,
  isMinOperator,
  isMinLengthOperator,
  isMaxOperator,
  isMaxLengthOperator,
  isLowerCaseOperator,
  isLengthOperator,
  IsLengthBetweenOperator,
  isIntegerOperator,
  isFloatOperator,
  isFalsyOperator,
  isExistsInObjectOperator,
  isEmptyOperator,
  isEmailOperator,
  isDateOperator,
  isDateEqualsToNowOperator,
  isDateEqualsOperator,
  isDateBetweenOperator,
  isDateBeforeOrEqualsOperator,
  isDateBeforeOperator,
  isDateBeforeNowOrEqualsOperator,
  isDateBeforeNowOperator,
  isDateAfterOrEqualsOperator,
  isDateAfterOperator,
  isDateAfterNowOrEqualsOperator,
  isDateAfterNowOperator,
  isBooleanStringOperator,
  isBooleanOperator,
  isBooleanNumberStringOperator,
  isBooleanNumberOperator,
  isBetweenOperator,
  isArrayOperator,
  isAlphaOperator,
  isAlphaNumericOperator,
  inOperator,
  greaterThanOrEqualsOperator,
  greaterThanOperator,
  equalsOperator,
  containsOperator,
  containsAnyOperator,
  containsAllOperator,
} from "@root/operators";
// Enums
import { Operators, ConditionTypes } from "@root/enums";
// Types
import type {
  RuleType,
  EvaluationResult,
  EngineResult,
  Criteria,
  Constraint,
  Condition,
} from "@root/types";

export class Evaluator<T = any> {
  private readonly discovery = new ObjectDiscovery<T>();

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
      if (evaluationResult.message) {
        return this.mutateResultMessage(
          {
            value: defaultResult?.value ?? (false as T),
            isPassed: false,
            message: evaluationResult.message,
          },
          criteria,
          false,
        );
      }
    }

    const message = (defaultResult as EvaluationResult)?.message;
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
    // eslint-disable-next-line no-labels
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
              // eslint-disable-next-line no-labels
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
          }
          if (isConstraint) {
            const evaluation = this.evaluateConstraint(node, criteria);
            isPassed &&= evaluation.isPassed;

            if (!evaluation.isPassed) {
              message = evaluation.message;
              // eslint-disable-next-line no-labels
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
   * The constraint is evaluated by comparing the field value in the criteria object with the constraint value using the specified operator.
   * The operator is a function that takes two arguments: the field value and the constraint value.
   * The operator function returns true if the constraint passes, otherwise false.
   * The constraint value can be a text path expression resolved using the criteria object.
   * The criteria object is used to resolve the field and constraint values.
   * The result is an object with a valid property that is true if the constraint passes, otherwise false.
   * The result also has a message property that contains the result message.
   *
   * @param constraint The constraint to evaluate.
   * @param criteria The criteria to evaluate the constraint with.
   */
  private evaluateConstraint(
    constraint: Constraint,
    criteria: Criteria,
  ): EvaluationResult<T> {
    let criterion = this.discovery.resolveProperty(constraint.field, criteria);
    if (typeof criterion === "undefined") {
      criterion = "undefined";
    }

    const message = constraint.message!;
    const constraintValue = Array.isArray(constraint.value)
      ? constraint.value.map((x) =>
          `${constraint.value}`.includes("$.")
            ? this.discovery.resolveProperty(x as string, criteria)
            : x,
        )
      : `${constraint.value}`.includes("$.")
        ? this.discovery.resolveProperty(constraint.value as string, criteria)
        : constraint.value;

    const operatorsProcessorMap: Record<
      Operators,
      (...args: Array<any>) => any
    > = {
      [Operators.Equals]: () => {
        return equalsOperator(criterion, constraintValue);
      },
      [Operators.NotEquals]: () => {
        return !equalsOperator(criterion, constraintValue);
      },
      [Operators.Like]: () => {
        return likeOperator(criterion, constraintValue);
      },
      [Operators.NotLike]: () => {
        return !likeOperator(criterion, constraintValue);
      },
      [Operators.GreaterThan]: () => {
        return greaterThanOperator(criterion, constraintValue);
      },
      [Operators.GreaterThanOrEquals]: () => {
        return greaterThanOrEqualsOperator(criterion, constraintValue);
      },
      [Operators.LessThan]: () => {
        return lessThanOperator(criterion, constraintValue);
      },
      [Operators.LessThanOrEquals]: () => {
        return lessThanOrEqualsOperator(criterion, constraintValue);
      },
      [Operators.In]: () => {
        return inOperator(criterion, constraintValue);
      },
      [Operators.NotIn]: () => {
        return !inOperator(criterion, constraintValue);
      },
      [Operators.Contains]: () => {
        return containsOperator(criterion, constraintValue);
      },
      /* istanbul ignore next */
      [Operators.NotContains]: () => {
        return !containsOperator(criterion, constraintValue);
      },
      [Operators.SelfContainsAll]: () => {
        return selfContainsAllOperator(criterion, constraintValue);
      },
      [Operators.SelfNotContainsAll]: () => {
        return !selfContainsAllOperator(criterion, constraintValue);
      },
      [Operators.SelfContainsAny]: () => {
        return selfContainsAnyOperator(criterion, constraintValue);
      },
      [Operators.SelfNotContainsAny]: () => {
        return !selfContainsAnyOperator(criterion, constraintValue);
      },
      [Operators.SelfContainsNone]: () => {
        return selfContainsNoneOperator(criterion, constraintValue);
      },
      [Operators.ContainsAny]: () => {
        return containsAnyOperator(criterion, constraintValue);
      },
      [Operators.NotContainsAny]: () => {
        return !containsAnyOperator(criterion, constraintValue);
      },
      [Operators.ContainsAll]: () => {
        return containsAllOperator(criterion, constraintValue);
      },
      [Operators.NotContainsAll]: () => {
        return !containsAllOperator(criterion, constraintValue);
      },
      [Operators.Matches]: () => {
        return matchesOperator(criterion, constraintValue);
      },
      [Operators.NotMatches]: () => {
        return !matchesOperator(criterion, constraintValue);
      },
      [Operators.Exists]: () => {
        if (constraint.field.includes("$.")) {
          return !!this.discovery.resolveProperty(constraint.field, criteria);
        }

        return isExistsInObjectOperator(constraint.field, criteria);
      },
      [Operators.NotExists]: () => {
        if (constraint.field.includes("$.")) {
          return !this.discovery.resolveProperty(constraint.field, criteria);
        }

        return !isExistsInObjectOperator(constraint.field, criteria);
      },
      [Operators.NullOrUndefined]: () => {
        return isNullOrUndefinedOperator(criterion);
      },
      [Operators.NotNullOrUndefined]: () => {
        return !isNullOrUndefinedOperator(criterion);
      },
      [Operators.DateAfter]: () => {
        return isDateAfterOperator(criterion, constraintValue);
      },
      [Operators.DateBefore]: () => {
        return isDateBeforeOperator(criterion, constraintValue);
      },
      [Operators.DateAfterNow]: () => {
        return isDateAfterNowOperator(criterion);
      },
      [Operators.DateBeforeNow]: () => {
        return isDateBeforeNowOperator(criterion);
      },
      [Operators.DateAfterNowOrEquals]: () => {
        return isDateAfterNowOrEqualsOperator(criterion);
      },
      [Operators.DateBeforeNowOrEquals]: () => {
        return isDateBeforeNowOrEqualsOperator(criterion);
      },
      [Operators.DateEqualsToNow]: () => {
        return isDateEqualsToNowOperator(criterion);
      },
      [Operators.DateNotEqualsToNow]: () => {
        return !isDateEqualsToNowOperator(criterion);
      },
      [Operators.DateAfterOrEquals]: () => {
        return isDateAfterOrEqualsOperator(criterion, constraintValue);
      },
      [Operators.DateBeforeOrEquals]: () => {
        return isDateBeforeOrEqualsOperator(criterion, constraintValue);
      },
      [Operators.DateEquals]: () => {
        return isDateEqualsOperator(criterion, constraintValue);
      },
      [Operators.DateNotEquals]: () => {
        return !isDateEqualsOperator(criterion, constraintValue);
      },
      [Operators.DateBetween]: () => {
        return isDateBetweenOperator(criterion, constraintValue);
      },
      [Operators.DateNotBetween]: () => {
        return !isDateBetweenOperator(criterion, constraintValue);
      },
      [Operators.TimeAfter]: () => {
        return isTimeAfterOperator(criterion, constraintValue);
      },
      [Operators.TimeBefore]: () => {
        return isTimeBeforeOperator(criterion, constraintValue);
      },
      [Operators.TimeAfterOrEquals]: () => {
        return isTimeAfterOrEqualsOperator(criterion, constraintValue);
      },
      [Operators.TimeBeforeOrEquals]: () => {
        return isTimeBeforeOrEqualsOperator(criterion, constraintValue);
      },
      [Operators.TimeEquals]: () => {
        return isTimeEqualsOperator(criterion, constraintValue);
      },
      [Operators.TimeNotEquals]: () => {
        return !isTimeEqualsOperator(criterion, constraintValue);
      },
      [Operators.TimeBetween]: () => {
        return isTimeBetweenOperator(criterion, constraintValue);
      },
      [Operators.TimeNotBetween]: () => {
        return !isTimeBetweenOperator(criterion, constraintValue);
      },
      [Operators.Empty]: () => {
        return isEmptyOperator(criterion);
      },
      [Operators.NotEmpty]: () => {
        return !isEmptyOperator(criterion);
      },
      [Operators.NullOrWhiteSpace]: () => {
        return isNullOrWhiteSpaceOperator(criterion);
      },
      [Operators.NotNullOrWhiteSpace]: () => {
        return !isNullOrWhiteSpaceOperator(criterion);
      },
      [Operators.Numeric]: () => {
        return isNumericOperator(criterion);
      },
      [Operators.NotNumeric]: () => {
        return !isNumericOperator(criterion);
      },
      [Operators.Boolean]: () => {
        return isBooleanOperator(criterion);
      },
      [Operators.NotBoolean]: () => {
        return !isBooleanOperator(criterion);
      },
      [Operators.Date]: () => {
        return isDateOperator(criterion);
      },
      [Operators.NotDate]: () => {
        return !isDateOperator(criterion);
      },
      [Operators.Email]: () => {
        return isEmailOperator(criterion);
      },
      [Operators.NotEmail]: () => {
        return !isEmailOperator(criterion);
      },
      [Operators.Url]: () => {
        return isUrlOperator(criterion);
      },
      [Operators.NotUrl]: () => {
        return !isUrlOperator(criterion);
      },
      [Operators.UUID]: () => {
        return isUuidOperator(criterion);
      },
      [Operators.NotUUID]: () => {
        return !isUuidOperator(criterion);
      },
      [Operators.Alpha]: () => {
        return isAlphaOperator(criterion);
      },
      [Operators.NotAlpha]: () => {
        return !isAlphaOperator(criterion);
      },
      [Operators.AlphaNumeric]: () => {
        return isAlphaNumericOperator(criterion);
      },
      [Operators.NotAlphaNumeric]: () => {
        return !isAlphaNumericOperator(criterion);
      },
      [Operators.PersianAlpha]: () => {
        return isPersianAlphaOperator(criterion);
      },
      [Operators.NotPersianAlpha]: () => {
        return !isPersianAlphaOperator(criterion);
      },
      [Operators.PersianAlphaNumeric]: () => {
        return isPersianAlphaNumericOperator(criterion);
      },
      [Operators.NotPersianAlphaNumeric]: () => {
        return !isPersianAlphaNumericOperator(criterion);
      },
      [Operators.LowerCase]: () => {
        return isLowerCaseOperator(criterion);
      },
      [Operators.NotLowerCase]: () => {
        return !isLowerCaseOperator(criterion);
      },
      [Operators.UpperCase]: () => {
        return isUpperCaseOperator(criterion);
      },
      [Operators.NotUpperCase]: () => {
        return !isUpperCaseOperator(criterion);
      },
      [Operators.String]: () => {
        return isStringOperator(criterion);
      },
      [Operators.NotString]: () => {
        return !isStringOperator(criterion);
      },
      [Operators.Falsy]: () => {
        return isFalsyOperator(criterion);
      },
      [Operators.NotFalsy]: () => {
        return !isFalsyOperator(criterion);
      },
      [Operators.Truthy]: () => {
        return isTruthyOperator(criterion);
      },
      [Operators.NotTruthy]: () => {
        return !isTruthyOperator(criterion);
      },
      [Operators.Object]: () => {
        return isObjectOperator(criterion);
      },
      [Operators.NotObject]: () => {
        return !isObjectOperator(criterion);
      },
      [Operators.Array]: () => {
        return isArrayOperator(criterion);
      },
      [Operators.NotArray]: () => {
        return !isArrayOperator(criterion);
      },
      [Operators.BooleanString]: () => {
        return isBooleanStringOperator(criterion);
      },
      [Operators.NotBooleanString]: () => {
        return !isBooleanStringOperator(criterion);
      },
      [Operators.BooleanNumber]: () => {
        return isBooleanNumberOperator(criterion);
      },
      [Operators.NotBooleanNumber]: () => {
        return !isBooleanNumberOperator(criterion);
      },
      [Operators.BooleanNumberString]: () => {
        return isBooleanNumberStringOperator(criterion);
      },
      [Operators.NotBooleanNumberString]: () => {
        return !isBooleanNumberStringOperator(criterion);
      },
      [Operators.Number]: () => {
        return isNumberOperator(criterion);
      },
      [Operators.NotNumber]: () => {
        return !isNumberOperator(criterion);
      },
      [Operators.Integer]: () => {
        return isIntegerOperator(criterion);
      },
      [Operators.NotInteger]: () => {
        return !isIntegerOperator(criterion);
      },
      [Operators.Float]: () => {
        return isFloatOperator(criterion);
      },
      [Operators.NotFloat]: () => {
        return !isFloatOperator(criterion);
      },
      [Operators.Positive]: () => {
        return isPositiveOperator(criterion);
      },
      [Operators.NotPositive]: () => {
        return !isPositiveOperator(criterion);
      },
      [Operators.Negative]: () => {
        return isNegativeOperator(criterion);
      },
      [Operators.NotNegative]: () => {
        return !isNegativeOperator(criterion);
      },
      [Operators.Zero]: () => {
        return isZeroOperator(criterion);
      },
      [Operators.NotZero]: () => {
        return !isZeroOperator(criterion);
      },
      [Operators.Min]: () => {
        return isMinOperator(criterion, constraintValue);
      },
      [Operators.NotMin]: () => {
        return !isMinOperator(criterion, constraintValue);
      },
      [Operators.Max]: () => {
        return isMaxOperator(criterion, constraintValue);
      },
      [Operators.NotMax]: () => {
        return !isMaxOperator(criterion, constraintValue);
      },
      [Operators.Between]: () => {
        return isBetweenOperator(criterion, constraintValue);
      },
      [Operators.NotBetween]: () => {
        return !isBetweenOperator(criterion, constraintValue);
      },
      [Operators.NumberBetween]: () => {
        return isNumberBetweenOperator(criterion, constraintValue);
      },
      [Operators.NotNumberBetween]: () => {
        return !isNumberBetweenOperator(criterion, constraintValue);
      },
      [Operators.StringLength]: () => {
        return isLengthOperator(criterion, constraintValue);
      },
      [Operators.NotStringLength]: () => {
        return !isLengthOperator(criterion, constraintValue);
      },
      [Operators.MinLength]: () => {
        return isMinLengthOperator(criterion, constraintValue);
      },
      [Operators.NotMinLength]: () => {
        return !isMinLengthOperator(criterion, constraintValue);
      },
      [Operators.MaxLength]: () => {
        return isMaxLengthOperator(criterion, constraintValue);
      },
      [Operators.NotMaxLength]: () => {
        return !isMaxLengthOperator(criterion, constraintValue);
      },
      [Operators.LengthBetween]: () => {
        return IsLengthBetweenOperator(criterion, constraintValue);
      },
      [Operators.NotLengthBetween]: () => {
        return !IsLengthBetweenOperator(criterion, constraintValue);
      },
    };

    const operatorFn = operatorsProcessorMap[constraint.operator];
    if (!operatorFn) {
      return {
        value: false as T,
        isPassed: false,
        message: `Invalid operator: ${constraint.operator}. Please provide a valid operator. The operator is case-sensitive.`,
      };
    }

    const value = operatorFn();
    return {
      value,
      isPassed: value,
      message: this.mutateResultMessage(
        {
          value,
          isPassed: value,
          message,
        },
        {
          ...criteria,
          self: {
            value: constraint.value,
            input: criterion,
          },
        },
        value,
      ).message,
    };
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
