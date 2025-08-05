import React from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  RuleType,
  EngineResult,
  Constraint,
  ConditionType,
  Condition,
} from "@usex/rule-engine";

export interface HistoryEntry {
  rule: RuleType;
  timestamp: number;
  action: string;
  description: string;
  changes?: {
    before?: any;
    after?: any;
  };
}

export interface ValidationError {
  path: string;
  message: string;
}

interface UnifiedRuleStore {
  // Core State
  rule: RuleType;
  isDirty: boolean;
  validationErrors: ValidationError[];

  // History
  history: HistoryEntry[];
  historyIndex: number;

  // UI State
  expandedGroups: Set<string>;

  // Core Actions
  setRule: (rule: RuleType, action?: string, description?: string) => void;
  updateConditions: (
    conditions: Condition | Condition[],
    action?: string,
    description?: string,
  ) => void;
  updateDefaultResult: (result: EngineResult | undefined) => void;
  resetRule: (initialRule?: RuleType) => void;

  // Condition/Constraint Management
  addCondition: (parentPath: string, conditionType: ConditionType) => void;
  removeCondition: (path: string) => void;
  updateCondition: (path: string, condition: Condition) => void;
  addConstraint: (conditionPath: string, constraint: Constraint) => void;
  updateConstraint: (path: string, constraint: Constraint) => void;
  removeConstraint: (path: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getUndoInfo: () => HistoryEntry | null;
  getRedoInfo: () => HistoryEntry | null;
  getHistoryInfo: () => {
    current: number;
    total: number;
    entries: HistoryEntry[];
  };

  // UI State Management
  toggleGroupExpanded: (path: string) => void;
  isGroupExpanded: (path: string) => boolean;
  expandAll: () => void;
  collapseAll: () => void;

  // Validation
  validate: () => boolean;
  clearErrors: () => void;

  // Import/Export
  importRule: (rule: RuleType) => void;
  exportRule: () => RuleType;

  // Internal Helpers
  addToHistory: (
    rule: RuleType,
    action: string,
    description: string,
    changes?: any,
  ) => void;
  clearHistory: () => void;
}

const MAX_HISTORY = 100;
const initialRule: RuleType = { conditions: {} };

// Helper functions for path-based operations with single condition object
// Forward declare to handle mutual recursion
let updateItemsAtPath: (
  items: (Condition | Constraint)[],
  pathParts: string[],
  updater: (items: (Condition | Constraint)[]) => (Condition | Constraint)[],
) => (Condition | Constraint)[];

const updateConditionAtPath = (
  condition: Condition,
  pathParts: string[],
  updater: (items: (Condition | Constraint)[]) => (Condition | Constraint)[],
): Condition => {
  if (pathParts.length === 0) {
    return condition;
  }

  const [currentPart, ...remainingParts] = pathParts;
  const newCondition = { ...condition };

  // Handle condition type parts (e.g., "and", "or", "none")
  if (currentPart === "and" && condition.and) {
    if (remainingParts.length === 0) {
      newCondition.and = updater(condition.and);
    } else {
      newCondition.and = updateItemsAtPath(
        condition.and,
        remainingParts,
        updater,
      );
    }
  } else if (currentPart === "or" && condition.or) {
    if (remainingParts.length === 0) {
      newCondition.or = updater(condition.or);
    } else {
      newCondition.or = updateItemsAtPath(
        condition.or,
        remainingParts,
        updater,
      );
    }
  } else if (currentPart === "none" && condition.none) {
    if (remainingParts.length === 0) {
      newCondition.none = updater(condition.none);
    } else {
      newCondition.none = updateItemsAtPath(
        condition.none,
        remainingParts,
        updater,
      );
    }
  }

  return newCondition;
};

updateItemsAtPath = (
  items: (Condition | Constraint)[],
  pathParts: string[],
  updater: (items: (Condition | Constraint)[]) => (Condition | Constraint)[],
): (Condition | Constraint)[] => {
  if (pathParts.length === 0) {
    return updater(items);
  }

  const [currentPart, ...remainingParts] = pathParts;

  // Handle numeric indices (e.g., "0", "1")
  if (currentPart.match(/^\d+$/)) {
    const index = Number.parseInt(currentPart, 10);
    if (index >= 0 && index < items.length) {
      const newItems = [...items];
      const item = newItems[index];

      // Check if it's a condition (has and/or/none) or constraint (has field)
      if ("field" in item) {
        // It's a constraint, can't update further
        return items;
      } else {
        // It's a condition, continue recursively
        newItems[index] = updateConditionAtPath(
          item as Condition,
          remainingParts,
          updater,
        );
      }
      return newItems;
    }
  }

  return items;
};

export const useUnifiedRuleStore = create<UnifiedRuleStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      rule: initialRule,
      isDirty: false,
      validationErrors: [],
      history: [
        {
          rule: initialRule,
          timestamp: Date.now(),
          action: "Initialize",
          description: "Initial empty rule",
        },
      ],
      historyIndex: 0,
      expandedGroups: new Set<string>(),

