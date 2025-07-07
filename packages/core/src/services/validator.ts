import { isEmpty } from "ramda";
import { RuleError, isObject } from "@root/utils";
import { isStringOperator } from "@root/operators";
import { operatorRegistry } from "@root/operators/registry";
import { ObjectDiscovery } from "@root/services/object-discovery";
// Enums
import { Operators, ConditionTypes } from "@root/enums";
// Types
import type {
  ValidationResult,
  RuleType,
  OperatorsType,
  Constraint,
  ConditionType,
  Condition,
} from "@root/types";

export class Validator<T = any> {
  private readonly discovery = new ObjectDiscovery<T>();

  /**
   * Validates a rule and returns a boolean indicating its validity.
   *
   * This function checks whether a provided rule object adheres to the expected
   * format and data types.
   * If the rule is valid, it returns `true`.
   * Otherwise, a `RuleError` object is returned containing details about the validation issue.
   *
   * The `RuleError` object has the following properties:
   *   - `message` (string): A descriptive message explaining the validation error.
   *   - `element` (*): The specific element within the rule that caused the error.
   *                   The type of `element` can vary depending on the structure of
   *                   your rule object.
   *
   * @param {object} rule - The rule object to be validated.
   *
   * @returns {boolean|object} True if the rule is valid, a `RuleError` object
   *                            with details on the validation error otherwise.
   *                            The `RuleError` object has the following properties:
   *                            - `message` (string): A descriptive message explaining the validation error.
   *                            - `element` (*): The specific element within the rule that caused the error.
   *                            The type of `element` can vary depending on the structure of your rule object.
   *                            If the rule is valid, the function returns `true`.
   */
  validate(rule: RuleType<T>): RuleError {
    // Assume the rule is valid.
    const result: ValidationResult = { isValid: true };

    // Check the rule is a valid JSON
    if (!isObject(rule)) {
      return new RuleError({
        isValid: false,
        error: {
          message: "The rule must be a valid JSON object.",
          element: rule,
        },
      });
    }

    // Cater for the case where the condition property is not an array.
    const conditions = this.discovery.getConditions(rule);

    // Validate the 'conditions' property.
    if (
      !conditions.length ||
      (isObject(conditions[0]) && isEmpty(conditions[0]))
    ) {
      return new RuleError({
        isValid: false,
        error: {
          message:
            "The conditions property must contain at least one condition.",
          element: rule,
        },
      });
    }

    // Validate each condition in the rule.
    for (const condition of conditions) {
      const subResult = this.validateCondition(condition);
      result.isValid = result.isValid && subResult.isValid;
      result.error = (result?.error ?? subResult?.error)!;
    }

    return new RuleError({
      isValid: result.isValid,
      error: {
        message: result.error?.message ?? "",
        element: result.error?.element ?? {},
      },
    });
  }

  /**
   * Validates the structure and data types of a condition object.
   *
   * This function ensures the condition object adheres to the expected format
   * and data types.
   * It checks for the presence of essential properties (`field`,`operator`, and `value`) and validates their data types.
   * Additionally, it verifies compatibility between the operator and the value format.
   *
   * The function supports nested conditions through recursive validation.
   * The `depth` parameter is used to track the current recursion level and prevent infinite loops.
   *
   * @param {object} condition - The condition object to be validated.
   * @param {string} condition.field - The field name to be evaluated.
   * @param {string} condition.operator - The comparison operator to be used.
   * @param {string | number | boolean | Array} condition.value - The value to be compared against the field.
   * @param {number} [depth] - Optional recursion depth parameter (defaults to 0).
   *
   * @returns {object} A `RuleError` object with the following properties:
   *   - `isValid` (boolean): True if the condition is valid, False otherwise.
   *   - `error` (string|null): An error message describing the validation issue,
   *                             or null if the condition is valid.
   *                             The error message is set to the first validation error encountered.
   *                             If the condition is valid, the error message is null.
   */
  private validateCondition(
    condition: Condition,
    depth: number = 0,
  ): RuleError {
    // Check to see if the condition is valid.
    const result = this.isValidCondition(condition);
    if (!result.isValid) {
      return result;
    }

    // Set the type of condition.
    const type = this.discovery.conditionType(condition) as ConditionType;

    // Check if the condition is iterable
    if (!Array.isArray(condition[type])) {
      return new RuleError({
        isValid: false,
        error: {
          message: `The condition '${type}' should be iterable.`,
          element: condition,
        },
      });
    }

    // Validate each item in the condition.
    for (const node of condition[type]) {
      const isCondition = this.discovery.isCondition(node);
      if (isCondition) {
        const subResult = this.validateCondition(node as Condition, depth + 1);
        result.isValid = result.isValid && subResult.isValid;
        result.error = result?.error ?? subResult?.error;
      }

      const isConstraint = this.discovery.isConstraint(node);
      if (isConstraint) {
        const subResult = this.validateConstraint(node as Constraint);
        result.isValid = result.isValid && subResult.isValid;
        result.error = result.error ?? subResult.error;
      }

      if (!isConstraint && !isCondition) {
        return new RuleError({
          isValid: false,
          error: {
            message: "Each node should be a condition or constraint.",
            element: node,
          },
        });
      }

      // If any part fails validation, there is no point to continue.
      if (!result.isValid) {
        break;
      }
    }

    return new RuleError({
      isValid: result.isValid,
      error: {
        message: result.error?.message ?? "",
        element: result.error?.element ?? {},
      },
    });
  }

