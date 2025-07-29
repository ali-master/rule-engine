import type { OperatorsType } from "./rule.type";
import type {
  ValueType,
  OperatorCategory,
  FieldType,
} from "@root/operators/base";

/**
 * Dynamic TypeScript utilities for IDE auto-completion of operators
 * Provides intelligent IntelliSense for both built-in and runtime registered operators
 */

// ================================
// CORE TYPE UTILITIES
// ================================

/**
 * Extract all registered operator names from the registry at compile time
 * This type is dynamically updated when operators are registered
 */
export type ExtractRegisteredOperators = OperatorsType;

/**
 * Union type of all available operators (built-in + custom)
 * Automatically includes newly registered operators through module augmentation
 */
export type AvailableOperators =
  | ExtractRegisteredOperators
  | CustomOperatorNames;

/**
 * Custom operator names (augmented at runtime via module declaration merging)
 * This interface can be extended to add custom operators for IDE auto-completion
 */
export interface CustomOperatorNames {}

/**
 * Extract custom operator names from the CustomOperatorNames interface
 */
export type CustomOperatorUnion = keyof CustomOperatorNames extends never
  ? never
  : keyof CustomOperatorNames;

// ================================
// FIELD TYPE INFERENCE
// ================================

/**
 * Maps JavaScript types to our FieldType enum
 */
export type InferFieldType<T> = T extends string
  ? "string"
  : T extends number
    ? "number"
    : T extends boolean
      ? "boolean"
      : T extends Date
        ? "date"
        : T extends Array<any>
          ? "array"
          : T extends object
            ? "object"
            : "any";

/**
 * Maps field types to compatible operators
 */
export type OperatorsForFieldType<F extends FieldType> = F extends "string"
  ? StringOperators
  : F extends "number"
    ? NumericOperators
    : F extends "boolean"
      ? BooleanOperators
      : F extends "date"
        ? DateOperators
        : F extends "array"
          ? ArrayOperators
          : F extends "object"
            ? ObjectOperators
            : F extends "any"
              ? AvailableOperators
              : never;

/**
 * Infer compatible operators for a given field value type
 */
export type InferOperatorsForType<T> = OperatorsForFieldType<InferFieldType<T>>;

// ================================
// OPERATOR CATEGORIES
// ================================

/**
 * String-specific operators
 */
export type StringOperators =
  | "equals"
  | "not-equals"
  | "like"
  | "not-like"
  | "starts-with"
  | "ends-with"
  | "contains-string"
  | "matches"
  | "not-matches"
  | "min-length"
  | "max-length"
  | "length-between"
  | "email"
  | "url"
  | "uuid"
  | "alpha"
  | "alpha-numeric"
  | "upper-case"
  | "lower-case"
  | "null-or-white-space"
  | "not-null-or-white-space";

/**
 * Numeric-specific operators
 */
export type NumericOperators =
  | "equals"
  | "not-equals"
  | "greater-than"
  | "less-than"
  | "greater-than-or-equals"
  | "less-than-or-equals"
  | "between"
  | "not-between"
  | "min"
  | "max"
  | "positive"
  | "negative"
  | "zero"
  | "integer"
  | "float"
  | "even"
  | "odd";

/**
 * Boolean-specific operators
 */
export type BooleanOperators =
  | "equals"
  | "not-equals"
  | "truthy"
  | "falsy"
  | "boolean-string"
  | "boolean-number";

/**
 * Date-specific operators
 */
export type DateOperators =
  | "date-after"
  | "date-before"
  | "date-after-or-equals"
  | "date-before-or-equals"
  | "date-equals"
  | "date-not-equals"
  | "date-between"
  | "date-not-between"
  | "date-after-now"
  | "date-before-now";

/**
 * Array-specific operators
 */
export type ArrayOperators =
  | "contains"
  | "not-contains"
  | "contains-any"
  | "contains-all"
  | "not-contains-any"
  | "not-contains-all"
  | "array-length"
  | "array-min-length"
  | "array-max-length"
  | "in"
  | "not-in";

/**
 * Object-specific operators
 */
export type ObjectOperators =
  | "exists"
  | "not-exists"
  | "object"
  | "not-object"
  | "empty"
  | "not-empty"
  | "null-or-undefined"
  | "not-null-or-undefined";

// ================================
// VALUE TYPE INFERENCE
// ================================

/**
 * Infer the expected value type for a given operator
 */
export type InferValueTypeForOperator<O extends string> = O extends
  | "between"
  | "not-between"
  | "date-between"
  | "date-not-between"
  ? [number, number] | [Date, Date]
  : O extends "length-between" | "not-length-between"
    ? [number, number]
    : O extends "in" | "not-in" | "contains-any" | "contains-all"
      ? Array<any>
      : O extends "matches" | "not-matches"
        ? string | RegExp
        : O extends "min-length" | "max-length" | "array-length"
          ? number
          : O extends "email" | "url" | "exists" | "truthy" | "falsy"
            ? boolean
            : O extends "date-after" | "date-before" | "date-equals"
              ? Date | string
              : any;

// ================================
// SMART CONSTRAINT INTERFACES
// ================================

/**
 * Smart constraint with type-safe operator inference
 */
export interface SmartConstraint<
  TData = any,
  TField extends keyof TData = keyof TData,
> {
  field: TField | string;
  operator: string;
  value?: any;
  message?: string;
}

/**
 * Type-safe rule definition with operator inference
 */
export interface SmartRule<TResult = any, TData = any> {
  conditions:
    | SmartCondition<TResult, TData>
    | Array<SmartCondition<TResult, TData>>;
  default?: TResult;
}

