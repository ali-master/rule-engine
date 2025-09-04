<div align="center">
  <img src="./assets/core-logo.png" alt="Rule Engine" width="120" />

  <h1>@usex/rule-engine</h1>
  <p><strong>🎯 The Ultimate JSON-Based Rule Engine for Modern Applications</strong></p>

  <p>
    <a href="https://www.npmjs.com/package/@usex/rule-engine"><img src="https://img.shields.io/npm/v/@usex/rule-engine?style=flat-square&color=blue" alt="npm version" /></a>
    <a href="https://github.com/ali-master/rule-engine/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@usex/rule-engine?style=flat-square&color=green" alt="license" /></a>
    <a href="https://codecov.io/gh/ali-master/rule-engine"><img src="https://codecov.io/gh/ali-master/rule-engine/graph/badge.svg?token=UN5opqxNsi" alt="codecov" /></a>
    <a href="https://www.npmjs.com/package/@usex/rule-engine"><img src="https://img.shields.io/npm/dm/@usex/rule-engine?style=flat-square&color=orange" alt="downloads" /></a>
    <a href="https://github.com/ali-master/rule-engine"><img src="https://img.shields.io/github/stars/ali-master/rule-engine?style=flat-square&color=yellow" alt="stars" /></a>
    <a href="https://bundlephobia.com/package/@usex/rule-engine"><img src="https://img.shields.io/bundlephobia/minzip/@usex/rule-engine?style=flat-square&color=purple" alt="bundle size" /></a>
  </p>

  <p>
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-packages">Packages</a> •
    <a href="#-examples">Examples</a> •
    <a href="#-documentation">Documentation</a> •
    <a href="#-why-choose-this">Why This?</a>
  </p>
</div>

---

**Transform complex business logic into elegant, maintainable JSON rules.** Stop hardcoding decisions, start building intelligent systems that adapt to your business needs.

```typescript
// From this mess...
if (user.tier === 'vip' && order.total > 100 && user.country === 'US') {
  return { discount: 0.20, shipping: 'free' };
} else if (user.isNew && order.total > 50) {
  return { discount: 0.10, shipping: 'standard' };
} // ... 50 more lines of spaghetti code

// To this elegance...
const result = await RuleEngine.evaluate(discountRules, { user, order });
```

## 🚀 Why Rule Engine?

### **Built for Modern Developers**
- 🎯 **Zero Dependencies** - Pure JavaScript excellence, no supply chain bloat
- 🏎️ **Lightning Fast** - 17,000+ rule evaluations per second with complex JSONPath support at 55,000+ ops/sec
- 🛡️ **TypeScript Native** - **Fully typed with generic support** for bulletproof type safety
- 🔧 **Extensible Architecture** - **Create & register custom operators** without core modifications
- 🌐 **Universal** - Node.js, browsers, edge functions, Deno, Bun everywhere

### **Powerful Yet Intuitive**
- 🔍 **JSONPath Support** - Navigate complex objects: `$.user.profile.settings.theme`
- 🔗 **Self-Referencing** - Dynamic field references: `"value": "$.maxPrice"`
- 🧩 **121+ Operators** - From basic comparisons to advanced pattern matching
- 🏗️ **Visual Builder** - Drag-and-drop UI for non-technical stakeholders

### **Enterprise Ready**
- 🔧 **Extensible Core** - **Plugin custom operators** without touching internals
- 🛡️ **Type-Safe APIs** - **Generic interfaces** ensure compile-time safety
- 📊 **Rule Introspection** - Reverse-engineer possible inputs from rule definitions
- ⚡ **Performance Optimized** - Optional validation bypass for trusted rules
- 🎭 **Data Mutations** - Preprocess data before evaluation

## 📦 Packages

This monorepo contains two powerful packages:

