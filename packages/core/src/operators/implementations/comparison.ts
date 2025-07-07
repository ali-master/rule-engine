import { isObject } from "@root/utils";
import { Operators } from "@root/enums";
import { OperatorCategory, BaseOperatorStrategy } from "../base";
import type { OperatorMetadata, OperatorContext } from "../base";

/**
 * Equals operator - checks if values are equal
 */
export class EqualsOperator extends BaseOperatorStrategy<any, any> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Equals,
    displayName: "Equals",
    category: OperatorCategory.COMPARISON,
    description: "Checks if the field value equals the constraint value",
    acceptedFieldTypes: ["any"],
    expectedValueType: "any",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "age", operator: "equals", value: 25 }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (fieldValue === undefined || constraintValue === undefined) return false;
    if (fieldValue === null || constraintValue === null)
      return fieldValue === constraintValue;
    if (typeof fieldValue !== typeof constraintValue) return false;

    if (fieldValue instanceof Date && constraintValue instanceof Date) {
      return fieldValue.getTime() === constraintValue.getTime();
    }

    if (
      (isObject(fieldValue) && isObject(constraintValue)) ||
      (Array.isArray(fieldValue) && Array.isArray(constraintValue))
    ) {
      return JSON.stringify(fieldValue) === JSON.stringify(constraintValue);
    }

    return fieldValue === constraintValue;
  }
}

/**
 * Not Equals operator
 */
export class NotEqualsOperator extends BaseOperatorStrategy<any, any> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotEquals,
    displayName: "Not Equals",
    category: OperatorCategory.COMPARISON,
    description:
      "Checks if the field value does not equal the constraint value",
    acceptedFieldTypes: ["any"],
    expectedValueType: "any",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "status", operator: "not-equals", value: "inactive" }',
  };

  private equalsOperator = new EqualsOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.equalsOperator.evaluate(context);
  }
}

/**
 * Greater Than operator
 */
export class GreaterThanOperator extends BaseOperatorStrategy<
  number | string | Date,
  number | string | Date
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.GreaterThan,
    displayName: "Greater Than",
    category: OperatorCategory.COMPARISON,
    description:
      "Checks if the field value is greater than the constraint value",
    acceptedFieldTypes: ["number", "string", "date"],
    expectedValueType: "number",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "age", operator: "greater-than", value: 18 }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (fieldValue === undefined || constraintValue === undefined) return false;
    if (fieldValue === null || constraintValue === null) return false;
    if (typeof fieldValue !== typeof constraintValue) return false;

    return fieldValue > constraintValue;
  }

  isValidFieldType(value: unknown): value is number | string | Date {
    return (
      typeof value === "number" ||
      typeof value === "string" ||
      value instanceof Date
    );
  }

  isValidConstraintType(value: unknown): value is number | string | Date {
    return this.isValidFieldType(value);
  }
}

/**
 * Greater Than or Equals operator
 */
export class GreaterThanOrEqualsOperator extends BaseOperatorStrategy<
  number | string | Date,
  number | string | Date
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.GreaterThanOrEquals,
    displayName: "Greater Than or Equals",
    category: OperatorCategory.COMPARISON,
    description:
      "Checks if the field value is greater than or equal to the constraint value",
    acceptedFieldTypes: ["number", "string", "date"],
    expectedValueType: "number",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "score", operator: "greater-than-or-equals", value: 60 }',
  };

  private equalsOperator = new EqualsOperator();
  private greaterThanOperator = new GreaterThanOperator();

  evaluate(context: OperatorContext): boolean {
    return (
      this.equalsOperator.evaluate(context) ||
      this.greaterThanOperator.evaluate(context)
    );
  }

  isValidFieldType(value: unknown): value is number | string | Date {
    return this.greaterThanOperator.isValidFieldType!(value);
  }

  isValidConstraintType(value: unknown): value is number | string | Date {
    return this.greaterThanOperator.isValidConstraintType!(value);
  }
}

/**
 * Less Than operator
 */
export class LessThanOperator extends BaseOperatorStrategy<
  number | string | Date,
  number | string | Date
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.LessThan,
    displayName: "Less Than",
    category: OperatorCategory.COMPARISON,
    description: "Checks if the field value is less than the constraint value",
    acceptedFieldTypes: ["number", "string", "date"],
    expectedValueType: "number",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "price", operator: "less-than", value: 100 }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (fieldValue === undefined || constraintValue === undefined) return false;
    if (fieldValue === null || constraintValue === null) return false;
    if (typeof fieldValue !== typeof constraintValue) return false;

    return fieldValue < constraintValue;
  }

  isValidFieldType(value: unknown): value is number | string | Date {
    return (
      typeof value === "number" ||
      typeof value === "string" ||
      value instanceof Date
    );
  }

  isValidConstraintType(value: unknown): value is number | string | Date {
    return this.isValidFieldType(value);
  }
}

