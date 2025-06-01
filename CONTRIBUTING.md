# Contributing to @usex/rule-engine

First off, thank you for considering contributing to @usex/rule-engine! It's people like you that make this project better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment
4. Create a branch for your changes
5. Make your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js >= 18.12.0
- pnpm >= 10.11.0

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/rule-engine.git
cd rule-engine

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Project Structure

```
rule-engine/
├── packages/
│   ├── core/         # Core rule engine library
│   └── builder/      # Visual rule builder UI
├── apps/
│   └── web/          # Documentation website
└── docs/             # Additional documentation
```

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

1. **Clear title and description**
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Code samples** (if applicable)
6. **Environment details** (Node version, OS, etc.)

### Suggesting Features

Feature suggestions are welcome! Please:

1. **Check existing issues** first
2. **Provide clear use cases**
3. **Explain the benefits**
4. **Consider implementation details**

### Code Contributions

1. **Small changes**: Bug fixes, documentation updates
2. **Large changes**: New features, significant refactoring (discuss first in an issue)

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Provide proper types (avoid `any`)
- Document complex types

### Code Style

```typescript
// Good
export function evaluateRule<T>(
  rule: RuleType<T>,
  data: unknown
): Promise<EvaluationResult<T>> {
  // Implementation
}

// Bad
export function evaluateRule(rule: any, data: any): any {
  // Implementation
}
```

### Naming Conventions

- **Files**: kebab-case (e.g., `rule-engine.ts`)
- **Classes**: PascalCase (e.g., `RuleEngine`)
- **Functions/Variables**: camelCase (e.g., `evaluateRule`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_DEPTH`)
- **Types/Interfaces**: PascalCase (e.g., `RuleType`)

### Comments

```typescript
/**
 * Evaluates a rule against the provided criteria.
 * 
 * @param rule - The rule to evaluate
 * @param criteria - The data to evaluate against
 * @param trustRule - Skip validation if true
 * @returns The evaluation result
 * 
 * @example
 * ```typescript
 * const result = await evaluateRule(rule, { age: 25 });
 * ```
 */
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific package tests
cd packages/core && pnpm test
```

### Writing Tests

```typescript
describe('RuleEngine', () => {
  describe('evaluate', () => {
    it('should evaluate simple rule correctly', async () => {
      const rule = {
        conditions: {
          and: [
            { field: 'age', operator: 'greater-than', value: 18 }
          ]
        }
      };
      
      const result = await RuleEngine.evaluate(rule, { age: 25 });
      
      expect(result.isPassed).toBe(true);
      expect(result.value).toBe(true);
    });
  });
});
```

### Test Requirements

- Write tests for all new features
- Maintain or improve code coverage
- Test edge cases
- Include integration tests for complex features

## Documentation

### Code Documentation

- Document all public APIs
- Include JSDoc comments
- Provide usage examples
- Explain complex algorithms

### README Updates

Update relevant README files when:
- Adding new features
- Changing APIs
- Adding new operators
- Fixing significant bugs

### Documentation Structure

```
packages/core/
├── README.md           # Package documentation
└── docs/
    ├── api-reference.md
    ├── operators.md
    └── best-practices.md
```

## Pull Request Process

### Before Submitting

1. **Update documentation** for any API changes
2. **Add tests** for new functionality
3. **Run all tests** locally
4. **Update CHANGELOG** if applicable
5. **Ensure code follows** style guidelines

### PR Guidelines

#### Title Format
```
<type>(<scope>): <subject>

Examples:
feat(core): add new date-between operator
fix(builder): resolve focus issue in field selector
docs(core): update migration guide
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions/changes
- `chore`: Maintenance tasks

#### Description Template
```markdown
## Description
Brief description of changes

## Motivation
Why these changes are needed

## Changes
- Change 1
- Change 2

## Testing
How the changes were tested

## Breaking Changes
List any breaking changes

## Related Issues
Fixes #123
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Address feedback** promptly
4. **Squash commits** if requested

## Questions?

Feel free to:
- Open an issue for questions
- Join discussions in existing issues
- Contact maintainers

Thank you for contributing! 🎉