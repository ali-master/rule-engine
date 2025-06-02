# API Reference v2.1

Complete API reference for @usex/rule-engine v2.1 with enhanced TypeScript support.

## Table of Contents

- [RuleEngine Class](#ruleengine-class)
- [Evaluator Class](#evaluator-class)
- [ObjectDiscovery Class](#objectdiscovery-class)
- [Mutator Class](#mutator-class)
- [Types and Interfaces](#types-and-interfaces)
- [Operators](#operators)

## RuleEngine Class

The main class for rule evaluation. Uses singleton pattern for instance management.

### Getting an Instance

```typescript
const engine = RuleEngine.getInstance(config?: RuleEngineConfig);
```

### Configuration Options

```typescript
interface RuleEngineConfig {
  trustMode?: boolean;              // Skip validation for performance
  autoInitializeOperators?: boolean; // Auto-register built-in operators
  customOperatorInit?: () => void;   // Custom initialization function
  enableOptimizations?: boolean;     // Enable performance optimizations
  enableCaching?: boolean;          // Cache evaluation results
  maxCacheSize?: number;            // Maximum cache entries
}
```

### Instance Methods

#### evaluate

Evaluates a rule against criteria with automatic type inference.

```typescript
// Overload 1: Single criteria object
evaluate<T = any>(
  rule: RuleType,
  criteria: CriteriaObject<T>,
  trustRule?: boolean
): Promise<EvaluationResult<T>>

// Overload 2: Array of criteria
evaluate<T = any>(
  rule: RuleType,
  criteria: Array<T>,
  trustRule?: boolean
): Promise<Array<EvaluationResult<T>>>

// Example usage
const singleResult = await engine.evaluate(rule, { age: 25 });
// TypeScript knows: singleResult is EvaluationResult<T>

const arrayResults = await engine.evaluate(rule, [{ age: 25 }, { age: 30 }]);
// TypeScript knows: arrayResults is Array<EvaluationResult<T>>
```

#### checkIsPassed

Quick check if a rule passes, with optimized return types.

```typescript
// Overload 1: Single criteria
checkIsPassed(
  rule: RuleType,
  criteria: CriteriaObject,
  trustRule?: boolean
): Promise<boolean>

// Overload 2: Array of criteria
checkIsPassed<T = any>(
  rule: RuleType,
  criteria: Array<T>,
  trustRule?: boolean
): Promise<boolean | boolean[]>

// Example
const passed = await engine.checkIsPassed(rule, { age: 25 }); // boolean
const allPassed = await engine.checkIsPassed(rule, [{ age: 25 }, { age: 16 }]); // boolean | boolean[]
```

#### getEvaluateResult

Get just the evaluation result value without metadata.

```typescript
// Overload 1: Single criteria
getEvaluateResult<T = any>(
  rule: RuleType,
  criteria: CriteriaObject,
  trustRule?: boolean
): Promise<T>

// Overload 2: Array of criteria
getEvaluateResult<T = any>(
  rule: RuleType,
  criteria: Array<any>,
  trustRule?: boolean
): Promise<T[]>

// Example
const value = await engine.getEvaluateResult<number>(rule, { score: 100 }); // number
const values = await engine.getEvaluateResult<number>(rule, [{ score: 100 }]); // number[]
```

#### evaluateMany

Evaluate multiple rules against the same criteria.

```typescript
// Overload 1: Single criteria
evaluateMany<T = any>(
  rules: RuleType[],
  criteria: CriteriaObject<T>,
  trustRule?: boolean
): Promise<Array<EvaluationResult<T>>>

// Overload 2: Array of criteria
evaluateMany<T = any>(
  rules: RuleType[],
  criteria: Array<T>,
  trustRule?: boolean
): Promise<Array<Array<EvaluationResult<T>>>>

// Example
const results = await engine.evaluateMany([rule1, rule2], { age: 25 });
// Array<EvaluationResult<T>> - one result per rule
```

#### Mutation Methods

```typescript
// Add a mutation
addMutation(field: string, mutation: MutationFunction): void

// Remove a specific mutation
removeMutation(field: string): void

// Clear all mutations (v2.1: now removes mutations, not just cache)
clearMutations(): void

// Clear mutation cache only
clearMutationCache(field?: string): void

// Clear evaluation cache
clearCache(): void
```

#### Introspection Methods

```typescript
// Introspect a rule with enhanced options
introspect<R = any>(
  rule: RuleType<R>,
  options?: {
    includeMetadata?: boolean;
    includeComplexity?: boolean;
    validateOperators?: boolean;
  }
): EnhancedIntrospectionResult<R>

// Validate operators in a rule
validateOperators(rule: RuleType): ValidationResult

// Get all operators used in a rule
getUsedOperators(rule: RuleType): Set<string>
```

### Static Methods

All instance methods are also available as static methods:

```typescript
// Static evaluate with overloads
static evaluate<T = any>(
  rule: RuleType,
  criteria: CriteriaObject<T>,
  trustRule?: boolean
): Promise<EvaluationResult<T>>

static evaluate<T = any>(
  rule: RuleType,
  criteria: Array<T>,
  trustRule?: boolean
): Promise<Array<EvaluationResult<T>>>

// Static checkIsPassed with overloads
static checkIsPassed(
  rule: RuleType,
  criteria: CriteriaObject,
  trustRule?: boolean
): Promise<boolean>

static checkIsPassed<T = any>(
  rule: RuleType,
  criteria: Array<T>,
  trustRule?: boolean
): Promise<boolean | boolean[]>

// Static getEvaluateResult with overloads
static getEvaluateResult<T = any>(
  rule: RuleType,
  criteria: CriteriaObject,
  trustRule?: boolean
): Promise<T>

static getEvaluateResult<T = any>(
  rule: RuleType,
  criteria: Array<any>,
  trustRule?: boolean
): Promise<T[]>
```

## Evaluator Class

Low-level evaluation engine used internally by RuleEngine.

### Methods

#### evaluate

```typescript
// Overload 1: Single criteria
evaluate(
  rule: RuleType,
  criteria: CriteriaObject<T>
): EvaluationResult<T>

// Overload 2: Array of criteria
evaluate(
  rule: RuleType,
  criteria: Array<T>
): Array<EvaluationResult<T>>
```

## ObjectDiscovery Class

Utility class for JSONPath operations and property resolution.

### Methods with Overloads

#### resolveProperty

```typescript
// Overload 1: Single object
resolveProperty(path: string, json: CriteriaObject<T>): any

// Overload 2: Array
resolveProperty(path: string, json: Array<T>): any

// Example
const value = discovery.resolveProperty("$.user.name", { user: { name: "John" } });
```

#### updateProperty

```typescript
// Overload 1: Single object
updateProperty(path: string, json: CriteriaObject<T>, value: any): any

// Overload 2: Array
updateProperty(path: string, json: Array<T>, value: any): any

// Example
discovery.updateProperty("$.user.active", userData, true);
```

#### resolveTextPathExpressions

```typescript
// Overload 1: Single object
resolveTextPathExpressions(str: string, criteria: CriteriaObject<T>): string

// Overload 2: Array
resolveTextPathExpressions(str: string, criteria: Array<T>): string

// Example
const message = discovery.resolveTextPathExpressions(
  "Hello $.name, your score is $.score",
  { name: "John", score: 100 }
);
// Result: "Hello John, your score is 100"
```

## Mutator Class

Handles data mutations before rule evaluation.

### Key Methods

```typescript
// Add a mutation
add(name: string, mutation: MutationFunction): void

// Remove mutation(s)
remove(names: string | string[]): void

// Remove all mutations (v2.1: new method)
removeAll(): void

// Clear cache
clearCache(name?: string): void

// Mutate data (handles both objects and arrays automatically)
mutate(criteria: Criteria): Promise<Criteria>
```

## Types and Interfaces

### Core Types

```typescript
// Criteria types
type CriteriaObject<T = any> = Record<string, T>;
type Criteria<T = any> = CriteriaObject<T> | Array<T>;

// Rule types
interface RuleType<R = any> {
  conditions: Condition<R> | Array<Condition<R>>;
  default?: EngineResult<R>;
}

// Evaluation result
interface EvaluationResult<T = any> {
  value: T;
  isPassed: boolean;
  message?: string;
}

// Condition types
interface Condition<R = any> {
  or?: Array<Constraint | Condition<R>>;
  and?: Array<Constraint | Condition<R>>;
  none?: Array<Constraint | Condition<R>>;
  result?: EngineResult<R>;
}

// Constraint type
interface Constraint {
  field: string;
  operator: OperatorsType;
  value?: any;
  message?: string;
}
```

### Operator Types

```typescript
// Base operator strategy
abstract class BaseOperatorStrategy<TField = any, TConstraint = any> {
  abstract readonly metadata: OperatorMetadata;
  abstract evaluate(context: OperatorContext): boolean;
  abstract isValidFieldType(value: unknown): value is TField;
  abstract isValidConstraintType(value: unknown): value is TConstraint;
  
  // Optional overrides
  validate?(context: OperatorContext): ValidationResult;
  formatMessage?(template: string, context: OperatorContext): string;
}

// Operator context
interface OperatorContext {
  fieldValue: any;
  constraintValue: any;
  criteria: Criteria;
  fieldPath: string;
}

// Operator metadata
interface OperatorMetadata {
  name: string;
  displayName: string;
  category: OperatorCategory;
  description: string;
  acceptedFieldTypes: FieldType[];
  expectedValueType: ValueType;
  requiresValue: boolean;
  isNegatable?: boolean;
  example: string;
}
```

## Best Practices

1. **Use TypeScript generics** for type-safe results:
   ```typescript
   const result = await engine.evaluate<MyResultType>(rule, criteria);
   ```

2. **Leverage overloads** for better type inference:
   ```typescript
   // Let TypeScript infer based on input
   const result = await engine.evaluate(rule, { age: 25 }); // Single result
   const results = await engine.evaluate(rule, [{ age: 25 }]); // Array result
   ```

3. **Use singleton pattern** for resource efficiency:
   ```typescript
   const engine = RuleEngine.getInstance(); // Reuses existing instance
   ```

4. **Clean up in tests** to avoid state pollution:
   ```typescript
   afterEach(() => {
     const engine = RuleEngine.getInstance();
     engine.clearMutations();
     engine.clearCache();
   });
   ```

5. **Enable caching** for performance:
   ```typescript
   const engine = RuleEngine.getInstance({
     enableCaching: true,
     maxCacheSize: 1000
   });
   ```