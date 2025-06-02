# @usex/rule-engine

A simple yet powerful rule engine for Node.js and the browser. Define complex business rules using JSON structures and evaluate them against your data with full TypeScript support.

> **New in v2.1**: Enhanced TypeScript support with method overloads, improved type inference, and better error handling. See the [V2 Migration Guide](./docs/v2-migration-guide.md) and [TypeScript Guide](./docs/typescript-guide.md) for details.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Operators](#operators)
- [Advanced Usage](#advanced-usage)
- [Examples](#examples)
- [TypeScript Support](#typescript-support)
- [Performance](#performance)
- [Contributing](#contributing)
- [License](#license)

## Features

- =� **Simple & Powerful**: Easy to use API with complex rule support
- =� **Zero Dependencies**: Lightweight core with optional peer dependencies
- =
 **JSONPath Support**: Access nested properties with `$.path.to.property`
- = **Self-referencing**: Reference other fields in rule values
- <� **Type Safety**: Full TypeScript support with generics
- � **Performance**: Optional validation bypass for trusted rules
- =' **Extensible**: Add custom mutations for data preprocessing
- <� **Flexible**: 126+ built-in operators for every use case
- =
 **Introspection**: Analyze rules to understand possible inputs
- <� **Builder Pattern**: Fluent API for programmatic rule construction

## Installation

```bash
npm install @usex/rule-engine
```

Or with yarn:

```bash
yarn add @usex/rule-engine
```

Or with pnpm:

```bash
pnpm add @usex/rule-engine
```

## Quick Start

```typescript
import { RuleEngine } from '@usex/rule-engine';

// Define a simple rule
const rule = {
  conditions: {
    and: [
      { field: "age", operator: "greater-than", value: 18 },
      { field: "country", operator: "equals", value: "US" }
    ]
  },
  default: { value: false }
};

// Evaluate the rule
const result = await RuleEngine.evaluate(rule, {
  age: 25,
  country: "US"
});

console.log(result);
// { value: true, isPassed: true }
```

## Core Concepts

### Rule Structure

A rule consists of conditions and an optional default result:

```typescript
interface Rule<R = any> {
  conditions: Condition<R> | Condition<R>[];
  default?: R;
}
```

### Conditions

Conditions can be grouped using logical operators:

```typescript
interface Condition<R = any> {
  or?: Array<Constraint | Condition<R>>;   // ANY must match
  and?: Array<Constraint | Condition<R>>;  // ALL must match
  none?: Array<Constraint | Condition<R>>; // NONE must match
  result?: R; // Optional result for granular rules
}
```

### Constraints

The basic evaluation unit:

```typescript
interface Constraint {
  field: string;      // Field path (supports JSONPath)
  operator: string;   // Operator type
  value: any;         // Value to compare against
  message?: string;   // Optional validation message
}
```

## API Reference

### RuleEngine Class

#### Static Methods

| Method | Description | Return Type |
|--------|-------------|-------------|
| `evaluate(rule, criteria, trustRule?)` | Evaluates a rule against criteria | `Promise<EvaluationResult<T>>` |
| `checkIsPassed(rule, criteria, trustRule?)` | Simple boolean check if rule passes | `Promise<boolean>` |
| `getEvaluateResult(rule, criteria, trustRule?)` | Get only result values without metadata | `Promise<T>` |
| `evaluateMany(rules, criteria, trustRule?)` | Evaluate multiple rules | `Promise<EvaluationResult<T>[]>` |
| `validate(rule)` | Validates rule structure | `ValidationResult` |
| `introspect(rule)` | Analyzes rule for possible inputs | `IntrospectionResult` |
| `builder()` | Returns fluent builder instance | `RuleBuilder` |

#### Instance Methods

All static methods are also available as instance methods:

```typescript
const engine = new RuleEngine();
const result = await engine.evaluate(rule, criteria);
```

### ObjectDiscovery Service

Utility methods for working with objects and JSONPath:

| Method | Description | Example |
|--------|-------------|---------|
| `resolveProperty(path, json)` | Resolves nested properties | `resolveProperty("$.user.name", data)` |
| `updateProperty(path, json, value)` | Updates nested properties | `updateProperty("$.user.age", data, 25)` |
| `resolveTextPathExpressions(text, criteria)` | Template string resolution | `"Hello $.name"` � `"Hello John"` |

## Operators

### Comparison Operators

| Category | Operators | Description |
|----------|-----------|-------------|
| **String** | `equals`, `not-equals`, `like`, `not-like` | Basic string comparison |
| **Numeric** | `greater-than`, `less-than`, `greater-than-or-equals`, `less-than-or-equals` | Numeric comparison |
| **Array** | `in`, `not-in`, `contains`, `not-contains`, `contains-any`, `contains-all` | Array operations |
| **Pattern** | `matches`, `not-matches` | Regex pattern matching |

### Existence & Nullability

| Operator | Description |
|----------|-------------|
| `exists` | Field exists in object |
| `not-exists` | Field does not exist |
| `null-or-undefined` | Value is null or undefined |
| `not-null-or-undefined` | Value is not null or undefined |
| `empty` | Empty string, array, or object |
| `not-empty` | Not empty |

### Date & Time Operators

| Category | Operators | Example |
|----------|-----------|---------|
| **Date Comparison** | `date-after`, `date-before`, `date-equals`, `date-between` | Compare dates |
| **Relative to Now** | `date-after-now`, `date-before-now` | Compare to current date |
| **Time Comparison** | `time-after`, `time-before`, `time-equals`, `time-between` | Compare times |

### Type Validation

| Category | Operators | Description |
|----------|-----------|-------------|
| **Type Checks** | `string`, `number`, `boolean`, `object`, `array`, `date` | Validate data types |
| **Format** | `email`, `url`, `uuid`, `alpha`, `alpha-numeric` | Validate formats |
| **Numeric** | `integer`, `float`, `positive`, `negative`, `zero` | Numeric validation |
| **String** | `lower-case`, `upper-case` | String case validation |
| **Persian** | `persian-alpha`, `persian-alpha-numeric` | Persian text support |

### Length & Range Validation

| Operator | Description | Example |
|----------|-------------|---------|
| `string-length` | Exact string length | `{ operator: "string-length", value: 10 }` |
| `min-length` | Minimum string length | `{ operator: "min-length", value: 5 }` |
| `max-length` | Maximum string length | `{ operator: "max-length", value: 20 }` |
| `length-between` | String length range | `{ operator: "length-between", value: [5, 20] }` |
| `between` | Numeric range | `{ operator: "between", value: [18, 65] }` |

## Advanced Usage

### JSONPath Support

Access nested properties using JSONPath expressions:

```typescript
const rule = {
  conditions: {
    and: [
      {
        field: "$.user.profile.age",
        operator: "greater-than",
        value: 21
      },
      {
        field: "$.user.permissions[0]",
        operator: "equals",
        value: "admin"
      }
    ]
  }
};

const data = {
  user: {
    profile: { age: 25 },
    permissions: ["admin", "user"]
  }
};

const result = await RuleEngine.evaluate(rule, data);
```

### Self-referencing Fields

Reference other fields in your rules using JSONPath:

```typescript
const rule = {
  conditions: {
    and: [
      {
        field: "$.price",
        operator: "less-than",
        value: "$.maxPrice" // Reference another field
      }
    ]
  }
};

const data = {
  price: 100,
  maxPrice: 150
};

const result = await RuleEngine.evaluate(rule, data);
// Result: { value: true, isPassed: true }
```

### Builder Pattern

Use the fluent API to construct rules programmatically:

```typescript
const rule = RuleEngine.builder()
  .add({
    and: [
      { field: "status", operator: "equals", value: "active" },
      { field: "role", operator: "in", value: ["admin", "moderator"] }
    ],
    result: { access: "full", level: "high" }
  })
  .add({
    and: [
      { field: "status", operator: "equals", value: "active" },
      { field: "role", operator: "equals", value: "user" }
    ],
    result: { access: "limited", level: "low" }
  })
  .default({ access: "none", level: "none" })
  .build(true); // Validate before building
```

### Mutations

Add data preprocessing before evaluation:

```typescript
const engine = new RuleEngine();

// Add a mutation to normalize email fields
engine.addMutation('normalizeEmail', (criteria) => {
  if (criteria.email) {
    criteria.email = criteria.email.toLowerCase().trim();
  }
  return criteria;
});

// The mutation will be applied before evaluation
const result = await engine.evaluate(rule, {
  email: "  USER@EXAMPLE.COM  "
});
```

### Batch Evaluation

Evaluate rules against multiple criteria:

```typescript
const users = [
  { name: "Alice", age: 25, country: "US" },
  { name: "Bob", age: 17, country: "CA" },
  { name: "Charlie", age: 30, country: "US" }
];

const results = await RuleEngine.evaluate(rule, users);
// Returns array of results, one for each user
```

### Rule Introspection

Analyze rules to understand possible inputs:

```typescript
const introspection = RuleEngine.introspect(rule);
console.log(introspection);
// {
//   possibleCriteria: [
//     { age: { min: 18 }, country: "US" }
//   ],
//   fields: ["age", "country"],
//   operators: ["greater-than", "equals"]
// }
```

## Examples

### E-commerce Discount Rules

```typescript
const discountRule = {
  conditions: [
    {
      // VIP customers get 20% off
      and: [
        { field: "$.customer.tier", operator: "equals", value: "vip" },
        { field: "$.cart.total", operator: "greater-than", value: 100 }
      ],
      result: { discount: 0.20, message: "VIP discount applied!" }
    },
    {
      // New customers get 10% off first order
      and: [
        { field: "$.customer.orderCount", operator: "equals", value: 0 },
        { field: "$.cart.total", operator: "greater-than", value: 50 }
      ],
      result: { discount: 0.10, message: "Welcome discount!" }
    },
    {
      // Bulk orders get 15% off
      or: [
        { field: "$.cart.itemCount", operator: "greater-than", value: 10 },
        { field: "$.cart.total", operator: "greater-than", value: 500 }
      ],
      result: { discount: 0.15, message: "Bulk discount!" }
    }
  ],
  default: { discount: 0, message: "No discount applicable" }
};
```

### Access Control Rules

```typescript
const accessRule = {
  conditions: [
    {
      // Admins have full access
      and: [
        { field: "role", operator: "equals", value: "admin" },
        { field: "status", operator: "equals", value: "active" }
      ],
      result: {
        canRead: true,
        canWrite: true,
        canDelete: true
      }
    },
    {
      // Editors can read and write
      and: [
        { field: "role", operator: "equals", value: "editor" },
        { field: "status", operator: "equals", value: "active" }
      ],
      result: {
        canRead: true,
        canWrite: true,
        canDelete: false
      }
    }
  ],
  default: {
    canRead: true,
    canWrite: false,
    canDelete: false
  }
};
```

### Form Validation Rules

```typescript
const validationRule = {
  conditions: {
    and: [
      // Email validation
      {
        field: "email",
        operator: "email",
        value: true,
        message: "Invalid email format"
      },
      // Password strength
      {
        field: "password",
        operator: "min-length",
        value: 8,
        message: "Password must be at least 8 characters"
      },
      // Age restriction
      {
        field: "age",
        operator: "between",
        value: [18, 120],
        message: "Age must be between 18 and 120"
      },
      // Terms acceptance
      {
        field: "acceptedTerms",
        operator: "equals",
        value: true,
        message: "You must accept the terms and conditions"
      }
    ]
  }
};
```

## TypeScript Support

Full TypeScript support with generics for type-safe results:

```typescript
interface DiscountResult {
  discount: number;
  message: string;
}

const rule: RuleType<DiscountResult> = {
  conditions: {
    and: [
      { field: "tier", operator: "equals", value: "gold" }
    ],
    result: { discount: 0.15, message: "Gold tier discount" }
  },
  default: { discount: 0, message: "No discount" }
};

// Type-safe evaluation
const result = await RuleEngine.evaluate<DiscountResult>(rule, data);
// result.value is typed as DiscountResult
```

## Performance

### Optimization Tips

1. **Trust Rules**: Skip validation for known-good rules
   ```typescript
   const result = await RuleEngine.evaluate(rule, data, true);
   ```

2. **Reuse Engine Instance**: For multiple evaluations
   ```typescript
   const engine = new RuleEngine();
   // Reuse engine for better performance
   ```

3. **Batch Processing**: Evaluate multiple criteria at once
   ```typescript
   const results = await RuleEngine.evaluate(rule, arrayOfData);
   ```

### Benchmarks

| Operation | Records | Time | Throughput |
|-----------|---------|------|------------|
| Simple Rule | 10,000 | 85ms | ~117,000/sec |
| Complex Rule (10 conditions) | 10,000 | 250ms | ~40,000/sec |
| JSONPath Resolution | 10,000 | 120ms | ~83,000/sec |
| With Mutations | 10,000 | 150ms | ~66,000/sec |

## Custom Operators (V2)

The new V2 architecture allows you to create and register custom operators:

```typescript
import { registerCustomOperator, OperatorCategory, BaseOperatorStrategy } from '@usex/rule-engine';

// Define a custom IPv4 validator
class IPv4Operator extends BaseOperatorStrategy<string, void> {
  readonly metadata = {
    name: "ipv4",
    displayName: "IPv4 Address",
    category: OperatorCategory.PATTERN,
    description: "Validates IPv4 addresses",
    acceptedFieldTypes: ["string"],
    expectedValueType: "void",
    requiresValue: false,
  };

  evaluate(context) {
    const { fieldValue } = context;
    const ipv4Regex = /^(25[0-5]|2[0-4]\d|[01]?\d{1,2})\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})$/;
    return ipv4Regex.test(fieldValue);
  }
}

// Register the operator
registerCustomOperator(IPv4Operator);

// Use in rules
const rule = {
  conditions: {
    and: [
      { field: "serverIp", operator: "ipv4" }
    ]
  }
};
```

### Benefits of V2

- **Modular Operators**: Each operator is a self-contained strategy
- **Type Safety**: Full TypeScript support with proper type inference
- **Metadata**: Operators include metadata for validation and documentation
- **Extensibility**: Easy to add custom operators without modifying core
- **Performance**: Optional caching and lazy operator loading

See the [V2 Migration Guide](./docs/v2-migration-guide.md) for more details.

## Documentation

- **[TypeScript Guide](./docs/typescript-guide.md)** - Comprehensive guide for TypeScript features and best practices
- **[API Reference v2.1](./docs/api-reference-v2.md)** - Complete API documentation with all method signatures
- **[Migration Guide](./docs/v2-migration-guide.md)** - Upgrade from v1 to v2 with detailed steps
- **[Operators Guide](./docs/operators.md)** - Full list of operators with examples
- **[Best Practices](./docs/best-practices.md)** - Recommended patterns and practices
- **[Changelog](./CHANGELOG.md)** - Detailed list of changes in each version

## Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

### Development

```bash
# Clone the repository
git clone https://github.com/ali-master/rule-engine.git

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the package
pnpm build
```

## License

MIT � [Ali Torki](https://github.com/ali-master)

---

Made with d by [Ali Torki](https://github.com/ali-master)
