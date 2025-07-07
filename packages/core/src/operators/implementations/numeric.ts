import { Operators } from "@root/enums";
import { OperatorCategory, BaseOperatorStrategy } from "../base";
import type { OperatorMetadata, OperatorContext } from "../base";
import { isNumberOperator } from "@root/operators";

/**
 * Numeric operator - checks if value is numeric
 */
export class NumericOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Numeric,
    displayName: "Is Numeric",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is numeric",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "quantity", operator: "numeric" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    if (typeof fieldValue === "number") {
      return !Number.isNaN(fieldValue) && Number.isFinite(fieldValue);
    }

    if (typeof fieldValue === "string") {
      const num = Number(fieldValue);
      return !Number.isNaN(num) && Number.isFinite(num);
    }

    return false;
  }
}

/**
 * Not Numeric operator
 */
export class NotNumericOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotNumeric,
    displayName: "Is Not Numeric",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is not numeric",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "code", operator: "not-numeric" }',
  };

  private numericOperator = new NumericOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.numericOperator.evaluate(context);
  }
}

/**
 * Number operator - checks if value is a number type
 */
export class NumberOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Number,
    displayName: "Is Number",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is a number type",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "age", operator: "number" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;
    return isNumberOperator(fieldValue);
  }
}

/**
 * Not Number operator
 */
export class NotNumberOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotNumber,
    displayName: "Is Not Number",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is not a number type",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "id", operator: "not-number" }',
  };

  private numberOperator = new NumberOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.numberOperator.evaluate(context);
  }
}

/**
 * Integer operator
 */
export class IntegerOperator extends BaseOperatorStrategy<number, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Integer,
    displayName: "Is Integer",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is an integer",
    acceptedFieldTypes: ["number"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "count", operator: "integer" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;
    return typeof fieldValue === "number" && Number.isInteger(fieldValue);
  }

  isValidFieldType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Not Integer operator
 */
export class NotIntegerOperator extends BaseOperatorStrategy<number, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotInteger,
    displayName: "Is Not Integer",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is not an integer",
    acceptedFieldTypes: ["number"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "price", operator: "not-integer" }',
  };

  private integerOperator = new IntegerOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.integerOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Float operator
 */
export class FloatOperator extends BaseOperatorStrategy<number, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Float,
    displayName: "Is Float",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is a float",
    acceptedFieldTypes: ["number"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "temperature", operator: "float" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;
    return typeof fieldValue === "number" && !Number.isInteger(fieldValue);
  }

  isValidFieldType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Not Float operator
 */
export class NotFloatOperator extends BaseOperatorStrategy<number, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotFloat,
    displayName: "Is Not Float",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is not a float",
    acceptedFieldTypes: ["number"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "quantity", operator: "not-float" }',
  };

  private floatOperator = new FloatOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.floatOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Positive operator
 */
export class PositiveOperator extends BaseOperatorStrategy<number, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Positive,
    displayName: "Is Positive",
    category: OperatorCategory.NUMERIC,
    description: "Checks if the field value is positive",
    acceptedFieldTypes: ["number"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "balance", operator: "positive" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;
    return typeof fieldValue === "number" && fieldValue > 0;
  }

  isValidFieldType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Not Positive operator
 */
export class NotPositiveOperator extends BaseOperatorStrategy<number, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotPositive,
    displayName: "Is Not Positive",
    category: OperatorCategory.NUMERIC,
    description: "Checks if the field value is not positive",
    acceptedFieldTypes: ["number"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "debt", operator: "not-positive" }',
  };

  private positiveOperator = new PositiveOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.positiveOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Negative operator
 */
export class NegativeOperator extends BaseOperatorStrategy<number, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Negative,
    displayName: "Is Negative",
    category: OperatorCategory.NUMERIC,
    description: "Checks if the field value is negative",
    acceptedFieldTypes: ["number"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "loss", operator: "negative" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;
    return typeof fieldValue === "number" && fieldValue < 0;
  }

  isValidFieldType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Not Negative operator
 */
export class NotNegativeOperator extends BaseOperatorStrategy<number, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotNegative,
    displayName: "Is Not Negative",
    category: OperatorCategory.NUMERIC,
    description: "Checks if the field value is not negative",
    acceptedFieldTypes: ["number"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "score", operator: "not-negative" }',
  };

  private negativeOperator = new NegativeOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.negativeOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Zero operator
 */
export class ZeroOperator extends BaseOperatorStrategy<number, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Zero,
    displayName: "Is Zero",
    category: OperatorCategory.NUMERIC,
    description: "Checks if the field value is zero",
    acceptedFieldTypes: ["number"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "remainder", operator: "zero" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;
    return fieldValue === 0;
  }

  isValidFieldType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Not Zero operator
 */
export class NotZeroOperator extends BaseOperatorStrategy<number, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotZero,
    displayName: "Is Not Zero",
    category: OperatorCategory.NUMERIC,
    description: "Checks if the field value is not zero",
    acceptedFieldTypes: ["number"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "divisor", operator: "not-zero" }',
  };

  private zeroOperator = new ZeroOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.zeroOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Min operator - minimum value check
 */
export class MinOperator extends BaseOperatorStrategy<number, number> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Min,
    displayName: "Minimum",
    category: OperatorCategory.NUMERIC,
    description:
      "Checks if the field value is greater than or equal to the minimum",
    acceptedFieldTypes: ["number"],
    expectedValueType: "number",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "age", operator: "min", value: 18 }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "number" || typeof constraintValue !== "number") {
      return false;
    }

    return fieldValue >= constraintValue;
  }

  isValidFieldType(value: unknown): value is number {
    return typeof value === "number";
  }

  isValidConstraintType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Max operator - maximum value check
 */
export class MaxOperator extends BaseOperatorStrategy<number, number> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Max,
    displayName: "Maximum",
    category: OperatorCategory.NUMERIC,
    description:
      "Checks if the field value is less than or equal to the maximum",
    acceptedFieldTypes: ["number"],
    expectedValueType: "number",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "discount", operator: "max", value: 50 }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "number" || typeof constraintValue !== "number") {
      return false;
    }

    return fieldValue <= constraintValue;
  }

  isValidFieldType(value: unknown): value is number {
    return typeof value === "number";
  }

  isValidConstraintType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Number Between operator
 */
export class NumberBetweenOperator extends BaseOperatorStrategy<
  number,
  [number, number]
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NumberBetween,
    displayName: "Number Between",
    category: OperatorCategory.NUMERIC,
    description: "Checks if the field value is between two numbers",
    acceptedFieldTypes: ["number"],
    expectedValueType: "array",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "score", operator: "number-between", value: [0, 100] }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (
      typeof fieldValue !== "number" ||
      !Array.isArray(constraintValue) ||
      constraintValue.length !== 2 ||
      typeof constraintValue[0] !== "number" ||
      typeof constraintValue[1] !== "number"
    ) {
      return false;
    }

    const [min, max] = constraintValue;
    return fieldValue >= min && fieldValue <= max;
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
}

/**
 * Not Number Between operator
 */
export class NotNumberBetweenOperator extends BaseOperatorStrategy<
  number,
  [number, number]
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotNumberBetween,
    displayName: "Not Number Between",
    category: OperatorCategory.NUMERIC,
    description: "Checks if the field value is not between two numbers",
    acceptedFieldTypes: ["number"],
    expectedValueType: "array",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "temperature", operator: "not-number-between", value: [-10, 40] }',
  };

  private betweenOperator = new NumberBetweenOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.betweenOperator.evaluate(context);
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
}
