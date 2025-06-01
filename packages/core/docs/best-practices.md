# Best Practices Guide

This guide covers best practices for using @usex/rule-engine effectively in production environments.

## Table of Contents

- [Rule Design](#rule-design)
- [Performance Optimization](#performance-optimization)
- [Error Handling](#error-handling)
- [Testing Strategies](#testing-strategies)
- [Security Considerations](#security-considerations)
- [Maintenance & Documentation](#maintenance--documentation)
- [Common Pitfalls](#common-pitfalls)

## Rule Design

### 1. Keep Rules Simple and Focused

**✅ Good: Single Responsibility**
```typescript
// Separate rules for different concerns
const ageVerificationRule = {
  conditions: {
    and: [
      { field: "age", operator: "greater-than-or-equals", value: 18 },
      { field: "age", operator: "less-than", value: 120 }
    ]
  }
};

const locationRule = {
  conditions: {
    or: [
      { field: "country", operator: "equals", value: "US" },
      { field: "country", operator: "equals", value: "CA" }
    ]
  }
};
```

**❌ Bad: Mixed Concerns**
```typescript
const complexRule = {
  conditions: {
    and: [
      { field: "age", operator: "greater-than", value: 18 },
      { field: "country", operator: "equals", value: "US" },
      { field: "email", operator: "email", value: true },
      { field: "subscription", operator: "equals", value: "active" }
    ]
  }
};
```

### 2. Use Meaningful Field Names

**✅ Good: Clear Field Names**
```typescript
{
  field: "$.user.subscription.status",
  operator: "equals",
  value: "active"
}
```

**❌ Bad: Ambiguous Names**
```typescript
{
  field: "$.data.s",
  operator: "equals",
  value: 1
}
```

### 3. Leverage JSONPath for Nested Data

**✅ Good: JSONPath for Deep Access**
```typescript
{
  conditions: {
    and: [
      { field: "$.order.items[0].quantity", operator: "greater-than", value: 0 },
      { field: "$.customer.addresses[?(@.type=='shipping')].country", operator: "equals", value: "US" }
    ]
  }
}
```

### 4. Structure Rules for Reusability

**✅ Good: Modular Rules**
```typescript
const isPremiumCustomer = {
  or: [
    { field: "$.customer.tier", operator: "equals", value: "premium" },
    { field: "$.customer.totalSpent", operator: "greater-than", value: 10000 }
  ]
};

const discountRule = {
  conditions: [{
    and: [isPremiumCustomer, { field: "$.order.total", operator: "greater-than", value: 100 }],
    result: { discount: 0.20 }
  }]
};
```

### 5. Use Appropriate Operators

| Use Case | Recommended Operator | Example |
|----------|---------------------|---------|
| Exact match | `equals` | `{ operator: "equals", value: "active" }` |
| Text search | `like` | `{ operator: "like", value: "admin" }` |
| Pattern match | `matches` | `{ operator: "matches", value: "^[A-Z]{2}\\d{4}$" }` |
| Range check | `between` | `{ operator: "between", value: [10, 100] }` |
| Null check | `null-or-undefined` | `{ operator: "null-or-undefined", value: true }` |

## Performance Optimization

### 1. Order Conditions by Likelihood of Failure

Place conditions most likely to fail first to short-circuit evaluation:

**✅ Good: Fail-fast Ordering**
```typescript
{
  conditions: {
    and: [
      // Most likely to fail first
      { field: "isPremium", operator: "equals", value: true },
      { field: "age", operator: "greater-than", value: 18 },
      // Expensive operation last
      { field: "history", operator: "matches", value: "complex.*regex" }
    ]
  }
}
```

### 2. Use Trust Mode for Validated Rules

Skip validation for rules that are known to be valid:

```typescript
// First time: validate
const isValid = RuleEngine.validate(rule).isValid;

// Subsequent evaluations: trust mode
if (isValid) {
  const result = await RuleEngine.evaluate(rule, data, true); // Skip validation
}
```

### 3. Batch Operations

Process multiple items in a single call:

**✅ Good: Batch Processing**
```typescript
const results = await RuleEngine.evaluate(rule, arrayOfUsers);
```

**❌ Bad: Individual Processing**
```typescript
const results = [];
for (const user of arrayOfUsers) {
  results.push(await RuleEngine.evaluate(rule, user));
}
```

### 4. Cache Rule Instances

**✅ Good: Reuse Parsed Rules**
```typescript
class RuleService {
  private ruleCache = new Map<string, RuleType>();
  
  getRule(name: string): RuleType {
    if (!this.ruleCache.has(name)) {
      this.ruleCache.set(name, this.loadRule(name));
    }
    return this.ruleCache.get(name)!;
  }
}
```

### 5. Use Mutations for Common Transformations

```typescript
const engine = new RuleEngine();

// Add common data transformations
engine.addMutation('normalize', (criteria) => {
  // Normalize common fields once
  if (criteria.email) {
    criteria.email = criteria.email.toLowerCase().trim();
  }
  if (criteria.phone) {
    criteria.phone = criteria.phone.replace(/\D/g, '');
  }
  return criteria;
});
```

## Error Handling

### 1. Validate Rules Before Production

```typescript
function deployRule(rule: RuleType): void {
  const validation = RuleEngine.validate(rule);
  
  if (!validation.isValid) {
    throw new Error(`Invalid rule: ${validation.error.message}`);
  }
  
  // Deploy validated rule
  saveRuleToDatabase(rule);
}
```

### 2. Handle Evaluation Errors Gracefully

```typescript
async function safeEvaluate(rule: RuleType, data: any): Promise<EvaluationResult> {
  try {
    return await RuleEngine.evaluate(rule, data);
  } catch (error) {
    // Log error for debugging
    console.error('Rule evaluation failed:', error);
    
    // Return safe default
    return {
      value: rule.default || false,
      isPassed: false,
      message: 'Evaluation error - using default'
    };
  }
}
```

### 3. Provide Meaningful Error Messages

```typescript
{
  conditions: {
    and: [
      {
        field: "email",
        operator: "email",
        value: true,
        message: "Please enter a valid email address (e.g., user@example.com)"
      },
      {
        field: "age",
        operator: "between",
        value: [18, 120],
        message: "Age must be between 18 and 120 years"
      }
    ]
  }
}
```

## Testing Strategies

### 1. Unit Test Individual Rules

```typescript
describe('DiscountRule', () => {
  const rule = {
    conditions: [{
      and: [
        { field: "tier", operator: "equals", value: "gold" },
        { field: "total", operator: "greater-than", value: 100 }
      ],
      result: { discount: 0.15 }
    }],
    default: { discount: 0 }
  };

  test('applies discount for gold tier with qualifying total', async () => {
    const result = await RuleEngine.evaluate(rule, {
      tier: "gold",
      total: 150
    });
    
    expect(result.value.discount).toBe(0.15);
    expect(result.isPassed).toBe(true);
  });

  test('no discount for non-qualifying orders', async () => {
    const result = await RuleEngine.evaluate(rule, {
      tier: "silver",
      total: 150
    });
    
    expect(result.value.discount).toBe(0);
    expect(result.isPassed).toBe(true); // Default was applied
  });
});
```

### 2. Test Edge Cases

```typescript
describe('Edge Cases', () => {
  test('handles null values', async () => {
    const rule = {
      conditions: {
        and: [
          { field: "name", operator: "not-null-or-undefined", value: true }
        ]
      }
    };
    
    const result = await RuleEngine.evaluate(rule, { name: null });
    expect(result.isPassed).toBe(false);
  });

  test('handles missing fields', async () => {
    const rule = {
      conditions: {
        and: [
          { field: "$.optional.field", operator: "exists", value: false }
        ]
      }
    };
    
    const result = await RuleEngine.evaluate(rule, {});
    expect(result.isPassed).toBe(true);
  });
});
```

### 3. Use Rule Introspection for Test Generation

```typescript
function generateTestCases(rule: RuleType) {
  const introspection = RuleEngine.introspect(rule);
  
  return introspection.constraints.map(constraint => ({
    description: `Test ${constraint.field} ${constraint.operator}`,
    field: constraint.field,
    validValue: generateValidValue(constraint),
    invalidValue: generateInvalidValue(constraint)
  }));
}
```

## Security Considerations

### 1. Validate Input Data

```typescript
const sanitizeInput = (data: any): any => {
  // Remove potentially dangerous fields
  const { __proto__, constructor, prototype, ...safe } = data;
  return safe;
};

const result = await RuleEngine.evaluate(rule, sanitizeInput(userInput));
```

### 2. Limit Rule Complexity

```typescript
function validateRuleComplexity(rule: RuleType): void {
  const maxDepth = 5;
  const maxConditions = 50;
  
  const depth = calculateDepth(rule);
  const conditionCount = countConditions(rule);
  
  if (depth > maxDepth) {
    throw new Error(`Rule exceeds maximum depth of ${maxDepth}`);
  }
  
  if (conditionCount > maxConditions) {
    throw new Error(`Rule exceeds maximum conditions of ${maxConditions}`);
  }
}
```

### 3. Sanitize Regex Patterns

```typescript
function validateRegexPattern(pattern: string): void {
  const dangerousPatterns = [
    /\(\?<[!=]/,  // Lookbehind assertions
    /\(\?\(/,     // Conditional patterns
    /\{1000,\}/   // Large repetitions
  ];
  
  if (dangerousPatterns.some(p => p.test(pattern))) {
    throw new Error('Potentially dangerous regex pattern');
  }
}
```

### 4. Use Allowlists for Dynamic Fields

```typescript
const allowedFields = new Set([
  'user.name',
  'user.email',
  'user.role',
  'order.total'
]);

function validateFieldAccess(field: string): void {
  const normalizedField = field.replace(/^\$\./, '');
  if (!allowedFields.has(normalizedField)) {
    throw new Error(`Access to field '${field}' is not allowed`);
  }
}
```

## Maintenance & Documentation

### 1. Document Rule Purpose and Context

```typescript
interface DocumentedRule extends RuleType {
  metadata: {
    id: string;
    name: string;
    description: string;
    author: string;
    created: Date;
    modified: Date;
    tags: string[];
    examples: Array<{
      input: any;
      expectedOutput: any;
    }>;
  };
}
```

### 2. Version Your Rules

```typescript
interface VersionedRule extends RuleType {
  version: string;
  changelog: Array<{
    version: string;
    date: Date;
    changes: string[];
  }>;
}
```

### 3. Create Rule Catalogs

```typescript
class RuleCatalog {
  private rules = new Map<string, DocumentedRule>();
  
  register(rule: DocumentedRule): void {
    this.validateRule(rule);
    this.rules.set(rule.metadata.id, rule);
  }
  
  findByTags(tags: string[]): DocumentedRule[] {
    return Array.from(this.rules.values())
      .filter(rule => 
        tags.some(tag => rule.metadata.tags.includes(tag))
      );
  }
  
  generateDocumentation(): string {
    // Generate markdown documentation
    return Array.from(this.rules.values())
      .map(rule => this.formatRuleDoc(rule))
      .join('\n\n');
  }
}
```

## Common Pitfalls

### 1. Incorrect JSONPath Usage

**❌ Bad: Missing $**
```typescript
{ field: "user.name", operator: "equals", value: "John" }
```

**✅ Good: Proper JSONPath**
```typescript
{ field: "$.user.name", operator: "equals", value: "John" }
// or
{ field: "user.name", operator: "equals", value: "John" } // Simple path
```

### 2. Type Mismatches

**❌ Bad: String vs Number**
```typescript
{ field: "age", operator: "greater-than", value: "18" } // String "18"
```

**✅ Good: Correct Types**
```typescript
{ field: "age", operator: "greater-than", value: 18 } // Number 18
```

### 3. Forgetting Default Values

**❌ Bad: No Default**
```typescript
{
  conditions: [
    { and: [...], result: { status: "approved" } },
    { and: [...], result: { status: "pending" } }
  ]
  // What if no conditions match?
}
```

**✅ Good: Always Include Default**
```typescript
{
  conditions: [
    { and: [...], result: { status: "approved" } },
    { and: [...], result: { status: "pending" } }
  ],
  default: { status: "rejected" }
}
```

### 4. Overly Complex Conditions

**❌ Bad: Deeply Nested**
```typescript
{
  conditions: {
    or: [{
      and: [{
        or: [{
          and: [{
            or: [/* ... */]
          }]
        }]
      }]
    }]
  }
}
```

**✅ Good: Flattened Logic**
```typescript
{
  conditions: [
    { and: [/* condition set 1 */], result: /* ... */ },
    { and: [/* condition set 2 */], result: /* ... */ },
    { and: [/* condition set 3 */], result: /* ... */ }
  ]
}
```

### 5. Not Handling Array Fields Properly

**❌ Bad: Assuming Single Value**
```typescript
{ field: "$.tags", operator: "equals", value: "important" }
```

**✅ Good: Use Array Operators**
```typescript
{ field: "$.tags", operator: "contains", value: "important" }
```

## Summary Checklist

- [ ] Keep rules simple and focused
- [ ] Use meaningful field names
- [ ] Order conditions for performance
- [ ] Validate rules before production
- [ ] Handle errors gracefully
- [ ] Write comprehensive tests
- [ ] Document rule purpose and usage
- [ ] Consider security implications
- [ ] Use appropriate operators
- [ ] Include default values
- [ ] Avoid overly complex nesting
- [ ] Version and track rule changes

---

For more information, see the [main documentation](../README.md).