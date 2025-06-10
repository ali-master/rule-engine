import {
  isValidTime,
  isObject,
  dateWithTzOffset,
  convertTimeToMs,
} from "@root/utils";
import { isBefore, isAfter } from "date-fns-jalali";

/**
 * Checks if the value is equal to the compareValue. Both values must be of the same type. If the values are objects, it will compare the stringifies versions of the objects.
 * @param value
 * @param compareValue
 * @returns boolean
 * @example
 * equalsOperator(1, 1) // true
 * equalsOperator(1, 2) // false
 * equalsOperator('a', 'a') // true
 * equalsOperator('a', 'b') // false
 * equalsOperator(1, '1') // false
 * equalsOperator({ a: 1 }, { a: 1 }) // true
 * equalsOperator({ a: 1 }, { a: 2 }) // false
 * equalsOperator({ a: 1 }, { b: 1 }) // false
 * equalsOperator({ a: 1 }, { a: '1' }) // false
 * equalsOperator({ a: 1 }, { a: 1, b: 2 }) // false
 * equalsOperator(null, 1) // false
 * equalsOperator(1, null) // false
 * equalsOperator(undefined, 1) // false
 * equalsOperator(1, undefined) // false
 */
export function equalsOperator(value: any, compareValue: any): boolean {
  if (value === undefined || compareValue === undefined) return false;
  if (value === null || compareValue === null) return false;
  if (typeof value !== typeof compareValue) return false;
  if (value instanceof Date && compareValue instanceof Date)
    return value.getTime() === compareValue.getTime();
  if (
    (isObject(value) && isObject(compareValue)) ||
    (Array.isArray(value) && Array.isArray(compareValue))
  )
    return JSON.stringify(value) === JSON.stringify(compareValue);

  return value === compareValue;
}

/**
 * Checks if the value is less than the compareValue. Both values must be of the same type.
 * @param value
 * @param compareValue
 * @returns boolean
 * @example
 * lessThanOperator(1, 2) // true
 * lessThanOperator(2, 1) // false
 * lessThanOperator('a', 'b') // true
 * lessThanOperator('b', 'a') // false
 * lessThanOperator(1, 'a') // false
 * lessThanOperator('a', 1) // false
 * lessThanOperator(null, 1) // false
 * lessThanOperator(1, null) // false
 * lessThanOperator(undefined, 1) // false
 * lessThanOperator(1, undefined) // false
 */
export function greaterThanOperator(value: any, compareValue: any): boolean {
  if (value === undefined || compareValue === undefined) return false;
  if (value === null || compareValue === null) return false;
  if (typeof value !== typeof compareValue) return false;

  return value > compareValue;
}

/**
 * Checks if the value is greater than the compareValue. Both values must be of the same type.
 * @param value
 * @param compareValue
 */
export function greaterThanOrEqualsOperator(
  value: any,
  compareValue: any,
): boolean {
  return (
    equalsOperator(value, compareValue) ||
    greaterThanOperator(value, compareValue)
  );
}

/**
 * Checks if the value is less than the compareValue. Both values must be of the same type.
 * @param value
 * @param compareValue
 */
export function lessThanOperator(value: any, compareValue: any): boolean {
  if (value === undefined || compareValue === undefined) return false;
  if (value === null || compareValue === null) return false;
  if (typeof value !== typeof compareValue) return false;

  return value < compareValue;
}

/**
 * Checks if the value is less than or equal to the compareValue. Both values must be of the same type.
 * @param value
 * @param compareValue
 */
export function lessThanOrEqualsOperator(
  value: any,
  compareValue: any,
): boolean {
  return (
    equalsOperator(value, compareValue) || lessThanOperator(value, compareValue)
  );
}

