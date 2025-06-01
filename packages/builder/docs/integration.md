# Integration Guide

Complete guide for integrating @usex/rule-engine-builder into your applications.

## Table of Contents

- [Framework Integration](#framework-integration)
- [State Management Integration](#state-management-integration)
- [Backend Integration](#backend-integration)
- [Styling Integration](#styling-integration)
- [Testing Integration](#testing-integration)
- [Performance Optimization](#performance-optimization)

## Framework Integration

### React Integration

#### Basic Setup

```tsx
import { TreeRuleBuilder } from '@usex/rule-engine-builder';
import '@usex/rule-engine-builder/styles';

function App() {
  return (
    <div className="App">
      <TreeRuleBuilder
        fields={fields}
        onChange={handleRuleChange}
      />
    </div>
  );
}
```

#### With React Router

```tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TreeRuleBuilder } from '@usex/rule-engine-builder';

function RuleBuilderPage() {
  const { ruleId } = useParams();
  const [rule, setRule] = useState(null);
  
  useEffect(() => {
    if (ruleId) {
      loadRule(ruleId).then(setRule);
    }
  }, [ruleId]);
  
  return (
    <TreeRuleBuilder
      initialRule={rule}
      onChange={handleRuleChange}
    />
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/rules/:ruleId" element={<RuleBuilderPage />} />
        <Route path="/rules/new" element={<RuleBuilderPage />} />
      </Routes>
    </Router>
  );
}
```

#### With Context Providers

```tsx
import { RuleBuilderProvider, useEnhancedRuleStore } from '@usex/rule-engine-builder';

function RuleBuilderWithContext() {
  return (
    <RuleBuilderProvider>
      <RuleBuilderContent />
    </RuleBuilderProvider>
  );
}

function RuleBuilderContent() {
  const { rule, updateRule } = useEnhancedRuleStore();
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <TreeRuleBuilder onChange={updateRule} />
      <RulePreview rule={rule} />
    </div>
  );
}
```

### Next.js Integration

#### App Router (Next.js 13+)

```tsx
// app/rules/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const TreeRuleBuilder = dynamic(
  () => import('@usex/rule-engine-builder').then(mod => ({ default: mod.TreeRuleBuilder })),
  { 
    ssr: false,
    loading: () => <div>Loading rule builder...</div>
  }
);

export default function RulesPage() {
  const [rule, setRule] = useState(null);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Rule Builder</h1>
      <TreeRuleBuilder
        onChange={setRule}
        className="min-h-[600px]"
      />
    </div>
  );
}
```

#### API Routes Integration

```tsx
// app/api/rules/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RuleEngine } from '@usex/rule-engine';

export async function POST(request: NextRequest) {
  const { rule, data } = await request.json();
  
  try {
    // Validate rule
    const validation = RuleEngine.validate(rule);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 }
      );
    }
    
    // Evaluate rule
    const result = await RuleEngine.evaluate(rule, data);
    
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

#### Server Components with Client Boundary

```tsx
// app/rules/[id]/page.tsx
import { RuleBuilderClient } from './rule-builder-client';

async function getRuleData(id: string) {
  // Fetch rule data on server
  const response = await fetch(`${process.env.API_URL}/rules/${id}`);
  return response.json();
}

export default async function RulePage({ params }: { params: { id: string } }) {
  const ruleData = await getRuleData(params.id);
  
  return (
    <div>
      <h1>Edit Rule: {ruleData.name}</h1>
      <RuleBuilderClient initialRule={ruleData.rule} />
    </div>
  );
}
```

```tsx
// app/rules/[id]/rule-builder-client.tsx
'use client';

import { TreeRuleBuilder } from '@usex/rule-engine-builder';

interface RuleBuilderClientProps {
  initialRule: any;
}

export function RuleBuilderClient({ initialRule }: RuleBuilderClientProps) {
  return (
    <TreeRuleBuilder
      initialRule={initialRule}
      onChange={handleRuleChange}
    />
  );
}
```

### Vite Integration

```tsx
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@usex/rule-engine-builder']
  },
  css: {
    postcss: './postcss.config.js'
  }
});
```

```tsx
// src/App.tsx
import { TreeRuleBuilder } from '@usex/rule-engine-builder';
import '@usex/rule-engine-builder/styles';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TreeRuleBuilder />
    </div>
  );
}

export default App;
```

## State Management Integration

### Redux Toolkit Integration

```tsx
// store/ruleSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RuleState {
  currentRule: any;
  rules: Record<string, any>;
  isLoading: boolean;
  error: string | null;
}

const initialState: RuleState = {
  currentRule: null,
  rules: {},
  isLoading: false,
  error: null
};

