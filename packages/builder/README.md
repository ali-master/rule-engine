# @usex/rule-engine-builder

A comprehensive React component library for building and managing rule engine configurations. This library provides an intuitive UI for creating complex business rules with support for nested conditions, multiple operators, and full customization.

## Features

- 🎨 **Visual Rule Builder** - Drag-and-drop interface for creating rules
- 🔄 **Import/Export** - Full JSON import/export functionality
- 🎯 **130+ Operators** - Comprehensive set of operators for all data types
- 🌲 **Nested Conditions** - Support for complex AND/OR/NONE logic trees
- 📝 **JSONPath Support** - Use JSONPath expressions for field references
- 🎨 **Fully Customizable** - Theme support and component customization
- 📦 **Type-Safe** - Built with TypeScript for better developer experience
- ⚡ **Lightweight** - Minimal dependencies, tree-shakeable

## Installation

```bash
npm install @usex/rule-engine-builder
# or
yarn add @usex/rule-engine-builder
# or
pnpm add @usex/rule-engine-builder
```

## Quick Start

```tsx
import { RuleBuilder } from '@usex/rule-engine-builder';
import '@usex/rule-engine-builder/styles';

function App() {
  const handleRuleChange = (rule) => {
    console.log('Rule updated:', rule);
  };

  return (
    <RuleBuilder
      onRuleChange={handleRuleChange}
      showViewer={true}
      showImportExport={true}
    />
  );
}
```

## Advanced Usage

### With Custom Fields

```tsx
import { RuleBuilder, FieldConfig } from '@usex/rule-engine-builder';

const fields: FieldConfig[] = [
  {
    name: 'user.email',
    label: 'User Email',
    type: 'string',
    group: 'User',
  },
  {
    name: 'user.age',
    label: 'User Age',
    type: 'number',
    group: 'User',
  },
  {
    name: 'order.total',
    label: 'Order Total',
    type: 'number',
    group: 'Order',
  },
];

function App() {
  return (
    <RuleBuilder
      fields={fields}
      onRuleChange={(rule) => console.log(rule)}
    />
  );
}
```

### Custom Theme

```tsx
import { RuleBuilder, ThemeConfig } from '@usex/rule-engine-builder';

const customTheme: ThemeConfig = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    destructive: '#ef4444',
  },
  radius: 'lg',
  spacing: 'comfortable',
};

function App() {
  return (
    <RuleBuilder
      theme={customTheme}
      onRuleChange={(rule) => console.log(rule)}
    />
  );
}
```

### Using Sub-Components

For advanced use cases, you can use individual components:

```tsx
import {
  RuleBuilderProvider,
  RuleEditor,
  RuleViewer,
  useRuleBuilder,
} from '@usex/rule-engine-builder';

function CustomRuleBuilder() {
  const { state, updateRule } = useRuleBuilder();

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <RuleEditor />
      </div>
      <div className="w-1/3">
        <RuleViewer rule={state.rule} />
      </div>
    </div>
  );
}

function App() {
  return (
    <RuleBuilderProvider>
      <CustomRuleBuilder />
    </RuleBuilderProvider>
  );
}
```

## API Reference

### RuleBuilder Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onRuleChange` | `(rule: RuleType) => void` | - | Callback when rule changes |
| `fields` | `FieldConfig[]` | `[]` | Available fields for selection |
| `operators` | `OperatorConfig[]` | All operators | Available operators |
| `showViewer` | `boolean` | `true` | Show JSON viewer panel |
| `showImportExport` | `boolean` | `true` | Show import/export buttons |
| `viewerPosition` | `'right' \| 'bottom'` | `'right'` | Position of JSON viewer |
| `theme` | `ThemeConfig` | Default theme | Custom theme configuration |
| `readOnly` | `boolean` | `false` | Make the builder read-only |

### Field Configuration

```typescript
interface FieldConfig {
  name: string;              // Field identifier (supports JSONPath)
  label?: string;            // Display label
  type?: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  description?: string;      // Field description
  group?: string;           // Group name for organization
  jsonPath?: boolean;       // Enable JSONPath expressions
  values?: Array<{          // Predefined values for dropdowns
    value: any;
    label: string;
  }>;
}
```

### Rule Structure

```typescript
interface RuleType {
  conditions: Condition | Condition[];
  default?: EngineResult;
}

interface Condition {
  or?: Array<Constraint | Condition>;
  and?: Array<Constraint | Condition>;
  none?: Array<Constraint | Condition>;
  result?: EngineResult;
}

interface Constraint {
  field: string;
  operator: OperatorsType;
  value?: any;
  message?: string;
}
```

## Operators

The library includes 130+ operators organized in categories:

- **Comparison**: equals, not-equals, greater-than, less-than, etc.
- **Array/Collection**: in, not-in, contains, contains-all, etc.
- **Existence**: exists, not-exists, empty, not-empty, etc.
- **Date/Time**: date-after, date-before, date-between, etc.
- **Type Validation**: string, number, boolean, email, url, etc.
- **String Validation**: alpha, alphanumeric, matches (regex), etc.
- **Number Validation**: positive, negative, between, etc.
- **Length Validation**: min-length, max-length, length-between, etc.

## Examples

### E-commerce Discount Rule

```json
{
  "conditions": {
    "and": [
      {
        "field": "order.total",
        "operator": "greater-than",
        "value": 100
      },
      {
        "field": "user.membershipLevel",
        "operator": "in",
        "value": ["gold", "platinum"]
      }
    ],
    "result": {
      "value": "20% discount"
    }
  },
  "default": {
    "value": "No discount"
  }
}
```

### User Access Control

```json
{
  "conditions": [
    {
      "and": [
        {
          "field": "user.role",
          "operator": "equals",
          "value": "admin"
        }
      ],
      "result": { "value": "full-access" }
    },
    {
      "and": [
        {
          "field": "user.role",
          "operator": "equals",
          "value": "user"
        },
        {
          "field": "user.subscription",
          "operator": "equals",
          "value": "premium"
        }
      ],
      "result": { "value": "premium-access" }
    }
  ],
  "default": { "value": "basic-access" }
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
