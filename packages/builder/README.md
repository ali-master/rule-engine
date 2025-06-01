# @usex/rule-engine-builder

A comprehensive React component library for building visual rule engine interfaces. Create complex business rules with an intuitive drag-and-drop interface, real-time evaluation, and full customization support.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Components](#components)
- [API Reference](#api-reference)
- [Hooks](#hooks)
- [Advanced Usage](#advanced-usage)
- [Examples](#examples)
- [Customization](#customization)
- [TypeScript Support](#typescript-support)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🎨 **Visual Rule Builder** - Intuitive tree-based interface with drag-and-drop
- 🔄 **Real-time Evaluation** - Test rules instantly with sample data
- 📈 **History Management** - Undo/redo with 100-entry history and version comparison
- 🎯 **126+ Operators** - Comprehensive operator set for all data types
- 🌲 **Nested Conditions** - Complex AND/OR/NONE logic trees with unlimited depth
- 📝 **JSONPath Support** - Advanced field referencing and data navigation
- 🎨 **Theme System** - Light/dark modes with full customization
- ⌨️ **Keyboard Shortcuts** - Professional keyboard navigation and shortcuts
- 📦 **Type-Safe** - Full TypeScript support with comprehensive types
- ♿ **Accessible** - WCAG compliant with screen reader support
- ⚡ **Performance** - Optimized rendering with virtualization support
- 🔧 **Extensible** - Custom operators, fields, and UI components

## Installation

```bash
# npm
npm install @usex/rule-engine-builder @usex/rule-engine

# yarn
yarn add @usex/rule-engine-builder @usex/rule-engine

# pnpm
pnpm add @usex/rule-engine-builder @usex/rule-engine
```

### Peer Dependencies

```json
{
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
}
```

## Quick Start

### Basic Setup

```tsx
import { TreeRuleBuilder } from '@usex/rule-engine-builder';
import '@usex/rule-engine-builder/styles';

function App() {
  const handleRuleChange = (rule) => {
    console.log('Rule updated:', rule);
  };

  const handleSave = (rule) => {
    console.log('Rule saved:', rule);
    // Save to backend
  };

  return (
    <TreeRuleBuilder
      onChange={handleRuleChange}
      onSave={handleSave}
      showJsonViewer={true}
      showToolbar={true}
    />
  );
}
```

### With Custom Fields

```tsx
import { TreeRuleBuilder, FieldConfig } from '@usex/rule-engine-builder';

const fields: FieldConfig[] = [
  {
    name: 'user.email',
    label: 'Email Address',
    type: 'string',
    group: 'User Profile',
    description: 'User\'s email address'
  },
  {
    name: 'user.age',
    label: 'Age',
    type: 'number',
    group: 'User Profile',
    description: 'User\'s age in years'
  },
  {
    name: 'order.total',
    label: 'Order Total',
    type: 'number',
    group: 'Order',
    description: 'Total order amount'
  },
  {
    name: 'order.items',
    label: 'Order Items',
    type: 'array',
    group: 'Order',
    description: 'List of items in the order'
  }
];

function App() {
  return (
    <TreeRuleBuilder
      fields={fields}
      sampleData={{
        user: { email: 'john@example.com', age: 25 },
        order: { total: 150.00, items: ['item1', 'item2'] }
      }}
      onChange={(rule) => console.log(rule)}
    />
  );
}
```

## Components

### Primary Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| `TreeRuleBuilder` | Main rule builder with tree interface | Complete rule building solution |
| `ModernRuleBuilder` | Modern drag-and-drop variant | Enhanced UX with animations |
| `RuleEvaluator` | Real-time rule evaluation | Testing and validation |
| `HistoryViewer` | Rule change history | Version control and comparison |

### Editor Components

| Component | Description | Features |
|-----------|-------------|----------|
| `TreeConditionGroup` | Nested condition management | AND/OR/NONE logic, drag-and-drop |
| `TreeConstraintEditor` | Individual constraint editing | Field, operator, value selection |
| `ModernConstraintEditor` | Enhanced constraint editor | Smart validation, type checking |
| `FieldSelector` | Field selection interface | Grouped fields, search, JSONPath |

### Input Components

| Component | Type | Features |
|-----------|------|----------|
| `SmartValueInput` | Universal | Type-aware, validation, suggestions |
| `ArrayInput` | Array | Add/remove items, drag reorder |
| `BooleanInput` | Boolean | Toggle, dropdown, radio options |
| `DateInput` | Date/Time | Calendar picker, time zones |
| `NumberInput` | Number | Animated, range validation |
| `AnimatedNumberInput` | Number | Smooth animations, formatting |

### Utility Components

| Component | Purpose | Features |
|-----------|---------|----------|
| `JsonViewer` | JSON visualization | Syntax highlighting, collapsible |
| `DiffViewer` | Rule comparison | Side-by-side, unified diff views |
| `ImportExport` | Data management | JSON/YAML import/export |
| `ThemeToggle` | Theme switching | Light/dark mode toggle |

## API Reference

### TreeRuleBuilder Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fields` | `FieldConfig[]` | `[]` | Available fields for selection |
| `sampleData` | `Record<string, any>` | `{}` | Sample data for testing |
| `onChange` | `(rule: any) => void` | - | Callback when rule changes |
| `onSave` | `(rule: any) => void` | - | Callback for save action |
| `onExport` | `(rule: any, format: string) => void` | - | Callback for export action |
| `onImport` | `(data: string, format: string) => void` | - | Callback for import action |
| `readOnly` | `boolean` | `false` | Make builder read-only |
| `className` | `string` | - | Additional CSS classes |
| `showJsonViewer` | `boolean` | `true` | Show JSON viewer panel |
| `showToolbar` | `boolean` | `true` | Show toolbar with actions |
| `maxNestingDepth` | `number` | `10` | Maximum nesting depth |
| `customOperators` | `Record<string, any>` | - | Custom operator definitions |
| `theme` | `'light' \| 'dark' \| 'system'` | `'system'` | Theme preference |
| `keyboardShortcuts` | `KeyboardShortcuts` | Default shortcuts | Custom keyboard shortcuts |

### FieldConfig Interface

```typescript
interface FieldConfig {
  name: string;                    // Field identifier (supports JSONPath)
  label?: string;                  // Display label
  type?: FieldType;               // Data type
  description?: string;           // Field description
  group?: string;                 // Group name for organization
  jsonPath?: boolean;            // Enable JSONPath expressions
  required?: boolean;            // Mark as required field
  values?: Array<{               // Predefined values
    value: any;
    label: string;
    description?: string;
  }>;
  validation?: {                 // Field validation rules
    min?: number;
    max?: number;
    pattern?: string;
  };
}

type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
```

### KeyboardShortcuts Configuration

```typescript
interface KeyboardShortcuts {
  undo?: ShortcutConfig;
  redo?: ShortcutConfig;
  save?: ShortcutConfig;
  test?: ShortcutConfig;
  addGroup?: ShortcutConfig;
  expandAll?: ShortcutConfig;
  collapseAll?: ShortcutConfig;
  help?: ShortcutConfig;
}

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  shift?: boolean;
  alt?: boolean;
}
```

### Theme Configuration

```typescript
interface ThemeConfig {
  colors?: {
    or?: string;      // OR group color
    and?: string;     // AND group color
    none?: string;    // NONE group color
  };
  labels?: {
    addGroup?: string;
    addRule?: string;
    removeGroup?: string;
    // ... other labels
  };
}
```

## Hooks

### useEnhancedRuleStore

Advanced rule state management with history.

```typescript
const {
  rule,              // Current rule
  history,           // Rule history
  historyIndex,      // Current history position
  updateRule,        // Update rule
  updateConditions,  // Update conditions
  undo,             // Undo last change
  redo,             // Redo last change
  canUndo,          // Can undo?
  canRedo,          // Can redo?
  expandAll,        // Expand all groups
  collapseAll,      // Collapse all groups
  getHistoryInfo    // Get history metadata
} = useEnhancedRuleStore();
```

### useFieldDiscovery

Automatic field discovery from sample data.

```typescript
const {
  fields,           // Discovered fields
  isLoading,        // Discovery in progress
  discover,         // Trigger discovery
  addCustomField,   // Add custom field
  removeField       // Remove field
} = useFieldDiscovery(sampleData, options);
```

### useKeyboardShortcuts

Configurable keyboard shortcuts.

```typescript
useKeyboardShortcuts([
  {
    key: 'z',
    ctrl: true,
    handler: () => undo(),
    description: 'Undo last action'
  },
  {
    key: 's',
    ctrl: true,
    handler: () => save(),
    description: 'Save rule'
  }
]);
```

## Advanced Usage

### Custom Field Discovery

```tsx
import { useFieldDiscovery, TreeRuleBuilder } from '@usex/rule-engine-builder';

function SmartRuleBuilder({ data }) {
  const { fields, discover } = useFieldDiscovery(data, {
    maxDepth: 3,
    includeArrayIndices: true,
    generateLabels: true
  });

  return (
    <TreeRuleBuilder
      fields={fields}
      sampleData={data}
      onChange={(rule) => console.log(rule)}
    />
  );
}
```

### Real-time Rule Evaluation

```tsx
import { TreeRuleBuilder, RuleEvaluator } from '@usex/rule-engine-builder';

function EvaluatingRuleBuilder() {
  const [rule, setRule] = useState(null);
  const [testData, setTestData] = useState({});

  return (
    <div className="grid grid-cols-2 gap-4">
      <TreeRuleBuilder
        onChange={setRule}
        sampleData={testData}
      />
      <RuleEvaluator
        rule={rule}
        data={testData}
        onDataChange={setTestData}
      />
    </div>
  );
}
```

### Custom Operators

```tsx
const customOperators = {
  'custom-contains': {
    label: 'Custom Contains',
    category: 'String',
    description: 'Custom contains logic',
    valueType: 'string',
    evaluate: (fieldValue, constraintValue) => {
      return fieldValue?.toLowerCase().includes(constraintValue?.toLowerCase());
    }
  }
};

<TreeRuleBuilder
  customOperators={customOperators}
  onChange={(rule) => console.log(rule)}
/>
```

### History Management

```tsx
import { TreeRuleBuilder, HistoryViewer } from '@usex/rule-engine-builder';

function VersionControlledBuilder() {
  return (
    <div>
      <TreeRuleBuilder
        showToolbar={true}
        onChange={(rule) => console.log(rule)}
      />
      <HistoryViewer className="mt-4" />
    </div>
  );
}
```

## Examples

### E-commerce Discount Rules

```tsx
const discountFields: FieldConfig[] = [
  {
    name: 'customer.tier',
    label: 'Customer Tier',
    type: 'string',
    group: 'Customer',
    values: [
      { value: 'bronze', label: 'Bronze' },
      { value: 'silver', label: 'Silver' },
      { value: 'gold', label: 'Gold' },
      { value: 'platinum', label: 'Platinum' }
    ]
  },
  {
    name: 'order.total',
    label: 'Order Total',
    type: 'number',
    group: 'Order'
  },
  {
    name: 'order.itemCount',
    label: 'Item Count',
    type: 'number',
    group: 'Order'
  }
];

function DiscountRuleBuilder() {
  const handleRuleChange = (rule) => {
    // Apply discount logic based on rule
    console.log('Discount rule:', rule);
  };

  return (
    <TreeRuleBuilder
      fields={discountFields}
      sampleData={{
        customer: { tier: 'gold', totalSpent: 1500 },
        order: { total: 200, itemCount: 3 }
      }}
      onChange={handleRuleChange}
      labels={{
        addGroup: 'Add Discount Condition',
        noRules: 'No discount rules defined. Add conditions to create discounts.'
      }}
    />
  );
}
```

### Access Control Rules

```tsx
const accessFields: FieldConfig[] = [
  {
    name: 'user.role',
    label: 'User Role',
    type: 'string',
    group: 'User',
    values: [
      { value: 'admin', label: 'Administrator' },
      { value: 'moderator', label: 'Moderator' },
      { value: 'user', label: 'Regular User' },
      { value: 'guest', label: 'Guest' }
    ]
  },
  {
    name: 'user.permissions',
    label: 'Permissions',
    type: 'array',
    group: 'User'
  },
  {
    name: 'resource.type',
    label: 'Resource Type',
    type: 'string',
    group: 'Resource'
  }
];

function AccessControlBuilder() {
  return (
    <TreeRuleBuilder
      fields={accessFields}
      sampleData={{
        user: { 
          role: 'moderator', 
          permissions: ['read', 'write', 'moderate'] 
        },
        resource: { type: 'document', owner: 'user123' }
      }}
      colors={{
        and: 'border-green-500/30 bg-green-500/5',
        or: 'border-blue-500/30 bg-blue-500/5',
        none: 'border-red-500/30 bg-red-500/5'
      }}
    />
  );
}
```

### Form Validation Rules

```tsx
const validationFields: FieldConfig[] = [
  {
    name: 'email',
    label: 'Email Address',
    type: 'string',
    group: 'Contact',
    validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' }
  },
  {
    name: 'age',
    label: 'Age',
    type: 'number',
    group: 'Personal',
    validation: { min: 18, max: 120 }
  },
  {
    name: 'password',
    label: 'Password',
    type: 'string',
    group: 'Security'
  }
];

function ValidationRuleBuilder() {
  const [validationRule, setValidationRule] = useState(null);
  
  const validateForm = (formData) => {
    if (!validationRule) return { isValid: true };
    
    // Use RuleEngine to validate
    return RuleEngine.evaluate(validationRule, formData);
  };

  return (
    <div>
      <TreeRuleBuilder
        fields={validationFields}
        onChange={setValidationRule}
        sampleData={{
          email: 'user@example.com',
          age: 25,
          password: 'securePass123'
        }}
        labels={{
          addGroup: 'Add Validation Rule',
          noRules: 'No validation rules defined.'
        }}
      />
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3>Test Validation</h3>
        <button onClick={() => {
          const result = validateForm({
            email: 'test@example.com',
            age: 25,
            password: 'weak'
          });
          console.log('Validation result:', result);
        }}>
          Test Form Validation
        </button>
      </div>
    </div>
  );
}
```

## Customization

### Theme Customization

```tsx
const customTheme = {
  colors: {
    or: 'border-purple-500/30 bg-purple-500/5 dark:bg-purple-500/10',
    and: 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10',
    none: 'border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10'
  },
  labels: {
    addGroup: 'Add Business Rule',
    addRule: 'Add Condition',
    or: 'ANY',
    and: 'ALL',
    none: 'EXCEPT'
  }
};

<TreeRuleBuilder
  theme={customTheme}
  className="custom-rule-builder"
/>
```

### Custom Keyboard Shortcuts

```tsx
const customShortcuts = {
  save: { key: 's', ctrl: true, shift: true },
  test: { key: 't', alt: true },
  addGroup: { key: 'n', ctrl: true },
  help: { key: 'F1' }
};

<TreeRuleBuilder
  keyboardShortcuts={customShortcuts}
/>
```

### Responsive Layout

```tsx
function ResponsiveRuleBuilder() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <TreeRuleBuilder
      showJsonViewer={!isMobile}
      showToolbar={true}
      className={isMobile ? 'mobile-layout' : 'desktop-layout'}
    />
  );
}
```

## TypeScript Support

### Full Type Safety

```typescript
import { 
  TreeRuleBuilder, 
  FieldConfig, 
  RuleType, 
  EvaluationResult 
} from '@usex/rule-engine-builder';

interface UserData {
  name: string;
  age: number;
  email: string;
}

interface DiscountResult {
  discount: number;
  message: string;
}

const fields: FieldConfig[] = [
  { name: 'name', label: 'Name', type: 'string' },
  { name: 'age', label: 'Age', type: 'number' },
  { name: 'email', label: 'Email', type: 'string' }
];

function TypedRuleBuilder() {
  const handleRuleChange = (rule: RuleType<DiscountResult>) => {
    // rule is fully typed
    console.log(rule.conditions);
  };

  return (
    <TreeRuleBuilder
      fields={fields}
      onChange={handleRuleChange}
      sampleData={{ 
        name: 'John', 
        age: 30, 
        email: 'john@example.com' 
      } as UserData}
    />
  );
}
```

### Custom Hook Types

```typescript
import { useEnhancedRuleStore } from '@usex/rule-engine-builder';

function useTypedRuleStore() {
  const store = useEnhancedRuleStore();
  
  return {
    ...store,
    updateRule: (rule: RuleType<DiscountResult>) => store.updateRule(rule)
  };
}
```

## Performance Considerations

### Optimization Tips

1. **Memoize Field Configs**: Use `useMemo` for static field configurations
2. **Debounce Changes**: Debounce `onChange` callbacks for better performance
3. **Limit Nesting Depth**: Set appropriate `maxNestingDepth` values
4. **Virtual Scrolling**: Enable for large field lists
5. **Lazy Loading**: Load operators and field data on demand

```tsx
const fields = useMemo(() => generateFields(), []);
const debouncedOnChange = useMemo(
  () => debounce((rule) => console.log(rule), 300),
  []
);

<TreeRuleBuilder
  fields={fields}
  onChange={debouncedOnChange}
  maxNestingDepth={5}
/>
```

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | ≥ 88 |
| Firefox | ≥ 85 |
| Safari | ≥ 14 |
| Edge | ≥ 88 |

## Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone repository
git clone https://github.com/ali-master/rule-engine.git

# Install dependencies
pnpm install

# Start development server
cd packages/builder && pnpm dev

# Run tests
pnpm test

# Build package
pnpm build
```

## License

MIT © [Ali Torki](https://github.com/ali-master)

---

Made with ❤️ by [Ali Torki](https://github.com/ali-master)