const ruleSlice = createSlice({
  name: 'rules',
  initialState,
  reducers: {
    setCurrentRule: (state, action: PayloadAction<any>) => {
      state.currentRule = action.payload;
    },
    saveRule: (state, action: PayloadAction<{ id: string; rule: any }>) => {
      const { id, rule } = action.payload;
      state.rules[id] = rule;
      state.currentRule = rule;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { setCurrentRule, saveRule, setLoading, setError } = ruleSlice.actions;
export default ruleSlice.reducer;
```

```tsx
// components/RuleBuilderRedux.tsx
import { useSelector, useDispatch } from 'react-redux';
import { TreeRuleBuilder } from '@usex/rule-engine-builder';
import { setCurrentRule } from '../store/ruleSlice';

function RuleBuilderRedux() {
  const dispatch = useDispatch();
  const { currentRule, isLoading } = useSelector((state: RootState) => state.rules);
  
  const handleRuleChange = (rule: any) => {
    dispatch(setCurrentRule(rule));
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <TreeRuleBuilder
      rule={currentRule}
      onChange={handleRuleChange}
    />
  );
}
```

### Zustand Integration

```tsx
// store/ruleStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RuleStore {
  rule: any;
  history: any[];
  setRule: (rule: any) => void;
  addToHistory: (rule: any) => void;
  clearHistory: () => void;
}

const useRuleStore = create<RuleStore>()(
  persist(
    (set, get) => ({
      rule: null,
      history: [],
      setRule: (rule) => {
        const { addToHistory } = get();
        addToHistory(rule);
        set({ rule });
      },
      addToHistory: (rule) => {
        set((state) => ({
          history: [...state.history.slice(-9), rule] // Keep last 10
        }));
      },
      clearHistory: () => set({ history: [] })
    }),
    {
      name: 'rule-storage'
    }
  )
);

export default useRuleStore;
```

### TanStack Query Integration

```tsx
// hooks/useRuleQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RuleEngine } from '@usex/rule-engine';

export function useRule(ruleId: string) {
  return useQuery({
    queryKey: ['rule', ruleId],
    queryFn: () => fetchRule(ruleId),
    enabled: !!ruleId
  });
}

export function useSaveRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: saveRule,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['rule', variables.id], data);
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    }
  });
}

export function useValidateRule() {
  return useMutation({
    mutationFn: (rule: any) => Promise.resolve(RuleEngine.validate(rule))
  });
}

export function useEvaluateRule() {
  return useMutation({
    mutationFn: ({ rule, data }: { rule: any; data: any }) =>
      RuleEngine.evaluate(rule, data)
  });
}
```

```tsx
// components/RuleBuilderWithQuery.tsx
import { TreeRuleBuilder } from '@usex/rule-engine-builder';
import { useRule, useSaveRule, useValidateRule } from '../hooks/useRuleQueries';

function RuleBuilderWithQuery({ ruleId }: { ruleId: string }) {
  const { data: rule, isLoading } = useRule(ruleId);
  const saveRuleMutation = useSaveRule();
  const validateRuleMutation = useValidateRule();
  
  const handleSave = async (ruleToSave: any) => {
    // Validate first
    const validation = await validateRuleMutation.mutateAsync(ruleToSave);
    if (!validation.isValid) {
      throw new Error(validation.error.message);
    }
    
    // Save if valid
    await saveRuleMutation.mutateAsync({
      id: ruleId,
      rule: ruleToSave
    });
  };
  
  if (isLoading) return <div>Loading rule...</div>;
  
  return (
    <TreeRuleBuilder
      rule={rule}
      onSave={handleSave}
      onChange={debounce(handleSave, 1000)}
    />
  );
}
```

## Backend Integration

### Express.js API

```typescript
// routes/rules.ts
import express from 'express';
import { RuleEngine } from '@usex/rule-engine';

const router = express.Router();

