# Getting Started Guide

Welcome to the Rule Engine! This guide will help you get up and running quickly with both the core engine and the visual builder.

## Table of Contents

- [Installation](#installation)
- [Your First Rule](#your-first-rule)
- [Understanding Rules](#understanding-rules)
- [Using the Visual Builder](#using-the-visual-builder)
- [Common Patterns](#common-patterns)
- [Next Steps](#next-steps)

## Installation

### Core Engine Only

If you only need the rule evaluation engine:

```bash
npm install @usex/rule-engine
```

### With Visual Builder

For the complete experience with UI components:

```bash
npm install @usex/rule-engine @usex/rule-engine-builder
```

### Peer Dependencies

The builder requires React 18 or 19:

```json
{
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  }
}
```

## Your First Rule

### Basic Example

Let's create a simple rule to check if a user is eligible for a discount:

```typescript
import { RuleEngine } from '@usex/rule-engine';

// Define the rule
const discountRule = {
  conditions: {
    and: [
      { field: "age", operator: "greater-than", value: 18 },
      { field: "membershipLevel", operator: "equals", value: "gold" }
    ]
  },
  default: { value: false }
};

// Test data
const customer = {
  age: 25,
  membershipLevel: "gold",
  totalPurchases: 1500
};

// Evaluate the rule
const result = await RuleEngine.evaluate(discountRule, customer);
console.log(result); 
// { value: true, isPassed: true }
```

### Understanding the Result

The evaluation returns an object with:

| Property | Type | Description |
|----------|------|-------------|
| `value` | `any` | The result value (from condition or default) |
| `isPassed` | `boolean` | Whether any condition matched |
| `message` | `string?` | Optional message from constraints |

## Understanding Rules

### Rule Structure

Every rule has two main parts:

```typescript
interface Rule {
  conditions: Condition | Condition[];  // What to evaluate
  default?: any;                       // Fallback if no match
}
```

### Conditions

Conditions group constraints using logical operators:

```typescript
// AND - All must match
{
  and: [
    { field: "age", operator: "greater-than", value: 21 },
    { field: "country", operator: "equals", value: "US" }
  ]
}

// OR - Any must match
{
  or: [
    { field: "role", operator: "equals", value: "admin" },
    { field: "role", operator: "equals", value: "moderator" }
  ]
}

// NONE - None must match
{
  none: [
    { field: "status", operator: "equals", value: "banned" },
    { field: "status", operator: "equals", value: "suspended" }
  ]
}
```

### Constraints

The basic building blocks:

```typescript
interface Constraint {
  field: string;      // What to check
  operator: string;   // How to check
  value?: any;        // What to compare against
  message?: string;   // Optional validation message
}
```

## Using the Visual Builder

### Basic Setup

```tsx
import { TreeRuleBuilder } from '@usex/rule-engine-builder';
import '@usex/rule-engine-builder/styles';

function App() {
  const [rule, setRule] = useState(null);
  
  const handleRuleChange = (newRule) => {
    setRule(newRule);
    console.log('Rule updated:', newRule);
  };
  
  return (
    <div className="app">
      <TreeRuleBuilder
        onChange={handleRuleChange}
        showJsonViewer={true}
        showToolbar={true}
      />
      
      {rule && (
        <div className="result">
          <h3>Generated Rule:</h3>
          <pre>{JSON.stringify(rule, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

### With Custom Fields

Define your business fields:

```tsx
const fields = [
  {
    name: 'customer.tier',
    label: 'Customer Tier',
    type: 'string',
    group: 'Customer',
    values: [
      { value: 'bronze', label: 'Bronze' },
      { value: 'silver', label: 'Silver' },
      { value: 'gold', label: 'Gold' }
    ]
  },
  {
    name: 'order.total',
    label: 'Order Total',
    type: 'number',
    group: 'Order'
  },
  {
    name: 'order.items.length',
    label: 'Item Count',
    type: 'number',
    group: 'Order'
  }
];

<TreeRuleBuilder
  fields={fields}
  onChange={handleRuleChange}
/>
```

### With Sample Data

Provide sample data for testing:

```tsx
const sampleData = {
  customer: {
    tier: 'gold',
    joinDate: '2023-01-15',
    totalSpent: 2500
  },
  order: {
    total: 150,
    items: ['item1', 'item2', 'item3']
  }
};

<TreeRuleBuilder
  fields={fields}
  sampleData={sampleData}
  onChange={handleRuleChange}
  showJsonViewer={true}
/>
```

## Common Patterns

### 1. Discount Rules

```typescript
const discountRule = {
  conditions: [
    // VIP customers get 20% off
    {
      and: [
        { field: "customer.tier", operator: "equals", value: "vip" },
        { field: "order.total", operator: "greater-than", value: 100 }
      ],
      result: { discount: 0.20, message: "VIP discount applied!" }
    },
    // New customers get 10% off
    {
      and: [
        { field: "customer.isNew", operator: "equals", value: true },
        { field: "order.total", operator: "greater-than", value: 50 }
      ],
      result: { discount: 0.10, message: "Welcome discount!" }
    }
  ],
  default: { discount: 0, message: "No discount available" }
};
```

### 2. Access Control

```typescript
const accessRule = {
  conditions: {
    or: [
      // Admins have full access
      { field: "user.role", operator: "equals", value: "admin" },
      // Owners can access their own resources
      {
        and: [
          { field: "user.id", operator: "equals", value: "$.resource.ownerId" },
          { field: "resource.public", operator: "equals", value: false }
        ]
      },
      // Anyone can access public resources
      { field: "resource.public", operator: "equals", value: true }
    ]
  },
  default: { value: false }
};
```

### 3. Form Validation

```typescript
const validationRule = {
  conditions: {
    and: [
      // Email validation
      { 
        field: "email", 
        operator: "matches", 
        value: "^[^@]+@[^@]+\\.[^@]+$",
        message: "Invalid email format"
      },
      // Age restriction
      { 
        field: "age", 
        operator: "between", 
        value: [18, 100],
        message: "Age must be between 18 and 100"
      },
      // Password strength
      { 
        field: "password", 
        operator: "matches", 
        value: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
        message: "Password must contain uppercase, lowercase, and number"
      }
    ]
  }
};
```

### 4. Dynamic Pricing

```typescript
const pricingRule = {
  conditions: [
    // Bulk discount
    {
      and: [
        { field: "quantity", operator: "greater-than", value: 100 }
      ],
      result: { multiplier: 0.8, reason: "Bulk discount" }
    },
    // Premium customer discount
    {
      and: [
        { field: "customer.tier", operator: "in", value: ["gold", "platinum"] },
        { field: "quantity", operator: "greater-than", value: 10 }
      ],
      result: { multiplier: 0.85, reason: "Premium customer discount" }
    }
  ],
  default: { multiplier: 1, reason: "Standard pricing" }
};
```

## Advanced Features

### JSONPath Support

Access nested data with JSONPath:

```typescript
const rule = {
  conditions: {
    and: [
      // Access nested object
      { field: "$.user.profile.age", operator: "greater-than", value: 18 },
      
      // Access array element
      { field: "$.orders[0].total", operator: "greater-than", value: 100 },
      
      // Filter arrays
      { field: "$.items[?(@.price > 50)]", operator: "not-empty", value: true }
    ]
  }
};
```

### Self-referencing

Reference other fields in values:

```typescript
const rule = {
  conditions: {
    and: [
      // Compare two fields
      { field: "$.currentPrice", operator: "less-than", value: "$.maxPrice" },
      
      // Percentage of another field
      { field: "$.discount", operator: "less-than-or-equals", value: "$.maxDiscount" }
    ]
  }
};
```

### Complex Nested Rules

```typescript
const complexRule = {
  conditions: {
    or: [
      // Premium path
      {
        and: [
          { field: "tier", operator: "equals", value: "premium" },
          {
            or: [
              { field: "purchases", operator: "greater-than", value: 10 },
              { field: "totalSpent", operator: "greater-than", value: 1000 }
            ]
          }
        ]
      },
      // VIP override
      { field: "isVIP", operator: "equals", value: true }
    ]
  }
};
```

## Testing Your Rules

### Simple Test

```typescript
// Quick boolean check
const isPassed = await RuleEngine.checkIsPassed(rule, data);
console.log('Rule passed:', isPassed); // true or false

// Get just the result value
const value = await RuleEngine.getEvaluateResult(rule, data);
console.log('Result:', value); // The actual result value
```

### Batch Testing

```typescript
const testCases = [
  { name: "John", age: 25, tier: "gold" },
  { name: "Jane", age: 17, tier: "silver" },
  { name: "Bob", age: 30, tier: "bronze" }
];

const results = await RuleEngine.evaluate(rule, testCases);
results.forEach((result, index) => {
  console.log(`${testCases[index].name}: ${result.isPassed}`);
});
```

### Validation

Always validate rules before using them:

```typescript
const validation = RuleEngine.validate(rule);

if (!validation.isValid) {
  console.error('Invalid rule:', validation.error.message);
} else {
  // Safe to use the rule
  const result = await RuleEngine.evaluate(rule, data);
}
```

## Next Steps

Now that you understand the basics:

1. **Explore Operators**: Check the [Operators Guide](../packages/core/docs/operators.md) for all 126+ operators
2. **Learn Best Practices**: Read the [Best Practices Guide](../packages/core/docs/best-practices.md)
3. **Try Examples**: See real-world [Examples](../packages/builder/docs/examples.md)
4. **Build Complex Rules**: Use the [Visual Builder](../packages/builder/README.md)
5. **Integrate**: Follow the [Integration Guide](../packages/builder/docs/integration.md)

## Quick Reference

### Common Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `equals` | Exact match | `{ operator: "equals", value: "active" }` |
| `greater-than` | Greater than | `{ operator: "greater-than", value: 18 }` |
| `contains` | Array/string contains | `{ operator: "contains", value: "admin" }` |
| `between` | Range check | `{ operator: "between", value: [10, 20] }` |
| `matches` | Regex match | `{ operator: "matches", value: "^[A-Z]" }` |
| `exists` | Field exists | `{ operator: "exists", value: true }` |
| `empty` | Is empty | `{ operator: "empty", value: true }` |

### Keyboard Shortcuts (Builder)

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + S` | Save |
| `Ctrl/Cmd + E` | Toggle evaluation |
| `?` | Show help |

---

Ready to build more complex rules? Check out our [Examples](../packages/builder/docs/examples.md) or dive into the [API Reference](../packages/core/docs/api-reference.md)!