/**
 * Less Than or Equals operator
 */
export class LessThanOrEqualsOperator extends BaseOperatorStrategy<
  number | string | Date,
  number | string | Date
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.LessThanOrEquals,
    displayName: "Less Than or Equals",
    category: OperatorCategory.COMPARISON,
    description:
      "Checks if the field value is less than or equal to the constraint value",
    acceptedFieldTypes: ["number", "string", "date"],
    expectedValueType: "number",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "quantity", operator: "less-than-or-equals", value: 10 }',
  };

  private equalsOperator = new EqualsOperator();
  private lessThanOperator = new LessThanOperator();

  evaluate(context: OperatorContext): boolean {
    return (
      this.equalsOperator.evaluate(context) ||
      this.lessThanOperator.evaluate(context)
    );
  }

  isValidFieldType(value: unknown): value is number | string | Date {
    return this.lessThanOperator.isValidFieldType!(value);
  }

  isValidConstraintType(value: unknown): value is number | string | Date {
    return this.lessThanOperator.isValidConstraintType!(value);
  }
}

/**
 * In operator - checks if value is in array
 */
export class InOperator extends BaseOperatorStrategy<any, any[]> {
  readonly metadata: OperatorMetadata = {
    name: Operators.In,
    displayName: "In",
    category: OperatorCategory.COMPARISON,
    description: "Checks if the field value is in the provided array",
    acceptedFieldTypes: ["any"],
    expectedValueType: "array",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "status", operator: "in", value: ["active", "pending"] }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (!Array.isArray(constraintValue)) return false;
    return constraintValue.includes(fieldValue);
  }

  isValidConstraintType(value: unknown): value is any[] {
    return Array.isArray(value);
  }
}

/**
 * Not In operator
 */
export class NotInOperator extends BaseOperatorStrategy<any, any[]> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotIn,
    displayName: "Not In",
    category: OperatorCategory.COMPARISON,
    description: "Checks if the field value is not in the provided array",
    acceptedFieldTypes: ["any"],
    expectedValueType: "array",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "role", operator: "not-in", value: ["admin", "moderator"] }',
  };

  private inOperator = new InOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.inOperator.evaluate(context);
  }

  isValidConstraintType(value: unknown): value is any[] {
    return Array.isArray(value);
  }
}

/**
 * Between operator - checks if value is between two values
 */
export class BetweenOperator extends BaseOperatorStrategy<
  number,
  [number, number]
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Between,
    displayName: "Between",
    category: OperatorCategory.COMPARISON,
    description: "Checks if the field value is between two values (inclusive)",
    acceptedFieldTypes: ["number"],
    expectedValueType: "range",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "age", operator: "between", value: [18, 65] }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (!Array.isArray(constraintValue) || constraintValue.length !== 2)
      return false;
    if (typeof fieldValue !== "number") return false;

    const [min, max] = constraintValue;
    return fieldValue >= Number(min) && fieldValue <= Number(max);
  }

  isValidFieldType(value: unknown): value is number {
    return typeof value === "number";
  }

  isValidConstraintType(value: unknown): value is [number, number] {
    return (
      Array.isArray(value) &&
      value.length === 2 &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    );
  }

  override validate(
    context: OperatorContext,
  ): ReturnType<BaseOperatorStrategy["validate"]> {
    const baseValidation = super.validate(context);
    if (!baseValidation.isValid) return baseValidation;

    if (
      Array.isArray(context.constraintValue) &&
      context.constraintValue.length === 2
    ) {
      const [min, max] = context.constraintValue;
      if (min > max) {
        return {
          isValid: false,
          error: "Minimum value cannot be greater than maximum value",
        };
      }
    }

    return baseValidation;
  }
}

/**
 * Not Between operator
 */
export class NotBetweenOperator extends BaseOperatorStrategy<
  number,
  [number, number]
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotBetween,
    displayName: "Not Between",
    category: OperatorCategory.COMPARISON,
    description: "Checks if the field value is not between two values",
    acceptedFieldTypes: ["number"],
    expectedValueType: "range",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "temperature", operator: "not-between", value: [0, 100] }',
  };

  private betweenOperator = new BetweenOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.betweenOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is number {
    return this.betweenOperator.isValidFieldType!(value);
  }

  isValidConstraintType(value: unknown): value is [number, number] {
    return this.betweenOperator.isValidConstraintType!(value);
  }

  override validate(
    context: OperatorContext,
  ): ReturnType<BaseOperatorStrategy["validate"]> {
    return this.betweenOperator.validate(context);
  }
}
