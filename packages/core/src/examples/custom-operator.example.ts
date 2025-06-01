/**
 * Example: Creating custom operators
 */

import { OperatorCategory, BaseOperatorStrategy } from "@root/operators/base";
import type { OperatorMetadata, OperatorContext } from "@root/operators/base";
import { registerCustomOperator } from "@root/operators/factory";
import { RuleEngine } from "@root/services/rule-engine";

/**
 * Example 1: Custom IPv4 validation operator
 */
class IPv4Operator extends BaseOperatorStrategy<string, void> {
  readonly metadata: OperatorMetadata = {
    name: "ipv4" as any, // You would add this to the Operators enum
    displayName: "IPv4 Address",
    category: OperatorCategory.PATTERN,
    description: "Checks if the field value is a valid IPv4 address",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: true,
    example: '{ field: "ipAddress", operator: "ipv4" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    if (typeof fieldValue !== "string") return false;

    const ipv4Regex =
      /^(25[0-5]|2[0-4]\d|[01]?\d{1,2})\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})$/;
    return ipv4Regex.test(fieldValue);
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Example 2: Custom credit card validation operator
 */
class CreditCardOperator extends BaseOperatorStrategy<string, string> {
  readonly metadata: OperatorMetadata = {
    name: "credit-card" as any,
    displayName: "Credit Card",
    category: OperatorCategory.PATTERN,
    description: "Validates credit card numbers with optional type checking",
    acceptedFieldTypes: ["string"],
    expectedValueType: "string",
    requiresValue: false,
    isNegatable: true,
    example: '{ field: "cardNumber", operator: "credit-card", value: "visa" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "string") return false;

    // Remove spaces and dashes
    const cleaned = fieldValue.replace(/[\s-]/g, "");

    // Check if it's a valid credit card number using Luhn algorithm
    if (!this.isValidLuhn(cleaned)) return false;

    // If no specific type requested, just check Luhn validity
    if (!constraintValue) return true;

    // Check specific card type
    return this.matchesCardType(cleaned, constraintValue as string);
  }

