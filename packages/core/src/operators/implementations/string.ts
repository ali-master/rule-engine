import { Operators } from "@root/enums";
import { OperatorCategory, BaseOperatorStrategy } from "../base";
import type { OperatorMetadata, OperatorContext } from "../base";

/**
 * Like operator - SQL-like pattern matching
 */
export class LikeOperator extends BaseOperatorStrategy<string, string> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Like,
    displayName: "Like",
    category: OperatorCategory.STRING,
    description: "Performs SQL-like pattern matching with % and _ wildcards",
    acceptedFieldTypes: ["string"],
    expectedValueType: "string",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "email", operator: "like", value: "%@gmail.com" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "string" || typeof constraintValue !== "string")
      return false;

    return this.performLikeMatch(fieldValue, constraintValue);
  }

  private performLikeMatch(
    text: string,
    pattern: string,
    caseInsensitive = false,
  ): boolean {
    // Escape special regex characters except our wildcards
    const escapedPattern = pattern.replace(/([\\.^$*+?()[\]{}|])/g, "\\$1");

    // Build the regular expression with pattern handling
    let regexStr = "^";
    let i = 0;

    while (i < escapedPattern.length) {
      const char = escapedPattern[i];

      if (char === "%" && (i === 0 || escapedPattern[i - 1] !== "\\")) {
        // % matches any sequence of characters
        regexStr += ".*";
      } else if (char === "_" && (i === 0 || escapedPattern[i - 1] !== "\\")) {
        // _ matches exactly one character
        regexStr += ".";
      } else if (char === "\\" && i + 1 < escapedPattern.length) {
        // Handle escaped characters
        i++;
        regexStr += escapedPattern[i];
      } else {
        regexStr += char;
      }
      i++;
    }

    regexStr += "$";

    return new RegExp(regexStr, caseInsensitive ? "i" : undefined).test(text);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Not Like operator
 */
export class NotLikeOperator extends BaseOperatorStrategy<string, string> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotLike,
    displayName: "Not Like",
    category: OperatorCategory.STRING,
    description: "Performs negated SQL-like pattern matching",
    acceptedFieldTypes: ["string"],
    expectedValueType: "string",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "filename", operator: "not-like", value: "%.tmp" }',
  };

  private likeOperator = new LikeOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.likeOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Starts With operator
 */
export class StartsWithOperator extends BaseOperatorStrategy<string, string> {
  readonly metadata: OperatorMetadata = {
    name: Operators.StartsWith,
    displayName: "Starts With",
    category: OperatorCategory.STRING,
    description: "Checks if the string starts with the specified value",
    acceptedFieldTypes: ["string"],
    expectedValueType: "string",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "url", operator: "starts-with", value: "https://" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "string" || typeof constraintValue !== "string")
      return false;

    return fieldValue.startsWith(constraintValue);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Ends With operator
 */
export class EndsWithOperator extends BaseOperatorStrategy<string, string> {
  readonly metadata: OperatorMetadata = {
    name: Operators.EndsWith,
    displayName: "Ends With",
    category: OperatorCategory.STRING,
    description: "Checks if the string ends with the specified value",
    acceptedFieldTypes: ["string"],
    expectedValueType: "string",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "email", operator: "ends-with", value: ".com" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "string" || typeof constraintValue !== "string")
      return false;

    return fieldValue.endsWith(constraintValue);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Contains substring operator
 */
export class ContainsStringOperator extends BaseOperatorStrategy<
  string,
  string
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.ContainsString,
    displayName: "Contains String",
    category: OperatorCategory.STRING,
    description: "Checks if the string contains the specified substring",
    acceptedFieldTypes: ["string"],
    expectedValueType: "string",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "description", operator: "contains-string", value: "error" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "string" || typeof constraintValue !== "string")
      return false;

    return fieldValue.includes(constraintValue);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * String Length operator
 */
export class StringLengthOperator extends BaseOperatorStrategy<string, number> {
  readonly metadata: OperatorMetadata = {
    name: Operators.StringLength,
    displayName: "String Length",
    category: OperatorCategory.STRING,
    description: "Checks if the string length equals the specified value",
    acceptedFieldTypes: ["string"],
    expectedValueType: "number",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "code", operator: "string-length", value: 6 }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "string" || typeof constraintValue !== "number")
      return false;

    return fieldValue.length === constraintValue;
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Min Length operator
 */
export class MinLengthOperator extends BaseOperatorStrategy<string, number> {
  readonly metadata: OperatorMetadata = {
    name: Operators.MinLength,
    displayName: "Minimum Length",
    category: OperatorCategory.STRING,
    description: "Checks if the string length is at least the specified value",
    acceptedFieldTypes: ["string"],
    expectedValueType: "number",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "password", operator: "min-length", value: 8 }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "string" || typeof constraintValue !== "number")
      return false;

