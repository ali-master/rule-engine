import { Operators } from "@root/enums";
import { OperatorCategory, BaseOperatorStrategy } from "../base";
import type { OperatorMetadata, OperatorContext } from "../base";

/**
 * Helper function to parse dates
 */
function parseDate(value: any): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

/**
 * Helper function to parse time strings (HH:MM:SS)
 */
function parseTime(value: string): number | null {
  const match = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;

  const hours = Number.parseInt(match[1]!, 10);
  const minutes = Number.parseInt(match[2]!, 10);
  const seconds = match[3] ? Number.parseInt(match[3], 10) : 0;

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    return null;
  }

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Date After operator
 */
export class DateAfterOperator extends BaseOperatorStrategy<
  Date | string | number,
  Date | string | number
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.DateAfter,
    displayName: "Date After",
    category: OperatorCategory.DATE_TIME,
    description: "Checks if the field date is after the provided date",
    acceptedFieldTypes: ["date", "string", "number"],
    expectedValueType: "date",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "createdAt", operator: "date-after", value: "2024-01-01" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    const fieldDate = parseDate(fieldValue);
    const constraintDate = parseDate(constraintValue);

    if (!fieldDate || !constraintDate) return false;

    return fieldDate > constraintDate;
  }
}

/**
 * Date After Now operator
 */
export class DateAfterNowOperator extends BaseOperatorStrategy<
  Date | string | number,
  void
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.DateAfterNow,
    displayName: "Date After Now",
    category: OperatorCategory.DATE_TIME,
    description: "Checks if the field date is after the current date",
    acceptedFieldTypes: ["date", "string", "number"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: true,
    example: '{ field: "expiresAt", operator: "date-after-now" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    const fieldDate = parseDate(fieldValue);
    if (!fieldDate) return false;

    return fieldDate > new Date();
  }
}

/**
 * Date Before operator
 */
export class DateBeforeOperator extends BaseOperatorStrategy<
  Date | string | number,
  Date | string | number
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.DateBefore,
    displayName: "Date Before",
    category: OperatorCategory.DATE_TIME,
    description: "Checks if the field date is before the provided date",
    acceptedFieldTypes: ["date", "string", "number"],
    expectedValueType: "date",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "birthday", operator: "date-before", value: "2000-01-01" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    const fieldDate = parseDate(fieldValue);
    const constraintDate = parseDate(constraintValue);

    if (!fieldDate || !constraintDate) return false;

    return fieldDate < constraintDate;
  }
}

/**
 * Date Before Now operator
 */
export class DateBeforeNowOperator extends BaseOperatorStrategy<
  Date | string | number,
  void
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.DateBeforeNow,
    displayName: "Date Before Now",
    category: OperatorCategory.DATE_TIME,
    description: "Checks if the field date is before the current date",
    acceptedFieldTypes: ["date", "string", "number"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: true,
    example: '{ field: "startedAt", operator: "date-before-now" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    const fieldDate = parseDate(fieldValue);
    if (!fieldDate) return false;

    return fieldDate < new Date();
  }
}

/**
 * Date Equals operator
 */
export class DateEqualsOperator extends BaseOperatorStrategy<
  Date | string | number,
  Date | string | number
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.DateEquals,
    displayName: "Date Equals",
    category: OperatorCategory.DATE_TIME,
    description: "Checks if the field date equals the provided date",
    acceptedFieldTypes: ["date", "string", "number"],
    expectedValueType: "date",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "appointmentDate", operator: "date-equals", value: "2024-01-15" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    const fieldDate = parseDate(fieldValue);
    const constraintDate = parseDate(constraintValue);

    if (!fieldDate || !constraintDate) return false;

    return fieldDate.getTime() === constraintDate.getTime();
  }
}

/**
 * Date Equals To Now operator
 */
export class DateEqualsToNowOperator extends BaseOperatorStrategy<
  Date | string | number,
  void
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.DateEqualsToNow,
    displayName: "Date Equals Now",
    category: OperatorCategory.DATE_TIME,
    description: "Checks if the field date equals the current date",
    acceptedFieldTypes: ["date", "string", "number"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: true,
    example: '{ field: "todayDate", operator: "date-equals-to-now" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    const fieldDate = parseDate(fieldValue);
    if (!fieldDate) return false;

    const now = new Date();
    // Compare only date parts, not time
    return fieldDate.toDateString() === now.toDateString();
  }
}

/**
 * Date Not Equals operator
 */