  private isValidLuhn(cardNumber: string): boolean {
    if (!/^\d+$/.test(cardNumber)) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = Number.parseInt(cardNumber[i]!, 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  private matchesCardType(cardNumber: string, type: string): boolean {
    const patterns: Record<string, RegExp> = {
      visa: /^4\d{12}(?:\d{3})?$/,
      mastercard: /^5[1-5]\d{14}$/,
      amex: /^3[47]\d{13}$/,
      discover: /^6(?:011|5\d{2})\d{12}$/,
    };

    const pattern = patterns[type.toLowerCase()];
    return pattern ? pattern.test(cardNumber) : false;
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is string {
    return (
      typeof value === "string" &&
      ["visa", "mastercard", "amex", "discover"].includes(value.toLowerCase())
    );
  }
}

/**
 * Example 3: Custom range overlap operator
 */
class RangeOverlapOperator extends BaseOperatorStrategy<
  [number, number],
  [number, number]
> {
  readonly metadata: OperatorMetadata = {
    name: "range-overlap" as any,
    displayName: "Range Overlap",
    category: OperatorCategory.COMPARISON,
    description: "Checks if two numeric ranges overlap",
    acceptedFieldTypes: ["array"],
    expectedValueType: "range",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "availability", operator: "range-overlap", value: [9, 17] }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (!this.isValidRange(fieldValue) || !this.isValidRange(constraintValue)) {
      return false;
    }

    const [fieldStart, fieldEnd] = fieldValue as [number, number];
    const [constraintStart, constraintEnd] = constraintValue as [
      number,
      number,
    ];

    // Ranges overlap if one starts before the other ends
    return fieldStart <= constraintEnd && constraintStart <= fieldEnd;
  }

  private isValidRange(value: unknown): value is [number, number] {
    return (
      Array.isArray(value) &&
      value.length === 2 &&
      typeof value[0] === "number" &&
      typeof value[1] === "number" &&
      value[0] <= value[1]
    );
  }

  isValidFieldType(value: unknown): value is [number, number] {
    return this.isValidRange(value);
  }

  isValidConstraintType(value: unknown): value is [number, number] {
    return this.isValidRange(value);
  }

  override validate(
    context: OperatorContext,
  ): ReturnType<BaseOperatorStrategy["validate"]> {
    const baseValidation = super.validate(context);
    if (!baseValidation.isValid) return baseValidation;

    if (!this.isValidRange(context.fieldValue)) {
      return {
        isValid: false,
        error:
          "Field value must be a valid range [start, end] where start <= end",
      };
    }

    if (!this.isValidRange(context.constraintValue)) {
      return {
        isValid: false,
        error:
          "Constraint value must be a valid range [start, end] where start <= end",
      };
    }

    return baseValidation;
  }
}

/**
 * Example 4: Custom business hours operator
 */
class BusinessHoursOperator extends BaseOperatorStrategy<Date, void> {
  readonly metadata: OperatorMetadata = {
    name: "business-hours" as any,
    displayName: "Business Hours",
    category: OperatorCategory.DATE_TIME,
    description:
      "Checks if a datetime is within business hours (Mon-Fri 9AM-5PM)",
    acceptedFieldTypes: ["date"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: true,
    example: '{ field: "requestTime", operator: "business-hours" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    let date: Date;
    if (fieldValue instanceof Date) {
      date = fieldValue;
    } else if (
      typeof fieldValue === "string" ||
      typeof fieldValue === "number"
    ) {
      date = new Date(fieldValue);
      if (Number.isNaN(date.getTime())) return false;
    } else {
      return false;
    }

    const dayOfWeek = date.getDay();
    const hour = date.getHours();

    // Monday-Friday (1-5)
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;

    // 9 AM - 5 PM
    return hour >= 9 && hour < 17;
  }

  isValidFieldType(value: unknown): value is Date {
    return (
      value instanceof Date ||
      (typeof value === "string" && !Number.isNaN(Date.parse(value))) ||
      (typeof value === "number" && !Number.isNaN(new Date(value).getTime()))
    );
  }
}

/**
 * Example usage
 */
export async function customOperatorExample() {
  // Register custom operators
  registerCustomOperator(IPv4Operator);
  registerCustomOperator(CreditCardOperator);
  registerCustomOperator(RangeOverlapOperator);
  registerCustomOperator(BusinessHoursOperator);

  // Example 1: IPv4 validation
  const ipRule = {
    conditions: {
      and: [{ field: "serverIp", operator: "ipv4" as any }],
    },
  };

  const ipResult = await RuleEngine.evaluate(ipRule, {
    serverIp: "192.168.1.1",
  });
  console.log("IPv4 valid:", ipResult.isPassed); // true

  // Example 2: Credit card validation
  const ccRule = {
    conditions: {
      and: [
        { field: "cardNumber", operator: "credit-card" as any, value: "visa" },
      ],
    },
  };

  const ccResult = await RuleEngine.evaluate(ccRule, {
    cardNumber: "4111 1111 1111 1111", // Test Visa number
  });
  console.log("Credit card valid:", ccResult.isPassed); // true

  // Example 3: Range overlap
  const scheduleRule = {
    conditions: {
      and: [
        {
          field: "meetingTime",
          operator: "range-overlap" as any,
          value: [14, 16], // 2 PM - 4 PM
        },
      ],
    },
  };

  const scheduleResult = await RuleEngine.evaluate(scheduleRule, {
    meetingTime: [15, 17], // 3 PM - 5 PM (overlaps)
  });
  console.log("Schedule overlap:", scheduleResult.isPassed); // true

  // Example 4: Business hours check
  const businessRule = {
    conditions: {
      and: [{ field: "createdAt", operator: "business-hours" as any }],
    },
  };

  const businessResult = await RuleEngine.evaluate(businessRule, {
    createdAt: new Date("2024-01-15T10:30:00"), // Monday 10:30 AM
  });
  console.log("Within business hours:", businessResult.isPassed); // true
}

/**
 * Example: Creating a custom operator factory
 */
export function createRegexOperator(
  name: string,
  pattern: RegExp,
  description: string,
) {
  return class extends BaseOperatorStrategy<string, void> {
    readonly metadata: OperatorMetadata = {
      name: name as any,
      displayName: name,
      category: OperatorCategory.PATTERN,
      description,
      acceptedFieldTypes: ["string"],
      expectedValueType: "void",
      requiresValue: false,
      isNegatable: true,
      example: `{ field: "value", operator: "${name}" }`,
    };

    evaluate(context: OperatorContext): boolean {
      const { fieldValue } = context;
      return typeof fieldValue === "string" && pattern.test(fieldValue);
    }

    isValidFieldType(value: unknown): value is string {
      return typeof value === "string";
    }
  };
}

// Usage
const PhoneOperator = createRegexOperator(
  "phone",
  /^\+?[1-9]\d{1,14}$/,
  "Validates international phone numbers (E.164 format)",
);

registerCustomOperator(PhoneOperator);
