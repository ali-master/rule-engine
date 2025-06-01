# Component Reference

Comprehensive reference for all components in @usex/rule-engine-builder.

## Table of Contents

- [Primary Components](#primary-components)
- [Editor Components](#editor-components)
- [Input Components](#input-components)
- [Utility Components](#utility-components)
- [Hook Components](#hook-components)
- [UI Components](#ui-components)

## Primary Components

### TreeRuleBuilder

Main rule builder component with tree-based interface.

```typescript
interface TreeRuleBuilderProps {
  fields?: FieldConfig[];
  sampleData?: Record<string, any>;
  onChange?: (rule: any) => void;
  onSave?: (rule: any) => void | Promise<void>;
  onExport?: (rule: any, format: "json" | "yaml") => void;
  onImport?: (data: string, format: "json" | "yaml") => void;
  readOnly?: boolean;
  className?: string;
  showJsonViewer?: boolean;
  showToolbar?: boolean;
  maxNestingDepth?: number;
  customOperators?: Record<string, any>;
  theme?: "light" | "dark" | "system";
  labels?: LabelConfig;
  colors?: ColorConfig;
  keyboardShortcuts?: KeyboardShortcuts;
}
```

**Features:**
- Tree-based rule construction
- Drag-and-drop reordering
- Keyboard shortcuts
- History management
- Real-time evaluation
- Import/export functionality

**Example:**
```tsx
<TreeRuleBuilder
  fields={fields}
  sampleData={data}
  onChange={handleRuleChange}
  onSave={handleSave}
  showJsonViewer={true}
  maxNestingDepth={5}
/>
```

### ModernRuleBuilder

Enhanced rule builder with modern UI and animations.

```typescript
interface ModernRuleBuilderProps extends TreeRuleBuilderProps {
  animations?: boolean;
  dragAndDrop?: boolean;
  virtualScrolling?: boolean;
}
```

**Features:**
- Framer Motion animations
- Enhanced drag-and-drop
- Virtual scrolling for large datasets
- Modern design patterns

### RuleEvaluator

Real-time rule evaluation component.

```typescript
interface RuleEvaluatorProps {
  rule?: RuleType;
  data?: Record<string, any>;
  onDataChange?: (data: Record<string, any>) => void;
  showKeyboardShortcuts?: boolean;
  className?: string;
}
```

**Features:**
- Live rule evaluation
- Sample data editing
- Pass/fail indicators
- Performance metrics
- Keyboard shortcuts (Ctrl+E, Ctrl+Shift+E)

**Example:**
```tsx
<RuleEvaluator
  rule={currentRule}
  data={testData}
  onDataChange={setTestData}
  showKeyboardShortcuts={true}
/>
```

### HistoryViewer

Rule change history with version comparison.

```typescript
interface HistoryViewerProps {
  className?: string;
}
```

**Features:**
- 100-entry history
- Version comparison
- Diff visualization
- Checkout previous versions
- Search and filter

**Example:**
```tsx
<HistoryViewer className="mt-4" />
```

## Editor Components

### TreeConditionGroup

Nested condition group management.

```typescript
interface TreeConditionGroupProps {
  condition: Condition;
  path: number[];
  depth: number;
  fields: FieldConfig[];
  sampleData?: Record<string, any>;
  customOperators?: Record<string, any>;
  maxNestingDepth?: number;
  onUpdate: (condition: Condition) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  readOnly?: boolean;
  labels?: LabelConfig;
  colors?: ColorConfig;
}
```

**Features:**
- AND/OR/NONE logic groups
- Nested conditions
- Drag-and-drop reordering
- Visual depth indicators
- Expand/collapse state

### TreeConstraintEditor

Individual constraint editing interface.

```typescript
interface TreeConstraintEditorProps {
  constraint: Constraint;
  path: number[];
  fields: FieldConfig[];
  sampleData?: Record<string, any>;
  customOperators?: Record<string, any>;
  onUpdate: (constraint: Constraint) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  readOnly?: boolean;
}
```

**Features:**
- Field selection with groups
- Operator categorization
- Smart value inputs
- Validation messages
- Copy/paste support

### FieldSelector

Advanced field selection interface.

```typescript
interface FieldSelectorProps {
  fields: FieldConfig[];
  value?: string;
  onChange: (field: string) => void;
  placeholder?: string;
  className?: string;
  showGroups?: boolean;
  allowCustom?: boolean;
  jsonPathSupport?: boolean;
}
```

**Features:**
- Grouped field display
- Search and filtering
- JSONPath support
- Custom field creation
- Type indicators

**Example:**
```tsx
<FieldSelector
  fields={fields}
  value={selectedField}
  onChange={setSelectedField}
  showGroups={true}
  allowCustom={true}
  jsonPathSupport={true}
/>
```

### OperatorSelector

Categorized operator selection.

```typescript
interface OperatorSelectorProps {
  operators: OperatorConfig[];
  value?: string;
  onChange: (operator: string) => void;
  fieldType?: string;
  className?: string;
  showCategories?: boolean;
  searchable?: boolean;
}
```

**Features:**
- Category-based grouping
- Search functionality
- Field type filtering
- Help text and examples
- Icon indicators

## Input Components

### SmartValueInput

Universal value input with type awareness.

```typescript
interface SmartValueInputProps {
  value: any;
  onChange: (value: any) => void;
  operator: string;
  fieldType?: string;
  field?: FieldConfig;
  placeholder?: string;
  className?: string;
  validation?: ValidationConfig;
}
```

**Features:**
- Type-aware rendering
- Operator-specific inputs
- Validation feedback
- Suggestions and autocomplete
- Multi-value support

**Example:**
```tsx
<SmartValueInput
  value={constraintValue}
  onChange={setValue}
  operator="contains-any"
  fieldType="array"
  field={selectedField}
/>
```

### ArrayInput

Array value management with drag-and-drop.

```typescript
interface ArrayInputProps {
  value: any[];
  onChange: (value: any[]) => void;
  itemType?: string;
  placeholder?: string;
  maxItems?: number;
  allowDuplicates?: boolean;
  sortable?: boolean;
  className?: string;
}
```

**Features:**
- Add/remove items
- Drag-and-drop reordering
- Type-specific item inputs
- Duplicate detection
- Validation per item

### DateInput

Advanced date/time picker.

```typescript
interface DateInputProps {
  value: Date | string;
  onChange: (value: Date | string) => void;
  format?: string;
  showTime?: boolean;
  timeZone?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}
```

**Features:**
- Calendar popup
- Time selection
- Time zone support
- Format customization
- Range validation

### NumberInput

Animated number input with validation.

```typescript
interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  animated?: boolean;
  format?: Intl.NumberFormatOptions;
  className?: string;
}
```

**Features:**
- Smooth animations
- Range validation
- Step controls
- Number formatting
- Precision handling

## Utility Components

### JsonViewer / RuleViewer

JSON visualization with syntax highlighting.

```typescript
interface JsonViewerProps {
  data: any;
  rootName?: string;
  defaultExpanded?: boolean;
  className?: string;
  highlightLogicalOperators?: boolean;
  collapsible?: boolean;
  searchable?: boolean;
}
```

**Features:**
- Syntax highlighting
- Collapsible nodes
- Search functionality
- Logical operator highlighting
- Copy to clipboard

**Example:**
```tsx
<JsonViewer
  data={rule}
  rootName="rule"
  defaultExpanded={true}
  highlightLogicalOperators={true}
  searchable={true}
/>
```

### DiffViewer

Rule comparison and diff visualization.

```typescript
interface DiffViewerProps {
  oldValue: any;
  newValue: any;
  className?: string;
  title?: string;
  oldTitle?: string;
  newTitle?: string;
  viewMode?: "split" | "unified";
  showStats?: boolean;
}
```

**Features:**
- Side-by-side comparison
- Unified diff view
- Change statistics
- Syntax highlighting
- Property-level analysis

**Example:**
```tsx
<DiffViewer
  oldValue={previousRule}
  newValue={currentRule}
  title="Rule Changes"
  viewMode="split"
  showStats={true}
/>
```

### ImportExport

Rule import/export functionality.

```typescript
interface ImportExportProps {
  onImport: (data: any, format: string) => void;
  onExport: (format: string) => any;
  supportedFormats?: string[];
  className?: string;
}
```

**Features:**
- JSON/YAML support
- File upload/download
- Validation on import
- Format conversion
- Error handling

### ThemeToggle

Light/dark theme switching.

```typescript
interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}
```

**Features:**
- System theme detection
- Smooth transitions
- Customizable appearance
- Accessibility support

## Hook Components

### Enhanced Rule Store

Advanced state management with history.

```typescript
const useEnhancedRuleStore = () => ({
  // State
  rule: RuleType;
  history: HistoryEntry[];
  historyIndex: number;
  expandedGroups: Set<string>;
  
  // Actions
  updateRule: (rule: RuleType, action?: string, description?: string) => void;
  updateConditions: (conditions: Condition[]) => void;
  setRule: (rule: RuleType, action?: string, description?: string) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getUndoInfo: () => HistoryInfo;
  getRedoInfo: () => HistoryInfo;
  
  // UI State
  expandAll: () => void;
  collapseAll: () => void;
  toggleGroup: (groupId: string) => void;
  isGroupExpanded: (groupId: string) => boolean;
});
```

### Field Discovery

Automatic field discovery from sample data.

```typescript
const useFieldDiscovery = (data: any, options?: DiscoveryOptions) => ({
  fields: FieldConfig[];
  isLoading: boolean;
  error: Error | null;
  discover: () => void;
  addCustomField: (field: FieldConfig) => void;
  removeField: (fieldName: string) => void;
  updateField: (fieldName: string, updates: Partial<FieldConfig>) => void;
});

interface DiscoveryOptions {
  maxDepth?: number;
  includeArrayIndices?: boolean;
  generateLabels?: boolean;
  excludePaths?: string[];
  fieldTypes?: Record<string, string>;
}
```

### Keyboard Shortcuts

Configurable keyboard shortcut management.

```typescript
interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description: string;
  disabled?: boolean;
}

const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  // Registers global keyboard event listeners
  // Handles platform-specific modifiers (Cmd on Mac, Ctrl on others)
  // Provides conflict detection and resolution
};
```

## UI Components

### Core UI Components

Built on Radix UI primitives with full accessibility support:

| Component | Purpose | Features |
|-----------|---------|----------|
| `Button` | Actions and triggers | Variants, sizes, loading states |
| `Input` | Text input | Validation, prefixes, suffixes |
| `Select` | Dropdown selection | Search, grouping, custom options |
| `Dialog` | Modal dialogs | Zoom animations, scroll management |
| `Popover` | Floating content | Auto-positioning, close triggers |
| `Tooltip` | Help text | Delays, positioning, rich content |
| `Tabs` | Content organization | Keyboard navigation, indicators |
| `Card` | Content containers | Headers, footers, actions |
| `Badge` | Status indicators | Variants, sizes, icons |
| `Alert` | Notifications | Types, dismissible, actions |

### Advanced UI Components

| Component | Purpose | Features |
|-----------|---------|----------|
| `ZoomDialog` | Full-screen editing | Smooth zoom animations |
| `ScrollArea` | Custom scrollbars | Virtual scrolling, smooth scroll |
| `Collapsible` | Expandable content | Animations, nested support |
| `Command` | Command palette | Search, keyboard navigation |
| `Calendar` | Date selection | Range selection, disabled dates |
| `Slider` | Range input | Multiple handles, step values |
| `Switch` | Boolean toggle | Animated, labeled |
| `Separator` | Visual dividers | Orientation, spacing |

### Layout Components

| Component | Purpose | Features |
|-----------|---------|----------|
| `ResizablePanel` | Resizable layouts | Horizontal/vertical, constraints |
| `Sheet` | Side panels | Slide animations, overlay |
| `DropdownMenu` | Contextual menus | Submenus, separators, icons |
| `HoverCard` | Rich tooltips | Delays, rich content, positioning |

## Component Composition Examples

### Custom Rule Builder

```tsx
import {
  RuleBuilderProvider,
  TreeConditionGroup,
  FieldSelector,
  JsonViewer,
  useEnhancedRuleStore
} from '@usex/rule-engine-builder';

function CustomRuleBuilder() {
  const { rule, updateRule } = useEnhancedRuleStore();
  
  return (
    <RuleBuilderProvider>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <TreeConditionGroup
            condition={rule.conditions}
            path={[]}
            depth={0}
            fields={fields}
            onUpdate={updateRule}
          />
        </div>
        <div>
          <JsonViewer
            data={rule}
            highlightLogicalOperators={true}
          />
        </div>
      </div>
    </RuleBuilderProvider>
  );
}
```

### Evaluation Dashboard

```tsx
import {
  TreeRuleBuilder,
  RuleEvaluator,
  HistoryViewer,
  DiffViewer
} from '@usex/rule-engine-builder';

function EvaluationDashboard() {
  const [rule, setRule] = useState(null);
  const [testData, setTestData] = useState({});
  const [selectedVersions, setSelectedVersions] = useState([]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
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
      
      <div className="grid grid-cols-2 gap-6">
        <HistoryViewer />
        {selectedVersions.length === 2 && (
          <DiffViewer
            oldValue={selectedVersions[0]}
            newValue={selectedVersions[1]}
            title="Version Comparison"
          />
        )}
      </div>
    </div>
  );
}
```

---

For more information, see the [main documentation](../README.md).