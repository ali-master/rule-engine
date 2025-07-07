import { Operators } from "@root/enums";
import { OperatorCategory, BaseOperatorStrategy } from "../base";
import type { OperatorMetadata, OperatorContext } from "../base";
import { isFalsyOperator } from "@root/operators";

/**
 * Boolean operator - checks if value is boolean
 */
export class BooleanOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Boolean,
    displayName: "Is Boolean",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is a boolean",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "isActive", operator: "boolean" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;
    return typeof fieldValue === "boolean";
  }
}

/**
 * Not Boolean operator
 */
export class NotBooleanOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotBoolean,
    displayName: "Is Not Boolean",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is not a boolean",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "status", operator: "not-boolean" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;
    return typeof fieldValue !== "boolean";
  }
}

/**
 * Boolean String operator - checks if string represents a boolean
 */
export class BooleanStringOperator extends BaseOperatorStrategy<string, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.BooleanString,
    displayName: "Is Boolean String",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is a boolean string (true/false)",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "enabled", operator: "boolean-string" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;
    return (
      typeof fieldValue === "string" &&
      (fieldValue === "true" || fieldValue === "false")
    );
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Not Boolean String operator
 */
export class NotBooleanStringOperator extends BaseOperatorStrategy<
  string,
  void
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotBooleanString,
    displayName: "Is Not Boolean String",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is not a boolean string",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "value", operator: "not-boolean-string" }',
  };

  private booleanStringOperator = new BooleanStringOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.booleanStringOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Boolean Number operator - checks if number represents a boolean (0 or 1)
 */
export class BooleanNumberOperator extends BaseOperatorStrategy<number, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.BooleanNumber,
    displayName: "Is Boolean Number",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is a boolean number (0 or 1)",
    acceptedFieldTypes: ["number"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "flag", operator: "boolean-number" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;
    return (
      typeof fieldValue === "number" && (fieldValue === 0 || fieldValue === 1)
    );
  }

  isValidFieldType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Not Boolean Number operator
 */
export class NotBooleanNumberOperator extends BaseOperatorStrategy<
  number,
  void
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotBooleanNumber,
    displayName: "Is Not Boolean Number",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is not a boolean number",
    acceptedFieldTypes: ["number"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "count", operator: "not-boolean-number" }',
  };

  private booleanNumberOperator = new BooleanNumberOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.booleanNumberOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Boolean Number String operator - checks if string represents a boolean number
 */
export class BooleanNumberStringOperator extends BaseOperatorStrategy<
  string,
  void
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.BooleanNumberString,
    displayName: "Is Boolean Number String",
    category: OperatorCategory.TYPE,
    description:
      "Checks if the field value is a boolean number string (0 or 1)",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "active", operator: "boolean-number-string" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;
    return (
      typeof fieldValue === "string" &&
      (fieldValue === "0" || fieldValue === "1")
    );
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Not Boolean Number String operator
 */
export class NotBooleanNumberStringOperator extends BaseOperatorStrategy<
  string,
  void
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotBooleanNumberString,
    displayName: "Is Not Boolean Number String",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is not a boolean number string",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "value", operator: "not-boolean-number-string" }',
  };

  private booleanNumberStringOperator = new BooleanNumberStringOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.booleanNumberStringOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Truthy operator - checks if value is truthy
 */
export class TruthyOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Truthy,
    displayName: "Is Truthy",
    category: OperatorCategory.BOOLEAN,
    description: "Checks if the field value is truthy",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "hasPermission", operator: "truthy" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;
    return !!fieldValue;
  }
}

/**
 * Not Truthy operator
 */
export class NotTruthyOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotTruthy,
    displayName: "Is Not Truthy",
    category: OperatorCategory.BOOLEAN,
    description: "Checks if the field value is not truthy",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "disabled", operator: "not-truthy" }',
  };

  private truthyOperator = new TruthyOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.truthyOperator.evaluate(context);
  }
}

/**
 * Falsy operator - checks if value is falsy
 */
export class FalsyOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Falsy,
    displayName: "Is Falsy",
    category: OperatorCategory.BOOLEAN,
    description: "Checks if the field value is falsy",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "isDisabled", operator: "falsy" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;
    return isFalsyOperator(fieldValue);
  }
}

/**
 * Not Falsy operator
 */
export class NotFalsyOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotFalsy,
    displayName: "Is Not Falsy",
    category: OperatorCategory.BOOLEAN,
    description: "Checks if the field value is not falsy",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "isEnabled", operator: "not-falsy" }',
  };

  private falsyOperator = new FalsyOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.falsyOperator.evaluate(context);
  }
}
