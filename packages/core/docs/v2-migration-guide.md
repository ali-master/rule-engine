# Migration Guide: Upgrading to RuleEngine V2

This guide will help you migrate from the original RuleEngine to the new V2 implementation that uses the Strategy pattern for operators.

## Table of Contents

- [Overview of Changes](#overview-of-changes)
- [Breaking Changes](#breaking-changes)
- [New Features](#new-features)
- [Migration Steps](#migration-steps)
- [API Compatibility](#api-compatibility)
- [Custom Operators](#custom-operators)
- [Performance Improvements](#performance-improvements)

## Overview of Changes

RuleEngine V2 introduces significant architectural improvements:

1. **Strategy Pattern for Operators**: All operators now use the Strategy pattern, making them more modular and extensible
2. **Full Type Safety**: Enhanced TypeScript support with better type inference
3. **Operator Registry**: Centralized management of operators with metadata
4. **Enhanced Introspection**: More detailed rule analysis with operator metadata
5. **Custom Operators**: Easy creation and registration of custom operators
6. **Performance Optimizations**: Optional caching and lazy evaluation

## Breaking Changes

### 1. Import Changes

If you're importing specific operators:

```typescript
// Old
import { greaterThanOperator, equalsOperator } from "@usex/rule-engine";

// New - operators are now classes
import { GreaterThanOperator, EqualsOperator } from "@usex/rule-engine";
```

### 2. Custom Operator Registration

The way to add custom operators has changed:

```typescript
// Old - directly modify operator map
// New - use operator registry
import { registerCustomOperator, BaseOperatorStrategy } from "@usex/rule-engine";

operatorsProcessorMap["custom-operator"] = (a, b) => customLogic(a, b);

class CustomOperator extends BaseOperatorStrategy {
  // Implementation
}

registerCustomOperator(CustomOperator);
```

### 3. Introspection Result Structure

Enhanced introspection now includes optional metadata:

```typescript
// Old
const result = RuleEngine.introspect(rule);
// Returns: { results: [...], default?: {...} }

// New
const result = RuleEngine.introspect(rule, {
  includeMetadata: true,
  includeComplexity: true
});
// Returns: Enhanced result with operator metadata and complexity metrics
```

## New Features

### 1. RuleEngine Configuration

```typescript
import { RuleEngine } from "@usex/rule-engine";

// Configure the engine
const engine = RuleEngine.getInstance({
  trustMode: true,              // Skip validation for trusted rules
  enableCaching: true,          // Cache evaluation results
  maxCacheSize: 1000,          // Maximum cache entries
  enableOptimizations: true,    // Enable performance optimizations
});
```

### 2. Operator Metadata and Validation

```typescript
// Get metadata for all operators
const registry = engine.getOperatorRegistry();
const allOperators = registry.getAllMetadata();

// Validate operators in a rule
const validation = engine.validateOperators(rule);
if (!validation.isValid) {
  console.error("Invalid operators:", validation.errors);
}

// Get operators used in a rule
const usedOperators = engine.getUsedOperators(rule);
```

### 3. Custom Operator Creation

```typescript
import { registerCustomOperator, OperatorCategory, BaseOperatorStrategy } from "@usex/rule-engine";

class EmailDomainOperator extends BaseOperatorStrategy<string, string> {
  readonly metadata = {
    name: "email-domain",
    displayName: "Email Domain",
    category: OperatorCategory.STRING,
    description: "Checks if email has specific domain",
    acceptedFieldTypes: ["string"],
    expectedValueType: "string",
    requiresValue: true,
    example: '{ field: "email", operator: "email-domain", value: "gmail.com" }'
  };

  evaluate(context) {
    const { fieldValue, constraintValue } = context;
    if (!fieldValue || !constraintValue) return false;

    const domain = fieldValue.split('@')[1];
    return domain === constraintValue;
  }

  isValidFieldType(value) {
    return typeof value === "string" && value.includes("@");
  }
}

// Register the operator
registerCustomOperator(EmailDomainOperator);
```

## Migration Steps

### Step 1: Update Imports

```typescript
// Update your imports to use V2
import { RuleEngine } from "@usex/rule-engine";

// Or use both during migration
import { RuleEngine,  } from "@usex/rule-engine";
```

### Step 2: Update Rule Evaluation Calls

The API is mostly compatible, but you can now use the enhanced version:

```typescript
// Old
const result = await RuleEngine.evaluate(rule, data);

// New - same API, but using V2
const result = await RuleEngine.evaluate(rule, data);

// With configuration
const engine = RuleEngine.getInstance({ enableCaching: true });
const result = await engine.evaluate(rule, data);
```

### Step 3: Update Custom Operators

If you have custom operators, migrate them to the new pattern:

```typescript
// Old custom operator
const customOperator = (fieldValue, constraintValue) => {
  return fieldValue > constraintValue * 2;
};

// New custom operator
class CustomMultiplierOperator extends BaseOperatorStrategy<number, number> {
  readonly metadata = {
    name: "greater-than-double",
    displayName: "Greater Than Double",
    category: OperatorCategory.NUMERIC,
    description: "Checks if field is greater than double the value",
    acceptedFieldTypes: ["number"],
    expectedValueType: "number",
    requiresValue: true,
  };

  evaluate(context) {
    const { fieldValue, constraintValue } = context;
    return fieldValue > constraintValue * 2;
  }

  isValidFieldType(value) {
    return typeof value === "number";
  }
}

registerCustomOperator(CustomMultiplierOperator);
```

### Step 4: Update Introspection Usage

```typescript
// Old
const introspection = RuleEngine.introspect(rule);

// New with enhanced features
const introspection = RuleEngine.introspect(rule, {
  includeMetadata: true,    // Include operator metadata
  includeComplexity: true,  // Include complexity metrics
  validateOperators: true   // Validate all operators exist
});

// Access new metadata
console.log("Used operators:", introspection.operatorMetadata?.usedOperators);
console.log("Complexity:", introspection.complexity);
```

## API Compatibility

### Fully Compatible APIs

These methods work exactly the same in V2:

- `evaluate(rule, criteria, trustRule?)`
- `checkIsPassed(rule, criteria, trustRule?)`
- `getEvaluateResult(rule, criteria, trustRule?)`
- `validate(rule)`
- `builder()`

### Enhanced APIs

These methods have additional optional features in V2:

- `introspect(rule, options?)` - Now accepts options for metadata and complexity
- `constructor/getInstance(config?)` - Now accepts configuration options

### New APIs in V2

- `validateOperators(rule)` - Validate all operators in a rule
- `getUsedOperators(rule)` - Get set of operators used
- `getOperatorRegistry()` - Access the operator registry
- `configure(config)` - Update configuration
- `clearCache()` - Clear evaluation cache

## Custom Operators

### Operator Interface

All operators must implement the `OperatorStrategy` interface:

```typescript
interface OperatorStrategy<TField = any, TValue = any> {
  readonly metadata: OperatorMetadata;
  validate(context: OperatorContext): ValidationResult;
  evaluate(context: OperatorContext): boolean;
  isValidFieldType?(value: unknown): value is TField;
  isValidConstraintType?(value: unknown): value is TValue;
  formatMessage?(template: string, context: OperatorContext): string;
}
```

### Operator Context

Operators receive a context object with:

```typescript
interface OperatorContext {
  fieldValue: any;          // The resolved field value
  constraintValue?: any;    // The constraint value
  criteria?: Record<string, any>;  // Full criteria object
  fieldPath?: string;       // The field path
}
```

### Best Practices for Custom Operators

1. **Extend BaseOperatorStrategy**: Provides default implementations
2. **Implement Type Guards**: Use `isValidFieldType` and `isValidConstraintType`
3. **Provide Clear Metadata**: Help users understand your operator
4. **Handle Edge Cases**: Null, undefined, type mismatches
5. **Add Validation**: Implement custom validation logic

## Performance Improvements

### 1. Enable Caching

```typescript
const engine = RuleEngine.getInstance({
  enableCaching: true,
  maxCacheSize: 1000
});

// Clear cache when needed
engine.clearCache();
```

### 2. Trust Mode

Skip validation for known-good rules:

```typescript
// Global trust mode
const engine = RuleEngine.getInstance({ trustMode: true });

// Per-evaluation trust
await engine.evaluate(rule, data, true); // Skip validation
```

### 3. Operator Registry

The registry enables:
- Fast operator lookup (O(1) instead of O(n))
- Lazy loading of operators
- Better memory management

## Troubleshooting

### Common Issues

1. **"Unknown operator" errors**
   - Ensure custom operators are registered before use
   - Check operator names match exactly (case-sensitive)

2. **Type errors with custom operators**
   - Implement proper type guards
   - Use generics for type safety

3. **Performance degradation**
   - Enable caching for repeated evaluations
   - Use trust mode for validated rules
   - Consider batch evaluation for multiple items

### Debug Mode

Enable debug logging:

```typescript
import { Logger } from "@usex/rule-engine";
Logger.setLevel("debug");
```

## Example: Complete Migration

```typescript
// Before
import { RuleEngine } from "@usex/rule-engine";

// After
import { RuleEngine, initializeOperators } from "@usex/rule-engine";

const rule = {
  conditions: {
    and: [
      { field: "age", operator: "greater-than", value: 18 },
      { field: "status", operator: "equals", value: "active" }
    ]
  }
};

const result = await RuleEngine.evaluate(rule, { age: 25, status: "active" });

// Initialize once at app startup
initializeOperators();

// Configure engine
const engine = RuleEngine.getInstance({
  enableCaching: true,
  trustMode: false
});

// Same rule works without changes
const result = await engine.evaluate(rule, { age: 25, status: "active" });

// Use new features
const introspection = await engine.introspect(rule, {
  includeMetadata: true,
  includeComplexity: true
});

console.log("Rule complexity:", introspection.complexity);
console.log("Operators used:", introspection.operatorMetadata?.usedOperators);
```

## Summary

RuleEngine V2 maintains backward compatibility while adding powerful new features. The migration can be done incrementally:

1. Start by updating imports to use RuleEngine
2. Gradually migrate custom operators to the new pattern
3. Take advantage of new features like caching and enhanced introspection
4. Consider using TypeScript for better type safety

The original RuleEngine remains available for backward compatibility, allowing you to migrate at your own pace.
