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
import React, { useMemo, useCallback, createContext } from "react";
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

  // Forward declare to handle mutual recursion
  let updateConditionAtPath: (
    condition: Condition,
    pathParts: string[],
    updater: (conditions: Condition[]) => Condition[],
  ) => Condition;

  // Recursive function to update conditions at a path
  const updateConditionsAtPath = useCallback(
    (
      conditions: Condition[],
      pathParts: string[],
      updater: (conditions: Condition[]) => Condition[],
    ): Condition[] => {
      if (pathParts.length === 0) {
        return updater(conditions);
      }

      const [currentPart, ...remainingParts] = pathParts;

      // Handle numeric indices (e.g., "0", "1")
      if (currentPart.match(/^\d+$/)) {
        const index = Number.parseInt(currentPart, 10);
        if (index >= 0 && index < conditions.length) {
          const newConditions = [...conditions];
          if (remainingParts.length === 0) {
            // This shouldn't happen for our use cases, but handle it
            return conditions;
          } else {
            // Continue to next level
            newConditions[index] = updateConditionAtPath(
              newConditions[index],
              remainingParts,
              updater,
            );
          }
          return newConditions;
        }
      }

      return conditions;
    },
    [],
  );

  // Recursive function to update a single condition at a path
  updateConditionAtPath = useCallback(
    (
      condition: Condition,
      pathParts: string[],
      updater: (conditions: Condition[]) => Condition[],
    ): Condition => {
      if (pathParts.length === 0) {
        return condition;
      }

      const [currentPart, ...remainingParts] = pathParts;
      const newCondition = { ...condition };

      // Handle condition type parts (e.g., "and", "or", "none")
      if (currentPart === "and" && condition.and) {
        if (remainingParts.length === 0) {
          // Apply updater to this level
          newCondition.and = updater(condition.and as Condition[]);
        } else {
          // Continue deeper
          newCondition.and = updateConditionsAtPath(
            condition.and as Condition[],
            remainingParts,
            updater,
          );
        }
      } else if (currentPart === "or" && condition.or) {
        if (remainingParts.length === 0) {
          // Apply updater to this level
          newCondition.or = updater(condition.or as Condition[]);
        } else {
          // Continue deeper
          newCondition.or = updateConditionsAtPath(
            condition.or as Condition[],
            remainingParts,
            updater,
          );
        }
      } else if (currentPart === "none" && condition.none) {
        if (remainingParts.length === 0) {
          // Apply updater to this level
          newCondition.none = updater(condition.none as Condition[]);
        } else {
          // Continue deeper
          newCondition.none = updateConditionsAtPath(
            condition.none as Condition[],
            remainingParts,
            updater,
          );
        }
      }

      return newCondition;
    },
    [updateConditionsAtPath],
  );

  // ADD CONDITION: Add a new condition group
  const addCondition = useCallback(
    (parentPath: string, conditionType: ConditionType) => {
      const newCondition: Condition = { [conditionType]: [] };

      if (!parentPath) {
        // Add to root level
        const currentConditions = Array.isArray(state.rule.conditions)
          ? state.rule.conditions
          : state.rule.conditions
            ? [state.rule.conditions]
            : [];

        store.getState().updateConditions([...currentConditions, newCondition]);
        return;
      }

      const pathParts = parentPath.split(".");
      const rootConditions = Array.isArray(state.rule.conditions)
        ? state.rule.conditions
        : state.rule.conditions
          ? [state.rule.conditions]
          : [];

      const updatedConditions = updateConditionsAtPath(
        rootConditions,
        pathParts,
        (conditions) => [...conditions, newCondition],
      );

      store.getState().updateConditions(updatedConditions);
    },
    [state.rule.conditions, store, updateConditionsAtPath],
  );

  // ADD CONSTRAINT: Add a new constraint (rule)
  const addConstraint = useCallback(
    (conditionPath: string, constraint: Constraint) => {
      const pathParts = conditionPath.split(".");
      const rootConditions = Array.isArray(state.rule.conditions)
        ? state.rule.conditions
        : state.rule.conditions
          ? [state.rule.conditions]
          : [];

      const updatedConditions = updateConditionsAtPath(
        rootConditions,
        pathParts,
        (conditions) => [...conditions, constraint],
      );

      store.getState().updateConditions(updatedConditions);
    },
    [state.rule.conditions, store, updateConditionsAtPath],
  );

  // UPDATE CONSTRAINT: Update an existing constraint
  const updateConstraint = useCallback(
    (path: string, constraint: Constraint) => {
      const pathParts = path.split(".");
      const constraintIndex = Number.parseInt(pathParts.pop() || "0", 10);

      const rootConditions = Array.isArray(state.rule.conditions)
        ? state.rule.conditions
        : state.rule.conditions
          ? [state.rule.conditions]
          : [];

      const updatedConditions = updateConditionsAtPath(
        rootConditions,
        pathParts,
        (conditions) => {
          const newConditions = [...conditions];
          if (constraintIndex >= 0 && constraintIndex < conditions.length) {
            newConditions[constraintIndex] = constraint;
          }
          return newConditions;
        },
      );

      store.getState().updateConditions(updatedConditions);
    },
    [state.rule.conditions, store, updateConditionsAtPath],
  );

  // REMOVE CONSTRAINT: Remove a constraint
  const removeConstraint = useCallback(
    (path: string) => {
      const pathParts = path.split(".");
      const constraintIndex = Number.parseInt(pathParts.pop() || "0", 10);

      const rootConditions = Array.isArray(state.rule.conditions)
        ? state.rule.conditions
        : state.rule.conditions
          ? [state.rule.conditions]
          : [];

      const updatedConditions = updateConditionsAtPath(
        rootConditions,
        pathParts,
        (conditions) =>
          conditions.filter((_, index) => index !== constraintIndex),
      );

      store.getState().updateConditions(updatedConditions);
    },
    [state.rule.conditions, store, updateConditionsAtPath],
  );

  // UPDATE CONDITION: Update an entire condition
  const updateCondition = useCallback(
    (path: string, newCondition: Condition) => {
      const pathParts = path.split(".");
      const rootConditions = Array.isArray(state.rule.conditions)
        ? state.rule.conditions
        : state.rule.conditions
          ? [state.rule.conditions]
          : [];

      if (pathParts.length === 1) {
        // Update at root level
        const index = Number.parseInt(pathParts[0], 10);
        if (index >= 0 && index < rootConditions.length) {
          const newConditions = [...rootConditions];
          newConditions[index] = newCondition;
          store.getState().updateConditions(newConditions);
        }
      } else {
        // Update at nested level using recursive approach
        const conditionIndex = Number.parseInt(pathParts.pop() || "0", 10);
        const parentPathParts = pathParts;

        const updatedConditions = updateConditionsAtPath(
          rootConditions,
          parentPathParts,
          (conditions) => {
            const newConditions = [...conditions];
            if (conditionIndex >= 0 && conditionIndex < conditions.length) {
              newConditions[conditionIndex] = newCondition;
            }
            return newConditions;
          },
        );

        store.getState().updateConditions(updatedConditions);
      }
    },
    [state.rule.conditions, store, updateConditionsAtPath],
  );

  // REMOVE CONDITION: Remove an entire condition
  const removeCondition = useCallback(
    (path: string) => {
      const pathParts = path.split(".");
      const rootConditions = Array.isArray(state.rule.conditions)
        ? state.rule.conditions
        : state.rule.conditions
          ? [state.rule.conditions]
          : [];

      if (pathParts.length === 1) {
        // Remove from root level
        const index = Number.parseInt(pathParts[0], 10);
        const newConditions = rootConditions.filter((_, i) => i !== index);
        store.getState().updateConditions(newConditions);
      } else {
        // Remove from nested level using recursive approach
        const conditionIndex = Number.parseInt(pathParts.pop() || "0", 10);
        const parentPathParts = pathParts;

        const updatedConditions = updateConditionsAtPath(
          rootConditions,
          parentPathParts,
          (conditions) =>
            conditions.filter((_, index) => index !== conditionIndex),
        );

        store.getState().updateConditions(updatedConditions);
      }
    },
    [state.rule.conditions, store, updateConditionsAtPath],
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

  const contextValue: RuleBuilderContextType = useMemo(
    () => ({
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
    }),
    [
      state,
      store,
      addCondition,
      removeCondition,
      updateCondition,
      addConstraint,
      updateConstraint,
      removeConstraint,
      importRule,
      exportRule,
      validate,
    ],
  );

  return (
    <RuleBuilderContext value={contextValue}>{children}</RuleBuilderContext>
  );
};
