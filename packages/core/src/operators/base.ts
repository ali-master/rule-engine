import type { OperatorsType } from "@root/types";

/**
 * Type representing the expected field types for operators
 */
export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "array"
  | "object"
  | "any"
  | "time";

/**
 * Type representing the expected value types for operators
 */
export type ValueType = FieldType | "regex" | "range" | "void";

/**
 * Metadata for an operator
 */
export interface OperatorMetadata {
  /**
   * Unique name of the operator
   */
  name: OperatorsType;

  /**
   * Human-readable display name
   */
  displayName: string;

  /**
   * Category for grouping operators
   */
  category: OperatorCategory;

  /**
   * Description of what the operator does
   */
  description: string;

  /**
   * Accepted field types
   */
  acceptedFieldTypes: FieldType[];

  /**
   * Expected value type
   */
  expectedValueType: ValueType;

  /**
   * Whether the operator requires a value
   */
  requiresValue: boolean;

  /**
   * Whether the operator is negatable (has a NOT version)
   */
  isNegatable?: boolean;

  /**
   * Example usage
   */
  example?: string;
}

/**
 * Operator categories for organization
 */
export enum OperatorCategory {
  COMPARISON = "comparison",
  STRING = "string",
  NUMERIC = "numeric",
  ARRAY = "array",
  DATE_TIME = "date_time",
  TYPE = "type",
  EXISTENCE = "existence",
  BOOLEAN = "boolean",
  PATTERN = "pattern",
  PERSIAN = "persian",
}

/**
 * Context passed to operators during evaluation
 */
export interface OperatorContext {
  /**
   * The field value being evaluated
   */
  fieldValue: any;

  /**
   * The constraint value to compare against
   */
  constraintValue?: any;

  /**
   * The full criteria object for self-referencing
   */
  criteria?: Record<string, any>;

  /**
   * The field path that was resolved
   */
  fieldPath?: string;
}

/**
 * Result of operator validation
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Base interface for all operator strategies
 */
export interface OperatorStrategy<TField = any, TValue = any> {
  /**
   * Metadata about the operator
   */
  readonly metadata: OperatorMetadata;

  /**
   * Validates the input values before evaluation
   * @param context The operator context
   * @returns Validation result
   */
  validate(context: OperatorContext): ValidationResult;

  /**
   * Evaluates the operator logic
   * @param context The operator context
   * @returns Boolean result of the evaluation
   */
  evaluate(context: OperatorContext): boolean;

  /**
   * Type guard for field value
   * @param value The value to check
   * @returns Type predicate
   */
  isValidFieldType?(value: unknown): value is TField;

  /**
   * Type guard for constraint value
   * @param value The value to check
   * @returns Type predicate
   */
  isValidConstraintType?(value: unknown): value is TValue;

  /**
   * Gets the negated version of this operator
   * @returns The negated operator strategy or null if not negatable
   */
  getNegated?(): OperatorStrategy<TField, TValue> | null;

  /**
   * Formats error messages with context
   * @param template Message template with placeholders
   * @param context The operator context
   * @returns Formatted message
   */
  formatMessage?(template: string, context: OperatorContext): string;
}

/**
 * Base abstract class for operator strategies
 */
export abstract class BaseOperatorStrategy<TField = any, TValue = any>
  implements OperatorStrategy<TField, TValue>
{
  abstract readonly metadata: OperatorMetadata;

  /**
   * Default validation implementation
   */
  validate(context: OperatorContext): ValidationResult {
    const { fieldValue, constraintValue } = context;

    // Check if value is required but not provided
    if (this.metadata.requiresValue && constraintValue === undefined) {
      return {
        isValid: false,
        error: `Operator "${this.metadata.displayName}" requires a value`,
      };
    }

    // Validate field type if type guard is implemented
    if (
      "isValidFieldType" in this &&
      typeof this.isValidFieldType === "function" &&
      !this.isValidFieldType(fieldValue)
    ) {
      return {
        isValid: false,
        error: `Invalid field type for operator "${this.metadata.displayName}". Expected one of: ${this.metadata.acceptedFieldTypes.join(", ")}`,
      };
    }

    // Validate constraint type if type guard is implemented
    if (
      "isValidConstraintType" in this &&
      typeof this.isValidConstraintType === "function" &&
      constraintValue !== undefined
    ) {
      if (!this.isValidConstraintType(constraintValue)) {
        return {
          isValid: false,
          error: `Invalid value type for operator "${this.metadata.displayName}". Expected: ${this.metadata.expectedValueType}`,
        };
      }
    }

    return { isValid: true };
  }

  abstract evaluate(context: OperatorContext): boolean;

  /**
   * Default message formatter
   */
  formatMessage(template: string, context: OperatorContext): string {
    return template
      .replace("{{field}}", context.fieldPath || "field")
      .replace("{{value}}", JSON.stringify(context.constraintValue))
      .replace("{{fieldValue}}", JSON.stringify(context.fieldValue));
  }
}

/**
 * Factory function type for creating operator instances
 */
export type OperatorFactory = () => OperatorStrategy;

/**
 * Type for operator constructor
 */
export type OperatorConstructor = new () => OperatorStrategy;
