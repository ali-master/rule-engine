/**
 * Array operator implementations
 */

import { Operators } from "@root/enums";
import { OperatorCategory, BaseOperatorStrategy } from "../base";
import type { OperatorMetadata, OperatorContext } from "../base";

/**
 * Contains operator - checks if array contains value
 */
export class ContainsOperator extends BaseOperatorStrategy<any[], any> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Contains,
    displayName: "Contains",
    category: OperatorCategory.ARRAY,
    description: "Checks if the array contains the specified value",
    acceptedFieldTypes: ["array"],
    expectedValueType: "any",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "tags", operator: "contains", value: "featured" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (!Array.isArray(fieldValue)) return false;

    return fieldValue.includes(constraintValue);
  }

  isValidFieldType(value: unknown): value is any[] {
    return Array.isArray(value);
  }
}

/**
 * Not Contains operator
 */
export class NotContainsOperator extends BaseOperatorStrategy<any[], any> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotContains,
    displayName: "Not Contains",
    category: OperatorCategory.ARRAY,
    description: "Checks if the array does not contain the specified value",
    acceptedFieldTypes: ["array"],
    expectedValueType: "any",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "tags", operator: "not-contains", value: "draft" }',
  };

  private containsOperator = new ContainsOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.containsOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is any[] {
    return Array.isArray(value);
  }
}

/**
 * Contains Any operator - checks if array contains any of the values
 */
export class ContainsAnyOperator extends BaseOperatorStrategy<any[], any[]> {
  readonly metadata: OperatorMetadata = {
    name: Operators.ContainsAny,
    displayName: "Contains Any",
    category: OperatorCategory.ARRAY,
    description: "Checks if the array contains any of the specified values",
    acceptedFieldTypes: ["array"],
    expectedValueType: "array",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "roles", operator: "contains-any", value: ["admin", "moderator"] }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (!Array.isArray(fieldValue) || !Array.isArray(constraintValue))
      return false;

    return fieldValue.some((item) => constraintValue.includes(item));
  }

  isValidFieldType(value: unknown): value is any[] {
    return Array.isArray(value);
  }

  isValidConstraintType(value: unknown): value is any[] {
    return Array.isArray(value);
  }
}

/**
 * Not Contains Any operator
 */
export class NotContainsAnyOperator extends BaseOperatorStrategy<any[], any[]> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotContainsAny,
    displayName: "Not Contains Any",
    category: OperatorCategory.ARRAY,
    description:
      "Checks if the array does not contain any of the specified values",
    acceptedFieldTypes: ["array"],
    expectedValueType: "array",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "roles", operator: "not-contains-any", value: ["banned", "suspended"] }',
  };

  private containsAnyOperator = new ContainsAnyOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.containsAnyOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is any[] {
    return Array.isArray(value);
  }

  isValidConstraintType(value: unknown): value is any[] {
    return Array.isArray(value);
  }
}

/**
 * Contains All operator - checks if array contains all values
 */
export class ContainsAllOperator extends BaseOperatorStrategy<any[], any[]> {
  readonly metadata: OperatorMetadata = {
    name: Operators.ContainsAll,
    displayName: "Contains All",
    category: OperatorCategory.ARRAY,
    description: "Checks if the array contains all of the specified values",
    acceptedFieldTypes: ["array"],
    expectedValueType: "array",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "permissions", operator: "contains-all", value: ["read", "write"] }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (!Array.isArray(fieldValue) || !Array.isArray(constraintValue))
      return false;

    return constraintValue.every((value) => fieldValue.includes(value));
  }

  isValidFieldType(value: unknown): value is any[] {
    return Array.isArray(value);
  }

  isValidConstraintType(value: unknown): value is any[] {
    return Array.isArray(value);
  }
}

/**
 * Not Contains All operator
 */
export class NotContainsAllOperator extends BaseOperatorStrategy<any[], any[]> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotContainsAll,
    displayName: "Not Contains All",
    category: OperatorCategory.ARRAY,
    description:
      "Checks if the array does not contain all of the specified values",
    acceptedFieldTypes: ["array"],
    expectedValueType: "array",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "features", operator: "not-contains-all", value: ["premium", "enterprise"] }',
  };

  private containsAllOperator = new ContainsAllOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.containsAllOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is any[] {
    return Array.isArray(value);
  }

  isValidConstraintType(value: unknown): value is any[] {
    return Array.isArray(value);
  }
}

/**
 * Array Length operator - checks array length
 */
export class ArrayLengthOperator extends BaseOperatorStrategy<any[], number> {
  readonly metadata: OperatorMetadata = {
    name: Operators.ArrayLength,
    displayName: "Array Length",
    category: OperatorCategory.ARRAY,
    description: "Checks if the array length equals the specified value",
    acceptedFieldTypes: ["array"],
    expectedValueType: "number",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "items", operator: "array-length", value: 5 }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (!Array.isArray(fieldValue) || typeof constraintValue !== "number")
      return false;

