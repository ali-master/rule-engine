# Complete Operator Reference

This document provides a comprehensive reference for all 126 operators available in @usex/rule-engine.

## Table of Contents

- [Comparison Operators](#comparison-operators)
- [String Operators](#string-operators)
- [Numeric Operators](#numeric-operators)
- [Array Operators](#array-operators)
- [Date & Time Operators](#date--time-operators)
- [Type Validation Operators](#type-validation-operators)
- [Existence Operators](#existence-operators)
- [Length & Range Operators](#length--range-operators)
- [Boolean Operators](#boolean-operators)
- [Pattern Matching Operators](#pattern-matching-operators)
- [Persian Text Operators](#persian-text-operators)

## Comparison Operators

### Basic Comparison

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `equals` | Exact equality check | `{ field: "status", operator: "equals", value: "active" }` | Strict equality (===) |
| `not-equals` | Not equal check | `{ field: "role", operator: "not-equals", value: "guest" }` | Strict inequality (!==) |
| `greater-than` | Greater than comparison | `{ field: "age", operator: "greater-than", value: 18 }` | Works with numbers, strings, dates |
| `less-than` | Less than comparison | `{ field: "price", operator: "less-than", value: 100 }` | Works with numbers, strings, dates |
| `greater-than-or-equals` | Greater than or equal | `{ field: "score", operator: "greater-than-or-equals", value: 80 }` | Inclusive comparison |
| `less-than-or-equals` | Less than or equal | `{ field: "quantity", operator: "less-than-or-equals", value: 10 }` | Inclusive comparison |

## String Operators

### String Comparison

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `like` | Case-insensitive contains | `{ field: "name", operator: "like", value: "john" }` | Substring match |
| `not-like` | Case-insensitive not contains | `{ field: "email", operator: "not-like", value: "spam" }` | Substring exclusion |
| `starts-with` | String starts with | `{ field: "url", operator: "starts-with", value: "https://" }` | Case-sensitive |
| `not-starts-with` | String doesn't start with | `{ field: "path", operator: "not-starts-with", value: "/admin" }` | Case-sensitive |
| `ends-with` | String ends with | `{ field: "filename", operator: "ends-with", value: ".pdf" }` | Case-sensitive |
| `not-ends-with` | String doesn't end with | `{ field: "email", operator: "not-ends-with", value: ".temp" }` | Case-sensitive |

### String Validation

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `email` | Valid email format | `{ field: "contact", operator: "email", value: true }` | RFC 5322 compliant |
| `url` | Valid URL format | `{ field: "website", operator: "url", value: true }` | Includes protocol |
| `uuid` | Valid UUID format | `{ field: "id", operator: "uuid", value: true }` | v1-v5 UUIDs |
| `alpha` | Only alphabetic characters | `{ field: "firstName", operator: "alpha", value: true }` | A-Z, a-z only |
| `alpha-numeric` | Alphanumeric characters | `{ field: "username", operator: "alpha-numeric", value: true }` | A-Z, a-z, 0-9 |
| `numeric` | Only numeric characters | `{ field: "zipCode", operator: "numeric", value: true }` | 0-9 only |
| `lower-case` | All lowercase | `{ field: "code", operator: "lower-case", value: true }` | No uppercase letters |
| `upper-case` | All uppercase | `{ field: "countryCode", operator: "upper-case", value: true }` | No lowercase letters |

## Numeric Operators

### Number Validation

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `integer` | Is integer number | `{ field: "count", operator: "integer", value: true }` | No decimals |
| `float` | Is floating point | `{ field: "price", operator: "float", value: true }` | Has decimals |
| `positive` | Positive number | `{ field: "balance", operator: "positive", value: true }` | > 0 |
| `negative` | Negative number | `{ field: "debt", operator: "negative", value: true }` | < 0 |
| `zero` | Equals zero | `{ field: "remaining", operator: "zero", value: true }` | === 0 |
| `even` | Even number | `{ field: "pageNumber", operator: "even", value: true }` | n % 2 === 0 |
| `odd` | Odd number | `{ field: "id", operator: "odd", value: true }` | n % 2 !== 0 |

### Range Operators

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `between` | Number in range | `{ field: "age", operator: "between", value: [18, 65] }` | Inclusive |
| `number-between` | Alias for between | `{ field: "score", operator: "number-between", value: [0, 100] }` | Inclusive |
| `min` | Minimum value | `{ field: "age", operator: "min", value: 18 }` | >= value |
| `max` | Maximum value | `{ field: "amount", operator: "max", value: 1000 }` | <= value |

## Array Operators

### Array Operations

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `in` | Value in array | `{ field: "role", operator: "in", value: ["admin", "moderator"] }` | Exact match |
| `not-in` | Value not in array | `{ field: "status", operator: "not-in", value: ["banned", "suspended"] }` | Exclusion |
| `contains` | Array contains value | `{ field: "tags", operator: "contains", value: "featured" }` | Single value |
| `not-contains` | Array doesn't contain | `{ field: "permissions", operator: "not-contains", value: "delete" }` | Single value |
| `contains-any` | Contains any of values | `{ field: "skills", operator: "contains-any", value: ["js", "ts", "python"] }` | OR logic |
| `contains-all` | Contains all values | `{ field: "requirements", operator: "contains-all", value: ["degree", "experience"] }` | AND logic |
| `not-contains-any` | Doesn't contain any | `{ field: "allergies", operator: "not-contains-any", value: ["nuts", "dairy"] }` | None match |
| `not-contains-all` | Doesn't contain all | `{ field: "features", operator: "not-contains-all", value: ["premium", "pro"] }` | Not all match |

### Array Properties

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `array-length` | Array length equals | `{ field: "items", operator: "array-length", value: 5 }` | Exact count |
| `array-min-length` | Minimum array length | `{ field: "tags", operator: "array-min-length", value: 1 }` | >= count |
| `array-max-length` | Maximum array length | `{ field: "selections", operator: "array-max-length", value: 10 }` | <= count |
| `array-length-between` | Array length in range | `{ field: "choices", operator: "array-length-between", value: [2, 5] }` | Inclusive |

## Date & Time Operators

### Date Comparison

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `date-after` | Date is after | `{ field: "expiry", operator: "date-after", value: "2025-01-01" }` | Supports ISO 8601 |
| `date-before` | Date is before | `{ field: "created", operator: "date-before", value: "2023-12-31" }` | Supports ISO 8601 |
| `date-equals` | Date equals | `{ field: "birthday", operator: "date-equals", value: "1990-05-15" }` | Day precision |
| `date-not-equals` | Date not equals | `{ field: "lastLogin", operator: "date-not-equals", value: "2025-01-01" }` | Day precision |
| `date-between` | Date in range | `{ field: "event", operator: "date-between", value: ["2025-01-01", "2025-12-31"] }` | Inclusive |

### Relative Date Operators

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `date-after-now` | Date after current date | `{ field: "expires", operator: "date-after-now", value: true }` | Future dates |
| `date-before-now` | Date before current date | `{ field: "created", operator: "date-before-now", value: true }` | Past dates |
| `date-equals-now` | Date equals today | `{ field: "scheduled", operator: "date-equals-now", value: true }` | Today's date |
| `date-not-equals-now` | Date not today | `{ field: "appointment", operator: "date-not-equals-now", value: true }` | Not today |

### Time Operators

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `time-after` | Time is after | `{ field: "startTime", operator: "time-after", value: "09:00" }` | HH:mm format |
| `time-before` | Time is before | `{ field: "endTime", operator: "time-before", value: "17:00" }` | HH:mm format |
| `time-equals` | Time equals | `{ field: "alarm", operator: "time-equals", value: "08:30" }` | Exact match |
| `time-not-equals` | Time not equals | `{ field: "meeting", operator: "time-not-equals", value: "12:00" }` | Not exact |
| `time-between` | Time in range | `{ field: "workHours", operator: "time-between", value: ["09:00", "17:00"] }` | Inclusive |

## Type Validation Operators

### Data Type Checks

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `string` | Is string type | `{ field: "name", operator: "string", value: true }` | typeof === 'string' |
| `number` | Is number type | `{ field: "age", operator: "number", value: true }` | typeof === 'number' |
| `boolean` | Is boolean type | `{ field: "active", operator: "boolean", value: true }` | typeof === 'boolean' |
| `object` | Is object type | `{ field: "metadata", operator: "object", value: true }` | Non-null object |
| `array` | Is array type | `{ field: "items", operator: "array", value: true }` | Array.isArray() |
| `date` | Is date type | `{ field: "created", operator: "date", value: true }` | Valid Date object |
| `function` | Is function type | `{ field: "callback", operator: "function", value: true }` | typeof === 'function' |
| `null` | Is null | `{ field: "deleted", operator: "null", value: true }` | === null |
| `undefined` | Is undefined | `{ field: "optional", operator: "undefined", value: true }` | === undefined |

## Existence Operators

### Field Existence

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `exists` | Field exists | `{ field: "email", operator: "exists", value: true }` | Property defined |
| `not-exists` | Field doesn't exist | `{ field: "tempData", operator: "not-exists", value: true }` | Property undefined |
| `null-or-undefined` | Null or undefined | `{ field: "optional", operator: "null-or-undefined", value: true }` | == null |
| `not-null-or-undefined` | Not null/undefined | `{ field: "required", operator: "not-null-or-undefined", value: true }` | != null |

### Emptiness Checks

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `empty` | Is empty | `{ field: "notes", operator: "empty", value: true }` | "", [], {}, null, undefined |
| `not-empty` | Is not empty | `{ field: "description", operator: "not-empty", value: true }` | Has content |
| `null-or-white-space` | Null or whitespace | `{ field: "comment", operator: "null-or-white-space", value: true }` | No meaningful text |
| `not-null-or-white-space` | Has content | `{ field: "title", operator: "not-null-or-white-space", value: true }` | Non-empty text |

## Length & Range Operators

### String Length

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `string-length` | Exact length | `{ field: "code", operator: "string-length", value: 6 }` | === length |
| `min-length` | Minimum length | `{ field: "password", operator: "min-length", value: 8 }` | >= length |
| `max-length` | Maximum length | `{ field: "username", operator: "max-length", value: 20 }` | <= length |
| `length-between` | Length in range | `{ field: "bio", operator: "length-between", value: [10, 500] }` | Inclusive |

## Boolean Operators

### Boolean Logic

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `truthy` | Truthy value | `{ field: "enabled", operator: "truthy", value: true }` | !!value === true |
| `falsy` | Falsy value | `{ field: "disabled", operator: "falsy", value: true }` | !value === true |
| `boolean-string` | String boolean | `{ field: "flag", operator: "boolean-string", value: true }` | "true" or "false" |
| `boolean-number` | Numeric boolean | `{ field: "active", operator: "boolean-number", value: true }` | 0 or 1 |

## Pattern Matching Operators

### Regular Expressions

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `matches` | Regex match | `{ field: "phone", operator: "matches", value: "^\\d{3}-\\d{3}-\\d{4}$" }` | Full regex support |
| `not-matches` | Regex not match | `{ field: "text", operator: "not-matches", value: "\\b(spam|junk)\\b" }` | Exclusion pattern |

## Persian Text Operators

### Persian Validation

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `persian-alpha` | Persian letters only | `{ field: "firstName", operator: "persian-alpha", value: true }` | ا-ی only |
| `persian-alpha-numeric` | Persian alphanumeric | `{ field: "address", operator: "persian-alpha-numeric", value: true }` | ا-ی and ۰-۹ |
| `persian-number` | Persian numbers | `{ field: "nationalId", operator: "persian-number", value: true }` | ۰-۹ only |

## Usage Examples

### Complex Rule Example

```typescript
const complexRule = {
  conditions: {
    and: [
      // User validation
      { field: "email", operator: "email", value: true },
      { field: "age", operator: "between", value: [18, 100] },
      { field: "status", operator: "equals", value: "active" },

      // Profile requirements
      { field: "profile.bio", operator: "length-between", value: [50, 500] },
      { field: "profile.skills", operator: "contains-any", value: ["javascript", "typescript"] },
      { field: "profile.experience", operator: "greater-than", value: 2 },

      // Date validations
      { field: "joinDate", operator: "date-before-now", value: true },
      { field: "subscription.expires", operator: "date-after-now", value: true },

      // Complex nested validation
      {
        or: [
          { field: "role", operator: "equals", value: "premium" },
          { field: "credits", operator: "greater-than", value: 100 }
        ]
      }
    ]
  }
};
```

### Validation Rule Example

```typescript
const formValidation = {
  conditions: {
    and: [
      // Required fields
      { field: "username", operator: "not-null-or-undefined", value: true, message: "Username is required" },
      { field: "username", operator: "alpha-numeric", value: true, message: "Username must be alphanumeric" },
      { field: "username", operator: "length-between", value: [3, 20], message: "Username must be 3-20 characters" },

      // Email validation
      { field: "email", operator: "email", value: true, message: "Invalid email format" },

      // Password strength
      { field: "password", operator: "min-length", value: 8, message: "Password too short" },
      { field: "password", operator: "matches", value: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)", message: "Password must contain uppercase, lowercase, and number" },

      // Confirmation
      { field: "confirmPassword", operator: "equals", value: "$.password", message: "Passwords don't match" }
    ]
  }
};
```

## Best Practices

1. **Choose the Right Operator**: Use the most specific operator for your use case
2. **Provide Messages**: Include helpful error messages for validation rules
3. **Use JSONPath**: Leverage JSONPath for complex nested structures
4. **Combine Operators**: Use logical grouping (and/or/none) for complex rules
5. **Type Safety**: Validate data types before applying other operators
6. **Performance**: Order conditions from most to least likely to fail for better performance

---

For more information, see the [main documentation](../README.md).
