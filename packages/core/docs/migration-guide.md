# Migration Guide

This guide helps you migrate from other rule engines to @usex/rule-engine.

## Table of Contents

- [From json-rules-engine](#from-json-rules-engine)
- [From node-rules](#from-node-rules)
- [From business-rules-engine](#from-business-rules-engine)
- [From custom implementations](#from-custom-implementations)
- [Common Migration Patterns](#common-migration-patterns)

## From json-rules-engine

### Rule Structure Comparison

#### json-rules-engine
```javascript
{
  conditions: {
    all: [{
      fact: 'age',
      operator: 'greaterThanInclusive',
      value: 18
    }, {
      fact: 'country',
      operator: 'equal',
      value: 'US'
    }]
  },
  event: {
    type: 'adult-us-citizen',
    params: {
      canVote: true
    }
  }
}
```

#### @usex/rule-engine
```javascript
{
  conditions: {
    and: [{
      field: 'age',
      operator: 'greater-than-or-equals',
      value: 18
    }, {
      field: 'country',
      operator: 'equals',
      value: 'US'
    }],
    result: {
      canVote: true,
      type: 'adult-us-citizen'
    }
  }
}
```

### Key Differences

| Feature | json-rules-engine | @usex/rule-engine |
|---------|------------------|-------------------|
| Field Reference | `fact` | `field` |
| Logical Operators | `all`, `any` | `and`, `or`, `none` |
| Results | `event` system | `result` in conditions or `default` |
| Async Support | Facts can be promises | Built-in async evaluation |
| JSONPath | Not supported | Full support with `$.path.to.field` |

### Migration Example

```javascript
// json-rules-engine
// @usex/rule-engine
import { RuleEngine } from '@usex/rule-engine';

const Engine = require('json-rules-engine');
const engine = new Engine();

engine.addRule({
  conditions: {
    any: [{
      all: [{
        fact: 'account.balance',
        operator: 'greaterThan',
        value: 100
      }]
    }, {
      fact: 'account.type',
      operator: 'equal',
      value: 'premium'
    }]
  },
  event: {
    type: 'offer-discount',
    params: { discount: 0.25 }
  }
});

const facts = { account: { balance: 150, type: 'basic' } };
const { events } = await engine.run(facts);

const rule = {
  conditions: {
    or: [{
      and: [{
        field: '$.account.balance',
        operator: 'greater-than',
        value: 100
      }]
    }, {
      field: '$.account.type',
      operator: 'equals',
      value: 'premium'
    }],
    result: {
      discount: 0.25,
      type: 'offer-discount'
    }
  }
};

const result = await RuleEngine.evaluate(rule, facts);
```

## From node-rules

### Rule Structure Comparison

#### node-rules
```javascript
{
  name: "transaction-rule",
  priority: 1,
  condition: function(R) {
    R.when(this.amount > 500 && this.cardType === 'Credit');
  },
  consequence: function(R) {
    this.result = {
      requiresApproval: true,
      reason: 'High value credit transaction'
    };
    R.stop();
  }
}
```

#### @usex/rule-engine
```javascript
{
  conditions: {
    and: [{
      field: 'amount',
      operator: 'greater-than',
      value: 500
    }, {
      field: 'cardType',
      operator: 'equals',
      value: 'Credit'
    }],
    result: {
      requiresApproval: true,
      reason: 'High value credit transaction'
    }
  }
}
```

### Key Differences

| Feature | node-rules | @usex/rule-engine |
|---------|-----------|-------------------|
| Rule Definition | JavaScript functions | JSON structure |
| Priority System | Built-in priority | Order-based evaluation |
| Flow Control | `R.stop()`, `R.next()` | Automatic based on conditions |
| Rule Chaining | Sequential with flow control | Declarative with logical operators |

### Migration Example

```javascript
// node-rules
const RuleEngine = require('node-rules');

const rules = [{
  name: "premium-discount",
  condition: function(R) {
    R.when(this.customer.tier === 'premium' && this.orderTotal > 100);
  },
  consequence: function(R) {
    this.discount = 0.20;
    this.message = 'Premium customer discount';
    R.stop();
  }
}, {
  name: "bulk-discount",
  condition: function(R) {
    R.when(this.orderTotal > 500);
  },
  consequence: function(R) {
    this.discount = 0.15;
    this.message = 'Bulk order discount';
    R.stop();
  }
}];

const R = new RuleEngine(rules);
const fact = {
  customer: { tier: 'premium' },
  orderTotal: 150
};

R.execute(fact, function(result) {
  console.log(result.discount); // 0.20
});

// @usex/rule-engine
import { RuleEngine } from '@usex/rule-engine';

const rule = {
  conditions: [{
    and: [{
      field: '$.customer.tier',
      operator: 'equals',
      value: 'premium'
    }, {
      field: 'orderTotal',
      operator: 'greater-than',
      value: 100
    }],
    result: {
      discount: 0.20,
      message: 'Premium customer discount'
    }
  }, {
    and: [{
      field: 'orderTotal',
      operator: 'greater-than',
      value: 500
    }],
    result: {
      discount: 0.15,
      message: 'Bulk order discount'
    }
  }],
  default: {
    discount: 0,
    message: 'No discount applicable'
  }
};

const result = await RuleEngine.evaluate(rule, fact);
console.log(result.value.discount); // 0.20
```

## From business-rules-engine

### Rule Structure Comparison

#### business-rules-engine
```javascript
{
  name: "age-validation",
  rules: [
    {
      field: "age",
      method: "greaterThan",
      value: 18,
      message: "Must be over 18"
    },
    {
      field: "age",
      method: "lessThan",
      value: 100,
      message: "Invalid age"
    }
  ]
}
```

#### @usex/rule-engine
```javascript
{
  conditions: {
    and: [{
      field: 'age',
      operator: 'greater-than',
      value: 18,
      message: 'Must be over 18'
    }, {
      field: 'age',
      operator: 'less-than',
      value: 100,
      message: 'Invalid age'
    }]
  }
}
```

### Key Differences

| Feature | business-rules-engine | @usex/rule-engine |
|---------|---------------------|-------------------|
| Validation Focus | Built for validation | General purpose with validation support |
| Error Messages | Built-in message handling | Optional message field |
| Rule Grouping | Array of rules | Logical operators |
| Custom Validators | Method-based | Operator-based |

### Migration Example

```javascript
// business-rules-engine
const BusinessRulesEngine = require('business-rules-engine');

const rule = new BusinessRulesEngine.Rule();
rule.name = "user-registration";

rule.addRule({
  field: "email",
  method: "email",
  message: "Invalid email"
});

rule.addRule({
  field: "password",
  method: "minLength",
  value: 8,
  message: "Password too short"
});

const result = rule.validate({
  email: "user@example.com",
  password: "short"
});

// @usex/rule-engine
import { RuleEngine } from '@usex/rule-engine';

const rule = {
  conditions: {
    and: [{
      field: 'email',
      operator: 'email',
      value: true,
      message: 'Invalid email'
    }, {
      field: 'password',
      operator: 'min-length',
      value: 8,
      message: 'Password too short'
    }]
  }
};

const result = await RuleEngine.evaluate(rule, {
  email: "user@example.com",
  password: "short"
});

// Extract validation errors
if (!result.isPassed) {
  const errors = rule.conditions.and
    .filter(c => !evaluateConstraint(c, data))
    .map(c => c.message);
}
```

## From custom implementations

### Common Patterns

#### If-Else Chains
```javascript
// Before
function calculateDiscount(customer, order) {
  if (customer.tier === 'platinum' && order.total > 1000) {
    return 0.25;
  } else if (customer.tier === 'gold' && order.total > 500) {
    return 0.20;
  } else if (order.total > 1000) {
    return 0.15;
  } else if (customer.isNewCustomer && order.total > 100) {
    return 0.10;
  } else {
    return 0;
  }
}

// After
const discountRule = {
  conditions: [{
    and: [
      { field: '$.customer.tier', operator: 'equals', value: 'platinum' },
      { field: '$.order.total', operator: 'greater-than', value: 1000 }
    ],
    result: 0.25
  }, {
    and: [
      { field: '$.customer.tier', operator: 'equals', value: 'gold' },
      { field: '$.order.total', operator: 'greater-than', value: 500 }
    ],
    result: 0.20
  }, {
    and: [
      { field: '$.order.total', operator: 'greater-than', value: 1000 }
    ],
    result: 0.15
  }, {
    and: [
      { field: '$.customer.isNewCustomer', operator: 'equals', value: true },
      { field: '$.order.total', operator: 'greater-than', value: 100 }
    ],
    result: 0.10
  }],
  default: 0
};

const discount = await RuleEngine.getEvaluateResult(discountRule, { customer, order });
```

#### Switch Statements
```javascript
// Before
function getAccessLevel(user) {
  switch(user.role) {
    case 'admin':
      return { read: true, write: true, delete: true };
    case 'editor':
      return { read: true, write: true, delete: false };
    case 'viewer':
      return { read: true, write: false, delete: false };
    default:
      return { read: false, write: false, delete: false };
  }
}

// After
const accessRule = {
  conditions: [{
    and: [{ field: 'role', operator: 'equals', value: 'admin' }],
    result: { read: true, write: true, delete: true }
  }, {
    and: [{ field: 'role', operator: 'equals', value: 'editor' }],
    result: { read: true, write: true, delete: false }
  }, {
    and: [{ field: 'role', operator: 'equals', value: 'viewer' }],
    result: { read: true, write: false, delete: false }
  }],
  default: { read: false, write: false, delete: false }
};

const access = await RuleEngine.getEvaluateResult(accessRule, user);
```

## Common Migration Patterns

### 1. Dynamic Field References

Many rule engines don't support referencing other fields in values:

```javascript
// Using JSONPath to reference other fields
{
  conditions: {
    and: [{
      field: '$.current.price',
      operator: 'less-than',
      value: '$.maximum.price' // Reference another field
    }]
  }
}
```

### 2. Complex Nested Conditions

Convert complex boolean logic to nested conditions:

```javascript
// (A && B) || (C && D) || E
{
  conditions: {
    or: [{
      and: [conditionA, conditionB]
    }, {
      and: [conditionC, conditionD]
    },
    conditionE
    ]
  }
}
```

### 3. Array Operations

Leverage built-in array operators:

```javascript
{
  conditions: {
    and: [{
      field: 'tags',
      operator: 'contains-any',
      value: ['urgent', 'critical', 'high-priority']
    }, {
      field: 'assignees',
      operator: 'not-empty',
      value: true
    }]
  }
}
```

### 4. Date Comparisons

Use specialized date operators:

```javascript
{
  conditions: {
    and: [{
      field: 'subscription.expiresAt',
      operator: 'date-after-now',
      value: true
    }, {
      field: 'lastPayment',
      operator: 'date-between',
      value: ['2025-01-01', '2025-12-31']
    }]
  }
}
```

### 5. Validation Rules

Convert validation logic to rules with messages:

```javascript
{
  conditions: {
    and: [{
      field: 'username',
      operator: 'matches',
      value: '^[a-zA-Z0-9_]{3,20}$',
      message: 'Username must be 3-20 characters, alphanumeric and underscore only'
    }, {
      field: 'email',
      operator: 'email',
      value: true,
      message: 'Please enter a valid email address'
    }]
  }
}
```

## Best Practices for Migration

1. **Start Simple**: Migrate basic rules first, then tackle complex ones
2. **Test Thoroughly**: Create comprehensive test suites during migration
3. **Use TypeScript**: Leverage type safety for rule definitions
4. **Validate Rules**: Use the validation API to catch errors early
5. **Document Rules**: Add comments and maintain rule documentation
6. **Performance Test**: Compare performance with your previous solution
7. **Incremental Migration**: Run old and new systems in parallel initially

## Need Help?

If you encounter issues during migration:

1. Check the [API Reference](./api-reference.md)
2. Review the [Operators Guide](./operators.md)
3. See [Examples](../README.md#examples) for common patterns
4. Open an issue on [GitHub](https://github.com/ali-master/rule-engine/issues)

---

For more information, see the [main documentation](../README.md).
