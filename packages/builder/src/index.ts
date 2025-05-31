// Import styles
import "./styles/globals.css";

// Main components
export { ModernRuleBuilder } from "./components/ModernRuleBuilder";
export { ModernRuleBuilder as RuleBuilder } from "./components/ModernRuleBuilder";
export { TreeRuleBuilder } from "./components/TreeRuleBuilder";
export { JsonViewer } from "./components/JsonViewer";
export { JsonViewer as RuleViewer } from "./components/JsonViewer";

// Sub-components (for advanced usage)
export { DraggableConditionGroup } from "./components/DraggableConditionGroup";
export { ModernConstraintEditor } from "./components/ModernConstraintEditor";
export { TreeConditionGroup } from "./components/TreeConditionGroup";
export { TreeConstraintEditor } from "./components/TreeConstraintEditor";
export { DynamicFieldSelector } from "./components/DynamicFieldSelector";
export { FieldSelector } from "./components/FieldSelector";
export { OperatorSelector } from "./components/OperatorSelector";
export { ThemeToggle } from "./components/ThemeToggle";

// Input components
export { SmartValueInput } from "./components/inputs/SmartValueInput";
export { DateInput } from "./components/inputs/DateInput";
export { NumberInput } from "./components/inputs/NumberInput";
export { BooleanInput } from "./components/inputs/BooleanInput";
export { ArrayInput } from "./components/inputs/ArrayInput";

// Stores and hooks
export { useRuleStore } from "./stores/rule-store";
export { useTheme } from "./hooks/use-theme";
export { useFieldDiscovery } from "./hooks/use-field-discovery";

// Types
export type {
  FieldConfig,
  OperatorConfig,
  ThemeConfig,
} from "./types";

// Utils
export { operatorConfigs, operatorCategories, getOperatorConfig, getOperatorsByCategory, getOperatorsForFieldType } from "./utils/operators";

// Re-export from rule engine
export {
  Operators,
  ConditionTypes,
} from "@usex/rule-engine";

export type {
  RuleType,
  Condition,
  Constraint,
  EngineResult,
  OperatorsType,
  ConditionType,
} from "@usex/rule-engine";