export class DateNotEqualsOperator extends BaseOperatorStrategy<
  Date | string | number,
  Date | string | number
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.DateNotEquals,
    displayName: "Date Not Equals",
    category: OperatorCategory.DATE_TIME,
    description: "Checks if the field date does not equal the provided date",
    acceptedFieldTypes: ["date", "string", "number"],
    expectedValueType: "date",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "lastLogin", operator: "date-not-equals", value: "2024-01-01" }',
  };

  private equalsOperator = new DateEqualsOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.equalsOperator.evaluate(context);
  }
}

/**
 * Date After Or Equals operator
 */
export class DateAfterOrEqualsOperator extends BaseOperatorStrategy<
  Date | string | number,
  Date | string | number
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.DateAfterOrEquals,
    displayName: "Date After Or Equals",
    category: OperatorCategory.DATE_TIME,
    description:
      "Checks if the field date is after or equals the provided date",
    acceptedFieldTypes: ["date", "string", "number"],
    expectedValueType: "date",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "startDate", operator: "date-after-or-equals", value: "2024-01-01" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    const fieldDate = parseDate(fieldValue);
    const constraintDate = parseDate(constraintValue);

    if (!fieldDate || !constraintDate) return false;

    return fieldDate >= constraintDate;
  }
}

/**
 * Date Before Or Equals operator
 */
export class DateBeforeOrEqualsOperator extends BaseOperatorStrategy<
  Date | string | number,
  Date | string | number
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.DateBeforeOrEquals,
    displayName: "Date Before Or Equals",
    category: OperatorCategory.DATE_TIME,
    description:
      "Checks if the field date is before or equals the provided date",
    acceptedFieldTypes: ["date", "string", "number"],
    expectedValueType: "date",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "endDate", operator: "date-before-or-equals", value: "2024-12-31" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    const fieldDate = parseDate(fieldValue);
    const constraintDate = parseDate(constraintValue);

    if (!fieldDate || !constraintDate) return false;

    return fieldDate <= constraintDate;
  }
}

/**
 * Date Between operator
 */
export class DateBetweenOperator extends BaseOperatorStrategy<
  Date | string | number,
  [Date | string | number, Date | string | number]
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.DateBetween,
    displayName: "Date Between",
    category: OperatorCategory.DATE_TIME,
    description: "Checks if the field date is between two dates",
    acceptedFieldTypes: ["date", "string", "number"],
    expectedValueType: "array",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "eventDate", operator: "date-between", value: ["2024-01-01", "2024-12-31"] }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (!Array.isArray(constraintValue) || constraintValue.length !== 2)
      return false;

    const fieldDate = parseDate(fieldValue);
    const startDate = parseDate(constraintValue[0]);
    const endDate = parseDate(constraintValue[1]);

    if (!fieldDate || !startDate || !endDate) return false;

    return fieldDate >= startDate && fieldDate <= endDate;
  }

  isValidConstraintType(value: unknown): value is [any, any] {
    return Array.isArray(value) && value.length === 2;
  }
}

/**
 * Date Not Between operator
 */
export class DateNotBetweenOperator extends BaseOperatorStrategy<
  Date | string | number,
  [Date | string | number, Date | string | number]
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.DateNotBetween,
    displayName: "Date Not Between",
    category: OperatorCategory.DATE_TIME,
    description: "Checks if the field date is not between two dates",
    acceptedFieldTypes: ["date", "string", "number"],
    expectedValueType: "array",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "holiday", operator: "date-not-between", value: ["2024-06-01", "2024-08-31"] }',
  };

  private betweenOperator = new DateBetweenOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.betweenOperator.evaluate(context);
  }

  isValidConstraintType(value: unknown): value is [any, any] {
    return Array.isArray(value) && value.length === 2;
  }
}

/**
 * Time After operator
 */
export class TimeAfterOperator extends BaseOperatorStrategy<string, string> {
  readonly metadata: OperatorMetadata = {
    name: Operators.TimeAfter,
    displayName: "Time After",
    category: OperatorCategory.DATE_TIME,
    description: "Checks if the field time is after the provided time",
    acceptedFieldTypes: ["string"],
    expectedValueType: "string",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "openingTime", operator: "time-after", value: "09:00:00" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "string" || typeof constraintValue !== "string")
      return false;

    const fieldTime = parseTime(fieldValue);
    const constraintTime = parseTime(constraintValue);

    if (fieldTime === null || constraintTime === null) return false;

