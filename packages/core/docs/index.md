# @usex/rule-engine Documentation

Welcome to the comprehensive documentation for @usex/rule-engine - a simple yet powerful rule engine for Node.js and the browser.

## 📚 Documentation Overview

### Getting Started
- [**README**](../README.md) - Installation, quick start, and features overview
- [**API Reference**](./api-reference.md) - Complete API documentation
- [**TypeScript Guide**](../README.md#typescript-support) - Type-safe usage examples

### Core Concepts
- [**Operators Guide**](./operators.md) - All 126 operators with examples
- [**Best Practices**](./best-practices.md) - Production-ready patterns and tips
- [**Examples**](../README.md#examples) - Real-world use cases

### Migration & Integration
- [**Migration Guide**](./migration-guide.md) - Migrate from other rule engines
- [**Common Patterns**](./migration-guide.md#common-migration-patterns) - Convert existing logic

## 🚀 Quick Links

| Resource | Description |
|----------|-------------|
| [GitHub Repository](https://github.com/ali-master/rule-engine) | Source code and issues |
| [npm Package](https://www.npmjs.com/package/@usex/rule-engine) | Latest releases |
| [Changelog](https://github.com/ali-master/rule-engine/releases) | Version history |
| [License](../../../LICENSE) | MIT License |

## 📖 Documentation Structure

```
docs/
├── index.md              # This file - Documentation hub
├── api-reference.md      # Complete API documentation
├── operators.md          # All 126 operators reference
├── best-practices.md     # Production best practices
└── migration-guide.md    # Migration from other engines
```

## 🎯 Common Use Cases

### 1. Business Rules
- Discount calculations
- Pricing strategies
- Approval workflows
- Access control

### 2. Validation
- Form validation
- Data integrity
- Input sanitization
- Schema validation

### 3. Personalization
- Content filtering
- Feature flags
- User segmentation
- Recommendation engines

### 4. Automation
- Workflow automation
- Alert triggers
- Event processing
- Decision trees

## 💡 Key Features at a Glance

| Feature | Description |
|---------|-------------|
| **Zero Dependencies** | Lightweight core, optional peer dependencies |
| **JSONPath Support** | Access nested properties with `$.path.to.field` |
| **126+ Operators** | Comprehensive operator set for any use case |
| **Type Safety** | Full TypeScript support with generics |
| **Builder Pattern** | Fluent API for programmatic rule creation |
| **Async Support** | Promise-based evaluation |
| **Batch Processing** | Evaluate multiple criteria efficiently |
| **Rule Introspection** | Analyze rules for possible inputs |
| **Mutations** | Transform data before evaluation |
| **Cross-platform** | Works in Node.js and browsers |

## 📊 Quick Comparison

### Operator Categories

| Category | Count | Examples |
|----------|-------|----------|
| Comparison | 6 | `equals`, `greater-than`, `less-than` |
| String | 12 | `like`, `starts-with`, `email`, `url` |
| Numeric | 11 | `between`, `positive`, `even`, `integer` |
| Array | 12 | `contains`, `contains-any`, `array-length` |
| Date/Time | 14 | `date-after`, `date-between`, `time-equals` |
| Type | 10 | `string`, `number`, `array`, `object` |
| Existence | 6 | `exists`, `empty`, `null-or-undefined` |
| Boolean | 4 | `truthy`, `falsy`, `boolean-string` |
| Pattern | 2 | `matches`, `not-matches` |
| Persian | 3 | `persian-alpha`, `persian-number` |

## 🔧 Quick Setup

```bash
# Install
npm install @usex/rule-engine

# Basic usage
import { RuleEngine } from '@usex/rule-engine';

const rule = {
  conditions: {
    and: [
      { field: "age", operator: "greater-than", value: 18 },
      { field: "country", operator: "equals", value: "US" }
    ]
  },
  default: { allowed: false }
};

const result = await RuleEngine.evaluate(rule, { 
  age: 25, 
  country: "US" 
});
// { value: { allowed: true }, isPassed: true }
```

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/ali-master/rule-engine.git

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../../CONTRIBUTING.md) for details.

## 📝 License

MIT © [Ali Torki](https://github.com/ali-master)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/ali-master">Ali Torki</a></p>
  <p>
    <a href="https://github.com/ali-master/rule-engine">GitHub</a> •
    <a href="https://www.npmjs.com/package/@usex/rule-engine">npm</a> •
    <a href="https://github.com/ali-master/rule-engine/issues">Issues</a>
  </p>
</div>