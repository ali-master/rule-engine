/**
 * Factory for registering all built-in operators
 */

import { operatorRegistry } from "./registry";
import type { OperatorFactory, OperatorConstructor } from "./base";

// Import all operator implementations
import {
  ZeroOperator,
  UUIDOperator,
  UrlOperator,
  UpperCaseOperator,
  TruthyOperator,
  TimeNotEqualsOperator,
  TimeNotBetweenOperator,
  TimeEqualsOperator,
  TimeBetweenOperator,
  TimeBeforeOrEqualsOperator,
  TimeBeforeOperator,
  TimeAfterOrEqualsOperator,
  TimeAfterOperator,
  StringOperator,
  StringLengthOperator,
  StartsWithOperator,
  SelfNotContainsAnyOperator,
  SelfNotContainsAllOperator,
  SelfContainsNoneOperator,
  SelfContainsAnyOperator,
  SelfContainsAllOperator,
  PositiveOperator,
  PersianAlphaOperator,
  PersianAlphaNumericOperator,
  ObjectOperator,
  NumericOperator,
  NumberOperator,
  NumberBetweenOperator,
  NullOrWhiteSpaceOperator,
  NullOrUndefinedOperator,
  NotZeroOperator,
  NotUUIDOperator,
  NotUrlOperator,
  NotUpperCaseOperator,
  NotTruthyOperator,
  NotStringOperator,
  NotStringLengthOperator,
  NotPositiveOperator,
  NotPersianAlphaOperator,
  NotPersianAlphaNumericOperator,
  // Type
  NotObjectOperator,
  NotNumericOperator,
  NotNumberOperator,
  NotNumberBetweenOperator,
  NotNullOrWhiteSpaceOperator,
  NotNullOrUndefinedOperator,
  NotNegativeOperator,
  NotMatchesOperator,
  NotLowerCaseOperator,
  NotLikeOperator,
  NotLengthBetweenOperator,
  NotIntegerOperator,
  NotInOperator,
  NotFloatOperator,
  NotFalsyOperator,
  NotExistsOperator,
  NotEqualsOperator,
  NotEmptyOperator,
  NotEmailOperator,
  NotDateOperator,
  NotContainsOperator,
  NotContainsAnyOperator,
  NotContainsAllOperator,
  NotBooleanStringOperator,
  NotBooleanOperator,
  NotBooleanNumberStringOperator,
  NotBooleanNumberOperator,
  NotBetweenOperator,
  NotArrayOperator,
  NotAlphaOperator,
  NotAlphaNumericOperator,
  NegativeOperator,
  MinOperator,
  MinLengthOperator,
  MaxOperator,
  MaxLengthOperator,
  MatchesOperator,
  LowerCaseOperator,
  LikeOperator,
  LessThanOrEqualsOperator,
  LessThanOperator,
  LengthBetweenOperator,
  IntegerOperator,
  InOperator,
  GreaterThanOrEqualsOperator,
  GreaterThanOperator,
  // Numeric
  FloatOperator,
  FalsyOperator,
  ExistsOperator,
  EqualsOperator,
  EndsWithOperator,
  // Existence
  EmptyOperator,
  EmailOperator,
  DateOperator,
  DateNotEqualsToNowOperator,
  DateNotEqualsOperator,
  DateNotBetweenOperator,
  DateEqualsToNowOperator,
  DateEqualsOperator,
  DateBetweenOperator,
  DateBeforeOrEqualsOperator,
  DateBeforeOperator,
  DateBeforeNowOrEqualsOperator,
  DateBeforeNowOperator,
  DateAfterOrEqualsOperator,
  DateAfterOperator,
  DateAfterNowOrEqualsOperator,
  // Date/Time
  DateAfterNowOperator,
  // String
  ContainsStringOperator,
  ContainsOperator,
  ContainsAnyOperator,
  ContainsAllOperator,
  BooleanStringOperator,
  BooleanOperator,
  BooleanNumberStringOperator,
  // Boolean
  BooleanNumberOperator,
  // Comparison
  BetweenOperator,
  // Array
  ArrayOperator,
  AlphaOperator,
  // Pattern
  AlphaNumericOperator,
} from "./implementations";

/**
 * List of all built-in operator classes
 */
