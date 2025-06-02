# TypeScript Guide for @usex/rule-engine

This guide covers the enhanced TypeScript features in @usex/rule-engine v2.1, including improved type inference, method overloads, and best practices for type-safe rule evaluation.

## Table of Contents

- [Overview](#overview)
- [Type Inference with Method Overloads](#type-inference-with-method-overloads)
- [Singleton Pattern and Instance Management](#singleton-pattern-and-instance-management)
- [Working with Criteria Types](#working-with-criteria-types)
- [Type-Safe Rule Building](#type-safe-rule-building)
- [Custom Operators with Type Safety](#custom-operators-with-type-safety)
- [Common TypeScript Patterns](#common-typescript-patterns)
- [Troubleshooting](#troubleshooting)

## Overview

The rule engine now provides enhanced TypeScript support through:

1. **Method Overloads**: Automatic type inference based on input types
2. **Improved Type Safety**: Better compile-time error detection
3. **Generic Support**: Full support for custom result types
4. **Singleton Pattern**: Proper type-safe instance management

## Type Inference with Method Overloads

### Evaluate Method

The `evaluate` method now has overloads that automatically infer the return type based on your input:

```typescript
import { RuleEngine } from '@usex/rule-engine';

const engine = RuleEngine.getInstance();
const rule = {
  conditions: {
    and: [
      { field: "age", operator: "greater-than", value: 18 }
    ]
  }
};

// Single object input - TypeScript knows result is EvaluationResult<T>
const singleResult = await engine.evaluate(rule, { age: 25 });
console.log(singleResult.isPassed); // ✅ TypeScript knows this property exists

// Array input - TypeScript knows result is Array<EvaluationResult<T>>
const arrayResults = await engine.evaluate(rule, [
  { age: 25 },
  { age: 16 }
]);
console.log(arrayResults[0].isPassed); // ✅ TypeScript knows this is an array
```

### Other Methods with Overloads

Similar overloads are available for:

```typescript
// checkIsPassed - returns boolean or boolean[]
const isPassed = await engine.checkIsPassed(rule, { age: 25 }); // boolean
const areAllPassed = await engine.checkIsPassed(rule, [{ age: 25 }, { age: 16 }]); // boolean | boolean[]

// getEvaluateResult - returns T or T[]
const value = await engine.getEvaluateResult<number>(rule, { age: 25 }); // number
const values = await engine.getEvaluateResult<number>(rule, [{ age: 25 }]); // number[]

// evaluateMany - evaluates multiple rules
const results = await engine.evaluateMany([rule1, rule2], { age: 25 }); // Array<EvaluationResult<T>>
```

## Singleton Pattern and Instance Management

The RuleEngine uses a singleton pattern for better resource management:

```typescript
// Always use getInstance() - constructor is private
const engine = RuleEngine.getInstance({
  autoInitializeOperators: true,
  enableCaching: true,
  maxCacheSize: 100
});

// Static methods are also available
const result = await RuleEngine.evaluate(rule, criteria);

// In tests, clean up between test cases
beforeEach(() => {
  const engine = RuleEngine.getInstance();
  engine.clearMutations();
  engine.clearCache();
});

// Or use afterEach for cleanup
afterEach(() => {
  const engine = RuleEngine.getInstance();
  engine.clearMutations();
  engine.clearMutationCache();
  engine.clearCache();
});
```

## Working with Criteria Types

The library provides two main criteria types:

```typescript
import type { Criteria, CriteriaObject } from '@usex/rule-engine';

// CriteriaObject<T> - A single object
type UserCriteria = CriteriaObject<{
  name: string;
  age: number;
}>;

// Criteria<T> - Union type that can be object or array
type FlexibleCriteria = Criteria<UserData>;

// The overloads handle both automatically
async function evaluateUser(userData: UserCriteria | UserData[]) {
  const result = await engine.evaluate(rule, userData);
  // TypeScript infers the correct return type
}
```

## Type-Safe Rule Building

Use TypeScript generics for type-safe rule results:

```typescript
interface AccessRule {
  level: 'admin' | 'user' | 'guest';
  permissions: string[];
}

const accessRule = {
  conditions: [
    {
      and: [
        { field: "role", operator: "equals", value: "admin" },
        { field: "active", operator: "equals", value: true }
      ],
      result: {
        value: {
          level: 'admin' as const,
          permissions: ['read', 'write', 'delete']
        } as AccessRule
      }
    }
  ],
  default: {
    value: {
      level: 'guest' as const,
      permissions: ['read']
    } as AccessRule
  }
};

// Type-safe evaluation
const result = await engine.evaluate<AccessRule>(accessRule, { 
  role: 'admin', 
  active: true 
});

if (!Array.isArray(result)) {
  console.log(result.value.level); // TypeScript knows this is 'admin' | 'user' | 'guest'
  console.log(result.value.permissions); // TypeScript knows this is string[]
}
```

## Custom Operators with Type Safety

Create type-safe custom operators:

```typescript
import { BaseOperatorStrategy, OperatorMetadata, OperatorContext, OperatorCategory } from '@usex/rule-engine';

class EmailDomainOperator extends BaseOperatorStrategy<string, string> {
  readonly metadata: OperatorMetadata = {
    name: 'email-domain',
    displayName: 'Email Domain',
    category: OperatorCategory.STRING,
    description: 'Checks if email has specific domain',
    acceptedFieldTypes: ['string'],
    expectedValueType: 'string',
    requiresValue: true,
    example: '{ field: "email", operator: "email-domain", value: "gmail.com" }'
  };

  evaluate(context: OperatorContext): boolean {
    const { fieldValue, constraintValue } = context;
    
    if (typeof fieldValue !== 'string' || typeof constraintValue !== 'string') {
      return false;
    }
    
    const domain = fieldValue.split('@')[1];
    return domain === constraintValue;
  }

  isValidFieldType(value: unknown): value is string {
    return typeof value === 'string' && value.includes('@');
  }

  isValidConstraintType(value: unknown): value is string {
    return typeof value === 'string' && !value.includes('@');
  }
}

// Register the operator
registerCustomOperator(EmailDomainOperator);
```

## Common TypeScript Patterns

### Pattern 1: Conditional Type Guards

```typescript
const results = await engine.evaluate(rule, criteriaArray);

if (Array.isArray(results)) {
  // TypeScript knows results is Array<EvaluationResult<T>>
  results.forEach(result => {
    console.log(result.isPassed);
  });
} else {
  // TypeScript knows results is EvaluationResult<T>
  console.log(results.isPassed);
}
```

### Pattern 2: Generic Constraints

```typescript
interface BaseEntity {
  id: string;
  createdAt: Date;
}

async function evaluateEntity<T extends BaseEntity>(
  rule: RuleType,
  entity: T
): Promise<EvaluationResult<boolean>> {
  return await engine.evaluate<boolean>(rule, entity);
}
```

### Pattern 3: Type-Safe Mutations

```typescript
// Define mutation with proper types
engine.addMutation<number>('doubleValue', (value: number) => value * 2);

// Use in rules
const rule = {
  conditions: {
    and: [
      { field: "score", operator: "greater-than", value: 50 }
    ]
  }
};

// The mutation will be applied to the score field
const result = await engine.evaluate(rule, { score: 30 }); // score becomes 60 after mutation
```

## Troubleshooting

### Issue: "Property isPassed does not exist on type EvaluationResult<any>[]"

**Solution**: This error occurs when TypeScript can't determine if the result is a single object or array. Use the overloaded methods or add type guards:

```typescript
// Option 1: Use specific criteria type
const result = await engine.evaluate(rule, { age: 25 } as CriteriaObject);

// Option 2: Use type guard
const result = await engine.evaluate(rule, criteria);
if (!Array.isArray(result)) {
  console.log(result.isPassed); // Now TypeScript knows it's not an array
}
```

### Issue: "Constructor of class RuleEngine is private"

**Solution**: Use the singleton pattern:

```typescript
// ❌ Wrong
const engine = new RuleEngine();

// ✅ Correct
const engine = RuleEngine.getInstance();
```

### Issue: Type inference not working in IDE

**Solution**: 
1. Restart TypeScript language server
2. Ensure you're importing from the correct path
3. Check that your `tsconfig.json` includes the rule engine types

### Issue: Custom operator types not recognized

**Solution**: Ensure you're extending the correct base class and implementing all required methods:

```typescript
class MyOperator extends BaseOperatorStrategy<FieldType, ConstraintType> {
  // Implement all required methods
  evaluate(context: OperatorContext): boolean { /* ... */ }
  isValidFieldType(value: unknown): value is FieldType { /* ... */ }
  isValidConstraintType(value: unknown): value is ConstraintType { /* ... */ }
}
```

## Best Practices

1. **Always specify generic types** when you know the result type:
   ```typescript
   const result = await engine.evaluate<MyResultType>(rule, criteria);
   ```

2. **Use const assertions** for literal types in rules:
   ```typescript
   result: { value: 'admin' as const }
   ```

3. **Leverage type guards** instead of type assertions:
   ```typescript
   if (!Array.isArray(result)) {
     // TypeScript knows result is not an array
   }
   ```

4. **Define interfaces** for complex rule results:
   ```typescript
   interface RuleResult {
     status: string;
     score: number;
   }
   ```

5. **Use proper cleanup** in tests to avoid state pollution:
   ```typescript
   afterEach(() => {
     engine.clearMutations();
     engine.clearCache();
   });
   ```