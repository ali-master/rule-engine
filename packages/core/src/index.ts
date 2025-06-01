// Enums
export * from "@root/enums";
// Explicit re-export for better TypeScript support
export { ConditionTypes, Operators } from "@root/enums";
// Legacy operators (for backward compatibility)
export * from "@root/operators";
// Operator System Base (must come before implementations)
export {
  BaseOperatorStrategy,
  type FieldType,
  OperatorCategory,
  type OperatorConstructor,
  type OperatorContext,
  type OperatorFactory,
  type OperatorMetadata,
  type OperatorStrategy,
  type ValidationResult as OperatorValidationResult,
  type ValueType,
} from "@root/operators/base";
// Operator System
export {
  initializeOperators,
  registerBuiltInOperators,
  registerCustomOperator,
  registerCustomOperators,
} from "@root/operators/factory";
// Operator implementations
export {
  // Comparison operators
  BetweenOperator,
  // String operators
  ContainsStringOperator,
  EndsWithOperator,
  EqualsOperator,
  GreaterThanOperator,
  GreaterThanOrEqualsOperator,
  InOperator,
  LengthBetweenOperator,
  LessThanOperator,
  LessThanOrEqualsOperator,
  LikeOperator,
  MaxLengthOperator,
  MinLengthOperator,
  NotBetweenOperator,
  NotEqualsOperator,
  NotInOperator,
  NotLikeOperator,
  StartsWithOperator,
  StringLengthOperator,
} from "@root/operators/implementations";

export { OperatorRegistry, operatorRegistry } from "@root/operators/registry";

// Services
export { ObjectDiscovery } from "@root/services";
export { Evaluator } from "@root/services/evaluator";

export { Introspector } from "@root/services/introspector";
export type { EnhancedIntrospectionResult } from "@root/services/introspector";
export { RuleEngine } from "@root/services/rule-engine";
export type { RuleEngineConfig } from "@root/services/rule-engine";
// Types (excluding ValidationResult to avoid conflict)
export {
  type Condition,
  type ConditionType,
  type Constraint,
  type Criteria,
  type CriteriaObject,
  type CriteriaRange,
  type EngineResult,
  type EvaluationResult,
  type IntrospectionResult,
  type IntrospectionStep,
  type OperatorsType,
  type RuleType,
} from "@root/types";
// Utils
export * from "@root/utils";
