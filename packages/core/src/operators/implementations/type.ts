/**
 * Type checking operator implementations
 */

import { Operators } from "@root/enums";
import { OperatorCategory, BaseOperatorStrategy } from "../base";
import type { OperatorMetadata, OperatorContext } from "../base";

/**
 * String operator - checks if value is a string
 */
export class StringOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.String,
    displayName: "Is String",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is a string",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "name", operator: "string" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;
    return typeof fieldValue === "string";
  }
}

/**
 * Not String operator
 */
export class NotStringOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotString,
    displayName: "Is Not String",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is not a string",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "id", operator: "not-string" }',
  };

  private stringOperator = new StringOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.stringOperator.evaluate(context);
  }
}

/**
 * Object operator - checks if value is an object
 */
export class ObjectOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Object,
    displayName: "Is Object",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is an object",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "metadata", operator: "object" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;
    return (
      fieldValue !== null &&
      typeof fieldValue === "object" &&
      !Array.isArray(fieldValue)
    );
  }
}

/**
 * Not Object operator
 */
export class NotObjectOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotObject,
    displayName: "Is Not Object",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is not an object",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "value", operator: "not-object" }',
  };

  private objectOperator = new ObjectOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.objectOperator.evaluate(context);
  }
}

/**
 * Array operator - checks if value is an array
 */
export class ArrayOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Array,
    displayName: "Is Array",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is an array",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "tags", operator: "array" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;
    return Array.isArray(fieldValue);
  }
}

/**
 * Not Array operator
 */
export class NotArrayOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotArray,
    displayName: "Is Not Array",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is not an array",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "data", operator: "not-array" }',
  };

  private arrayOperator = new ArrayOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.arrayOperator.evaluate(context);
  }
}