    return fieldTime > constraintTime;
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Time Before operator
 */
export class TimeBeforeOperator extends BaseOperatorStrategy<string, string> {
  readonly metadata: OperatorMetadata = {
    name: Operators.TimeBefore,
    displayName: "Time Before",
    category: OperatorCategory.DATE_TIME,
    description: "Checks if the field time is before the provided time",
    acceptedFieldTypes: ["string"],
    expectedValueType: "string",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "closingTime", operator: "time-before", value: "18:00:00" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "string" || typeof constraintValue !== "string")
      return false;

    const fieldTime = parseTime(fieldValue);
    const constraintTime = parseTime(constraintValue);

    if (fieldTime === null || constraintTime === null) return false;

    return fieldTime < constraintTime;
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Time Equals operator
 */
export class TimeEqualsOperator extends BaseOperatorStrategy<string, string> {
  readonly metadata: OperatorMetadata = {
    name: Operators.TimeEquals,
    displayName: "Time Equals",
    category: OperatorCategory.DATE_TIME,
    description: "Checks if the field time equals the provided time",
    acceptedFieldTypes: ["string"],
    expectedValueType: "string",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "meetingTime", operator: "time-equals", value: "14:30:00" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "string" || typeof constraintValue !== "string")
      return false;

    const fieldTime = parseTime(fieldValue);
    const constraintTime = parseTime(constraintValue);

    if (fieldTime === null || constraintTime === null) return false;

    return fieldTime === constraintTime;
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Time Between operator
 */
export class TimeBetweenOperator extends BaseOperatorStrategy<
  string,
  [string, string]
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.TimeBetween,
    displayName: "Time Between",
    category: OperatorCategory.DATE_TIME,
    description: "Checks if the field time is between two times",
    acceptedFieldTypes: ["string"],
    expectedValueType: "array",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "workHours", operator: "time-between", value: ["09:00:00", "17:00:00"] }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (
      typeof fieldValue !== "string" ||
      !Array.isArray(constraintValue) ||
      constraintValue.length !== 2
    ) {
      return false;
    }

    const fieldTime = parseTime(fieldValue);
    const startTime = parseTime(constraintValue[0]);
    const endTime = parseTime(constraintValue[1]);

    if (fieldTime === null || startTime === null || endTime === null)
      return false;

    return fieldTime >= startTime && fieldTime <= endTime;
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is [string, string] {
    return (
      Array.isArray(value) &&
      value.length === 2 &&
      typeof value[0] === "string" &&
      typeof value[1] === "string"
    );
  }
}

/**
 * Date operator - checks if value is a valid date
 */
export class DateOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.Date,
    displayName: "Is Date",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is a valid date",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "birthday", operator: "date" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;
    const date = parseDate(fieldValue);
    return date !== null;
  }
}

/**
 * Not Date operator
 */
export class NotDateOperator extends BaseOperatorStrategy<any, void> {
  readonly metadata: OperatorMetadata = {
    name: Operators.NotDate,
    displayName: "Is Not Date",
    category: OperatorCategory.TYPE,
    description: "Checks if the field value is not a valid date",
    acceptedFieldTypes: ["any"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: false,
    example: '{ field: "customField", operator: "not-date" }',
  };

  private dateOperator = new DateOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.dateOperator.evaluate(context);
  }
}

/**
 * Time After Or Equals operator
 */
export class TimeAfterOrEqualsOperator extends BaseOperatorStrategy<
  string,
  string
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.TimeAfterOrEquals,
    displayName: "Time After Or Equals",
    category: OperatorCategory.DATE_TIME,
    description:
      "Checks if the field time is after or equal to the provided time",
    acceptedFieldTypes: ["string"],
    expectedValueType: "string",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "startTime", operator: "time-after-or-equals", value: "09:00:00" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "string" || typeof constraintValue !== "string")
      return false;

    const fieldTime = parseTime(fieldValue);
    const constraintTime = parseTime(constraintValue);

    if (fieldTime === null || constraintTime === null) return false;

    return fieldTime >= constraintTime;
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Time Before Or Equals operator
 */
export class TimeBeforeOrEqualsOperator extends BaseOperatorStrategy<
  string,
  string
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.TimeBeforeOrEquals,
    displayName: "Time Before Or Equals",
    category: OperatorCategory.DATE_TIME,
    description:
      "Checks if the field time is before or equal to the provided time",
    acceptedFieldTypes: ["string"],
    expectedValueType: "string",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "endTime", operator: "time-before-or-equals", value: "17:00:00" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "string" || typeof constraintValue !== "string")
      return false;

    const fieldTime = parseTime(fieldValue);
    const constraintTime = parseTime(constraintValue);

    if (fieldTime === null || constraintTime === null) return false;

    return fieldTime <= constraintTime;
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Time Not Equals operator
 */