/**
 * Parses and evaluates a safe and comprehensive SQL WHERE LIKE filter expression.
 *
 * @param text The text string to search (string).
 * @param pattern The pattern to match (string).
 * @param caseInsensitive (optional) A boolean flag indicating case-insensitive matching (default: false).
 * @returns boolean True if the text matches the pattern, False otherwise.
 * @example
 * likeOperator("Hello, World!", "Hello, World!") // true
 * likeOperator("Hello, World!", "Hello, %") // true
 * likeOperator("Hello, World!", "%World!") // true
 * likeOperator("Hello, World!", "%World") // false
 * likeOperator("Hello, World!", "Hello, %!", true) // true
 * likeOperator("Hello, World!", "hello, %", true) // true
 * likeOperator("Hello, World!", "Hello, %", true) // false
 * // startsWith
 * likeOperator("Hello, World!", "^Hello, World!") // true
 * likeOperator("Hello, World!", "^Hello, %") // true
 * likeOperator("Hello, World!", "^Hello, World!") // false
 * // endsWith
 * likeOperator("Hello, World!", "Hello, World!$") // true
 * likeOperator("Hello, World!", "%World!$") // true
 * likeOperator("Hello, World!", "Hello, World!$") // false
 * // startsWith and endsWith
 * likeOperator("Hello, World!", "^Hello, World!$") // true
 * likeOperator("Hello, World!", "^Hello, %$") // true
 * likeOperator("Hello, World!", "^Hello, World!$") // false
 */