const BUILT_IN_OPERATORS: Array<OperatorConstructor> = [
  // Array operators
  ArrayOperator,
  NotArrayOperator,
  ContainsOperator,
  NotContainsOperator,
  ContainsAnyOperator,
  NotContainsAnyOperator,
  ContainsAllOperator,
  NotContainsAllOperator,
  SelfContainsAnyOperator,
  SelfNotContainsAnyOperator,
  SelfContainsAllOperator,
  SelfNotContainsAllOperator,
  SelfContainsNoneOperator,
  // Boolean operators
  BooleanOperator,
  NotBooleanOperator,
  BooleanStringOperator,
  NotBooleanStringOperator,
  BooleanNumberOperator,
  NotBooleanNumberOperator,
  BooleanNumberStringOperator,
  NotBooleanNumberStringOperator,
  TruthyOperator,
  NotTruthyOperator,
  FalsyOperator,
  NotFalsyOperator,
  // Comparison operators
  EqualsOperator,
  NotEqualsOperator,
  GreaterThanOperator,
  GreaterThanOrEqualsOperator,
  LessThanOperator,
  LessThanOrEqualsOperator,
  InOperator,
  NotInOperator,
  BetweenOperator,
  NotBetweenOperator,
  // Date/Time operators
  DateAfterOperator,
  DateAfterNowOperator,
  DateAfterNowOrEqualsOperator,
  DateBeforeOperator,
  DateBeforeNowOperator,
  DateBeforeNowOrEqualsOperator,
  DateEqualsOperator,
  DateEqualsToNowOperator,
  DateNotEqualsOperator,
  DateNotEqualsToNowOperator,
  DateAfterOrEqualsOperator,
  DateBeforeOrEqualsOperator,
  DateBetweenOperator,
  DateNotBetweenOperator,
  TimeAfterOperator,
  TimeAfterOrEqualsOperator,
  TimeBeforeOperator,
  TimeBeforeOrEqualsOperator,
  TimeEqualsOperator,
  TimeNotEqualsOperator,
  TimeBetweenOperator,
  TimeNotBetweenOperator,
  DateOperator,
  NotDateOperator,
  // Existence operators
  ExistsOperator,
  NotExistsOperator,
  NullOrUndefinedOperator,
  NotNullOrUndefinedOperator,
  EmptyOperator,
  NotEmptyOperator,
  NullOrWhiteSpaceOperator,
  NotNullOrWhiteSpaceOperator,
  // Numeric operators
  NumericOperator,
  NotNumericOperator,
  NumberOperator,
  NotNumberOperator,
  IntegerOperator,
  NotIntegerOperator,
  FloatOperator,
  NotFloatOperator,
  PositiveOperator,
  NotPositiveOperator,
  NegativeOperator,
  NotNegativeOperator,
  ZeroOperator,
  NotZeroOperator,
  MinOperator,
  MaxOperator,
  NumberBetweenOperator,
  NotNumberBetweenOperator,
  // Pattern operators
  EmailOperator,
  NotEmailOperator,
  UrlOperator,
  NotUrlOperator,
  UUIDOperator,
  NotUUIDOperator,
  AlphaOperator,
  NotAlphaOperator,
  AlphaNumericOperator,
  NotAlphaNumericOperator,
  PersianAlphaOperator,
  NotPersianAlphaOperator,
  PersianAlphaNumericOperator,
  NotPersianAlphaNumericOperator,
  LowerCaseOperator,
  NotLowerCaseOperator,
  UpperCaseOperator,
  NotUpperCaseOperator,
  MatchesOperator,
  NotMatchesOperator,
  // String operators
  LikeOperator,
  NotLikeOperator,
  StartsWithOperator,
  EndsWithOperator,
  ContainsStringOperator,
  StringLengthOperator,
  NotStringLengthOperator,
  MinLengthOperator,
  MaxLengthOperator,
  LengthBetweenOperator,
  NotLengthBetweenOperator,
  // Type operators
  StringOperator,
  NotStringOperator,
  ObjectOperator,
  NotObjectOperator,
];

/**
 * Register all built-in operators
 * @param override Whether to override existing operators
 */
export function registerBuiltInOperators(override = false): void {
  // Only register if not already initialized
  if (!operatorRegistry.isInitialized() || override) {
    operatorRegistry.registerMany(BUILT_IN_OPERATORS, override);
    operatorRegistry.markInitialized();
  }
}

/**
 * Register a custom operator
 * @param operator The operator class or factory
 * @param override Whether to override existing operator
 */
export function registerCustomOperator(
  operator: OperatorConstructor | OperatorFactory,
  override = false,
): void {
  operatorRegistry.register(operator, override);
}

/**
 * Register multiple custom operators
 * @param operators Array of operator classes or factories
 * @param override Whether to override existing operators
 */
export function registerCustomOperators(
  operators: Array<OperatorConstructor | OperatorFactory>,
  override = false,
): void {
  operatorRegistry.registerMany(operators, override);
}

/**
 * Initialize the operator system with built-in operators
 * This should be called once at application startup
 */
export function initializeOperators(): void {
  // Only initialize if not already done
  if (!operatorRegistry.isInitialized()) {
    registerBuiltInOperators();
  }
}

// Export registry instance for direct access if needed
export { operatorRegistry } from "./registry";