    return fieldValue.length >= constraintValue;
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Max Length operator
 */
export class MaxLengthOperator extends BaseOperatorStrategy<string, number> {
  readonly metadata: OperatorMetadata = {
    name: Operators.MaxLength,
    displayName: "Maximum Length",
    category: OperatorCategory.STRING,
    description: "Checks if the string length is at most the specified value",
    acceptedFieldTypes: ["string"],
    expectedValueType: "number",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "username", operator: "max-length", value: 20 }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "string" || typeof constraintValue !== "number")
      return false;

    return fieldValue.length <= constraintValue;
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Length Between operator
 */
export class LengthBetweenOperator extends BaseOperatorStrategy<
  string,
  [number, number]
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.LengthBetween,
    displayName: "Length Between",
    category: OperatorCategory.STRING,
    description:
      "Checks if the string length is between two values (inclusive)",
    acceptedFieldTypes: ["string"],
    expectedValueType: "range",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "title", operator: "length-between", value: [10, 100] }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "string") return false;
    if (!Array.isArray(constraintValue) || constraintValue.length !== 2)
      return false;

    const [min, max] = constraintValue;
    return fieldValue.length >= Number(min) && fieldValue.length <= Number(max);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
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
          error: "Minimum length cannot be greater than maximum length",
        };
      }
      if (min < 0) {
        return {
          isValid: false,
          error: "Minimum length cannot be negative",
        };
      }
    }

    return baseValidation;
  }
}

/**
 * Not Length Between operator
 */
export class NotLengthBetweenOperator extends BaseOperatorStrategy<
  string,
  [number, number]
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotLengthBetween,
    displayName: "Not Length Between",
    category: OperatorCategory.STRING,
    description: "Checks if the string length is not between two values",
    acceptedFieldTypes: ["string"],
    expectedValueType: "range",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "code", operator: "not-length-between", value: [5, 10] }',
  };

  private lengthBetweenOperator = new LengthBetweenOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.lengthBetweenOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
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
 * Not String Length operator
 */
export class NotStringLengthOperator extends BaseOperatorStrategy<
  string,
  number
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotStringLength,
    displayName: "Not String Length",
    category: OperatorCategory.STRING,
    description:
      "Checks if the string length is not equal to the specified value",
    acceptedFieldTypes: ["string"],
    expectedValueType: "number",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "postal_code", operator: "not-string-length", value: 5 }',
  };

  private stringLengthOperator = new StringLengthOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.stringLengthOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is number {
    return typeof value === "number";
  }
}

/**
 * Matches operator - regex pattern matching
 */
export class MatchesOperator extends BaseOperatorStrategy<string, string> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Matches,
    displayName: "Matches Pattern",
    category: OperatorCategory.PATTERN,
    description:
      "Checks if the field value matches the regular expression pattern",
    acceptedFieldTypes: ["string"],
    expectedValueType: "string",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "email", operator: "matches", value: "^[\\w]+@[\\w]+\\.[\\w]+$" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "string" || typeof constraintValue !== "string") {
      return false;
    }

    // Empty pattern should return false
    if (constraintValue.length === 0) {
      return false;
    }

    try {
      let pattern = constraintValue;
      // Handle regex delimiters like /pattern/
      if (pattern.startsWith("/") && pattern.endsWith("/")) {
        pattern = pattern.slice(1, -1);
      }
      const regex = new RegExp(pattern);
      return regex.test(fieldValue);
    } catch {
      return false;
    }
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is string {
    return typeof value === "string";
  }

  override validate(
    context: OperatorContext,
  ): ReturnType<BaseOperatorStrategy["validate"]> {
    const baseValidation = super.validate(context);
    if (!baseValidation.isValid) return baseValidation;

    if (typeof context.constraintValue === "string") {
      // Empty pattern is invalid
      if (context.constraintValue.length === 0) {
        return {
          isValid: false,
          error: "Pattern cannot be empty",
        };
      }

      try {
        let pattern = context.constraintValue;
        // Handle regex delimiters
        if (pattern.startsWith("/") && pattern.endsWith("/")) {
          pattern = pattern.slice(1, -1);
        }

        new RegExp(pattern);
      } catch (error) {
        return {
          isValid: false,
          error: `Invalid regular expression: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }
    }

    return baseValidation;
  }
}

/**
 * Not Matches operator
 */
export class NotMatchesOperator extends BaseOperatorStrategy<string, string> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotMatches,
    displayName: "Not Matches Pattern",
    category: OperatorCategory.PATTERN,
    description:
      "Checks if the field value does not match the regular expression pattern",
    acceptedFieldTypes: ["string"],
    expectedValueType: "string",
    requiresValue: true,
    isNegatable: true,
    example: '{ field: "name", operator: "not-matches", value: "^[0-9]+$" }',
  };

  private matchesOperator = new MatchesOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.matchesOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is string {
    return typeof value === "string";
  }

  override validate(
    context: OperatorContext,
  ): ReturnType<BaseOperatorStrategy["validate"]> {
    return this.matchesOperator.validate(context);
  }
}