export class TimeNotEqualsOperator extends BaseOperatorStrategy<
  string,
  string
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.TimeNotEquals,
    displayName: "Time Not Equals",
    category: OperatorCategory.DATE_TIME,
    description: "Checks if the field time does not equal the provided time",
    acceptedFieldTypes: ["string"],
    expectedValueType: "string",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "breakTime", operator: "time-not-equals", value: "12:00:00" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (typeof fieldValue !== "string" || typeof constraintValue !== "string")
      return false;

    const fieldTime = parseTime(fieldValue);
    const constraintTime = parseTime(constraintValue);

    if (fieldTime === null || constraintTime === null) return false;

    return fieldTime !== constraintTime;
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is string {
    return typeof value === "string";
  }
}

/**
 * Time Not Between operator
 */
export class TimeNotBetweenOperator extends BaseOperatorStrategy<
  string,
  [string, string]
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.TimeNotBetween,
    displayName: "Time Not Between",
    category: OperatorCategory.DATE_TIME,
    description: "Checks if the field time is not between two times",
    acceptedFieldTypes: ["string"],
    expectedValueType: "array",
    requiresValue: true,
    isNegatable: true,
    example:
      '{ field: "breakTime", operator: "time-not-between", value: ["09:00:00", "17:00:00"] }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;

    if (
      typeof fieldValue !== "string" ||
      !Array.isArray(constraintValue) ||
      constraintValue.length !== 2
    ) {
      return false;
    }

    const fieldTime = parseTime(fieldValue);
    const startTime = parseTime(constraintValue[0]);
    const endTime = parseTime(constraintValue[1]);

    if (fieldTime === null || startTime === null || endTime === null)
      return false;

    return fieldTime < startTime || fieldTime > endTime;
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === "string";
  }

  isValidConstraintType(value: unknown): value is [string, string] {
    return (
      Array.isArray(value) &&
      value.length === 2 &&
      typeof value[0] === "string" &&
      typeof value[1] === "string"
    );
  }
}

/**
 * Date Not Equals To Now operator
 */
export class DateNotEqualsToNowOperator extends BaseOperatorStrategy<
  Date | string | number,
  void
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.DateNotEqualsToNow,
    displayName: "Date Not Equals Now",
    category: OperatorCategory.DATE_TIME,
    description: "Checks if the field date does not equal the current date",
    acceptedFieldTypes: ["date", "string", "number"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: true,
    example: '{ field: "eventDate", operator: "date-not-equals-to-now" }',
  };

  private equalsToNowOperator = new DateEqualsToNowOperator();

  evaluate(context: OperatorContext): boolean {
    return !this.equalsToNowOperator.evaluate(context);
  }
}

/**
 * Date After Now Or Equals operator
 */
export class DateAfterNowOrEqualsOperator extends BaseOperatorStrategy<
  Date | string | number,
  void
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.DateAfterNowOrEquals,
    displayName: "Date After Now Or Equals",
    category: OperatorCategory.DATE_TIME,
    description:
      "Checks if the field date is after or equal to the current date",
    acceptedFieldTypes: ["date", "string", "number"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: true,
    example: '{ field: "validUntil", operator: "date-after-now-or-equals" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    const fieldDate = parseDate(fieldValue);
    if (!fieldDate) return false;

    return fieldDate >= new Date();
  }
}

/**
 * Date Before Now Or Equals operator
 */
export class DateBeforeNowOrEqualsOperator extends BaseOperatorStrategy<
  Date | string | number,
  void
> {
  readonly metadata: OperatorMetadata = {
    name: Operators.DateBeforeNowOrEquals,
    displayName: "Date Before Now Or Equals",
    category: OperatorCategory.DATE_TIME,
    description:
      "Checks if the field date is before or equal to the current date",
    acceptedFieldTypes: ["date", "string", "number"],
    expectedValueType: "void",
    requiresValue: false,
    isNegatable: true,
    example: '{ field: "dueDate", operator: "date-before-now-or-equals" }',
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue } = context;

    const fieldDate = parseDate(fieldValue);
    if (!fieldDate) return false;

    return fieldDate <= new Date();
  }
}
