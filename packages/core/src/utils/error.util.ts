import type { ValidationResult } from "@root/types";

export class RuleError extends Error {
  constructor(validationResult: ValidationResult) {
    super(validationResult.error?.message ?? "");

    this.error = validationResult.error || null;
    this.isValid = validationResult.isValid;
    this.element = validationResult.error?.element || null;
  }

  /** Indicates whether the rule is valid or not. */
  isValid: boolean;

  /** The name/type of the error. */
  type: string = RuleError.name;

  /** The element that caused the error. */
  element: object | null;

  /** Error */
  error: ValidationResult["error"] | null;

  toModel?(): ValidationResult {
    return {
      isValid: this.isValid,
      error: {
        message: this.message,
        element: this.element as object,
      },
    };
  }
}

export class RuleTypeError extends Error {
  constructor(message: string) {
    super(message ?? "The type of rule is not valid for this operation");
  }

  /** The name/type of the error. */
  type: string = RuleError.name;
}
