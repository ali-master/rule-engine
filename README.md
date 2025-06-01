# Rule Engine

A powerful, flexible rule engine for JavaScript/TypeScript applications. Build complex business logic with a simple JSON-based DSL, featuring a visual rule builder UI and comprehensive operator set.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![npm version](https://img.shields.io/npm/v/@usex/rule-engine.svg)](https://www.npmjs.com/package/@usex/rule-engine)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Features

- 📦 **Zero Dependencies Core** - Lightweight and fast rule engine
- 🎨 **Visual Rule Builder** - React-based UI for creating rules without code
- 🔧 **121+ Built-in Operators** - Comprehensive operator set for all data types
- 🌳 **Complex Logic Trees** - Support for nested AND/OR/NONE conditions
- 🔍 **JSONPath Support** - Advanced data navigation with JSONPath expressions
- 📝 **History & Undo/Redo** - Built-in version control for rules
- 🛡️ **Type-Safe** - Full TypeScript support with generics
- ⚡ **High Performance** - Optimized for speed with caching support
- 🔄 **Real-time Evaluation** - Test rules instantly with sample data
- 🎯 **Customizable** - Themes, operators, and UI components

## 📦 Packages

This monorepo contains the following packages:

| Package | Version | Description |
|---------|---------|-------------|
| [`@usex/rule-engine`](./packages/core) | [![npm](https://img.shields.io/npm/v/@usex/rule-engine.svg)](https://www.npmjs.com/package/@usex/rule-engine) | Core rule engine library |
| [`@usex/rule-engine-builder`](./packages/builder) | [![npm](https://img.shields.io/npm/v/@usex/rule-engine-builder.svg)](https://www.npmjs.com/package/@usex/rule-engine-builder) | React UI components for building rules |

## 🚀 Quick Start

### Install the Core Engine

```bash
npm install @usex/rule-engine
# or
yarn add @usex/rule-engine
# or
pnpm add @usex/rule-engine
```

### Basic Usage

```typescript
import { RuleEngine } from '@usex/rule-engine';

// Define a rule
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

### With Visual Builder

```bash
npm install @usex/rule-engine-builder @usex/rule-engine
```

```tsx
import { TreeRuleBuilder } from '@usex/rule-engine-builder';
import '@usex/rule-engine-builder/styles';

function App() {
  const handleRuleChange = (rule) => {
    console.log('Rule updated:', rule);
  };

  return (
    <TreeRuleBuilder
      onChange={handleRuleChange}
      showJsonViewer={true}
      showToolbar={true}
    />
  );
}
```

## 📚 Documentation

### Core Documentation

| Topic | Description                               |
|-------|-------------------------------------------|
| [Core README](./packages/core/README.md) | Installation, API reference, and examples |
| [Operators Guide](./packages/core/docs/operators.md) | All 121 operators with examples           |
| [API Reference](./packages/core/docs/api-reference.md) | Complete API documentation                |
| [Best Practices](./packages/core/docs/best-practices.md) | Production tips and patterns              |
| [Migration Guide](./packages/core/docs/migration-guide.md) | Migrate from other rule engines           |

### Builder Documentation

| Topic | Description |
|-------|-------------|
| [Builder README](./packages/builder/README.md) | UI components and integration |
| [Component Reference](./packages/builder/docs/components.md) | All components with APIs |
| [Hooks Reference](./packages/builder/docs/hooks.md) | State management hooks |
| [Examples](./packages/builder/docs/examples.md) | Real-world use cases |
| [Integration Guide](./packages/builder/docs/integration.md) | Framework integration |

## 💡 Use Cases

### E-commerce

- **Dynamic Pricing**: Adjust prices based on customer tier, quantity, season
- **Shipping Rules**: Calculate shipping based on location, weight, method
- **Promotions**: Complex promotional campaigns with multiple conditions
- **Inventory**: Automated reordering and stock management

### Access Control

- **RBAC**: Role-based access control with fine-grained permissions
- **MFA Rules**: Intelligent multi-factor authentication based on risk
- **Resource Access**: Dynamic resource access based on context
- **Compliance**: Enforce regulatory compliance rules

### Form Validation

- **Dynamic Validation**: Context-aware form validation
- **Multi-step Forms**: Different rules for each form step
- **Custom Validators**: Business-specific validation logic
- **Conditional Fields**: Show/hide fields based on rules

### Business Automation

- **Lead Scoring**: Score leads based on behavior and attributes
- **Workflow Automation**: Trigger actions based on conditions
- **Alert Systems**: Intelligent alerting with complex criteria
- **Data Processing**: Transform and filter data streams

## 🏗️ Architecture

```
rule-engine/
├── packages/
│   ├── core/                 # Core rule engine
│   │   ├── src/
│   │   │   ├── services/     # RuleEngine, ObjectDiscovery
│   │   │   ├── operators/    # 121+ operators
│   │   │   ├── types/        # TypeScript types
│   │   │   └── utils/        # Utilities
│   │   └── docs/             # Core documentation
│   │
│   └── builder/              # React UI components
│       ├── src/
│       │   ├── components/   # UI components
│       │   ├── hooks/        # React hooks
│       │   └── stores/       # State management
│       └── docs/             # Builder documentation
│
└── apps/
    └── web/                  # Documentation website
```

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
pnpm test:unit

# Run linter
pnpm lint
```

### Package Scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm test:unit` | Run unit tests |
| `pnpm test:types` | Type checking |
| `pnpm test:knip` | Find unused dependencies |

### Development Workflow

```bash
# Start development server for builder
cd packages/builder
pnpm dev

# Run tests in watch mode
cd packages/core
pnpm test:watch

# Build a specific package
cd packages/core
pnpm build
```

## 📊 Performance

### Benchmarks

| Operation | Records | Time | Throughput |
|-----------|---------|------|------------|
| Simple Rule (5 conditions) | 10,000 | 85ms | ~117,000/sec |
| Complex Rule (20 conditions) | 10,000 | 250ms | ~40,000/sec |
| With JSONPath | 10,000 | 120ms | ~83,000/sec |
| With Mutations | 10,000 | 150ms | ~66,000/sec |
| Nested Rules (3 levels) | 10,000 | 180ms | ~55,000/sec |

### Optimization Tips

1. **Trust Mode**: Skip validation for known-good rules
2. **Batch Evaluation**: Process multiple items at once
3. **Memoization**: Cache frequently used rules
4. **Proper Indexing**: Order conditions by likelihood of failure

## 🔧 Operator Categories

### Overview

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
| **Persian** | 3 | `persian-alpha`, `persian-number` |

### Popular Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `equals` | Exact match | `{ field: "status", operator: "equals", value: "active" }` |
| `contains` | Array/string contains | `{ field: "tags", operator: "contains", value: "featured" }` |
| `between` | Range check | `{ field: "age", operator: "between", value: [18, 65] }` |
| `matches` | Regex pattern | `{ field: "email", operator: "matches", value: "^[^@]+@[^@]+$" }` |
| `date-after` | Date comparison | `{ field: "expires", operator: "date-after", value: "2024-01-01" }` |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Update documentation
- Follow the existing code style
- Add examples for new operators
- Ensure backward compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENCE](./LICENCE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Inspired by json-rules-engine and other rule engines
- Built with modern web technologies

## 💬 Support

- 📖 [Documentation](./packages/core/docs)
- 🐛 [Issue Tracker](https://github.com/ali-master/rule-engine/issues)
- 💭 [Discussions](https://github.com/ali-master/rule-engine/discussions)
- 📧 [Email](mailto:ali_4286@live.com)

## 🗺️ Roadmap

### Version 1.0 (Current)
- ✅ Core rule engine
- ✅ Visual rule builder
- ✅ 121+ operators
- ✅ TypeScript support
- ✅ Documentation

### Version 1.1 (Planned)
- 🔄 Rule templates
- 🔄 Rule marketplace
- 🔄 GraphQL integration
- 🔄 More operator types
- 🔄 Performance improvements

### Version 2.0 (Future)
- 🔮 AI-powered rule suggestions
- 🔮 Visual rule debugger
- 🔮 Cloud rule storage
- 🔮 Collaborative editing
- 🔮 Mobile app support

---

<div style="text-align: center;">
  <p>
    <strong>Made with ❤️ by <a href="https://github.com/ali-master">Ali Torki</a></strong>
  </p>
  <p>
    <a href="https://github.com/ali-master/rule-engine">GitHub</a> •
    <a href="https://www.npmjs.com/package/@usex/rule-engine">npm</a> •
    <a href="./packages/core/docs">Documentation</a>
  </p>
</div>