/**
 * Smart condition with type inference
 */
export interface SmartCondition<TResult = any, TData = any> {
  or?: Array<SmartConstraint<TData> | SmartCondition<TResult, TData>>;
  and?: Array<SmartConstraint<TData> | SmartCondition<TResult, TData>>;
  none?: Array<SmartConstraint<TData> | SmartCondition<TResult, TData>>;
  result?: TResult;
}

// ================================
// OPERATOR METADATA TYPES
// ================================

/**
 * Runtime operator metadata for IDE hints
 */
export interface OperatorIntelliSenseInfo {
  name: string;
  displayName: string;
  description: string;
  category: OperatorCategory;
  acceptedFieldTypes: FieldType[];
  expectedValueType: ValueType;
  requiresValue: boolean;
  examples: string[];
  documentation?: string;
}

/**
 * Registry of operator metadata for IntelliSense
 */
export interface IntelliSenseRegistry {
  [operatorName: string]: OperatorIntelliSenseInfo;
}

// ================================
// MODULE AUGMENTATION SUPPORT
// ================================

/**
 * Interface for extending operator auto-completion at runtime
 * Usage:
 *
 * declare module '@usex/rule-engine' {
 *   interface CustomOperatorNames {
 *     'my-custom-operator': CustomOperator<string, number>;
 *     'business-rule-check': CustomOperator<any, boolean>;
 *   }
 * }
 */
// Custom operators can be added via module augmentation

// ================================
// UTILITY TYPES FOR ADVANCED FEATURES
// ================================

/**
 * Extract operator names by category
 */
export type OperatorsByCategory<C extends OperatorCategory> = {
  [K in keyof IntelliSenseRegistry]: IntelliSenseRegistry[K]["category"] extends C
    ? K
    : never;
}[keyof IntelliSenseRegistry];

/**
 * Extract operators that accept a specific field type
 */
export type OperatorsByFieldType<F extends FieldType> = {
  [K in keyof IntelliSenseRegistry]: F extends IntelliSenseRegistry[K]["acceptedFieldTypes"][number]
    ? K
    : never;
}[keyof IntelliSenseRegistry];

/**
 * Extract operators that require a value
 */
export type OperatorsRequiringValue = {
  [K in keyof IntelliSenseRegistry]: IntelliSenseRegistry[K]["requiresValue"] extends true
    ? K
    : never;
}[keyof IntelliSenseRegistry];

/**
 * Extract operators that don't require a value
 */
export type OperatorsNotRequiringValue = {
  [K in keyof IntelliSenseRegistry]: IntelliSenseRegistry[K]["requiresValue"] extends false
    ? K
    : never;
}[keyof IntelliSenseRegistry];

// ================================
// CONTEXTUAL HELP TYPES
// ================================

/**
 * Contextual operator suggestions based on field and value types
 */
export type SuggestOperators<
  TField,
  TValue = any,
> = InferOperatorsForType<TField> &
  (TValue extends undefined
    ? OperatorsNotRequiringValue
    : OperatorsRequiringValue);

/**
 * Auto-completion context for IDE integration
 */
export interface AutoCompletionContext<TData = any> {
  availableFields: Array<{
    name: keyof TData | string;
    type: FieldType;
    description?: string;
  }>;
  currentField?: keyof TData | string;
  currentOperator?: AvailableOperators;
  currentValue?: any;
  suggestedOperators: AvailableOperators[];
  operatorMetadata: IntelliSenseRegistry;
}

// ================================
// VALIDATION HELPERS
// ================================

/**
 * Type guard for checking if an operator is valid
 */
export type IsValidOperator<T extends string> = T extends AvailableOperators
  ? true
  : false;

/**
 * Type-safe operator validation
 */
export interface OperatorValidation<T extends string> {
  isValid: IsValidOperator<T>;
  operator: T extends AvailableOperators ? T : never;
  suggestions: T extends AvailableOperators ? never : AvailableOperators[];
}

/**
 * Runtime operator suggestions based on partial input
 */
export type OperatorSuggestions<T extends string> = T extends ""
  ? AvailableOperators[]
  : Extract<AvailableOperators, `${T}${string}`>[];

// ================================
// BUILDER PATTERN TYPES
// ================================

/**
 * Fluent builder with intelligent operator suggestions
 */
export interface SmartRuleBuilder<TResult = any, TData = any> {
  field<K extends keyof TData>(
    field: K,
  ): OperatorSelector<TData[K], TResult, TData>;
  field(field: string): OperatorSelector<any, TResult, TData>;
}

/**
 * Operator selector with type-safe suggestions
 */
export interface OperatorSelector<_TField, TResult, TData> {
  operator<O extends string>(
    operator: O,
  ): ValueSelector<_TField, O, TResult, TData>;
}

/**
 * Value selector with inferred value types
 */
export interface ValueSelector<
  _TField,
  TOperator extends string,
  TResult,
  TData,
> {
  value(
    value: InferValueTypeForOperator<TOperator>,
  ): ConstraintBuilder<TResult, TData>;
  noValue(): ConstraintBuilder<TResult, TData>; // For operators that don't require values
}

/**
 * Constraint builder for chaining conditions
 */
export interface ConstraintBuilder<TResult, TData> {
  and(): SmartRuleBuilder<TResult, TData>;
  or(): SmartRuleBuilder<TResult, TData>;
  result(result: TResult): SmartRule<TResult, TData>;
  build(): SmartRule<TResult, TData>;
}