// Validate rule endpoint
router.post('/validate', async (req, res) => {
  try {
    const { rule } = req.body;
    const validation = RuleEngine.validate(rule);
    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Evaluate rule endpoint
router.post('/evaluate', async (req, res) => {
  try {
    const { rule, data } = req.body;
    const result = await RuleEngine.evaluate(rule, data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save rule endpoint
router.post('/rules', async (req, res) => {
  try {
    const { rule, name, description } = req.body;
    
    // Validate rule before saving
    const validation = RuleEngine.validate(rule);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error.message });
    }
    
    // Save to database
    const savedRule = await saveRuleToDatabase({
      rule,
      name,
      description,
      createdAt: new Date(),
      userId: req.user.id
    });
    
    res.json(savedRule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### GraphQL Integration

```typescript
// schema/rule.ts
import { gql } from 'apollo-server-express';
import { RuleEngine } from '@usex/rule-engine';

export const typeDefs = gql`
  type Rule {
    id: ID!
    name: String!
    description: String
    rule: JSON!
    createdAt: String!
    updatedAt: String!
  }
  
  type ValidationResult {
    isValid: Boolean!
    error: String
  }
  
  type EvaluationResult {
    value: JSON!
    isPassed: Boolean!
    message: String
  }
  
  type Query {
    rule(id: ID!): Rule
    rules: [Rule!]!
  }
  
  type Mutation {
    createRule(name: String!, description: String, rule: JSON!): Rule!
    updateRule(id: ID!, name: String, description: String, rule: JSON): Rule!
    validateRule(rule: JSON!): ValidationResult!
    evaluateRule(rule: JSON!, data: JSON!): EvaluationResult!
  }
`;

export const resolvers = {
  Query: {
    rule: async (_, { id }, { dataSources }) => {
      return await dataSources.ruleAPI.getRule(id);
    },
    rules: async (_, __, { dataSources }) => {
      return await dataSources.ruleAPI.getRules();
    }
  },
  
  Mutation: {
    createRule: async (_, { name, description, rule }, { dataSources }) => {
      const validation = RuleEngine.validate(rule);
      if (!validation.isValid) {
        throw new Error(validation.error.message);
      }
      
      return await dataSources.ruleAPI.createRule({
        name,
        description,
        rule
      });
    },
    
    validateRule: async (_, { rule }) => {
      return RuleEngine.validate(rule);
    },
    
    evaluateRule: async (_, { rule, data }) => {
      return await RuleEngine.evaluate(rule, data);
    }
  }
};
```

### Database Integration

```typescript
// models/Rule.ts
import { Schema, model, Document } from 'mongoose';

interface IRule extends Document {
  name: string;
  description?: string;
  rule: any;
  version: number;
  isActive: boolean;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ruleSchema = new Schema<IRule>({
  name: { type: String, required: true },
  description: { type: String },
  rule: { type: Schema.Types.Mixed, required: true },
  version: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String }],
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add validation middleware
ruleSchema.pre('save', function(next) {
  const { RuleEngine } = require('@usex/rule-engine');
  
  const validation = RuleEngine.validate(this.rule);
  if (!validation.isValid) {
    return next(new Error(validation.error.message));
  }
  
  this.updatedAt = new Date();
  next();
});

export const Rule = model<IRule>('Rule', ruleSchema);
```

## Styling Integration

### Tailwind CSS Integration

```tsx
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@usex/rule-engine-builder/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'rule-builder': {
          primary: '#3b82f6',
          secondary: '#6366f1',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444'
        }
      }
    }
  },
  plugins: []
};
```

### Styled Components Integration

```tsx
import styled, { ThemeProvider } from 'styled-components';
import { TreeRuleBuilder } from '@usex/rule-engine-builder';

const theme = {
  colors: {
    primary: '#3b82f6',
    background: '#ffffff',
    border: '#e5e7eb'
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem'
  }
};

const StyledRuleBuilder = styled.div`
  .rule-builder {
    --primary-color: ${props => props.theme.colors.primary};
    --background-color: ${props => props.theme.colors.background};
    --border-color: ${props => props.theme.colors.border};
  }
`;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <StyledRuleBuilder>
        <TreeRuleBuilder className="rule-builder" />
      </StyledRuleBuilder>
    </ThemeProvider>
  );
}
```

### CSS Modules Integration

```css
/* RuleBuilder.module.css */
.container {
  padding: 1rem;
  background: var(--background-color);
  border-radius: 0.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.content {
  min-height: 400px;
}

:global(.rule-engine-builder) {
  --primary-color: #3b82f6;
  --secondary-color: #6366f1;
}
```

```tsx
import styles from './RuleBuilder.module.css';
import { TreeRuleBuilder } from '@usex/rule-engine-builder';

function RuleBuilderComponent() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Rule Builder</h2>
      </div>
      <div className={styles.content}>
        <TreeRuleBuilder />
      </div>
    </div>
  );
}
```

## Testing Integration

### Jest Testing

```tsx
// __tests__/RuleBuilder.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TreeRuleBuilder } from '@usex/rule-engine-builder';

// Mock the heavy dependencies
jest.mock('@usex/rule-engine-builder', () => ({
  TreeRuleBuilder: jest.fn(() => <div data-testid="rule-builder">Rule Builder</div>)
}));

describe('RuleBuilder Integration', () => {
  it('renders rule builder component', () => {
    const handleChange = jest.fn();
    
    render(
      <TreeRuleBuilder
        onChange={handleChange}
        fields={[]}
      />
    );
    
    expect(screen.getByTestId('rule-builder')).toBeInTheDocument();
  });
  
  it('calls onChange when rule changes', async () => {
    const handleChange = jest.fn();
    const mockRule = { conditions: [], default: null };
    
    // Mock implementation that calls onChange
    const MockTreeRuleBuilder = jest.fn(({ onChange }) => (
      <button onClick={() => onChange(mockRule)}>
        Update Rule
      </button>
    ));
    
    jest.mocked(TreeRuleBuilder).mockImplementation(MockTreeRuleBuilder);
    
    render(<TreeRuleBuilder onChange={handleChange} />);
    
    fireEvent.click(screen.getByText('Update Rule'));
    
    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(mockRule);
    });
  });
});
```

### Testing with Mock Service Worker

```tsx
// __tests__/setup.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  rest.post('/api/rules/validate', (req, res, ctx) => {
    return res(
      ctx.json({
        isValid: true,
        error: null
      })
    );
  }),
  
  rest.post('/api/rules/evaluate', (req, res, ctx) => {
    return res(
      ctx.json({
        value: true,
        isPassed: true,
        message: null
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### E2E Testing with Playwright

```typescript
// tests/rule-builder.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Rule Builder', () => {
  test('should create a new rule', async ({ page }) => {
    await page.goto('/rules/new');
    
    // Wait for rule builder to load
    await page.waitForSelector('[data-testid="rule-builder"]');
    
    // Add a condition group
    await page.click('[data-testid="add-condition-group"]');
    
    // Select a field
    await page.click('[data-testid="field-selector"]');
    await page.click('text=User Email');
    
    // Select an operator
    await page.click('[data-testid="operator-selector"]');
    await page.click('text=equals');
    
    // Enter a value
    await page.fill('[data-testid="value-input"]', 'admin@example.com');
    
    // Save the rule
    await page.click('[data-testid="save-button"]');
    
    // Verify success message
    await expect(page.locator('text=Rule saved successfully')).toBeVisible();
  });
  
  test('should validate rule before saving', async ({ page }) => {
    await page.goto('/rules/new');
    
    // Try to save empty rule
    await page.click('[data-testid="save-button"]');
    
    // Should show validation error
    await expect(page.locator('text=Rule is invalid')).toBeVisible();
  });
});
```

## Performance Optimization

### Code Splitting

```tsx
import { lazy, Suspense } from 'react';

const TreeRuleBuilder = lazy(() =>
  import('@usex/rule-engine-builder').then(module => ({
    default: module.TreeRuleBuilder
  }))
);

function App() {
  return (
    <Suspense fallback={<div>Loading rule builder...</div>}>
      <TreeRuleBuilder />
    </Suspense>
  );
}
```

### Memoization

```tsx
import { memo, useMemo, useCallback } from 'react';
import { TreeRuleBuilder } from '@usex/rule-engine-builder';

const MemoizedRuleBuilder = memo(TreeRuleBuilder);

function OptimizedRuleBuilder({ data, onRuleChange }) {
  const fields = useMemo(() => {
    return discoverFields(data);
  }, [data]);
  
  const handleRuleChange = useCallback((rule) => {
    onRuleChange(rule);
  }, [onRuleChange]);
  
  return (
    <MemoizedRuleBuilder
      fields={fields}
      onChange={handleRuleChange}
    />
  );
}
```

### Virtual Scrolling

```tsx
import { FixedSizeList as List } from 'react-window';
import { TreeRuleBuilder } from '@usex/rule-engine-builder';

function VirtualizedRuleList({ rules }) {
  const renderRule = useCallback(({ index, style }) => (
    <div style={style}>
      <TreeRuleBuilder
        key={rules[index].id}
        rule={rules[index]}
        compact={true}
      />
    </div>
  ), [rules]);
  
  return (
    <List
      height={600}
      itemCount={rules.length}
      itemSize={200}
      itemData={rules}
    >
      {renderRule}
    </List>
  );
}
```

### Bundle Analysis

```bash
# Analyze bundle size
npm install --save-dev webpack-bundle-analyzer

# Add script to package.json
{
  "scripts": {
    "analyze": "npx webpack-bundle-analyzer build/static/js/*.js"
  }
}

# Run analysis
npm run analyze
```

### Performance Monitoring

```tsx
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Component:', id, 'Phase:', phase, 'Duration:', actualDuration);
}

function App() {
  return (
    <Profiler id="RuleBuilder" onRender={onRenderCallback}>
      <TreeRuleBuilder />
    </Profiler>
  );
}
```

---

For more integration examples and best practices, see the [main documentation](../README.md).