export function likeOperator(
  text: string,
  pattern: string,
  caseInsensitive = false,
) {
  // Escape special characters in the pattern to prevent SQL injection
  // eslint-disable-next-line regexp/no-obscure-range
  const escapedPattern = pattern.replace(/([\\%_[\]^$!@#&?()-='">{}])/g, "$1");

  // Build the regular expression with pattern handling
  let regexStr = "^";
  let isStartsWith = false;
  let isEndsWith = false;

  for (let i = 0; i < escapedPattern.length; i++) {
    const char = escapedPattern[i];
    switch (char) {
      case "%":
        regexStr += ".*";
        break;
      case "_":
        regexStr += ".";
        break;
      case "*":
        if (i === 0) {
          isStartsWith = true; // Starts with
        } else if (i === escapedPattern.length - 1) {
          isEndsWith = true; // Ends with
        } else {
          // Invalid wildcard placement
          return false;
        }
        break;
      case "[": {
        // Character set handling
        let charSetStr = "";
        let isNegated = false;
        if (escapedPattern[i + 1] === "^") {
          isNegated = true;
          i++; // Skip leading negation character
        }
        for (let j = i + 1; j < escapedPattern.length; j++) {
          if (escapedPattern[j] === "]") {
            i = j; // Update loop index
            break;
          }
          charSetStr += escapedPattern[j];
        }
        regexStr += isNegated ? `[^${charSetStr}]` : `[${charSetStr}]`;
        break;
      }
      case "^": // Starts with
        if (i === 0) {
          isStartsWith = true;
        } else {
          // Invalid placement of "^"
          return false;
        }
        break;
      case "$": // Ends with
        if (i === escapedPattern.length - 1) {
          isEndsWith = true;
        } else {
          // Invalid placement of "$"
          return false;
        }
        break;
      case "!": // Escape following character (literal match)
        if (i + 1 < escapedPattern.length) {
          regexStr += escapedPattern[i + 1];
          i++; // Skip the escaped character
        } else {
          // Invalid escape at the end
          return false;
        }
        break;
      default:
        regexStr += char;
    }
  }

  // Add anchors based on startsWith and endsWith
  // if (isStartsWith) {
  //   regexStr = regexStr.substring(0, 1); // Remove leading ^
  // }
  if (isEndsWith) {
    regexStr += "$"; // Add trailing $
  } else if (!isStartsWith) {
    regexStr += "$"; // Add trailing $ for default full match
  }

  // Build and test the regular expression
  return new RegExp(regexStr, caseInsensitive ? "i" : undefined).test(text);
}

export function isNullOrWhiteSpaceOperator(value: string): boolean {
  return value === null || value === undefined || value.trim() === "";
}

export function isNumericOperator(value: any): boolean {
  return !Number.isNaN(Number(value));
}

export function isBooleanOperator(value: any): boolean {
  return typeof value === "boolean";
}

export function isDateOperator(value: any): boolean {
  try {
    return new Date(value).toString() !== "Invalid Date";
  } catch {
    return false;
  }
}

export function isEmailOperator(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function isUrlOperator(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isUuidOperator(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  return uuidRegex.test(value);
}

export const faAlphabet = "ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی";
export const faNumber = "۰۱۲۳۴۵۶۷۸۹";
export const faShortVowels = "َُِ";
export const faOthers = "‌آاً";
export const faMixedWithArabic = "ًٌٍَُِّْٰٔءك‌ةۀأإيـئؤ،";
export const faText = faAlphabet + faNumber + faShortVowels + faOthers;
export const faAlphaText = faAlphabet + faShortVowels + faOthers;
export const faComplexText = faText + faMixedWithArabic;
export const faAlphaComplexText = faAlphaText + faMixedWithArabic;
export function isAlphaOperator(value: string): boolean {
  const alphaRegex = /^[a-z]+$/i;
  return alphaRegex.test(value);
}
export function isPersianAlphaOperator(value: string): boolean {
  // eslint-disable-next-line regexp/no-obscure-range
  const text = value.replace(/["'-+؟\s.]/g, "");

  // eslint-disable-next-line no-misleading-character-class,regexp/no-dupe-characters-character-class,regexp/no-misleading-unicode-character
  return new RegExp(`^[${faAlphaText}]+$`).test(text);
}

export function isAlphaNumericOperator(value: string): boolean {
  const alphaNumericRegex = /^[a-z0-9]+$/i;
  return alphaNumericRegex.test(value);
}

export function isPersianAlphaNumericOperator(value: string): boolean {
  // eslint-disable-next-line regexp/no-obscure-range
  const text = value.replace(/["'-+؟\s.]/g, "");

  // eslint-disable-next-line no-misleading-character-class,regexp/no-dupe-characters-character-class,regexp/no-misleading-unicode-character
  return new RegExp(`^[${faComplexText}]+$`).test(text);
}

export function isLowerCaseOperator(value: string): boolean {
  return value === value.toLowerCase();
}

export function isUpperCaseOperator(value: string): boolean {
  return value === value.toUpperCase();
}

export function isStringOperator(value: any): boolean {
  return typeof value === "string";
}

export function isObjectOperator(value: any): boolean {
  return isObject(value);
}

export function isArrayOperator(value: any): boolean {
  return Array.isArray(value);
}

export function isBooleanStringOperator(value: string): boolean {
  return value === "true" || value === "false";
}

export function isBooleanNumberOperator(value: any): boolean {
  return value === 0 || value === 1;
}

export function isBooleanNumberStringOperator(value: any): boolean {
  return value === "0" || value === "1";
}

export function isNumberOperator(value: any): boolean {
  // Check if it's a number using typeof
  if (typeof value === "number") {
    // Check for NaN (Not a Number)
    return !Number.isNaN(value);
  }

  // Check if it's a string and can be converted to a number
  if (typeof value === "string") {
    const num = Number(value);
    return !Number.isNaN(num) && value.trim() !== "";
  }

  return false;
}

export function isIntegerOperator(value: any): boolean {
  if (!isNumberOperator(value)) return false;

  return value === Number.parseInt(value, 10);
}

export function isFloatOperator(value: any): boolean {
  if (!isNumericOperator(value)) return false;

  const epsilon = Number.EPSILON; // Machine epsilon for floating-point precision
  return (
    Number.isFinite(value) && Math.abs(value - Math.floor(value)) > epsilon
  );
}

export function isPositiveOperator(value: any): boolean {
  if (!isNumericOperator(value)) return false;

  return value > 0;
}

export function isNegativeOperator(value: any): boolean {
  if (!isNumericOperator(value)) return false;

  return value < 0;
}

export function isZeroOperator(value: any): boolean {
  if (!isNumericOperator(value)) return false;

  return Number(value) === 0;
}

export function isNumberBetweenOperator(
  value: any,
  compareValues: any[],
): boolean {
  if (!Array.isArray(compareValues) || compareValues.length !== 2) return false;
  if (!isNumericOperator(value)) return false;

  const [start, end] = compareValues;
  return value >= Number(start) && value <= Number(end);
}

export function isLengthOperator(value: any, compareValue: any): boolean {
  if (!isStringOperator(value)) return false;
  if (!isNumericOperator(compareValue)) return false;

  return value.length === compareValue;
}

export function isMinLengthOperator(value: any, compareValue: any): boolean {
  if (!isStringOperator(value)) return false;
  if (!isNumericOperator(compareValue)) return false;

  return value.length >= compareValue;
}

export function isMaxLengthOperator(value: any, compareValue: any): boolean {
  if (!isStringOperator(value)) return false;
  if (!isNumericOperator(compareValue)) return false;

  return value.length <= compareValue;
}

export function IsLengthBetweenOperator(
  value: any,
  compareValues: any[],
): boolean {
  if (typeof value !== "string") return false;
  if (!Array.isArray(compareValues) || compareValues.length !== 2) return false;

  const [min, max] = compareValues;
  return value.length >= Number(min) && value.length <= Number(max);
}

export function isMinOperator(value: any, compareValue: any): boolean {
  if (!isNumericOperator(value)) return false;
  if (!isNumericOperator(compareValue)) return false;

  return value >= compareValue;
}

export function isMaxOperator(value: any, compareValue: any): boolean {
  return value <= compareValue;
}

export function isBetweenOperator(value: any, compareValues: any[]): boolean {
  if (!Array.isArray(compareValues) || compareValues.length !== 2) return false;
  if (!isNumericOperator(value)) return false;

  const [min, max] = compareValues;
  return value >= Number(min) && value <= Number(max);
}

export function isFalsyOperator(value: any): boolean {
  // Standard JavaScript falsy values: false, 0, -0, 0n, "", null, undefined, NaN
  return (
    (!value && value !== 0 && value !== false && value !== "") ||
    value === 0 ||
    value === false ||
    value === "" ||
    value === null ||
    value === undefined ||
    Number.isNaN(value)
  );
}

export function isTruthyOperator(value: any): boolean {
  // Returns true for any truthy value in JavaScript
  return !!value;
}

/**
 * Checks if the value is not equal to the compareValue. Both values must be of the same type.
 * @param value
 * @param compareValues
 * @constructor
 */
export function inOperator(value: any, compareValues: any[]): boolean {
  if (!Array.isArray(compareValues)) return false;

  return compareValues.includes(value);
}

export function containsOperator(value: any, compareValue: any): boolean {
  if (!Array.isArray(value)) return false;

  return value.includes(compareValue);
}

export function selfContainsAllOperator(
  value: any,
  compareValues: any[],
): boolean {
  if (!isStringOperator(value) || !Array.isArray(compareValues)) return false;

  return compareValues.every((compareValue) => value.includes(compareValue));
}

export function selfContainsAnyOperator(
  value: any,
  compareValues: any[],
): boolean {
  if (!isStringOperator(value) || !Array.isArray(compareValues)) return false;

  return compareValues.some((compareValue) => value.includes(compareValue));
}

export function selfContainsNoneOperator(
  value: any,
  compareValues: any[],
): boolean {
  if (!isStringOperator(value) || !Array.isArray(compareValues)) return false;

  return compareValues.every((compareValue) => !value.includes(compareValue));
}

export function containsAnyOperator(value: any, compareValues: any[]): boolean {
  if (!Array.isArray(value) || !Array.isArray(compareValues)) return false;

  return value.some((compareValue) => compareValues.includes(compareValue));
}

export function containsAllOperator(value: any, compareValues: any[]): boolean {
  if (!Array.isArray(value) || !Array.isArray(compareValues)) return false;

  return compareValues.every((compareValue) => value.includes(compareValue));
}

export function matchesOperator(value: string, pattern: string): boolean {
  if (!isStringOperator(value) || !isStringOperator(pattern)) return false;
  if (pattern.length === 0) return false;

  if (pattern.startsWith("/") && pattern.endsWith("/")) {
    pattern = pattern.slice(1, -1);
  }
  return new RegExp(pattern).test(value);
}

export function isExistsInObjectOperator(key: any, obj: any): boolean {
  if (!isObject(obj)) return false;

  return key in obj;
}

export function isNullOrUndefinedOperator(value: any): boolean {
  return value === null || value === undefined;
}

export function isEmptyOperator(value: any): boolean {
  if (Array.isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  if (typeof value === "string") return value === "";

  return false;
}

export function isDateAfterOperator(left: any, right: any): boolean {
  try {
    return (
      left !== right &&
      isAfter(
        dateWithTzOffset(new Date(left)),
        dateWithTzOffset(new Date(right)),
      )
    );
  } catch {
    return false;
  }
}

export function isDateAfterNowOperator(value: any): boolean {
  try {
    return isAfter(dateWithTzOffset(new Date(value)), new Date());
  } catch {
    return false;
  }
}

export function isDateBeforeOperator(left: any, right: any): boolean {
  try {
    return (
      left !== right &&
      isBefore(
        dateWithTzOffset(new Date(left)),
        dateWithTzOffset(new Date(right)),
      )
    );
  } catch {
    return false;
  }
}

export function isDateBeforeNowOperator(value: any): boolean {
  try {
    return isBefore(dateWithTzOffset(new Date(value)), new Date());
  } catch {
    return false;
  }
}

export function isDateAfterOrEqualsOperator(left: any, right: any): boolean {
  try {
    return !isBefore(
      dateWithTzOffset(new Date(left)),
      dateWithTzOffset(new Date(right)),
    );
  } catch {
    return false;
  }
}

export function isDateAfterNowOrEqualsOperator(value: any): boolean {
  try {
    return !isBefore(dateWithTzOffset(new Date(value)), new Date());
  } catch {
    return false;
  }
}

export function isDateBeforeOrEqualsOperator(left: any, right: any): boolean {
  try {
    return !isAfter(
      dateWithTzOffset(new Date(left)),
      dateWithTzOffset(new Date(right)),
    );
  } catch {
    return false;
  }
}

export function isDateBeforeNowOrEqualsOperator(value: any): boolean {
  try {
    return !isAfter(dateWithTzOffset(new Date(value)), new Date());
  } catch {
    return false;
  }
}

export function isDateEqualsOperator(left: any, right: any): boolean {
  try {
    return (
      dateWithTzOffset(new Date(left)).getTime() ===
      dateWithTzOffset(new Date(right)).getTime()
    );
  } catch {
    return false;
  }
}

export function isDateEqualsToNowOperator(dateValue: any): boolean {
  try {
    return (
      dateWithTzOffset(new Date(dateValue)).getTime() === new Date().getTime()
    );
  } catch {
    return false;
  }
}

export function isDateBetweenOperator(left: any, rightRange: any[]): boolean {
  try {
    if (!Array.isArray(rightRange) || rightRange.length !== 2) return false;

    const [start, end] = rightRange;
    return (
      isAfter(
        dateWithTzOffset(new Date(left)),
        dateWithTzOffset(new Date(start)),
      ) &&
      isBefore(
        dateWithTzOffset(new Date(left)),
        dateWithTzOffset(new Date(end)),
      )
    );
  } catch {
    return false;
  }
}

export function isTimeAfterOperator(left: any, right: any): boolean {
  try {
    return convertTimeToMs(left) > convertTimeToMs(right);
  } catch {
    return false;
  }
}

export function isTimeBeforeOperator(left: any, right: any): boolean {
  try {
    return convertTimeToMs(left) < convertTimeToMs(right);
  } catch {
    return false;
  }
}

export function isTimeAfterOrEqualsOperator(left: any, right: any): boolean {
  try {
    return convertTimeToMs(left) >= convertTimeToMs(right);
  } catch {
    return false;
  }
}

export function isTimeBeforeOrEqualsOperator(left: any, right: any): boolean {
  try {
    return convertTimeToMs(left) <= convertTimeToMs(right);
  } catch {
    return false;
  }
}

export function isTimeEqualsOperator(left: any, right: any): boolean {
  try {
    return convertTimeToMs(left) === convertTimeToMs(right);
  } catch {
    return false;
  }
}

export function isTimeBetweenOperator(left: any, right: any[]): boolean {
  if (!Array.isArray(right) || right.length !== 2) return false;
  if (!isValidTime(left)) return false;

  const [start, end] = right;
  return isTimeAfterOperator(left, start) && isTimeBeforeOperator(left, end);
}
