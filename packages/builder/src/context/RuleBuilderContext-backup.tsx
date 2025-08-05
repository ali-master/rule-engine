import type {
  RuleType,
  EngineResult,
  Constraint,
  ConditionType,
  Condition,
} from "@usex/rule-engine";
import type {
  ValidationError,
  RuleBuilderState,
  RuleBuilderProviderProps,
  RuleBuilderContextType,
} from "../types";
import React, { useMemo, useCallback, use, createContext } from "react";
import { create } from "zustand";

const initialRule: RuleType = {
  conditions: [],
};

interface RuleBuilderStore extends RuleBuilderState {
  updateRule: (rule: RuleType) => void;
  updateConditions: (conditions: Condition | Condition[]) => void;
  updateDefaultResult: (result: EngineResult | undefined) => void;
  resetRule: () => void;
}

const RuleBuilderContext = createContext<RuleBuilderContextType | null>(null);

export function useRuleBuilder() {
  const context = use(RuleBuilderContext);
  if (!context) {
    throw new Error("useRuleBuilder must be used within a RuleBuilderProvider");
  }
  return context;
}

function createRuleBuilderStore(initialRuleData?: RuleType) {
  return create<RuleBuilderStore>((set) => ({
    rule: initialRuleData || initialRule,
    isDirty: false,
    validationErrors: [],
    updateRule: (rule) => set({ rule, isDirty: true }),
    updateConditions: (conditions) =>
      set((state) => ({
        rule: { ...state.rule, conditions },
        isDirty: true,
      })),
    updateDefaultResult: (result) =>
      set((state) => ({
        rule: { ...state.rule, default: result },
        isDirty: true,
      })),
    resetRule: () =>
      set({
        rule: initialRuleData || initialRule,
        isDirty: false,
        validationErrors: [],
      }),
  }));
}