  /**
   * Validates the structure and data types of a rule constraint.
   *
   * This function ensures that a rule constraint object adheres to the expected format
   * and data types for its properties.
   * It verifies the presence of essential fields (`field`, `operator`, and `value`),
   * validates their data types, and checks for compatibility between the operator and value format.
   *
   * @param {object} constraint - The rule constraint object to be validated.
   * @param {string} constraint.field - The field name to be evaluated.
   * @param {string} constraint.operator - The comparison operator to be used.
   * @param {string | number | boolean | Array} constraint.value - The value to be compared against the field.
   *
   * @returns {object} A `RuleError` object with the following properties:
   *   - `isValid` (boolean): True if the constraint is valid, False otherwise.
   *   - `error` (string|null): An error message describing the validation issue,
   *                             or null if the constraint is valid.
   * @param constraint The constraint to validate.
   */
  private validateConstraint(constraint: Constraint): RuleError {
    if (!isStringOperator(constraint.field)) {
      return new RuleError({
        isValid: false,
        error: {
          message: 'Constraint "field" must be of type string.',
          element: constraint,
        },
      });
    }

    const matchOperators: Array<OperatorsType> = [
      Operators.Matches,
      Operators.NotMatches,
    ];

    // Check if the operator exists in the registry
    if (!operatorRegistry.has(constraint.operator as OperatorsType)) {
      const registeredOperators = operatorRegistry.getOperatorNames();
      return new RuleError({
        isValid: false,
        error: {
          message: `Constraint "operator" with value ${constraint.operator} is invalid. Valid operators are ${registeredOperators.join(`,`)}`,
          element: constraint,
        },
      });
    }

    // We must check that the value is an array if the operator is 'in' or 'not in'.
    const arrayOperatorsChecklist = [
      Operators.In,
      Operators.NotIn,
      Operators.ContainsAny,
      Operators.NotContainsAny,
      Operators.ContainsAll,
      Operators.NotContainsAll,
    ];
    if (
      arrayOperatorsChecklist.includes(constraint.operator) &&
      !Array.isArray(constraint.value)
    ) {
      return new RuleError({
        isValid: false,
        error: {
          message: `Constraint "value" must be an array if the "operator" is in ${arrayOperatorsChecklist.join(",")}`,
          element: constraint,
        },
      });
    }

    if (matchOperators.includes(constraint.operator)) {
      try {
        new RegExp(constraint.value as string);
      } catch {
        return new RuleError({
          isValid: false,
          error: {
            message: `Constraint "value" must be a valid regular expression if the "operator" is in ${matchOperators.join(",")}`,
            element: constraint,
          },
        });
      }
    }

    return new RuleError({ isValid: true });
  }

  /**
   * Checks an object to see if it is a valid condition.
   * A valid condition must have an 'any', 'all', or 'none' property.
   * It cannot have more than one.
   * It must also be an object.
   * If the object is not a valid condition, a RuleError object is returned.
   * Otherwise, a RuleError object with a true isValid property is returned.
   *
   * @param obj The object to check.
   * @returns {RuleError} A RuleError object.
   */
  private isValidCondition(obj: any): RuleError {
    if (!this.discovery.isCondition(obj)) {
      return new RuleError({
        isValid: false,
        error: {
          message: "Invalid condition structure.",
          element: obj,
        },
      });
    }

    const isAny = ConditionTypes.OR in obj;
    const isAll = ConditionTypes.AND in obj;
    const isNone = ConditionTypes.NONE in obj;

    // A valid condition must have an 'any', 'all', or 'none' property,
    // but cannot have more than one.
    if ((isAny && isAll) || (isAny && isNone) || (isAll && isNone)) {
      return new RuleError({
        isValid: false,
        error: {
          message:
            'A condition cannot have more than one "any", "all", or "none" property.',
          element: obj,
        },
      });
    }

    return new RuleError({ isValid: true });
  }
}
