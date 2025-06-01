# Hooks Reference

Comprehensive guide to all hooks available in @usex/rule-engine-builder.

## Table of Contents

- [State Management Hooks](#state-management-hooks)
- [UI Interaction Hooks](#ui-interaction-hooks)
- [Utility Hooks](#utility-hooks)
- [Custom Hook Patterns](#custom-hook-patterns)

## State Management Hooks

### useEnhancedRuleStore

Advanced rule state management with history and undo/redo functionality.

```typescript
interface EnhancedRuleStore {
  // Current State
  rule: RuleType;
  history: HistoryEntry[];
  historyIndex: number;
  expandedGroups: Set<string>;
  
  // Rule Management
  updateRule: (rule: RuleType, action?: string, description?: string) => void;
  updateConditions: (conditions: Condition[]) => void;
  setRule: (rule: RuleType, action?: string, description?: string) => void;
  
  // History Operations
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getUndoInfo: () => HistoryInfo | null;
  getRedoInfo: () => HistoryInfo | null;
  getHistoryInfo: () => { current: number; total: number };
  
  // UI State Management
  expandAll: () => void;
  collapseAll: () => void;
  toggleGroup: (groupId: string) => void;
  isGroupExpanded: (groupId: string) => boolean;
  
  // Utilities
  clearHistory: () => void;
  exportHistory: () => HistoryEntry[];
  importHistory: (history: HistoryEntry[]) => void;
}

interface HistoryEntry {
  rule: RuleType;
  timestamp: number;
  action: string;
  description: string;
  changes?: {
    before: any;
    after: any;
  };
}
```

**Usage:**
```tsx
import { useEnhancedRuleStore } from '@usex/rule-engine-builder';

function RuleEditor() {
  const {
    rule,
    updateRule,
    undo,
    redo,
    canUndo,
    canRedo,
    getHistoryInfo
  } = useEnhancedRuleStore();
  
  const handleAddCondition = () => {
    const newRule = {
      ...rule,
      conditions: [
        ...(Array.isArray(rule.conditions) ? rule.conditions : [rule.conditions]),
        { and: [] }
      ]
    };
    
    updateRule(newRule, 'Add', 'Added new condition group');
  };
  
  const historyInfo = getHistoryInfo();
  
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button onClick={undo} disabled={!canUndo()}>
          Undo
        </button>
        <button onClick={redo} disabled={!canRedo()}>
          Redo
        </button>
        <span className="text-sm text-muted-foreground">
          {historyInfo.current} / {historyInfo.total}
        </span>
      </div>
      
      <button onClick={handleAddCondition}>
        Add Condition
      </button>
      
      {/* Rule builder UI */}
    </div>
  );
}
```

**Features:**
- **History Management**: 100-entry history with automatic cleanup
- **Action Tracking**: Named actions with descriptions for clear audit trail
- **Change Detection**: Automatic before/after change tracking
- **UI State**: Persistent expand/collapse state for rule groups
- **Export/Import**: Full history serialization support

### useRuleStore

Basic rule state management for simpler use cases.

```typescript
interface RuleStore {
  rule: RuleType;
  setRule: (rule: RuleType) => void;
  updateConditions: (conditions: Condition[]) => void;
  reset: () => void;
}
```

**Usage:**
```tsx
import { useRuleStore } from '@usex/rule-engine-builder';

function SimpleRuleEditor() {
  const { rule, setRule, updateConditions } = useRuleStore();
  
  return (
    <div>
      {/* Simple rule editing UI */}
    </div>
  );
}
```

## UI Interaction Hooks

### useFieldDiscovery

Automatic field discovery from sample data with intelligent type inference.

```typescript
interface FieldDiscoveryOptions {
  maxDepth?: number;              // Maximum object nesting depth (default: 5)
  includeArrayIndices?: boolean;  // Include array index paths (default: false)
  generateLabels?: boolean;       // Auto-generate human-readable labels (default: true)
  excludePaths?: string[];        // Paths to exclude from discovery
  fieldTypes?: Record<string, FieldType>; // Override field types
  groupBy?: 'path' | 'type' | 'custom'; // Grouping strategy
  customGrouper?: (field: FieldConfig) => string; // Custom grouping function
}

interface FieldDiscoveryResult {
  fields: FieldConfig[];
  isLoading: boolean;
  error: Error | null;
  stats: {
    totalFields: number;
    byType: Record<FieldType, number>;
    byGroup: Record<string, number>;
  };
  
  // Actions
  discover: (data: any, options?: FieldDiscoveryOptions) => void;
  addCustomField: (field: FieldConfig) => void;
  removeField: (fieldName: string) => void;
  updateField: (fieldName: string, updates: Partial<FieldConfig>) => void;
  clearFields: () => void;
  
  // Utilities
  findField: (name: string) => FieldConfig | undefined;
  getFieldsByGroup: (group: string) => FieldConfig[];
  getFieldsByType: (type: FieldType) => FieldConfig[];
  exportFields: () => FieldConfig[];
  importFields: (fields: FieldConfig[]) => void;
}
```

**Usage:**
```tsx
import { useFieldDiscovery } from '@usex/rule-engine-builder';

function SmartRuleBuilder() {
  const {
    fields,
    isLoading,
    discover,
    addCustomField,
    stats
  } = useFieldDiscovery();
  
  const sampleData = {
    user: {
      name: 'John Doe',
      age: 30,
      email: 'john@example.com',
      preferences: {
        theme: 'dark',
        notifications: true
      }
    },
    orders: [
      { id: 1, total: 99.99, status: 'completed' },
      { id: 2, total: 149.99, status: 'pending' }
    ]
  };
  
  useEffect(() => {
    discover(sampleData, {
      maxDepth: 3,
      includeArrayIndices: true,
      generateLabels: true,
      groupBy: 'path'
    });
  }, [sampleData]);
  
  const handleAddCustomField = () => {
    addCustomField({
      name: 'customCalculation',
      label: 'Custom Calculation',
      type: 'number',
      group: 'Calculated Fields',
      description: 'Custom business logic calculation'
    });
  };
  
  if (isLoading) return <div>Discovering fields...</div>;
  
  return (
    <div>
      <div className="mb-4">
        <h3>Discovered Fields ({stats.totalFields})</h3>
        <div className="text-sm text-muted-foreground">
          {Object.entries(stats.byType).map(([type, count]) => (
            <span key={type} className="mr-4">
              {type}: {count}
            </span>
          ))}
        </div>
      </div>
      
      <button onClick={handleAddCustomField}>
        Add Custom Field
      </button>
      
      <TreeRuleBuilder
        fields={fields}
        sampleData={sampleData}
      />
    </div>
  );
}
```

**Field Discovery Algorithm:**
1. **Traversal**: Deep object traversal with cycle detection
2. **Type Inference**: Smart type detection based on value analysis
3. **Label Generation**: Humanized labels from camelCase/snake_case paths
4. **Grouping**: Automatic grouping by object hierarchy
5. **Validation**: Field validation and conflict resolution

### useKeyboardShortcuts

Comprehensive keyboard shortcut management with platform detection.

```typescript
interface ShortcutConfig {
  key: string;                    // Key to press (case-insensitive)
  ctrl?: boolean;                // Ctrl key (Windows/Linux)
  cmd?: boolean;                 // Cmd key (macOS) - auto-maps to ctrl on other platforms
  shift?: boolean;               // Shift key
  alt?: boolean;                 // Alt/Option key
  meta?: boolean;                // Meta key (Windows key, Cmd key)
  handler: (event: KeyboardEvent) => void; // Handler function
  description: string;           // Human-readable description
  disabled?: boolean;            // Temporarily disable shortcut
  preventDefault?: boolean;      // Prevent default browser behavior (default: true)
  stopPropagation?: boolean;     // Stop event propagation (default: true)
  target?: string | Element;     // Specific element to bind to (default: document)
}

interface KeyboardShortcutsAPI {
  register: (shortcuts: ShortcutConfig[]) => void;
  unregister: (keys: string[]) => void;
  enable: (key: string) => void;
  disable: (key: string) => void;
  getRegistered: () => ShortcutConfig[];
  isEnabled: (key: string) => boolean;
}
```

**Usage:**
```tsx
import { useKeyboardShortcuts } from '@usex/rule-engine-builder';

function RuleBuilderWithShortcuts() {
  const { rule, updateRule, undo, redo, canUndo, canRedo } = useEnhancedRuleStore();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  useKeyboardShortcuts([
    {
      key: 'z',
      ctrl: true,
      handler: () => canUndo() && undo(),
      description: 'Undo last action'
    },
    {
      key: 'y',
      ctrl: true,
      handler: () => canRedo() && redo(),
      description: 'Redo last action'
    },
    {
      key: 'z',
      ctrl: true,
      shift: true,
      handler: () => canRedo() && redo(),
      description: 'Redo last action (alternative)'
    },
    {
      key: 's',
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        handleSave();
      },
      description: 'Save rule'
    },
    {
      key: 'r',
      ctrl: true,
      handler: () => addNewConditionGroup(),
      description: 'Add new rule group'
    },
    {
      key: 'e',
      ctrl: true,
      shift: true,
      handler: () => expandAll(),
      description: 'Expand all groups'
    },
    {
      key: 'c',
      ctrl: true,
      shift: true,
      handler: () => collapseAll(),
      description: 'Collapse all groups'
    },
    {
      key: '?',
      shift: true,
      handler: () => setIsHelpOpen(true),
      description: 'Show keyboard shortcuts help'
    },
    {
      key: 'Escape',
      handler: () => setIsHelpOpen(false),
      description: 'Close dialogs'
    }
  ]);
  
  return (
    <div>
      <TreeRuleBuilder />
      
      {isHelpOpen && (
        <KeyboardShortcutsHelp onClose={() => setIsHelpOpen(false)} />
      )}
    </div>
  );
}
```

**Platform Handling:**
- **macOS**: `cmd` key automatically maps to Cmd key
- **Windows/Linux**: `ctrl` key maps to Ctrl key
- **Auto-detection**: Automatically detects platform and shows appropriate shortcuts
- **Conflict Resolution**: Prevents conflicting shortcuts and provides warnings

### useTheme

Theme management with system preference detection.

```typescript
interface ThemeAPI {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  systemTheme: 'light' | 'dark';
}
```

**Usage:**
```tsx
import { useTheme } from '@usex/rule-engine-builder';

function ThemedRuleBuilder() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  
  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-background text-foreground">
        <header className="flex justify-between items-center p-4">
          <h1>Rule Builder</h1>
          <button onClick={toggleTheme}>
            {resolvedTheme === 'dark' ? '☀️' : '🌙'}
          </button>
        </header>
        
        <TreeRuleBuilder theme={theme} />
      </div>
    </div>
  );
}
```

## Utility Hooks

### useDebounce

Debounce values and callbacks for performance optimization.

```typescript
function useDebounce<T>(value: T, delay: number): T;
function useDebounce<T extends (...args: any[]) => any>(
  callback: T, 
  delay: number
): T;
```

**Usage:**
```tsx
import { useDebounce } from '@usex/rule-engine-builder';

function RuleBuilderWithDebouncing() {
  const [rule, setRule] = useState(initialRule);
  
  // Debounce rule changes to avoid excessive API calls
  const debouncedRule = useDebounce(rule, 500);
  
  // Debounce the save function
  const debouncedSave = useDebounce((rule: RuleType) => {
    saveRuleToServer(rule);
  }, 1000);
  
  useEffect(() => {
    if (debouncedRule) {
      debouncedSave(debouncedRule);
    }
  }, [debouncedRule]);
  
  return (
    <TreeRuleBuilder
      onChange={setRule}
      rule={rule}
    />
  );
}
```

### useLocalStorage

Persistent local storage with automatic serialization.

```typescript
function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options?: {
    serializer?: {
      read: (value: string) => T;
      write: (value: T) => string;
    };
    syncAcrossTabs?: boolean;
  }
): [T, (value: T | ((prev: T) => T)) => void, () => void];
```

**Usage:**
```tsx
import { useLocalStorage } from '@usex/rule-engine-builder';

function PersistentRuleBuilder() {
  const [savedRule, setSavedRule, clearSavedRule] = useLocalStorage(
    'rule-builder-draft',
    { conditions: [], default: null },
    { syncAcrossTabs: true }
  );
  
  const [userPreferences, setUserPreferences] = useLocalStorage(
    'rule-builder-preferences',
    {
      theme: 'system' as const,
      showJsonViewer: true,
      autoSave: true
    }
  );
  
  return (
    <TreeRuleBuilder
      initialRule={savedRule}
      onChange={(rule) => {
        if (userPreferences.autoSave) {
          setSavedRule(rule);
        }
      }}
      showJsonViewer={userPreferences.showJsonViewer}
      theme={userPreferences.theme}
    />
  );
}
```

### useEventListener

Type-safe event listener management.

```typescript
function useEventListener<T extends keyof WindowEventMap>(
  eventType: T,
  handler: (event: WindowEventMap[T]) => void,
  options?: AddEventListenerOptions
): void;

function useEventListener<T extends keyof HTMLElementEventMap>(
  eventType: T,
  handler: (event: HTMLElementEventMap[T]) => void,
  element: RefObject<HTMLElement>,
  options?: AddEventListenerOptions
): void;
```

**Usage:**
```tsx
import { useEventListener } from '@usex/rule-engine-builder';

function RuleBuilderWithEvents() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Global keyboard events
  useEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      openCommandPalette();
    }
  });
  
  // Container-specific events
  useEventListener('drop', (event) => {
    event.preventDefault();
    handleRuleDrop(event);
  }, containerRef);
  
  return (
    <div ref={containerRef}>
      <TreeRuleBuilder />
    </div>
  );
}
```

## Custom Hook Patterns

### useAsyncRule

Handle async rule operations with loading states.

```typescript
function useAsyncRule() {
  const [rule, setRule] = useState<RuleType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const loadRule = useCallback(async (ruleId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loadedRule = await fetchRule(ruleId);
      setRule(loadedRule);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const saveRule = useCallback(async (ruleToSave: RuleType) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const savedRule = await saveRuleToServer(ruleToSave);
      setRule(savedRule);
      return savedRule;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    rule,
    isLoading,
    error,
    loadRule,
    saveRule,
    setRule
  };
}
```

### useRuleValidation

Real-time rule validation with detailed feedback.

```typescript
function useRuleValidation(rule: RuleType | null) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  
  useEffect(() => {
    if (!rule) {
      setValidation(null);
      return;
    }
    
    const validateAsync = async () => {
      try {
        const result = await RuleEngine.validate(rule);
        setValidation(result);
      } catch (error) {
        setValidation({
          isValid: false,
          error: {
            message: error.message,
            path: '',
            details: error
          }
        });
      }
    };
    
    validateAsync();
  }, [rule]);
  
  return validation;
}
```

### useRuleEvaluation

Reactive rule evaluation with caching.

```typescript
function useRuleEvaluation(rule: RuleType | null, data: any) {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const evaluate = useCallback(async () => {
    if (!rule || !data) {
      setResult(null);
      return;
    }
    
    setIsEvaluating(true);
    
    try {
      const evaluationResult = await RuleEngine.evaluate(rule, data);
      setResult(evaluationResult);
    } catch (error) {
      setResult({
        value: rule.default || false,
        isPassed: false,
        message: `Evaluation error: ${error.message}`
      });
    } finally {
      setIsEvaluating(false);
    }
  }, [rule, data]);
  
  useEffect(() => {
    evaluate();
  }, [evaluate]);
  
  return {
    result,
    isEvaluating,
    evaluate
  };
}
```

### Hook Composition Example

```tsx
function AdvancedRuleBuilder({ ruleId }: { ruleId?: string }) {
  // Core rule management
  const { rule, isLoading, error, loadRule, saveRule } = useAsyncRule();
  const { updateRule, undo, redo, canUndo, canRedo } = useEnhancedRuleStore();
  
  // Field discovery
  const { fields, discover } = useFieldDiscovery();
  
  // Validation and evaluation
  const validation = useRuleValidation(rule);
  const { result: evaluationResult } = useRuleEvaluation(rule, sampleData);
  
  // UI state
  const { theme, toggleTheme } = useTheme();
  const [preferences, setPreferences] = useLocalStorage('preferences', {
    autoSave: true,
    showValidation: true
  });
  
  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 's',
      ctrl: true,
      handler: () => rule && saveRule(rule),
      description: 'Save rule'
    },
    {
      key: 'z',
      ctrl: true,
      handler: () => canUndo() && undo(),
      description: 'Undo'
    }
  ]);
  
  // Auto-save
  const debouncedSave = useDebounce(saveRule, 2000);
  
  useEffect(() => {
    if (rule && preferences.autoSave) {
      debouncedSave(rule);
    }
  }, [rule, preferences.autoSave, debouncedSave]);
  
  // Load initial rule
  useEffect(() => {
    if (ruleId) {
      loadRule(ruleId);
    }
  }, [ruleId, loadRule]);
  
  if (isLoading) return <div>Loading rule...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="space-y-4">
        {/* Validation feedback */}
        {preferences.showValidation && validation && !validation.isValid && (
          <Alert variant="destructive">
            {validation.error?.message}
          </Alert>
        )}
        
        {/* Evaluation result */}
        {evaluationResult && (
          <div className={`p-2 rounded ${
            evaluationResult.isPassed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            Result: {JSON.stringify(evaluationResult.value)}
          </div>
        )}
        
        {/* Main rule builder */}
        <TreeRuleBuilder
          rule={rule}
          fields={fields}
          onChange={updateRule}
          theme={theme}
        />
      </div>
    </div>
  );
}
```

---

For more information, see the [main documentation](../README.md).