export const RuleBuilderProvider: React.FC<RuleBuilderProviderProps> = ({
  children,
  initialRule: initialRuleData,
  onChange,
  onValidationError,
}) => {
  const store = useMemo(
    () => createRuleBuilderStore(initialRuleData),
    [initialRuleData],
  );

  const state = store();

  React.useEffect(() => {
    if (state.isDirty && onChange) {
      onChange(state.rule);
    }
  }, [state.rule, state.isDirty, onChange]);

  React.useEffect(() => {
    if (state.validationErrors.length > 0 && onValidationError) {
      onValidationError(state.validationErrors);
    }
  }, [state.validationErrors, onValidationError]);

  // Helper function to deep clone the rule structure
  const cloneConditions = useCallback(
    (conditions: Condition | Condition[]): Condition | Condition[] => {
      return JSON.parse(JSON.stringify(conditions));
    },
    [],
  );

  // Navigate to a specific condition using a path like ["0", "and", "0"]
  const navigateToCondition = useCallback(
    (
      conditions: Condition | Condition[],
      path: string[],
    ): {
      condition: Condition | null;
      parent: any;
      parentKey: string | number;
    } => {
      if (path.length === 0) {
        return {
          condition: Array.isArray(conditions) ? conditions[0] : conditions,
          parent: null,
          parentKey: "",
        };
      }

      const [current, ...rest] = path;
      const conditionsArray = Array.isArray(conditions)
        ? conditions
        : [conditions];

      // Handle numeric indices (like "0", "1", etc.)
      if (current.match(/^\d+$/)) {
        const index = Number.parseInt(current);
        if (conditionsArray[index]) {
          if (rest.length === 0) {
            return {
              condition: conditionsArray[index],
              parent: conditionsArray,
              parentKey: index,
            };
          }
          return navigateToCondition(conditionsArray[index], rest);
        }
      }

      // Handle condition type keys (like "and", "or", "none")
      for (const condition of conditionsArray) {
        if (current === "or" && condition.or) {
          if (rest.length === 0) {
            return { condition, parent: condition, parentKey: "or" };
          }
          return navigateToCondition(condition.or, rest);
        } else if (current === "and" && condition.and) {
          if (rest.length === 0) {
            return { condition, parent: condition, parentKey: "and" };
          }
          return navigateToCondition(condition.and, rest);
        } else if (current === "none" && condition.none) {
          if (rest.length === 0) {
            return { condition, parent: condition, parentKey: "none" };
          }
          return navigateToCondition(condition.none, rest);
        }
      }

      return { condition: null, parent: null, parentKey: "" };
    },
    [],
  );

  // ADD CONDITION: Add a new condition group to a parent path
  const addCondition = useCallback(
    (parentPath: string, conditionType: ConditionType) => {
      const newConditions = cloneConditions(
        state.rule.conditions,
      ) as Condition[];
      const newCondition: Condition = { [conditionType]: [] };

      if (!parentPath) {
        // Add to root level
        const conditionsArray = Array.isArray(newConditions)
          ? newConditions
          : [newConditions];
        conditionsArray.push(newCondition);
        store.getState().updateConditions(conditionsArray);
        return;
      }

      const pathArray = parentPath.split(".");
      const { condition } = navigateToCondition(newConditions, pathArray);

      if (condition) {
        const currentConditionType = Object.keys(condition).find(
          (key) => key === "or" || key === "and" || key === "none",
        ) as ConditionType;

        if (currentConditionType && condition[currentConditionType]) {
          condition[currentConditionType].push(newCondition);
          store.getState().updateConditions(newConditions);
        }
      }
    },
    [state.rule.conditions, store, cloneConditions, navigateToCondition],
  );

  // ADD CONSTRAINT: Add a new constraint (rule) to a condition group
  const addConstraint = useCallback(
    (conditionPath: string, constraint: Constraint) => {
      const newConditions = cloneConditions(
        state.rule.conditions,
      ) as Condition[];
      const pathArray = conditionPath.split(".");
      const { condition } = navigateToCondition(newConditions, pathArray);

      if (condition) {
        const conditionType = Object.keys(condition).find(
          (key) => key === "or" || key === "and" || key === "none",
        ) as ConditionType;

        if (conditionType) {
          if (!condition[conditionType]) {
            condition[conditionType] = [];
          }
          condition[conditionType].push(constraint);
          store.getState().updateConditions(newConditions);
        }
      }
    },
    [state.rule.conditions, store, cloneConditions, navigateToCondition],
  );

  // UPDATE CONSTRAINT: Update an existing constraint
  const updateConstraint = useCallback(
    (path: string, constraint: Constraint) => {
      const newConditions = cloneConditions(
        state.rule.conditions,
      ) as Condition[];
      const pathParts = path.split(".");
      const constraintIndex = Number.parseInt(pathParts.pop() || "0");
      const conditionPath = pathParts.join(".");

      const pathArray = conditionPath ? conditionPath.split(".") : [];
      const { condition } = navigateToCondition(newConditions, pathArray);

      if (condition) {
        const conditionType = Object.keys(condition).find(
          (key) => key === "or" || key === "and" || key === "none",
        ) as ConditionType;

        if (
          conditionType &&
          condition[conditionType] &&
          condition[conditionType][constraintIndex]
        ) {
          condition[conditionType][constraintIndex] = constraint;
          store.getState().updateConditions(newConditions);
        }
      }
    },
    [state.rule.conditions, store, cloneConditions, navigateToCondition],
  );

  // REMOVE CONSTRAINT: Remove a constraint from a condition group
  const removeConstraint = useCallback(
    (path: string) => {
      const newConditions = cloneConditions(
        state.rule.conditions,
      ) as Condition[];
      const pathParts = path.split(".");
      const constraintIndex = Number.parseInt(pathParts.pop() || "0");
      const conditionPath = pathParts.join(".");

      const pathArray = conditionPath ? conditionPath.split(".") : [];
      const { condition } = navigateToCondition(newConditions, pathArray);

      if (condition) {
        const conditionType = Object.keys(condition).find(
          (key) => key === "or" || key === "and" || key === "none",
        ) as ConditionType;

        if (conditionType && condition[conditionType]) {
          condition[conditionType].splice(constraintIndex, 1);
          store.getState().updateConditions(newConditions);
        }
      }
    },
    [state.rule.conditions, store, cloneConditions, navigateToCondition],
  );

  // UPDATE CONDITION: Update an entire condition group
  const updateCondition = useCallback(
    (path: string, newCondition: Condition) => {
      const newConditions = cloneConditions(
        state.rule.conditions,
      ) as Condition[];
      const pathArray = path.split(".");
      const { parent, parentKey } = navigateToCondition(
        newConditions,
        pathArray,
      );

      if (parent && parentKey !== "") {
        if (Array.isArray(parent)) {
          parent[parentKey as number] = newCondition;
        } else {
          parent[parentKey] = newCondition;
        }
        store.getState().updateConditions(newConditions);
      }
    },
    [state.rule.conditions, store, cloneConditions, navigateToCondition],
  );

  // REMOVE CONDITION: Remove an entire condition group
  const removeCondition = useCallback(
    (path: string) => {
      const newConditions = cloneConditions(
        state.rule.conditions,
      ) as Condition[];
      const pathArray = path.split(".");

      if (pathArray.length === 1) {
        // Remove from root level
        const index = Number.parseInt(pathArray[0]);
        const conditionsArray = Array.isArray(newConditions)
          ? newConditions
          : [newConditions];
        conditionsArray.splice(index, 1);
        store.getState().updateConditions(conditionsArray);
      } else {
        // Remove from nested level
        const { parent, parentKey } = navigateToCondition(
          newConditions,
          pathArray,
        );
        if (parent && Array.isArray(parent)) {
          parent.splice(parentKey as number, 1);
          store.getState().updateConditions(newConditions);
        }
      }
    },
    [state.rule.conditions, store, cloneConditions, navigateToCondition],
  );

  const importRule = useCallback(
    (rule: RuleType) => {
      store.getState().updateRule(rule);
    },
    [store],
  );

  const exportRule = useCallback(() => {
    return state.rule;
  }, [state.rule]);

  const validate = useCallback(() => {
    const errors: ValidationError[] = [];

    if (
      !state.rule.conditions ||
      (Array.isArray(state.rule.conditions) &&
        state.rule.conditions.length === 0)
    ) {
      errors.push({
        path: "conditions",
        message: "At least one condition is required",
      });
    }

    const newState = store.getState();
    store.setState({ ...newState, validationErrors: errors });

    return errors.length === 0;
  }, [state.rule, store]);

  const contextValue: RuleBuilderContextType = {
    state,
    updateRule: store.getState().updateRule,
    updateConditions: store.getState().updateConditions,
    updateDefaultResult: store.getState().updateDefaultResult,
    addCondition,
    removeCondition,
    updateCondition,
    addConstraint,
    updateConstraint,
    removeConstraint,
    importRule,
    exportRule,
    resetRule: store.getState().resetRule,
    validate,
  };

  return (
    <RuleBuilderContext value={contextValue}>{children}</RuleBuilderContext>
  );
};
