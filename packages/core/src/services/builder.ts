import { Validator } from "@root/services/validator";
// Types
import type { RuleType, OperatorsType, Condition, Constraint, ConditionType } from "@root/types";

export class Builder<T = any> {
  /** Stores to rule being constructed */
  private rule: RuleType = { conditions: [] };

  constructor(public readonly validator: Validator) {}

  /**
   * Adds a node (in the root) to the rule being constructed
   *
   * @param node The node to add to the rule
   */
  add(node: Condition<T>): Builder<T> {
    (this.rule.conditions as Condition<T>[]).push(node);

    return this;
  }

  /**
   * Sets the default value of the rule being constructed
   *
   * @param value The default value of the rule
   * @returns The builder instance
   */
  default(value: RuleType["default"]): Builder<T> {
    this.rule.default = value;

    return this;
  }

  /**
   * Builds the rule being and returns it (optionally validating it)
   *
   * @param validate Whether to validate the rule before returning it
   * @returns The rule being constructed
   * @throws Error if validation is enabled and the rule is invalid
   */
  build(validate?: boolean): RuleType<T> {
    if (!validate) {
      return this.rule;
    }

    const validationResult = this.validator.validate(this.rule);
    if (validationResult.isValid) {
      return this.rule;
    }

    throw validationResult;
  }

  /**
   * Creates a new condition node for the rule being constructed
   *
   * @param type The type of condition
   * @param nodes Any child nodes of the condition
   * @param result The result of the condition node (for granular rules)
   * @returns The condition node
   */
  condition(
    type: ConditionType,
    nodes: Condition<T>[ConditionType],
    result?: Condition<T>["result"],
  ): Condition<T> {
    return {
      [type]: nodes,
      result,
    };
  }

  /**
   * Creates a new constraint node for a condition node to use
   *
   * @param field The field to apply the constraint to
   * @param operator The operator to apply to the field
   * @param value The value to compare the field to
   * @returns The constraint node
   */
  constraint(field: string, operator: OperatorsType, value: Constraint["value"]): Constraint {
    return {
      field,
      operator,
      value,
    };
  }
}
