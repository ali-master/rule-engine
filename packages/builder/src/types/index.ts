import type { RuleType, OperatorsType, EngineResult, Constraint, ConditionType, Condition } from '@usex/rule-engine';

export interface RuleBuilderState {
  rule: RuleType;
  isDirty: boolean;
  validationErrors: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
}

export interface RuleBuilderContextType {
  state: RuleBuilderState;
  updateRule: (rule: RuleType) => void;
  updateConditions: (conditions: Condition | Condition[]) => void;
  updateDefaultResult: (result: EngineResult | undefined) => void;
  addCondition: (parentPath: string, conditionType: ConditionType) => void;
  removeCondition: (path: string) => void;
  updateCondition: (path: string, condition: Condition) => void;
  addConstraint: (conditionPath: string, constraint: Constraint) => void;
  updateConstraint: (path: string, constraint: Constraint) => void;
  removeConstraint: (path: string) => void;
  importRule: (rule: RuleType) => void;
  exportRule: () => RuleType;
  resetRule: () => void;
  validate: () => boolean;
}

export interface RuleBuilderProviderProps {
  children: React.ReactNode;
  initialRule?: RuleType;
  onChange?: (rule: RuleType) => void;
  onValidationError?: (errors: ValidationError[]) => void;
}

export interface RuleBuilderProps {
  className?: string;
  showImportExport?: boolean;
  showViewer?: boolean;
  viewerPosition?: 'right' | 'bottom';
  theme?: ThemeConfig;
  fields?: FieldConfig[];
  operators?: OperatorConfig[];
  customValueInputs?: Record<string, React.ComponentType<ValueInputProps>>;
  onRuleChange?: (rule: RuleType) => void;
  readOnly?: boolean;
}

export interface RuleEditorProps {
  className?: string;
  readOnly?: boolean;
}

export interface ConditionGroupProps {
  condition: Condition;
  path: string;
  depth?: number;
  readOnly?: boolean;
  onUpdate?: (condition: Condition) => void;
  onRemove?: () => void;
}

export interface ConstraintEditorProps {
  constraint: Constraint;
  path: string;
  fields?: FieldConfig[];
  operators?: OperatorConfig[];
  readOnly?: boolean;
  onUpdate?: (constraint: Constraint) => void;
  onRemove?: () => void;
}

export interface FieldSelectorProps {
  value: string;
  onChange: (value: string) => void;
  fields?: FieldConfig[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface OperatorSelectorProps {
  value: OperatorsType;
  onChange: (value: OperatorsType) => void;
  operators?: OperatorConfig[];
  field?: string;
  disabled?: boolean;
  className?: string;
}

export interface ValueInputProps {
  value: any;
  onChange: (value: any) => void;
  operator: OperatorsType;
  field?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export interface RuleViewerProps {
  rule: RuleType;
  className?: string;
  syntaxHighlight?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface FieldConfig {
  name: string;
  label?: string;
  type?: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  description?: string;
  group?: string;
  jsonPath?: boolean;
  values?: Array<{ value: any; label: string }>;
}

export interface OperatorConfig {
  name: OperatorsType;
  label?: string;
  category?: string;
  description?: string;
  valueType?: 'none' | 'single' | 'multiple' | 'range';
  applicableTypes?: Array<FieldConfig['type']>;
}

export interface ThemeConfig {
  colors?: {
    primary?: string;
    secondary?: string;
    destructive?: string;
    muted?: string;
    accent?: string;
    background?: string;
    foreground?: string;
    card?: string;
    border?: string;
  };
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'compact' | 'normal' | 'comfortable';
  fontFamily?: string;
}

export interface ImportExportProps {
  onImport: (rule: RuleType) => void;
  onExport: () => RuleType;
  className?: string;
}

export interface ResultEditorProps {
  result?: EngineResult;
  onChange: (result: EngineResult | undefined) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export type ConditionPath = string;
export type ConstraintPath = string;