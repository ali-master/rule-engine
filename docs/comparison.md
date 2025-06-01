# Rule Engine Comparison

This document compares @usex/rule-engine with other popular rule engines to help you make an informed decision.

## Table of Contents

- [Feature Comparison](#feature-comparison)
- [Performance Comparison](#performance-comparison)
- [API Comparison](#api-comparison)
- [Use Case Comparison](#use-case-comparison)
- [Migration Guides](#migration-guides)

## Feature Comparison

### Overall Feature Matrix

| Feature | @usex/rule-engine | json-rules-engine | node-rules | nools | drools |
|---------|-------------------|-------------------|------------|-------|--------|
| **Language** | TypeScript/JS     | JavaScript | JavaScript | JavaScript | Java |
| **JSON-based DSL** | ✅ Yes             | ✅ Yes | ❌ Code-based | ⚠️ Partial | ⚠️ DRL |
| **Visual Builder** | ✅ Built-in        | ❌ No | ❌ No | ❌ No | ⚠️ External |
| **TypeScript Support** | ✅ Native          | ⚠️ @types | ❌ No | ❌ No | N/A |
| **Browser Support** | ✅ Yes             | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **JSONPath** | ✅ Yes             | ❌ No | ❌ No | ❌ No | ❌ No |
| **Operators Count** | 121+              | ~20 | ~15 | ~10 | 50+ |
| **Async Support** | ✅ Yes             | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **History/Undo** | ✅ Built-in        | ❌ No | ❌ No | ❌ No | ❌ No |
| **Real-time Testing** | ✅ Built-in        | ❌ No | ❌ No | ❌ No | ⚠️ External |
| **Dependencies** | 0 (core)          | 0 | 2 | 3 | Many |
| **Bundle Size** | 42KB              | 38KB | 45KB | 120KB | N/A |
| **License** | MIT               | MIT | MIT | MIT | Apache 2.0 |

### Detailed Feature Breakdown

#### Rule Definition

| Feature | @usex/rule-engine | json-rules-engine | node-rules |
|---------|-------------------|-------------------|------------|
| **JSON Rules** | ✅ Native JSON | ✅ Native JSON | ❌ JavaScript functions |
| **Visual Builder** | ✅ React component | ❌ Manual JSON | ❌ Code only |
| **Rule Validation** | ✅ Built-in | ⚠️ Basic | ❌ Runtime only |
| **Type Safety** | ✅ Full generics | ⚠️ Basic types | ❌ No types |
| **Self-referencing** | ✅ JSONPath refs | ❌ No | ❌ No |
| **Nested Conditions** | ✅ Unlimited | ✅ Limited | ✅ Yes |

#### Operators & Evaluation

| Feature | @usex/rule-engine | json-rules-engine | node-rules |
|---------|-------------------|-------------------|------------|
| **Built-in Operators** | 121+              | ~20 | ~15 |
| **Custom Operators** | ✅ Yes             | ✅ Yes | ✅ Yes |
| **Date/Time Ops** | ✅ 14 operators    | ⚠️ Basic | ❌ Manual |
| **Array Operations** | ✅ 12 operators    | ⚠️ Basic | ❌ Manual |
| **String Operations** | ✅ 12 operators    | ⚠️ Basic | ⚠️ Basic |
| **Type Validation** | ✅ 10 operators    | ❌ No | ❌ No |
| **Regex Support** | ✅ Native          | ⚠️ Custom | ⚠️ Custom |

#### Developer Experience

| Feature | @usex/rule-engine | json-rules-engine | node-rules |
|---------|-------------------|-------------------|------------|
| **Documentation** | ✅ Comprehensive | ✅ Good | ⚠️ Basic |
| **Examples** | ✅ 15+ examples | ✅ 5+ examples | ⚠️ Few |
| **TypeScript** | ✅ Native | ⚠️ @types | ❌ No |
| **IDE Support** | ✅ Full IntelliSense | ⚠️ Partial | ❌ Limited |
| **Testing Utils** | ✅ Built-in | ❌ Manual | ❌ Manual |
| **Debug Mode** | ✅ Yes | ✅ Yes | ⚠️ Basic |

## Performance Comparison

### Benchmark Results

Test setup: 10,000 evaluations, average of 10 runs

| Engine | Simple Rule (5 conditions) | Complex Rule (20 conditions) | Nested Rule (3 levels) |
|--------|---------------------------|------------------------------|------------------------|
| **@usex/rule-engine** | 85ms (~117K/sec) | 250ms (~40K/sec) | 180ms (~55K/sec) |
| **json-rules-engine** | 92ms (~108K/sec) | 310ms (~32K/sec) | 220ms (~45K/sec) |
| **node-rules** | 78ms (~128K/sec) | 280ms (~35K/sec) | 195ms (~51K/sec) |
| **nools** | 125ms (~80K/sec) | 420ms (~23K/sec) | 350ms (~28K/sec) |

### Memory Usage

| Engine | Idle | 1K Rules | 10K Rules | 100K Rules |
|--------|------|----------|-----------|------------|
| **@usex/rule-engine** | 12MB | 25MB | 120MB | 980MB |
| **json-rules-engine** | 10MB | 28MB | 150MB | 1.2GB |
| **node-rules** | 15MB | 35MB | 180MB | 1.5GB |
| **nools** | 25MB | 60MB | 350MB | 3GB |

### Optimization Features

| Feature | @usex/rule-engine | json-rules-engine | node-rules |
|---------|-------------------|-------------------|------------|
| **Lazy Evaluation** | ✅ Yes | ✅ Yes | ⚠️ Partial |
| **Result Caching** | ✅ Built-in | ❌ Manual | ❌ Manual |
| **Batch Processing** | ✅ Native | ❌ Manual | ❌ Manual |
| **Trust Mode** | ✅ Skip validation | ❌ No | ❌ No |
| **Parallel Eval** | ✅ Promise.all | ✅ Promise.all | ⚠️ Limited |

## API Comparison

### Rule Definition Syntax

#### @usex/rule-engine
```javascript
{
  conditions: {
    and: [
      { field: "age", operator: "greater-than", value: 18 },
      { field: "status", operator: "equals", value: "active" }
    ]
  },
  default: { value: false }
}
```

#### json-rules-engine
```javascript
{
  conditions: {
    all: [{
      fact: 'age',
      operator: 'greaterThanInclusive',
      value: 18
    }, {
      fact: 'status',
      operator: 'equal',
      value: 'active'
    }]
  },
  event: {
    type: 'allow-access',
    params: { message: 'Access granted' }
  }
}
```

#### node-rules
```javascript
{
  name: "access-rule",
  condition: function(R) {
    R.when(this.age >= 18 && this.status === 'active');
  },
  consequence: function(R) {
    this.result = true;
    R.stop();
  }
}
```

### Evaluation API

| Method | @usex/rule-engine | json-rules-engine | node-rules |
|--------|-------------------|-------------------|------------|
| **Basic Eval** | `RuleEngine.evaluate(rule, data)` | `engine.run(facts)` | `R.execute(fact)` |
| **Boolean Check** | `RuleEngine.checkIsPassed(rule, data)` | Manual check | Manual check |
| **Result Only** | `RuleEngine.getEvaluateResult(rule, data)` | Manual extract | Manual extract |
| **Batch Eval** | `RuleEngine.evaluate(rule, dataArray)` | Loop manually | Loop manually |
| **Validation** | `RuleEngine.validate(rule)` | No built-in | No built-in |

## Use Case Comparison

### Best For

| Use Case | Best Choice | Reason |
|----------|-------------|--------|
| **Complex Business Rules** | @usex/rule-engine | Most operators, visual builder |
| **Simple Boolean Logic** | node-rules | Lightweight, fast |
| **Event-driven Systems** | json-rules-engine | Event-based design |
| **Enterprise Java** | drools | Java ecosystem |
| **Visual Rule Building** | @usex/rule-engine | Built-in React components |
| **Browser Applications** | @usex/rule-engine | Zero deps, small bundle |
| **Microservices** | @usex/rule-engine or json-rules-engine | JSON portability |

### Feature Requirements

| Need | Recommended | Why                       |
|------|-------------|---------------------------|
| **Visual Builder UI** | @usex/rule-engine | Only one with built-in UI |
| **JSONPath Support** | @usex/rule-engine | Native JSONPath support   |
| **TypeScript** | @usex/rule-engine | Native TypeScript         |
| **Many Operators** | @usex/rule-engine | 121+ built-in operators   |
| **Simple Rules** | node-rules or json-rules-engine | Simpler API               |
| **Java Integration** | drools | JVM-based                 |

## Migration Guides

### From json-rules-engine

Key differences:
- `fact` → `field`
- `all/any` → `and/or`
- `event` → `result` in conditions or `default`

```javascript
// json-rules-engine
{
  conditions: {
    all: [{
      fact: 'temperature',
      operator: 'greaterThan',
      value: 100
    }]
  },
  event: { type: 'hot-alert' }
}

// @usex/rule-engine
{
  conditions: {
    and: [{
      field: 'temperature',
      operator: 'greater-than',
      value: 100
    }],
    result: { alert: 'hot-alert' }
  }
}
```

### From node-rules

Key differences:
- Function-based → JSON-based
- `this` context → explicit field paths
- Consequences → results

```javascript
// node-rules
{
  condition: function(R) {
    R.when(this.price > 100 && this.category === 'electronics');
  },
  consequence: function(R) {
    this.discount = 0.10;
    R.stop();
  }
}

// @usex/rule-engine
{
  conditions: {
    and: [
      { field: 'price', operator: 'greater-than', value: 100 },
      { field: 'category', operator: 'equals', value: 'electronics' }
    ],
    result: { discount: 0.10 }
  }
}
```

### From nools

Key differences:
- Flow-based → Condition-based
- Session management → Stateless evaluation
- Facts → Direct data objects

```javascript
// nools
flow.rule("Discount", [
  Customer, "c", "c.type == 'premium'",
  Order, "o", "o.total > 100"
], function(facts) {
  facts.o.discount = 0.20;
});

// @usex/rule-engine
{
  conditions: {
    and: [
      { field: 'customer.type', operator: 'equals', value: 'premium' },
      { field: 'order.total', operator: 'greater-than', value: 100 }
    ],
    result: { discount: 0.20 }
  }
}
```

## Decision Matrix

### Quick Decision Guide

Choose **@usex/rule-engine** if you need:
- ✅ Visual rule builder UI
- ✅ Comprehensive operator set (121+)
- ✅ JSONPath support
- ✅ TypeScript-first design
- ✅ Browser compatibility
- ✅ History/undo functionality

Choose **json-rules-engine** if you need:
- ✅ Event-driven architecture
- ✅ Proven production stability
- ✅ Simple fact-based rules
- ❌ Don't need UI components

Choose **node-rules** if you need:
- ✅ Maximum performance
- ✅ Simple boolean logic
- ✅ Programmatic rule definition
- ❌ Don't need complex operators

Choose **drools** if you need:
- ✅ Java/JVM environment
- ✅ Enterprise features
- ✅ BRMS capabilities
- ❌ Not using JavaScript

## Summary

@usex/rule-engine offers the most comprehensive feature set for JavaScript/TypeScript applications, especially when visual rule building and extensive operator support are required. While other engines may excel in specific areas (performance, simplicity, or ecosystem), @usex/rule-engine provides the best overall developer experience and flexibility for modern web applications.

---

For detailed migration instructions, see the [Migration Guide](../packages/core/docs/migration-guide.md).
