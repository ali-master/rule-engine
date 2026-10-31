# @usex/rule-engine-builder Documentation

Welcome to the comprehensive documentation for @usex/rule-engine-builder - a complete React component library for building visual rule engine interfaces.

## 📚 Documentation Overview

### Getting Started

- [**README**](../README.md) - Installation, quick start, and overview
- [**Integration Guide**](./integration.md) - Framework and backend integration
- [**Examples**](./examples.md) - Real-world use cases and implementations

### Component Documentation

- [**Component Reference**](./components.md) - Complete component API documentation
- [**Hooks Reference**](./hooks.md) - State management and utility hooks
- [**UI Components**](./components.md#ui-components) - Available UI component library

### Advanced Guides

- [**Custom Operators**](../README.md#custom-operators) - Creating custom business logic
- [**Theme Customization**](../README.md#theme-customization) - Styling and branding
- [**Performance Optimization**](./integration.md#performance-optimization) - Best practices

## 🚀 Quick Navigation

| Topic                   | Documentation                                      |
| ----------------------- | -------------------------------------------------- |
| **Installation**        | [README](../README.md#installation)                |
| **Basic Usage**         | [README](../README.md#quick-start)                 |
| **TreeRuleBuilder**     | [Components](./components.md#treerulebuilder)      |
| **State Management**    | [Hooks](./hooks.md#state-management-hooks)         |
| **Field Discovery**     | [Hooks](./hooks.md#usefielddiscovery)              |
| **Keyboard Shortcuts**  | [Hooks](./hooks.md#usekeyboardshortcuts)           |
| **React Integration**   | [Integration](./integration.md#react-integration)  |
| **Next.js Setup**       | [Integration](./integration.md#nextjs-integration) |
| **E-commerce Examples** | [Examples](./examples.md#e-commerce-examples)      |
| **Access Control**      | [Examples](./examples.md#access-control-examples)  |
| **Form Validation**     | [Examples](./examples.md#form-validation-examples) |

## 🎯 Component Categories

### Primary Components

| Component           | Purpose                     | Documentation                                   |
| ------------------- | --------------------------- | ----------------------------------------------- |
| `TreeRuleBuilder`   | Main rule builder interface | [Components](./components.md#treerulebuilder)   |
| `ModernRuleBuilder` | Enhanced with animations    | [Components](./components.md#modernrulebuilder) |
| `RuleEvaluator`     | Real-time rule testing      | [Components](./components.md#ruleevaluator)     |
| `HistoryViewer`     | Version control             | [Components](./components.md#historyviewer)     |

### Editor Components

| Component              | Purpose                | Use Case                     |
| ---------------------- | ---------------------- | ---------------------------- |
| `TreeConditionGroup`   | Nested logic groups    | AND/OR/NONE conditions       |
| `TreeConstraintEditor` | Individual constraints | Field-operator-value editing |
| `FieldSelector`        | Field selection        | Grouped field picker         |
| `OperatorSelector`     | Operator selection     | Categorized operators        |

### Input Components

| Component         | Type      | Features                 |
| ----------------- | --------- | ------------------------ |
| `SmartValueInput` | Universal | Type-aware, validation   |
| `ArrayInput`      | Array     | Drag-and-drop reordering |
| `DateInput`       | Date/Time | Calendar, time zones     |
| `NumberInput`     | Number    | Animated, formatting     |

## 🔧 Integration Patterns

### Framework Support

| Framework            | Status                | Documentation                                            |
| -------------------- | --------------------- | -------------------------------------------------------- |
| **React**            | ✅ Full Support       | [Integration Guide](./integration.md#react-integration)  |
| **Next.js**          | ✅ App & Pages Router | [Integration Guide](./integration.md#nextjs-integration) |
| **Vite**             | ✅ Optimized          | [Integration Guide](./integration.md#vite-integration)   |
| **Create React App** | ✅ Supported          | [README](../README.md#quick-start)                       |

### State Management

| Library            | Status       | Documentation                                              |
| ------------------ | ------------ | ---------------------------------------------------------- |
| **Zustand**        | ✅ Built-in  | [Hooks](./hooks.md#useenhancedrulestore)                   |
| **Redux Toolkit**  | ✅ Supported | [Integration](./integration.md#redux-toolkit-integration)  |
| **TanStack Query** | ✅ Supported | [Integration](./integration.md#tanstack-query-integration) |
| **Context API**    | ✅ Supported | [Integration](./integration.md#with-context-providers)     |

### Backend Integration

| Backend       | Status          | Documentation                                       |
| ------------- | --------------- | --------------------------------------------------- |
| **REST APIs** | ✅ Full Support | [Integration](./integration.md#expressjs-api)       |
| **GraphQL**   | ✅ Full Support | [Integration](./integration.md#graphql-integration) |
| **tRPC**      | ✅ Compatible   | [Integration](./integration.md#backend-integration) |
| **Firebase**  | ✅ Compatible   | [Examples](./examples.md#integration-examples)      |

## 📖 Use Case Documentation

### Business Applications

| Use Case            | Example                   | Documentation                                      |
| ------------------- | ------------------------- | -------------------------------------------------- |
| **E-commerce**      | Dynamic pricing, shipping | [Examples](./examples.md#e-commerce-examples)      |
| **Access Control**  | RBAC, permissions         | [Examples](./examples.md#access-control-examples)  |
| **Form Validation** | Registration, surveys     | [Examples](./examples.md#form-validation-examples) |
| **Business Logic**  | Lead scoring, workflows   | [Examples](./examples.md#business-logic-examples)  |

### Technical Implementations

| Pattern                  | Description             | Documentation                                        |
| ------------------------ | ----------------------- | ---------------------------------------------------- |
| **Multi-tenant SaaS**    | Tenant-specific rules   | [Examples](./examples.md#multi-tenant-saas-platform) |
| **Real-time Evaluation** | Live rule testing       | [Components](./components.md#ruleevaluator)          |
| **Version Control**      | Rule history management | [Components](./components.md#historyviewer)          |
| **Custom Operators**     | Domain-specific logic   | [README](../README.md#custom-operators)              |

## 🎨 Customization Guide

### Theming

| Aspect         | Customization        | Documentation                                            |
| -------------- | -------------------- | -------------------------------------------------------- |
| **Colors**     | CSS variables, props | [README](../README.md#theme-customization)               |
| **Typography** | Font families, sizes | [Integration](./integration.md#styling-integration)      |
| **Layout**     | Spacing, borders     | [Integration](./integration.md#tailwind-css-integration) |
| **Components** | Custom UI components | [Components](./components.md#ui-components)              |

### Behavior

| Feature                | Customization       | Documentation                                |
| ---------------------- | ------------------- | -------------------------------------------- |
| **Keyboard Shortcuts** | Custom key bindings | [Hooks](./hooks.md#usekeyboardshortcuts)     |
| **Field Discovery**    | Custom algorithms   | [Hooks](./hooks.md#usefielddiscovery)        |
| **Validation**         | Custom rules        | [README](../README.md#form-validation-rules) |
| **Operators**          | Business logic      | [README](../README.md#custom-operators)      |

## 🧪 Testing Documentation

### Testing Strategies

| Type                  | Tools                 | Documentation                                                    |
| --------------------- | --------------------- | ---------------------------------------------------------------- |
| **Unit Tests**        | Jest, Testing Library | [Integration](./integration.md#jest-testing)                     |
| **Integration Tests** | MSW, Mock APIs        | [Integration](./integration.md#testing-with-mock-service-worker) |
| **E2E Tests**         | Playwright, Cypress   | [Integration](./integration.md#e2e-testing-with-playwright)      |
| **Visual Tests**      | Storybook, Chromatic  | [Integration](./integration.md#testing-integration)              |

## 📊 Performance Guide

### Optimization Techniques

| Technique             | Implementation      | Documentation                                     |
| --------------------- | ------------------- | ------------------------------------------------- |
| **Code Splitting**    | Dynamic imports     | [Integration](./integration.md#code-splitting)    |
| **Memoization**       | React.memo, useMemo | [Integration](./integration.md#memoization)       |
| **Virtual Scrolling** | Large datasets      | [Integration](./integration.md#virtual-scrolling) |
| **Bundle Analysis**   | Webpack analyzer    | [Integration](./integration.md#bundle-analysis)   |

## 🔍 Troubleshooting

### Common Issues

| Issue                 | Solution              | Documentation                                            |
| --------------------- | --------------------- | -------------------------------------------------------- |
| **Styling conflicts** | CSS isolation         | [Integration](./integration.md#styling-integration)      |
| **SSR hydration**     | Dynamic imports       | [Integration](./integration.md#nextjs-integration)       |
| **Performance**       | Optimization patterns | [Integration](./integration.md#performance-optimization) |
| **Type errors**       | TypeScript setup      | [README](../README.md#typescript-support)                |

## 🚀 Getting Started Checklist

### Setup Steps

- [ ] Install packages: `@usex/rule-engine-builder` and `@usex/rule-engine`
- [ ] Import styles: `import '@usex/rule-engine-builder/styles'`
- [ ] Add basic component: `<TreeRuleBuilder />`
- [ ] Configure fields and sample data
- [ ] Set up onChange handler
- [ ] Add keyboard shortcuts (optional)
- [ ] Customize theme (optional)
- [ ] Set up backend integration (optional)

### Quick Links

- 📦 [Installation Guide](../README.md#installation)
- 🚀 [Quick Start Tutorial](../README.md#quick-start)
- 🎯 [Live Examples](./examples.md)
- 🔧 [Integration Patterns](./integration.md)
- 📚 [API Reference](./components.md)

## 🤝 Contributing

Want to improve the documentation?

1. Check existing [issues](https://github.com/ali-master/rule-engine/issues)
2. Read the [Contributing Guide](../../../CONTRIBUTING.md)
3. Submit documentation improvements
4. Help others in discussions

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/ali-master/rule-engine/issues)
- **Discussions**: [Community Q&A](https://github.com/ali-master/rule-engine/discussions)
- **Documentation**: You're reading it! 📖

---

<div align="center">
  <p>
    <strong>Made with ❤️ by the @usex/rule-engine community</strong>
  </p>
  <p>
    <a href="https://github.com/ali-master/rule-engine">GitHub</a> •
    <a href="https://www.npmjs.com/package/@usex/rule-engine-builder">npm</a> •
    <a href="../README.md">Documentation</a>
  </p>
</div>
