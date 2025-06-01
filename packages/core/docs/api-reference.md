# API Reference

Complete API documentation for @usex/rule-engine.

## Table of Contents

- [RuleEngine Class](#ruleengine-class)
- [ObjectDiscovery Service](#objectdiscovery-service)
- [Builder API](#builder-api)
- [Types & Interfaces](#types--interfaces)
- [Enums](#enums)
- [Utilities](#utilities)

## RuleEngine Class

The main class for rule evaluation and management.

### Constructor

```typescript
new RuleEngine(options?: RuleEngineOptions)
```

#### Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `logger` | `Logger` | `console` | Custom logger implementation |
| `cache` | `boolean` | `true` | Enable/disable mutation caching |
| `mutations` | `Map<string, MutationFunction>` | `new Map()` | Initial mutations |

### Instance Methods

#### evaluate

Evaluates a rule against criteria.

```typescript
async evaluate<R = any>(
  rule: RuleType<R>, 
  criteria: any | any[], 
  trustRule?: boolean
): Promise<EvaluationResult<R> | EvaluationResult<R>[]>
```

**Parameters:**
- `rule`: The rule to evaluate
- `criteria`: Single object or array of objects to evaluate against
- `trustRule`: Skip rule validation if true (default: false)

**Returns:**
- Single `EvaluationResult` for single criteria
- Array of `EvaluationResult` for array criteria

**Example:**
```typescript
const engine = new RuleEngine();
const result = await engine.evaluate(rule, { age: 25 });
// { value: true, isPassed: true }
```

#### checkIsPassed

Simple boolean check if rule passes.

```typescript
async checkIsPassed(
  rule: RuleType<any>, 
  criteria: any | any[], 
  trustRule?: boolean
): Promise<boolean>
```

**Parameters:**
- Same as `evaluate`

**Returns:**
- `true` if rule passes, `false` otherwise

**Example:**
```typescript
const passed = await engine.checkIsPassed(rule, { age: 25 });
// true
```

#### getEvaluateResult

Get only result values without evaluation metadata.

```typescript
async getEvaluateResult<R = any>(
  rule: RuleType<R>, 
  criteria: any | any[], 
  trustRule?: boolean
): Promise<R | R[]>
```

**Parameters:**
- Same as `evaluate`

**Returns:**
- Result value(s) only, without `isPassed` flag

**Example:**
```typescript
const result = await engine.getEvaluateResult(rule, data);
// { discount: 0.15, message: "15% off" }
```

#### evaluateMultiple

Evaluate multiple rules against same criteria.

```typescript
async evaluateMultiple<R = any>(
  rules: RuleType<R>[], 
  criteria: any, 
  trustRule?: boolean
): Promise<EvaluationResult<R>[]>
```

**Parameters:**
- `rules`: Array of rules to evaluate
- `criteria`: Single criteria object
- `trustRule`: Skip validation for all rules

**Returns:**
- Array of evaluation results

**Example:**
```typescript
const results = await engine.evaluateMultiple([rule1, rule2], data);
// [{ value: true, isPassed: true }, { value: false, isPassed: false }]
```

#### validate

Validates rule structure.

```typescript
validate(rule: RuleType<any>): ValidationResult
```

**Parameters:**
- `rule`: Rule to validate

**Returns:**
```typescript
interface ValidationResult {
  isValid: boolean;
  error?: {
    message: string;
    path?: string;
    details?: any;
  };
}
```

**Example:**
```typescript
const validation = engine.validate(rule);
if (!validation.isValid) {
  console.error(validation.error.message);
}
```

#### introspect

Analyzes rule for possible input ranges.

```typescript
introspect(rule: RuleType<any>): IntrospectionResult
```

**Parameters:**
- `rule`: Rule to analyze

**Returns:**
```typescript
interface IntrospectionResult {
  possibleCriteria: any[];
  fields: string[];
  operators: string[];
  constraints: ConstraintInfo[];
}
```

**Example:**
```typescript
const analysis = engine.introspect(rule);
console.log(analysis.fields); // ["age", "country"]
```

#### builder

Get a new rule builder instance.

```typescript
builder(): RuleBuilder
```

**Returns:**
- New `RuleBuilder` instance

**Example:**
```typescript
const builder = engine.builder();
const rule = builder
  .add({ and: [...] })
  .default({ value: false })
  .build();
```

### Mutation Methods

#### addMutation

Add a criteria preprocessor.

```typescript
addMutation(name: string, fn: MutationFunction): void
```

**Parameters:**
- `name`: Unique mutation name
- `fn`: Function that transforms criteria

**Example:**
```typescript
engine.addMutation('normalize', (criteria) => {
  if (criteria.email) {
    criteria.email = criteria.email.toLowerCase();
  }
  return criteria;
});
```

#### removeMutation

Remove a mutation by name.

```typescript
removeMutation(name: string): boolean
```

**Parameters:**
- `name`: Mutation name to remove

**Returns:**
- `true` if removed, `false` if not found

#### clearMutationCache

Clear mutation result cache.

```typescript
clearMutationCache(name?: string): void
```

**Parameters:**
- `name`: Optional specific mutation to clear (clears all if omitted)

### Static Methods

All instance methods are available as static methods on the `RuleEngine` class:

```typescript
RuleEngine.evaluate(rule, criteria, trustRule?)
RuleEngine.checkIsPassed(rule, criteria, trustRule?)
RuleEngine.getEvaluateResult(rule, criteria, trustRule?)
RuleEngine.evaluateMultiple(rules, criteria, trustRule?)
RuleEngine.validate(rule)
RuleEngine.introspect(rule)
RuleEngine.builder()
```

## ObjectDiscovery Service

Utilities for working with objects and JSONPath expressions.

### resolveProperty

Resolves a property value from an object using path or JSONPath.

```typescript
static resolveProperty(
  path: string, 
  json: any
): any
```

**Parameters:**
- `path`: Property path or JSONPath expression
- `json`: Object to resolve from

**Returns:**
- Resolved value or undefined

**Example:**
```typescript
const value = ObjectDiscovery.resolveProperty("$.user.profile.age", data);
// 25
```

### updateProperty

Updates a property value in an object.

```typescript
static updateProperty(
  path: string, 
  json: any, 
  value: any
): void
```

**Parameters:**
- `path`: Property path or JSONPath expression
- `json`: Object to update
- `value`: New value to set

**Example:**
```typescript
ObjectDiscovery.updateProperty("$.user.age", data, 26);
```

### resolveTextPathExpressions

Resolves JSONPath expressions in template strings.

```typescript
static resolveTextPathExpressions(
  text: string, 
  criteria: any
): string
```

**Parameters:**
- `text`: Template string with JSONPath expressions
- `criteria`: Data object for resolution

**Returns:**
- Resolved string

**Example:**
```typescript
const result = ObjectDiscovery.resolveTextPathExpressions(
  "Hello $.user.name, you have $.points points",
  { user: { name: "John" }, points: 100 }
);
// "Hello John, you have 100 points"
```

### Type Guards

#### isCondition

Check if object is a valid condition.

```typescript
static isCondition(obj: any): obj is Condition
```

**Example:**
```typescript
if (ObjectDiscovery.isCondition(obj)) {
  // obj is typed as Condition
}
```

#### isConstraint

Check if object is a valid constraint.

```typescript
static isConstraint(obj: any): obj is Constraint
```

**Example:**
```typescript
if (ObjectDiscovery.isConstraint(obj)) {
  // obj is typed as Constraint
}
```

#### isGranular

Check if rule has result values.

```typescript
static isGranular(rule: RuleType<any>): boolean
```

**Example:**
```typescript
if (ObjectDiscovery.isGranular(rule)) {
  // Rule has result values in conditions
}
```

## Builder API

Fluent API for constructing rules programmatically.

### Methods

#### add

Add a condition to the rule.

```typescript
add(condition: Condition<R>): RuleBuilder<R>
```

**Example:**
```typescript
builder.add({
  and: [
    { field: "age", operator: "greater-than", value: 18 }
  ],
  result: { allowed: true }
})
```

#### default

Set default result.

```typescript
default(result: R): RuleBuilder<R>
```

**Example:**
```typescript
builder.default({ allowed: false })
```

#### build

Build the final rule.

```typescript
build(validate?: boolean): RuleType<R>
```

**Parameters:**
- `validate`: Validate rule before returning (default: false)

**Returns:**
- Complete rule object

**Example:**
```typescript
const rule = builder.build(true); // Validates before returning
```

### Complete Example

```typescript
const rule = RuleEngine.builder()
  .add({
    and: [
      { field: "age", operator: "greater-than", value: 21 },
      { field: "country", operator: "equals", value: "US" }
    ],
    result: { canDrink: true }
  })
  .add({
    and: [
      { field: "age", operator: "greater-than", value: 18 },
      { field: "country", operator: "not-equals", value: "US" }
    ],
    result: { canDrink: true }
  })
  .default({ canDrink: false })
  .build(true);
```

## Types & Interfaces

### RuleType

Main rule structure.

```typescript
interface RuleType<R = any> {
  conditions: Condition<R> | Condition<R>[];
  default?: R;
}
```

### Condition

Logical grouping of constraints.

```typescript
interface Condition<R = any> {
  or?: Array<Constraint | Condition<R>>;
  and?: Array<Constraint | Condition<R>>;
  none?: Array<Constraint | Condition<R>>;
  result?: R;
}
```

### Constraint

Basic evaluation unit.

```typescript
interface Constraint {
  field: string;
  operator: string;
  value: any;
  message?: string;
}
```

### EvaluationResult

Result of rule evaluation.

```typescript
interface EvaluationResult<T = any> {
  value: T;
  isPassed: boolean;
  message?: string;
}
```

### ValidationResult

Result of rule validation.

```typescript
interface ValidationResult {
  isValid: boolean;
  error?: {
    message: string;
    path?: string;
    details?: any;
  };
}
```

### IntrospectionResult

Result of rule introspection.

```typescript
interface IntrospectionResult {
  possibleCriteria: any[];
  fields: string[];
  operators: string[];
  constraints: Array<{
    field: string;
    operator: string;
    value: any;
    path: string;
  }>;
}
```

## Enums

### ConditionType

```typescript
enum ConditionType {
  Or = "or",
  And = "and", 
  None = "none"
}
```

### Operators

See [Operators Documentation](./operators.md) for complete list.

## Utilities

### Error Handling

```typescript
class RuleEngineError extends Error {
  constructor(message: string, public code?: string, public details?: any)
}
```

### Date Utilities

```typescript
// Parse various date formats
parseDate(value: any): Date

// Format date to ISO string
formatDate(date: Date): string

// Check if valid date
isValidDate(value: any): boolean
```

### Type Checking

```typescript
// Check if value is object
isObject(value: any): boolean

// Check if value is empty
isEmpty(value: any): boolean

// Deep clone object
deepClone<T>(obj: T): T
```

---

For more information, see the [main documentation](../README.md).