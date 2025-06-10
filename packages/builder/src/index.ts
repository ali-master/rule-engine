// Import styles
import "./styles/globals.css";

// Sub-components (for advanced usage)
export { DiffViewer } from "./components/DiffViewer";
export { DraggableConditionGroup } from "./components/DraggableConditionGroup";
export { DynamicFieldSelector } from "./components/DynamicFieldSelector";
export { FieldSelector } from "./components/FieldSelector";
export { HistoryViewer } from "./components/HistoryViewer";
export { ArrayInput } from "./components/inputs/ArrayInput";
export { BooleanInput } from "./components/inputs/BooleanInput";

export { DateInput } from "./components/inputs/DateInput";
export { NumberInput } from "./components/inputs/NumberInput";
// Input components
export { SmartValueInput } from "./components/inputs/SmartValueInput";
export { JsonViewer } from "./components/JsonViewer";
export { JsonViewer as RuleViewer } from "./components/JsonViewer";
export { ModernConstraintEditor } from "./components/ModernConstraintEditor";
// Main components
export { ModernRuleBuilder } from "./components/ModernRuleBuilder";
export { ModernRuleBuilder as RuleBuilder } from "./components/ModernRuleBuilder";
export { OperatorSelector } from "./components/OperatorSelector";
export { RuleEvaluator } from "./components/RuleEvaluator";

export { ThemeToggle } from "./components/ThemeToggle";
export { TreeConditionGroup } from "./components/TreeConditionGroup";
export { TreeConstraintEditor } from "./components/TreeConstraintEditor";
export { TreeRuleBuilder } from "./components/TreeRuleBuilder";
export { VisualFieldSelector } from "./components/VisualFieldSelector";

export { useFieldDiscovery } from "./hooks/use-field-discovery";
export { useTheme } from "./hooks/use-theme";
// Stores and hooks
export { useEnhancedRuleStore } from "./stores/enhanced-rule-store";
export { useRuleStore } from "./stores/rule-store";

// Types
export type { FieldConfig, OperatorConfig, ThemeConfig } from "./types";

export {
  buildJsonPath,
  buildPath,
  fieldToJsonPath,
  getAllPaths,
  getValueByPath,
  jsonPathToField,
  parseJsonPath,
  validateJsonPath,
} from "./utils/json-path";
// Utils
export {
  getOperatorConfig,
  getOperatorsByCategory,
  getOperatorsForFieldType,
  operatorCategories,
  operatorConfigs,
} from "./utils/operators";

// Re-export from rule engine
export { ConditionTypes, Operators } from "@usex/rule-engine";

export type {
  Condition,
  ConditionType,
  Constraint,
  EngineResult,
  OperatorsType,
  RuleType,
} from "@usex/rule-engine";
