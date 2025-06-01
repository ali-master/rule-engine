/**
 * Pattern matching operator implementations
 */

import { Operators } from "@root/enums";
import { OperatorCategory, BaseOperatorStrategy } from "../base";
import type { OperatorMetadata, OperatorContext } from "../base";
import { isPersianAlphaOperator } from "@root/operators";

/**
 * Email operator - validates email format
 */
export class EmailOperator extends BaseOperatorStrategy<string, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Email,
    displayName: "Is Email",
    category: OperatorCategory.PATTERN,
    description: "Checks if the field value is a valid email address",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "contactEmail", operator: "email" }',
  };

  private readonly emailRegex = /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    if (typeof fieldValue !== "string") return false;

    return this.emailRegex.test(fieldValue);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Not Email operator
 */
export class NotEmailOperator extends BaseOperatorStrategy<string, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotEmail,
    displayName: "Is Not Email",
    category: OperatorCategory.PATTERN,
    description: "Checks if the field value is not a valid email address",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "username", operator: "not-email" }',
  };

  private emailOperator = new EmailOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.emailOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * URL operator - validates URL format
 */
export class UrlOperator extends BaseOperatorStrategy<string, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Url,
    displayName: "Is URL",
    category: OperatorCategory.PATTERN,
    description: "Checks if the field value is a valid URL",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "website", operator: "url" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    if (typeof fieldValue !== "string") return false;

    try {
      new URL(fieldValue);
      return true;
    } catch {
      return false;
    }
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Not URL operator
 */
export class NotUrlOperator extends BaseOperatorStrategy<string, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotUrl,
    displayName: "Is Not URL",
    category: OperatorCategory.PATTERN,
    description: "Checks if the field value is not a valid URL",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "reference", operator: "not-url" }',
  };

  private urlOperator = new UrlOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.urlOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * UUID operator - validates UUID format
 */
export class UUIDOperator extends BaseOperatorStrategy<string, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.UUID,
    displayName: "Is UUID",
    category: OperatorCategory.PATTERN,
    description: "Checks if the field value is a valid UUID",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "id", operator: "uuid" }',
  };

  private readonly uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    if (typeof fieldValue !== "string") return false;

    return this.uuidRegex.test(fieldValue);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Not UUID operator
 */
export class NotUUIDOperator extends BaseOperatorStrategy<string, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotUUID,
    displayName: "Is Not UUID",
    category: OperatorCategory.PATTERN,
    description: "Checks if the field value is not a valid UUID",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "code", operator: "not-uuid" }',
  };

  private uuidOperator = new UUIDOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.uuidOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Alpha operator - checks if string contains only letters
 */
export class AlphaOperator extends BaseOperatorStrategy<string, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Alpha,
    displayName: "Is Alpha",
    category: OperatorCategory.PATTERN,
    description:
      "Checks if the field value contains only alphabetic characters",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "firstName", operator: "alpha" }',
  };

  private readonly alphaRegex = /^[a-z]+$/i;

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    if (typeof fieldValue !== "string") return false;

    return this.alphaRegex.test(fieldValue);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Not Alpha operator
 */
export class NotAlphaOperator extends BaseOperatorStrategy<string, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotAlpha,
    displayName: "Is Not Alpha",
    category: OperatorCategory.PATTERN,
    description:
      "Checks if the field value does not contain only alphabetic characters",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "password", operator: "not-alpha" }',
  };

  private alphaOperator = new AlphaOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.alphaOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * AlphaNumeric operator - checks if string contains only letters and numbers
 */
export class AlphaNumericOperator extends BaseOperatorStrategy<string, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.AlphaNumeric,
    displayName: "Is AlphaNumeric",
    category: OperatorCategory.PATTERN,
    description:
      "Checks if the field value contains only alphanumeric characters",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "username", operator: "alpha-numeric" }',
  };

  private readonly alphaNumericRegex = /^[a-z0-9]+$/i;

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    if (typeof fieldValue !== "string") return false;

    return this.alphaNumericRegex.test(fieldValue);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Not AlphaNumeric operator
 */
