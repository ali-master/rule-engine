// Utilities
import { isEmpty } from "ramda";
import { JSONPath } from "jsonpath-plus";
import { isObject, extractJsonPathExpressions } from "@root/utils";
// Enums
import { ConditionTypes } from "@root/enums";
// Types
import type {
  RuleType,
  CriteriaObject,
  Criteria,
  Constraint,
  ConditionType,
  Condition,
} from "@root/types";

/**
 * Object discovery service. Used to discover information about objects.
 */
export class ObjectDiscovery<T = any> {
  /**
   * Returns the conditions of a rule.
   * @param rule The rule to get the conditions from.
   */
  getConditions(rule: RuleType<T>): Array<Condition<T>> {
    return Array.isArray(rule.conditions) ? rule.conditions : [rule.conditions];
  }

  /**
   * Returns the type of condition passed to the function.
   * @param condition The condition to check.
   */
  conditionType(condition: Condition<T>): ConditionType | null {
    if (ConditionTypes.OR in condition) {
      return ConditionTypes.OR;
    }
    if (ConditionTypes.AND in condition) {
      return ConditionTypes.AND;
    }
    if (ConditionTypes.NONE in condition) {
      return ConditionTypes.NONE;
    }

    return null;
  }

  /**
   * Checks the rule to see if it is granular.
   * @param rule The rule to check.
   */
  isGranular(rule: RuleType<T>): boolean {
    const conditions = this.getConditions(rule);

    // Checks each condition making sure it has a result property.
    for (const condition of conditions) {
      if (
        !this.isCondition(condition) ||
        !("result" in condition) ||
        condition.result === undefined
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks an object to see if it is a valid condition.
   * @param obj The object to check.
   */
  isCondition(obj: object): obj is Condition {
    return isObject(obj) && !!this.conditionType(obj);
  }

  /**
   * Checks an object to see if it is a valid constraint.
   * @param obj The object to check.
   */
  isConstraint(obj: object): obj is Constraint {
    return isObject(obj) && "field" in obj && "operator" in obj;
  }

  /**
   * Resolves a nested property from a sting as an object path.
   * @param path The path to resolve.
   * @param json The object to resolve the path against.
   */
  resolveProperty(path: string, json: Criteria<T>): any {
    if (!path?.includes("$.") && isObject(json)) {
      return (json as CriteriaObject)[path];
    }
    const result = JSONPath({ path, json: json as Criteria });
    if (Array.isArray(result) && result.length === 1) {
      return result[0];
    }

    return isEmpty(result) ? undefined : result;
  }

  /**
   * Updates a property in a JSON object. Supports nested properties.
   *
   * @param path The path to the property to update.
   * @param json The JSON object to update.
   * @param value The value to set the property to.
   * @returns The updated JSON object.
   * @example
   * updateProperty("$.meta.default.password", { meta: { default: { password: "password" } } }, "new-password")
   * // Output: { meta: { default: { password: "new-password" } } }
   */
  updateProperty(path: string, json: Criteria<T>, value: any): any {
    if (!path?.includes("$.") && isObject(json)) {
      (json as CriteriaObject)[path] = value;
      return json;
    }

    return JSONPath({
      path,
      json: json as Criteria,
      wrap: false,
      callback: (_: any, __: any, { parent, parentProperty }: any) => {
        return (parent[parentProperty] = value);
      },
    });
  }

  /**
   * Resolves the text properties of a string.
   * @param {string} str
   * @param {Criteria} criteria
   * @returns {string} The resolved string.
   * @example
   * resolveTextProperties(
   *  "Password is invalid and contains username($.username), name($.name) and family($.family)",
   *  {
   *  meta: { default: { password: "@john-doe-@johndoe" } },
   *  username: "john-doe",
   *  name: "john",
   *  family: "doe",
   * }) // Output: "Password is invalid and contains username(john-doe), name(john) and family(doe)"
   */
  resolveTextPathExpressions(str: string, criteria: Criteria<T>): string {
    const expressions = extractJsonPathExpressions(str);
    let result = str;

    for (const expression of expressions) {
      const resolvedExpressionPath = this.resolveProperty(expression, criteria);
      result = result.replace(expression, resolvedExpressionPath);
    }

    return result;
  }
}