      // Core Actions
      setRule: (rule, action = "Set Rule", description = "Rule updated") => {
        const state = get();
        state.addToHistory(rule, action, description, {
          before: state.rule,
          after: rule,
        });
        set({ rule, isDirty: true });
      },

      updateConditions: (
        conditions,
        action = "Update Conditions",
        description = "Conditions updated",
      ) => {
        const state = get();
        const newRule = { ...state.rule, conditions };

        const changeDescription = Array.isArray(conditions)
          ? `Updated ${conditions.length} condition group(s)`
          : "Updated condition";

        state.addToHistory(newRule, action, description || changeDescription, {
          before: state.rule.conditions,
          after: conditions,
        });

        set({ rule: newRule, isDirty: true });
      },

      updateDefaultResult: (result) => {
        const state = get();
        const newRule = { ...state.rule, default: result };
        state.addToHistory(
          newRule,
          "Update Default Result",
          result ? "Set default result" : "Removed default result",
          { before: state.rule.default, after: result },
        );
        set({ rule: newRule, isDirty: true });
      },

      resetRule: (initialRuleData = initialRule) => {
        set({
          rule: initialRuleData,
          isDirty: false,
          validationErrors: [],
          history: [
            {
              rule: initialRuleData,
              timestamp: Date.now(),
              action: "Reset",
              description: "Rule reset to initial state",
            },
          ],
          historyIndex: 0,
        });
      },

      // Condition/Constraint Management
      addCondition: (parentPath: string, conditionType: ConditionType) => {
        const state = get();
        const newCondition: Condition = { [conditionType]: [] };

        if (!parentPath) {
          // Add to root level - replace the entire conditions object
          state.updateConditions(
            newCondition,
            "Add Root Condition",
            `Set root ${conditionType} condition group`,
          );
          return;
        }

        const pathParts = parentPath.split(".");
        const updatedConditions = updateConditionAtPath(
          state.rule.conditions as Condition,
          pathParts,
          (items) => [...items, newCondition],
        );

        state.updateConditions(
          updatedConditions,
          "Add Nested Condition",
          `Added ${conditionType} condition to ${parentPath}`,
        );
      },

      removeCondition: (path: string) => {
        const state = get();
        const pathParts = path.split(".");

        // For the new structure, we need to handle removal within the single conditions object
        const conditionIndex = Number.parseInt(pathParts.pop() || "0", 10);
        const parentPathParts = pathParts;

        const updatedConditions = updateConditionAtPath(
          state.rule.conditions as Condition,
          parentPathParts,
          (items) => items.filter((_, index) => index !== conditionIndex),
        );

        state.updateConditions(
          updatedConditions,
          "Remove Condition",
          `Removed condition at ${path}`,
        );
      },

      updateCondition: (path: string, newCondition: Condition) => {
        const state = get();
        const pathParts = path.split(".");

        if (pathParts.length === 0) {
          // Update the root condition
          state.updateConditions(
            newCondition,
            "Update Root Condition",
            "Updated root condition",
          );
          return;
        }

        // Update nested condition
        const conditionIndex = Number.parseInt(pathParts.pop() || "0", 10);
        const parentPathParts = pathParts;

        const updatedConditions = updateConditionAtPath(
          state.rule.conditions as Condition,
          parentPathParts,
          (items) => {
            const newItems = [...items];
            if (conditionIndex >= 0 && conditionIndex < items.length) {
              newItems[conditionIndex] = newCondition;
            }
            return newItems;
          },
        );

        state.updateConditions(
          updatedConditions,
          "Update Condition",
          `Updated condition at ${path}`,
        );
      },

      addConstraint: (conditionPath: string, constraint: Constraint) => {
        const state = get();
        const pathParts = conditionPath.split(".");

        const updatedConditions = updateConditionAtPath(
          state.rule.conditions as Condition,
          pathParts,
          (items) => [...items, constraint],
        );

        state.updateConditions(
          updatedConditions,
          "Add Constraint",
          `Added constraint to ${conditionPath}`,
        );
      },

      updateConstraint: (path: string, constraint: Constraint) => {
        const state = get();
        const pathParts = path.split(".");
        const constraintIndex = Number.parseInt(pathParts.pop() || "0", 10);

        const updatedConditions = updateConditionAtPath(
          state.rule.conditions as Condition,
          pathParts,
          (items) => {
            const newItems = [...items];
            if (constraintIndex >= 0 && constraintIndex < items.length) {
              newItems[constraintIndex] = constraint;
            }
            return newItems;
          },
        );

        state.updateConditions(
          updatedConditions,
          "Update Constraint",
          `Updated constraint at ${path}`,
        );
      },

      removeConstraint: (path: string) => {
        const state = get();
        const pathParts = path.split(".");
        const constraintIndex = Number.parseInt(pathParts.pop() || "0", 10);

        const updatedConditions = updateConditionAtPath(
          state.rule.conditions as Condition,
          pathParts,
          (items) => items.filter((_, index) => index !== constraintIndex),
        );

        state.updateConditions(
          updatedConditions,
          "Remove Constraint",
          `Removed constraint at ${path}`,
        );
      },