| Package | Description | Install |
|---------|-------------|---------|
| **[@usex/rule-engine](./packages/core)** <br/> [![npm](https://img.shields.io/npm/v/@usex/rule-engine.svg?style=flat-square)](https://www.npmjs.com/package/@usex/rule-engine) | **Fully typed** core engine with **generic support** & **custom operators** | `npm install @usex/rule-engine` |
| **[@usex/rule-engine-builder](./packages/builder)** <br/> [![npm](https://img.shields.io/npm/v/@usex/rule-engine-builder.svg?style=flat-square)](https://www.npmjs.com/package/@usex/rule-engine-builder) | Visual rule builder for React applications | `npm install @usex/rule-engine-builder` |

## 🛡️ TypeScript Excellence & Extensibility

### **Fully Typed with Generics**
The core package is built with TypeScript-first design, providing complete type safety:

```typescript
// Type-safe rule definitions with generics
interface DiscountResult {
  discount: number;
  code: string;
  description: string;
}

// Generic rule with full type inference
const discountRule: Rule<DiscountResult> = {
  conditions: [
    {
      and: [
        { field: "$.user.tier", operator: "equals", value: "premium" },
        { field: "$.order.total", operator: "greater-than", value: 100 }
      ],
      result: {
        discount: 0.20,      // ✅ Type-safe
        code: "PREMIUM20",   // ✅ Type-safe
        description: "20% premium discount"  // ✅ Type-safe
      }
    }
  ],
  default: { discount: 0, code: "", description: "No discount" }
};

// Evaluation with full type inference
const result = await RuleEngine.evaluate<DiscountResult>(discountRule, orderData);
// result.value is automatically typed as DiscountResult ✅
```

### **Custom Operators Made Easy**
Extend the engine with your business-specific logic:

```typescript
import { OperatorRegistry, BaseOperator } from '@usex/rule-engine';

// 1. Create your custom operator
class IsWeekendOperator extends BaseOperator {
  name = 'is-weekend';
  category = 'datetime';

  evaluate(fieldValue: Date): boolean {
    const day = fieldValue.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }
}

class BulkDiscountEligibleOperator extends BaseOperator {
  name = 'bulk-discount-eligible';
  category = 'business';

  evaluate(orderData: any, threshold: number): boolean {
    return orderData.quantity >= threshold || orderData.value >= threshold * 10;
  }
}

// 2. Register your operators
OperatorRegistry.register(new IsWeekendOperator());
OperatorRegistry.register(new BulkDiscountEligibleOperator());

// 3. Use them in your rules immediately
const weekendRule = {
  conditions: {
    and: [
      { field: "$.currentDate", operator: "is-weekend", value: true },
      { field: "$.order", operator: "bulk-discount-eligible", value: 10 }
    ],
    result: {
      discount: 0.25,
      reason: "Weekend bulk discount!"
    }
  }
};

// 4. Full TypeScript support for your custom operators
const result = await RuleEngine.evaluate(weekendRule, {
  currentDate: new Date(),
  order: { quantity: 15, value: 200 }
}); // ✅ Fully typed, including custom operators
```

### **Advanced Generic Usage**

```typescript
// Define complex result types
interface AccessControlResult {
  allowed: boolean;
  permissions: string[];
  level: 'admin' | 'user' | 'guest';
  expiresAt?: Date;
}

interface UserData {
  role: string;
  department: string;
  clearanceLevel: number;
}

// Generic rule with both input and output types
const accessRule: Rule<AccessControlResult, UserData> = {
  conditions: [
    {
      and: [
        { field: "role", operator: "equals", value: "admin" },
        { field: "clearanceLevel", operator: "greater-than", value: 5 }
      ],
      result: {
        allowed: true,
        permissions: ["read", "write", "delete"],
        level: "admin"
      }
    }
  ],
  default: {
    allowed: false,
    permissions: [],
    level: "guest"
  }
};

// Type-safe evaluation with input validation
const userData: UserData = {
  role: "admin",
  department: "engineering",
  clearanceLevel: 8
};

const access = await RuleEngine.evaluate<AccessControlResult, UserData>(
  accessRule,
  userData
);
// Both input and output are fully typed ✅
```

## 🎬 Quick Start

### Core Engine (Pure JavaScript/TypeScript)

```bash
npm install @usex/rule-engine
```

```typescript
import { RuleEngine } from '@usex/rule-engine';

// Define a discount rule
const discountRule = {
  conditions: [
    {
      // VIP customers get 20% off orders over $100
      and: [
        { field: "$.customer.tier", operator: "equals", value: "vip" },
        { field: "$.order.total", operator: "greater-than", value: 100 }
      ],
      result: { discount: 0.20, message: "VIP discount applied! 🎉" }
    },
    {
      // First-time buyers get 10% off orders over $50
      and: [
        { field: "$.customer.orderCount", operator: "equals", value: 0 },
        { field: "$.order.total", operator: "greater-than", value: 50 }
      ],
      result: { discount: 0.10, message: "Welcome! First order discount 🎁" }
    }
  ],
  default: { discount: 0, message: "No discount available" }
};

// Apply the rule
const orderData = {
  customer: { tier: "vip", orderCount: 5 },
  order: { total: 150, items: ["laptop", "mouse"] }
};

const result = await RuleEngine.evaluate(discountRule, orderData);
console.log(result);
// { value: { discount: 0.20, message: "VIP discount applied! 🎉" }, isPassed: true }
```

### Visual Builder (React Applications)

```bash
npm install @usex/rule-engine-builder @usex/rule-engine react
```

```tsx
import React, { useState } from 'react';
import { RuleBuilder } from '@usex/rule-engine-builder';
import { RuleEngine } from '@usex/rule-engine';

function App() {
  const [rule, setRule] = useState(null);

  const availableFields = [
    { name: '$.user.tier', type: 'string', label: 'User Tier' },
    { name: '$.user.age', type: 'number', label: 'User Age' },
    { name: '$.order.total', type: 'number', label: 'Order Total' },
    { name: '$.order.items', type: 'array', label: 'Order Items' }
  ];

  const testData = {
    user: { tier: 'premium', age: 28 },
    order: { total: 150, items: ['laptop', 'mouse'] }
  };

  return (
    <div className="app">
      <h1>Build Your Business Rules Visually</h1>

      <RuleBuilder
        rule={rule}
        onRuleChange={setRule}
        availableFields={availableFields}
        testData={testData}
        theme="auto"
        showPreview={true}
        showHistory={true}
      />

      {rule && (
        <button onClick={async () => {
          const result = await RuleEngine.evaluate(rule, testData);
          console.log('Rule Result:', result);
        }}>
          Test Rule
        </button>
      )}
    </div>
  );
}
```

## 💡 Real-World Examples

### 🛒 E-commerce Pricing Engine

```typescript
const pricingRules = {
  conditions: [
    {
      // Black Friday: 50% off everything
      and: [
        { field: "$.event.name", operator: "equals", value: "black-friday" },
        { field: "$.event.active", operator: "equals", value: true }
      ],
      result: { discount: 0.50, code: "BLACKFRIDAY50", expires: "2025-11-30T23:59:59Z" }
    },
    {
      // Bulk orders: tiered discounts
      or: [
        { field: "$.cart.quantity", operator: "greater-than", value: 50 },
        { field: "$.cart.value", operator: "greater-than", value: 1000 }
      ],
      result: { discount: 0.15, code: "BULK15", shipping: "free" }
    },
    {
      // New customer welcome
      and: [
        { field: "$.customer.orderHistory.length", operator: "equals", value: 0 },
        { field: "$.cart.value", operator: "greater-than", value: 50 }
      ],
      result: { discount: 0.10, code: "WELCOME10", message: "Welcome! Enjoy 10% off your first order 🎉" }
    }
  ],
  default: { discount: 0, message: "Regular pricing applies" }
};
```

### 🔐 Dynamic Access Control

```typescript
const accessControlRules = {
  conditions: [
    {
      // Super admin: full access
      and: [
        { field: "role", operator: "equals", value: "super-admin" },
        { field: "status", operator: "equals", value: "active" }
      ],
      result: {
        permissions: ["read", "write", "delete", "admin"],
        level: "unlimited",
        expires: null
      }
    },
    {
      // Department manager: departmental access during business hours
      and: [
        { field: "role", operator: "equals", value: "manager" },
        { field: "department", operator: "exists", value: true },
        { field: "$.currentTime", operator: "time-between", value: ["09:00", "17:00"] }
      ],
      result: {
        permissions: ["read", "write"],
        level: "department",
        scope: "$.department",
        expires: "$.session.loginTime + 8h"
      }
    }
  ],
  default: { permissions: [], level: "none", message: "Access denied" }
};
```

### ✅ Smart Form Validation

```typescript
const registrationValidation = {
  conditions: {
    and: [
      // Email validation
      {
        field: "email",
        operator: "email",
        value: true,
        message: "Please enter a valid email address"
      },
      // Strong password requirements
      {
        and: [
          {
            field: "password",
            operator: "min-length",
            value: 8,
            message: "Password must be at least 8 characters long"
          },
          {
            field: "password",
            operator: "matches",
            value: ".*[A-Z].*",
            message: "Password must contain at least one uppercase letter"
          },
          {
            field: "password",
            operator: "matches",
            value: ".*[0-9].*",
            message: "Password must contain at least one number"
          }
        ]
      },
      // Age verification
      {
        field: "birthDate",
        operator: "date-before",
        value: "$.today - 18 years",
        message: "You must be 18 or older to register"
      }
    ]
  }
};
```

## 🔧 Advanced Features

### 🔗 Self-Referencing Magic
Compare fields against other fields dynamically:

```typescript
const budgetRule = {
  conditions: {
    and: [
      // Actual cost must not exceed budget
      {
        field: "$.project.actualCost",
        operator: "less-than-or-equals",
        value: "$.project.approvedBudget"
      },
      // Start date must be before end date
      {
        field: "$.project.startDate",
        operator: "date-before",
        value: "$.project.endDate"
      }
    ]
  }
};
```

### 🏗️ Fluent Builder Pattern
Construct complex rules programmatically:

```typescript
const complexRule = RuleEngine.builder()
  .add({
    and: [
      { field: "userType", operator: "equals", value: "premium" },
      { field: "subscriptionActive", operator: "equals", value: true }
    ],
    result: { access: "premium", features: ["analytics", "api", "support"] }
  })
  .add({
    and: [
      { field: "userType", operator: "equals", value: "basic" },
      { field: "trialExpired", operator: "equals", value: false }
    ],
    result: { access: "basic", features: ["dashboard"] }
  })
  .default({ access: "none", features: [] })
  .build(true); // Validate during build
```

### 📊 Rule Introspection
Understand what your rules need:

```typescript
const insights = RuleEngine.introspect(complexRule);
console.log(insights);
// {
//   fields: ["userType", "subscriptionActive", "trialExpired"],
//   operators: ["equals"],
//   possibleResults: [
//     { access: "premium", features: ["analytics", "api", "support"] },
//     { access: "basic", features: ["dashboard"] },
//     { access: "none", features: [] }
//   ],
//   complexity: "medium",
//   estimatedPerformance: "fast"
// }
```

## 🏎️ Performance & Benchmarks
*Real-world performance data from actual benchmark runs (10,000 iterations each)*

### Core Rule Performance
| Operation | Hz (ops/sec) | Avg Time | Performance Grade |
|-----------|-------------|----------|-------------------|
| **Simple Rules (3-5 conditions)** | **~16,900** | **0.059ms** | **🚀 Lightning Fast** |
| Complex Rules (nested evaluation) | ~17,400 | 0.057ms | 🔥 Blazing |
| Complex Rules (priority-based) | ~8,000 | 0.126ms | ⚡ Very Fast |
| Array Operations | ~45,400 | 0.022ms | 🚀 Ultra Fast |

### Advanced Features
| Feature | Hz (ops/sec) | Avg Time | Performance Grade |
|---------|-------------|----------|-------------------|
| **JSONPath Resolution (simple)** | **~55,000** | **0.018ms** | **🔥 Blazing Fast** |
| JSONPath Deep Nested Access | ~54,000 | 0.019ms | 🔥 Blazing Fast |
| JSONPath Array Processing | ~49,500 | 0.020ms | 🚀 Ultra Fast |
| Self-Referencing (complex) | ~33,600 | 0.030ms | 🚀 Excellent |
| Data Mutations (simple) | ~16,300 | 0.061ms | 🚀 Fast |
| Data Mutations (complex) | ~34,100 | 0.029ms | 🚀 Excellent |

### Specialized Operations
| Operation | Hz (ops/sec) | Use Case | Performance |
|-----------|-------------|----------|-------------|
| **Rule Builder (simple)** | **~12,000,000** | Rule Construction | ⚡ Instant |
| Rule Builder (complex) | ~94,300 | Complex Rule Building | 🚀 Very Fast |
| Rule Validation | ~67,000 | Schema Validation | 🔥 Blazing |
| Error Handling | ~1,661,000 | Exception Processing | ⚡ Instant |

### Optimization Tips

1. **Trust Mode**: Skip validation for 20% performance boost
   ```typescript
   const result = await RuleEngine.evaluate(rule, data, true);
   ```

2. **Batch Processing**: Process multiple records at once
   ```typescript
   const results = await RuleEngine.evaluate(rule, arrayOfData);
   ```

3. **Operator Selection**: Prefer specific operators over general ones
   ```typescript
   { operator: "equals" }        // ✅ Fast
   { operator: "matches" }       // ⚠️ Slower for simple cases
   ```

## 🔧 Operator Categories

### All 121+ Operators at Your Fingertips

| Category | Count | Examples |
|----------|-------|----------|
| **Comparison** | 6 | `equals`, `greater-than`, `less-than` |
| **String** | 12 | `like`, `starts-with`, `matches` |
| **Numeric** | 11 | `between`, `divisible-by`, `even` |
| **Array** | 12 | `contains`, `contains-any`, `array-length` |
| **Date/Time** | 14 | `date-after`, `date-between`, `time-equals` |
| **Type** | 10 | `string`, `number`, `boolean` |
| **Existence** | 6 | `exists`, `empty`, `null-or-undefined` |
| **Boolean** | 4 | `truthy`, `falsy`, `boolean-string` |
| **Pattern** | 2 | `matches`, `not-matches` |
| **Length** | 8 | `min-length`, `max-length`, `length-between` |
| **Persian** | 6 | `persian-alpha`, `persian-number` |
| **Validation** | 30+ | `email`, `url`, `uuid`, `alpha-numeric` |

### Popular Operators

```typescript
// String operations
{ field: "name", operator: "equals", value: "John" }
{ field: "email", operator: "like", value: "*@gmail.com" }
{ field: "description", operator: "matches", value: "^Product.*" }

// Numeric comparisons
{ field: "age", operator: "greater-than", value: 18 }
{ field: "price", operator: "between", value: [10, 100] }

// Array operations
{ field: "roles", operator: "contains", value: "admin" }
{ field: "tags", operator: "contains-all", value: ["urgent", "review"] }

// Date/time
{ field: "expiryDate", operator: "date-before-now", value: true }
{ field: "openTime", operator: "time-after", value: "09:00" }

// Validation
{ field: "email", operator: "email", value: true }
{ field: "password", operator: "min-length", value: 8 }
```

## 🎓 Complete TypeScript Excellence

### **Built-in Generic Support**
The core package is **100% TypeScript** with comprehensive generic interfaces:

```typescript
// 🛡️ Full generic support for input and output types
interface UserPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  level: 'admin' | 'user' | 'guest';
}

interface UserContext {
  role: string;
  department: string;
  active: boolean;
}

// ✅ Type-safe rule with both input/output generics
const accessRule: Rule<UserPermissions, UserContext> = {
  conditions: [
    {
      and: [
        { field: "role", operator: "equals", value: "admin" },
        { field: "active", operator: "equals", value: true }
      ],
      result: {
        canRead: true,
        canWrite: true,
        canDelete: true,
        level: "admin"   // ✅ Autocomplete & validation
      }
    }
  ],
  default: {
    canRead: false,
    canWrite: false,
    canDelete: false,
    level: "guest"     // ✅ Type-safe default
  }
};

// ✅ Fully typed evaluation with IntelliSense
const result = await RuleEngine.evaluate<UserPermissions, UserContext>(
  accessRule,
  { role: "admin", department: "IT", active: true }
);
// result.value is automatically typed as UserPermissions with full IDE support ✅
```

### **Type-Safe Custom Operators**
Custom operators inherit full TypeScript support:

```typescript
// ✅ Typed custom operator interface
interface CustomOperator<T = any, V = any> {
  name: string;
  category: string;
  evaluate(fieldValue: T, operatorValue: V): boolean;
}

// ✅ Type-safe custom operator implementation
class DateRangeOperator implements CustomOperator<Date, [Date, Date]> {
  name = 'date-within-range';
  category = 'datetime';

  evaluate(fieldValue: Date, [start, end]: [Date, Date]): boolean {
    return fieldValue >= start && fieldValue <= end;
  }
}

// ✅ Generic operator registration with type safety
OperatorRegistry.register<Date, [Date, Date]>(new DateRangeOperator());
```

## 📚 Documentation

### Core Package
- 📖 **[Core README](./packages/core/README.md)** - Complete API reference and examples
- 🎯 **[Operators Guide](./packages/core/docs/operators.md)** - All 121+ operators with examples
- 💡 **[Best Practices](./packages/core/docs/best-practices.md)** - Production patterns and tips
- 🚀 **[Migration Guide](./packages/core/docs/migration-guide.md)** - Upgrading from other engines

### Builder Package
- 🏗️ **[Builder README](./packages/builder/README.md)** - React components and integration
- 🎨 **[Component Reference](./packages/builder/docs/components.md)** - All UI components
- ⌨️ **[Keyboard Shortcuts](./packages/builder/docs/shortcuts.md)** - Professional navigation
- 🎯 **[Integration Examples](./packages/builder/docs/integration.md)** - Framework guides

### Architecture & Development
- 🏛️ **[Architecture Guide](./docs/architecture.md)** - System design and patterns
- 🛠️ **[Development Setup](./docs/getting-started.md)** - Contributing and development
- 📊 **[Comparison Guide](./docs/comparison.md)** - vs other rule engines

## 🛠️ Development

### Prerequisites
- Node.js >= 18.12.0
- pnpm >= 10.11.0

### Setup
```bash
# Clone the repository
git clone https://github.com/ali-master/rule-engine.git
cd rule-engine

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linter
pnpm lint
```

### Package Scripts
| Script | Description |
|--------|-------------|
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all packages |
| `pnpm test:types` | Type checking |
| `pnpm test:bench` | Performance benchmarks |

## 🆚 Why Choose This Rule Engine?

| Feature | @usex/rule-engine | json-rules-engine | node-rules |
|---------|-------------------|-------------------|------------|
| Zero Dependencies | ✅ | ❌ | ❌ |
| **TypeScript Native** | **✅ 100% + Generics** | ⚠️ Partial | ❌ |
| **Custom Operators** | **✅ Full Support** | ⚠️ Limited | ❌ |
| JSONPath Support | ✅ | ❌ | ❌ |
| Self-Referencing | ✅ | ❌ | ❌ |
| Visual Builder | ✅ | ❌ | ❌ |
| Generic Support | **✅ Input/Output** | ❌ | ❌ |
| Performance (ops/sec) | 17k+ (55k+ JSONPath) | 45k | 30k |
| Bundle Size | 12KB | 45KB | 38KB |
| Browser Support | ✅ | ✅ | ❌ |
| Rule Introspection | ✅ | ❌ | ❌ |
| Fluent Builder | ✅ | ❌ | ❌ |

## 🤝 Contributing

We love contributions! Whether it's:
- 🐛 Bug reports and fixes
- ✨ New operators or features
- 📖 Documentation improvements
- 🎨 Examples and tutorials
- 🏗️ UI components for the builder

See our [Contributing Guide](./CONTRIBUTING.md) for details.

### How to Contribute
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🗺️ Roadmap

### Version 1.0 (Current)
- ✅ Core rule engine with 121+ operators
- ✅ **Full TypeScript support with generics**
- ✅ **Custom operator registration system**
- ✅ Visual rule builder for React
- ✅ Comprehensive documentation
- ✅ Performance optimizations

### Version 1.1 (Q2 2025)
- 🔄 **Enhanced TypeScript utilities** (type guards, validators)
- 🔄 **Operator marketplace** with community operators
- 🔄 Rule templates and marketplace
- 🔄 GraphQL integration
- 🔄 More operator types (geo, financial)
- 🔄 Advanced debugging tools

### Version 2.0 (Q4 2025)
- 🔮 AI-powered rule suggestions
- 🔮 Visual rule debugger
- 🔮 Collaborative editing
- 🔮 Mobile app support
- 🔮 Multi-language operators

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENCE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Inspired by json-rules-engine and other rule engines
- Built with modern web technologies and best practices

## 💬 Support & Community

- 📖 **[Documentation](./packages/core/docs)** - Complete guides and references
- 🐛 **[Issue Tracker](https://github.com/ali-master/rule-engine/issues)** - Bug reports and feature requests
- 💭 **[Discussions](https://github.com/ali-master/rule-engine/discussions)** - Community Q&A and ideas
- 📧 **[Email](mailto:ali_4286@live.com)** - Direct contact

## Star History

<a href="https://www.star-history.com/#ali-master/rule-engine&Date&LogScale">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=ali-master/rule-engine&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=ali-master/rule-engine&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=ali-master/rule-engine&type=Date" />
 </picture>
</a>

---

<div align="center">

**Built with ❤️ by [Ali Torki](https://github.com/ali-master) for the developer community**

[⭐ Star us on GitHub](https://github.com/ali-master/rule-engine) • [📦 View on npm](https://www.npmjs.com/package/@usex/rule-engine) • [📖 Read the Docs](./packages/core/README.md)

**Making complex business logic simple, one rule at a time.**

</div>