export class NotAlphaNumericOperator extends BaseOperatorStrategy<
  string,
  void
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotAlphaNumeric,
    displayName: "Is Not AlphaNumeric",
    category: OperatorCategory.PATTERN,
    description:
      "Checks if the field value does not contain only alphanumeric characters",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "specialCode", operator: "not-alpha-numeric" }',
  };

  private alphaNumericOperator = new AlphaNumericOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.alphaNumericOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Persian Alpha operator
 */
export class PersianAlphaOperator extends BaseOperatorStrategy<string, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.PersianAlpha,
    displayName: "Is Persian Alpha",
    category: OperatorCategory.PATTERN,
    description:
      "Checks if the field value contains only Persian alphabetic characters",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "persianName", operator: "persian-alpha" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    if (typeof fieldValue !== "string") return false;

    return isPersianAlphaOperator(fieldValue);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Not Persian Alpha operator
 */
export class NotPersianAlphaOperator extends BaseOperatorStrategy<
  string,
  void
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotPersianAlpha,
    displayName: "Is Not Persian Alpha",
    category: OperatorCategory.PATTERN,
    description:
      "Checks if the field value does not contain only Persian alphabetic characters",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "englishName", operator: "not-persian-alpha" }',
  };

  private persianAlphaOperator = new PersianAlphaOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.persianAlphaOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Persian AlphaNumeric operator
 */
export class PersianAlphaNumericOperator extends BaseOperatorStrategy<
  string,
  void
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.PersianAlphaNumeric,
    displayName: "Is Persian AlphaNumeric",
    category: OperatorCategory.PATTERN,
    description:
      "Checks if the field value contains only Persian alphanumeric characters",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "persianCode", operator: "persian-alpha-numeric" }',
  };

  private readonly persianAlphaNumericRegex = /^[\u0600-\u06FF\s0-9]+$/;

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    if (typeof fieldValue !== "string") return false;

    return this.persianAlphaNumericRegex.test(fieldValue);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Not Persian AlphaNumeric operator
 */
export class NotPersianAlphaNumericOperator extends BaseOperatorStrategy<
  string,
  void
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotPersianAlphaNumeric,
    displayName: "Is Not Persian AlphaNumeric",
    category: OperatorCategory.PATTERN,
    description:
      "Checks if the field value does not contain only Persian alphanumeric characters",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "mixedCode", operator: "not-persian-alpha-numeric" }',
  };

  private persianAlphaNumericOperator = new PersianAlphaNumericOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.persianAlphaNumericOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Lower Case operator
 */
export class LowerCaseOperator extends BaseOperatorStrategy<string, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.LowerCase,
    displayName: "Is Lower Case",
    category: OperatorCategory.PATTERN,
    description: "Checks if the field value is in lower case",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "code", operator: "lower-case" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    if (typeof fieldValue !== "string") return false;

    return fieldValue === fieldValue.toLowerCase() && /[a-z]/.test(fieldValue);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Not Lower Case operator
 */
export class NotLowerCaseOperator extends BaseOperatorStrategy<string, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotLowerCase,
    displayName: "Is Not Lower Case",
    category: OperatorCategory.PATTERN,
    description: "Checks if the field value is not in lower case",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "title", operator: "not-lower-case" }',
  };

  private lowerCaseOperator = new LowerCaseOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.lowerCaseOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Upper Case operator
 */
export class UpperCaseOperator extends BaseOperatorStrategy<string, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.UpperCase,
    displayName: "Is Upper Case",
    category: OperatorCategory.PATTERN,
    description: "Checks if the field value is in upper case",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "constant", operator: "upper-case" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    if (typeof fieldValue !== "string") return false;

    return fieldValue === fieldValue.toUpperCase() && /[A-Z]/.test(fieldValue);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Not Upper Case operator
 */
export class NotUpperCaseOperator extends BaseOperatorStrategy<string, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotUpperCase,
    displayName: "Is Not Upper Case",
    category: OperatorCategory.PATTERN,
    description: "Checks if the field value is not in upper case",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "description", operator: "not-upper-case" }',
  };

  private upperCaseOperator = new UpperCaseOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.upperCaseOperator.evaluate(context);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}