      // History Management
      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          set({
            historyIndex: newIndex,
            rule: history[newIndex].rule,
            isDirty: true,
          });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          set({
            historyIndex: newIndex,
            rule: history[newIndex].rule,
            isDirty: true,
          });
        }
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      getUndoInfo: () => {
        const { history, historyIndex } = get();
        return historyIndex > 0 ? history[historyIndex - 1] : null;
      },

      getRedoInfo: () => {
        const { history, historyIndex } = get();
        return historyIndex < history.length - 1
          ? history[historyIndex + 1]
          : null;
      },

      getHistoryInfo: () => {
        const { history, historyIndex } = get();
        return {
          current: historyIndex,
          total: history.length,
          entries: history,
        };
      },

      // UI State Management
      toggleGroupExpanded: (path: string) => {
        set((state) => {
          const newExpanded = new Set(state.expandedGroups);
          if (newExpanded.has(path)) {
            newExpanded.delete(path);
          } else {
            newExpanded.add(path);
          }
          return { expandedGroups: newExpanded };
        });
      },

      isGroupExpanded: (path: string) => {
        return get().expandedGroups.has(path);
      },

      expandAll: () => {
        const allPaths = new Set<string>();
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            allPaths.add(`${i}`);
            allPaths.add(`${i}.and`);
            allPaths.add(`${i}.or`);
            allPaths.add(`${i}.none`);
            for (let k = 0; k < 10; k++) {
              allPaths.add(`${i}.and.${j}`);
              allPaths.add(`${i}.or.${j}`);
              allPaths.add(`${i}.none.${j}`);
            }
          }
        }
        set({ expandedGroups: allPaths });
      },

      collapseAll: () => {
        set({ expandedGroups: new Set<string>() });
      },

      // Validation
      validate: () => {
        const state = get();
        const errors: ValidationError[] = [];

        if (!state.rule.conditions) {
          errors.push({
            path: "conditions",
            message: "Conditions are required",
          });
        } else {
          const condition = state.rule.conditions as Condition;

          // Check if conditions object is empty
          if (Object.keys(condition).length === 0) {
            errors.push({
              path: "conditions",
              message: "At least one constraint or condition is required",
            });
          } else {
            const hasContent =
              (condition.and && condition.and.length > 0) ||
              (condition.or && condition.or.length > 0) ||
              (condition.none && condition.none.length > 0);

            if (!hasContent) {
              errors.push({
                path: "conditions",
                message: "At least one constraint or condition is required",
              });
            }
          }
        }

        set({ validationErrors: errors });
        return errors.length === 0;
      },

      clearErrors: () => {
        set({ validationErrors: [] });
      },

      // Import/Export
      importRule: (rule: RuleType) => {
        const state = get();
        state.setRule(
          rule,
          "Import Rule",
          "Imported rule from external source",
        );
      },

      exportRule: () => {
        return get().rule;
      },

      // Internal Helpers
      addToHistory: (rule, action, description, changes) => {
        set((state) => {
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push({
            rule: JSON.parse(JSON.stringify(rule)), // Deep clone
            timestamp: Date.now(),
            action,
            description,
            changes,
          });

          // Limit history size
          if (newHistory.length > MAX_HISTORY) {
            newHistory.shift();
          }

          return {
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      clearHistory: () => {
        const currentRule = get().rule;
        set({
          history: [
            {
              rule: currentRule,
              timestamp: Date.now(),
              action: "Clear History",
              description: "History cleared",
            },
          ],
          historyIndex: 0,
        });
      },
    }),
    {
      name: "unified-rule-builder-store",
    },
  ),
);

// Export a simple hook that matches the old context API with proper reactivity
export const useRuleBuilder = () => {
  // Get the entire store state directly to ensure reactivity
  const store = useUnifiedRuleStore();

  // Create stable state object
  const state = React.useMemo(
    () => ({
      rule: store.rule,
      isDirty: store.isDirty,
      validationErrors: store.validationErrors,
    }),
    [store.rule, store.isDirty, store.validationErrors],
  );

  // Return the API object
  return React.useMemo(
    () => ({
      state,
      // Core actions
      updateRule: store.setRule,
      updateConditions: store.updateConditions,
      updateDefaultResult: store.updateDefaultResult,
      resetRule: store.resetRule,

      // Condition/Constraint management
      addCondition: store.addCondition,
      removeCondition: store.removeCondition,
      updateCondition: store.updateCondition,
      addConstraint: store.addConstraint,
      updateConstraint: store.updateConstraint,
      removeConstraint: store.removeConstraint,

      // Import/Export
      importRule: store.importRule,
      exportRule: store.exportRule,

      // Validation
      validate: store.validate,

      // History
      undo: store.undo,
      redo: store.redo,
      canUndo: store.canUndo,
      canRedo: store.canRedo,
    }),
    [store, state],
  );
};