    return fieldValue.length === constraintValue;
  }

  isValidFieldType(value: unknown): value is any[] {
    return Array.isArray(value);
  }

  isValidConstraintType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Array Min Length operator
 */
export class ArrayMinLengthOperator extends BaseOperatorStrategy<
  any[],
  number
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.ArrayMinLength,
    displayName: "Array Minimum Length",
    category: OperatorCategory.ARRAY,
    description: "Checks if the array length is at least the specified value",
    acceptedFieldTypes: ["array"],
    expectedValueType: "number",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "attendees", operator: "array-min-length", value: 2 }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (!Array.isArray(fieldValue) || typeof constraintValue !== "number")
      return false;

    return fieldValue.length >= constraintValue;
  }

  isValidFieldType(value: unknown): value is any[] {
    return Array.isArray(value);
  }

  isValidConstraintType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Array Max Length operator
 */
export class ArrayMaxLengthOperator extends BaseOperatorStrategy<
  any[],
  number
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.ArrayMaxLength,
    displayName: "Array Maximum Length",
    category: OperatorCategory.ARRAY,
    description: "Checks if the array length is at most the specified value",
    acceptedFieldTypes: ["array"],
    expectedValueType: "number",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "tags", operator: "array-max-length", value: 10 }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (!Array.isArray(fieldValue) || typeof constraintValue !== "number")
      return false;

    return fieldValue.length <= constraintValue;
  }

  isValidFieldType(value: unknown): value is any[] {
    return Array.isArray(value);
  }

  isValidConstraintType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Self Contains Any operator - checks if string field contains any values from constraint array
 */
export class SelfContainsAnyOperator extends BaseOperatorStrategy<
  string,
  any[]
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.SelfContainsAny,
    displayName: "Self Contains Any",
    category: OperatorCategory.STRING,
    description:
      "Checks if the string field contains any of the values in the constraint array",
    acceptedFieldTypes: ["string"],
    expectedValueType: "array",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "password", operator: "self-contains-any", value: ["admin", "user"] }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "string" || !Array.isArray(constraintValue))
      return false;

    return constraintValue.some((value) => fieldValue.includes(String(value)));
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is any[] {
    return Array.isArray(value);
  }
}

/**
 * Self Not Contains Any operator
 */
export class SelfNotContainsAnyOperator extends BaseOperatorStrategy<
  string,
  any[]
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.SelfNotContainsAny,
    displayName: "Self Not Contains Any",
    category: OperatorCategory.STRING,
    description:
      "Checks if the string field does not contain any of the values in the constraint array",
    acceptedFieldTypes: ["string"],
    expectedValueType: "array",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "password", operator: "self-not-contains-any", value: ["admin", "test"] }',
  };

  private selfContainsAnyOperator = new SelfContainsAnyOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.selfContainsAnyOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is any[] {
    return Array.isArray(value);
  }
}

/**
 * Self Contains All operator
 */
export class SelfContainsAllOperator extends BaseOperatorStrategy<
  string,
  any[]
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.SelfContainsAll,
    displayName: "Self Contains All",
    category: OperatorCategory.STRING,
    description:
      "Checks if the string field contains all of the values in the constraint array",
    acceptedFieldTypes: ["string"],
    expectedValueType: "array",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "password", operator: "self-contains-all", value: ["pass", "word"] }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "string" || !Array.isArray(constraintValue))
      return false;

    return constraintValue.every((value) => fieldValue.includes(String(value)));
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is any[] {
    return Array.isArray(value);
  }
}

/**
 * Self Not Contains All operator
 */
export class SelfNotContainsAllOperator extends BaseOperatorStrategy<
  string,
  any[]
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.SelfNotContainsAll,
    displayName: "Self Not Contains All",
    category: OperatorCategory.STRING,
    description:
      "Checks if the string field does not contain all of the values in the constraint array",
    acceptedFieldTypes: ["string"],
    expectedValueType: "array",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "password", operator: "self-not-contains-all", value: ["admin", "123"] }',
  };

  private selfContainsAllOperator = new SelfContainsAllOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.selfContainsAllOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is any[] {
    return Array.isArray(value);
  }
}

/**
 * Self Contains None operator - alias for Self Not Contains Any
 * Checks that the string field contains none of the values in the array
 */
export class SelfContainsNoneOperator extends BaseOperatorStrategy<
  string,
  any[]
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.SelfContainsNone,
    displayName: "Self Contains None",
    category: OperatorCategory.STRING,
    description:
      "Checks if the string field contains none of the values in the constraint array",
    acceptedFieldTypes: ["string"],
    expectedValueType: "array",
    requiresValue: true,
    isNegatable: false,
    example:
      '{ field: "password", operator: "self-not-contains-none", value: ["admin", "test"] }',
  };

  // This is the same as SelfNotContainsAny
  private selfNotContainsAnyOperator = new SelfNotContainsAnyOperator();

  evaluate(context: OperatorContext): boolean {
    return this.selfNotContainsAnyOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is any[] {
    return Array.isArray(value);
  }
}
