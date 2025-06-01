/**
 * Existence and nullability operator implementations
 */

import { Operators } from "@root/enums";
import { OperatorCategory, BaseOperatorStrategy } from "../base";
import type { OperatorMetadata, OperatorContext } from "../base";

/**
 * Exists operator - checks if field exists
 */
export class ExistsOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Exists,
    displayName: "Exists",
    category: OperatorCategory.EXISTENCE,
    description: "Checks if the field exists in the object",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "email", operator: "exists" }',
  };

  evaluate(context: OperatorContext): boolean {
    // For exists check, the fieldValue will be undefined if the field doesn't exist
    // We also need to check if the field path exists in the criteria
    const { fieldValue, criteria } = context;

    // If no criteria is provided, we can't check existence
    if (!criteria) {
      return fieldValue !== undefined;
    }

    // Check if the field exists - if fieldValue is not undefined, the field exists
    return fieldValue !== undefined;
  }
}

/**
 * Not Exists operator
 */
export class NotExistsOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotExists,
    displayName: "Not Exists",
    category: OperatorCategory.EXISTENCE,
    description: "Checks if the field does not exist in the object",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "deletedAt", operator: "not-exists" }',
  };

  private existsOperator = new ExistsOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.existsOperator.evaluate(context);
  }
}

/**
 * Null Or Undefined operator
 */
export class NullOrUndefinedOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NullOrUndefined,
    displayName: "Null or Undefined",
    category: OperatorCategory.EXISTENCE,
    description: "Checks if the field value is null or undefined",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "middleName", operator: "null-or-undefined" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;
    return fieldValue === null || fieldValue === undefined;
  }
}

/**
 * Not Null Or Undefined operator
 */
export class NotNullOrUndefinedOperator extends BaseOperatorStrategy<
  any,
  void
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotNullOrUndefined,
    displayName: "Not Null or Undefined",
    category: OperatorCategory.EXISTENCE,
    description: "Checks if the field value is not null or undefined",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "requiredField", operator: "not-null-or-undefined" }',
  };

  private nullOrUndefinedOperator = new NullOrUndefinedOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.nullOrUndefinedOperator.evaluate(context);
  }
}

/**
 * Empty operator - checks if value is empty
 */
export class EmptyOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Empty,
    displayName: "Empty",
    category: OperatorCategory.EXISTENCE,
    description:
      "Checks if the field value is empty (string, array, or object)",
    acceptedFieldTypes: ["string", "array", "object"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "description", operator: "empty" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    if (fieldValue === null || fieldValue === undefined) return true;

    if (typeof fieldValue === "string") {
      return fieldValue.length === 0;
    }

    if (Array.isArray(fieldValue)) {
      return fieldValue.length === 0;
    }

    if (typeof fieldValue === "object") {
      return Object.keys(fieldValue).length === 0;
    }

    return false;
  }
}

/**
 * Not Empty operator
 */
export class NotEmptyOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotEmpty,
    displayName: "Not Empty",
    category: OperatorCategory.EXISTENCE,
    description: "Checks if the field value is not empty",
    acceptedFieldTypes: ["string", "array", "object"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "name", operator: "not-empty" }',
  };

  private emptyOperator = new EmptyOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.emptyOperator.evaluate(context);
  }
}

/**
 * Null Or White Space operator
 */
export class NullOrWhiteSpaceOperator extends BaseOperatorStrategy<
  string,
  void
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NullOrWhiteSpace,
    displayName: "Null or White Space",
    category: OperatorCategory.EXISTENCE,
    description:
      "Checks if the field value is null, undefined, or contains only whitespace",
    acceptedFieldTypes: ["string", "any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "comment", operator: "null-or-white-space" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    if (fieldValue === null || fieldValue === undefined) return true;

    if (typeof fieldValue === "string") {
      return fieldValue.trim().length === 0;
    }

    return false;
  }
}

/**
 * Not Null Or White Space operator
 */
export class NotNullOrWhiteSpaceOperator extends BaseOperatorStrategy<
  string,
  void
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotNullOrWhiteSpace,
    displayName: "Not Null or White Space",
    category: OperatorCategory.EXISTENCE,
    description:
      "Checks if the field value is not null, undefined, or whitespace",
    acceptedFieldTypes: ["string", "any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "username", operator: "not-null-or-white-space" }',
  };

  private nullOrWhiteSpaceOperator = new NullOrWhiteSpaceOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.nullOrWhiteSpaceOperator.evaluate(context);
  }
}
