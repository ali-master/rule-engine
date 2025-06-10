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

  const findConditionByPath = useCallback(
    (conditions: Condition | Condition[], path: string[]): Condition | null => {
      if (path.length === 0) {
        return Array.isArray(conditions) ? conditions[0] : conditions;
      }

      const [current, ...rest] = path;
      const conditionsArray = Array.isArray(conditions)
        ? conditions
        : [conditions];

      for (const condition of conditionsArray) {
        if (current === "or" && condition.or) {
          const found = findConditionByPath(condition.or as Condition[], rest);
          if (found) return found;
        } else if (current === "and" && condition.and) {
          const found = findConditionByPath(condition.and as Condition[], rest);
          if (found) return found;
        } else if (current === "none" && condition.none) {
          const found = findConditionByPath(
            condition.none as Condition[],
            rest,
          );
          if (found) return found;
        } else if (
          current.match(/^\d+$/) &&
          conditionsArray[Number.parseInt(current)]
        ) {
          const found = findConditionByPath(
            conditionsArray[Number.parseInt(current)],
            rest,
          );
          if (found) return found;
        }
      }

      return null;
    },
    [],
  );

  const updateConditionAtPath = useCallback(
    (
      conditions: Condition | Condition[],
      path: string[],
      newCondition: Condition,
    ): Condition | Condition[] => {
      if (path.length === 0) {
        return newCondition;
      }

      const [current, ...rest] = path;
      const conditionsArray = Array.isArray(conditions)
        ? conditions
        : [conditions];

      if (current.match(/^\d+$/)) {
        const index = Number.parseInt(current);
        const newConditions = [...conditionsArray];
        newConditions[index] = updateConditionAtPath(
          newConditions[index],
          rest,
          newCondition,
        ) as Condition;
        return newConditions;
      }

      return conditionsArray.map((condition) => {
        const newCond = { ...condition };
        if (current === "or" && condition.or) {
          // Handle mixed arrays of Conditions and Constraints
          const orItems = condition.or;
          const filteredConditions = orItems.filter(
            (item): item is Condition =>
              !("field" in item && "operator" in item),
          );
          newCond.or = [
            ...orItems.filter((item) => "field" in item && "operator" in item),
            ...(updateConditionAtPath(
              filteredConditions,
              rest,
              newCondition,
            ) as Condition[]),
          ];
        } else if (current === "and" && condition.and) {
          // Handle mixed arrays of Conditions and Constraints
          const andItems = condition.and;
          const filteredConditions = andItems.filter(
            (item): item is Condition =>
              !("field" in item && "operator" in item),
          );
          newCond.and = [
            ...andItems.filter((item) => "field" in item && "operator" in item),
            ...(updateConditionAtPath(
              filteredConditions,
              rest,
              newCondition,
            ) as Condition[]),
          ];
        } else if (current === "none" && condition.none) {
          // Handle mixed arrays of Conditions and Constraints
          const noneItems = condition.none;
          const filteredConditions = noneItems.filter(
            (item): item is Condition =>
              !("field" in item && "operator" in item),
          );
          newCond.none = [
            ...noneItems.filter(
              (item) => "field" in item && "operator" in item,
            ),
            ...(updateConditionAtPath(
              filteredConditions,
              rest,
              newCondition,
            ) as Condition[]),
          ];
        }
        return newCond;
      });
    },
    [],
  );

  const addCondition = useCallback(
    (parentPath: string, conditionType: ConditionType) => {
      const pathArray = parentPath ? parentPath.split(".") : [];
      const newCondition: Condition = {
        [conditionType]: [],
      };

      if (pathArray.length === 0) {
        const currentConditions = Array.isArray(state.rule.conditions)
          ? state.rule.conditions
          : state.rule.conditions
            ? [state.rule.conditions]
            : [];
        store.getState().updateConditions([...currentConditions, newCondition]);
      } else {
        const updatedConditions = updateConditionAtPath(
          state.rule.conditions,
          pathArray,
          newCondition,
        );
        store.getState().updateConditions(updatedConditions);
      }
    },
    [state.rule.conditions, store, updateConditionAtPath],
  );

  const removeCondition = useCallback(
    (path: string) => {
      const pathArray = path.split(".");
      if (pathArray.length === 1) {
        const index = Number.parseInt(pathArray[0]);
        const currentConditions = Array.isArray(state.rule.conditions)
          ? state.rule.conditions
          : [state.rule.conditions];
        const newConditions = currentConditions.filter((_, i) => i !== index);
        store.getState().updateConditions(newConditions);
      }
    },
    [state.rule.conditions, store],
  );

  const updateCondition = useCallback(
    (path: string, condition: Condition) => {
      const pathArray = path.split(".");
      const updatedConditions = updateConditionAtPath(
        state.rule.conditions,
        pathArray,
        condition,
      );
      store.getState().updateConditions(updatedConditions);
    },
    [state.rule.conditions, store, updateConditionAtPath],
  );

  const addConstraint = useCallback(
    (conditionPath: string, constraint: Constraint) => {
      const pathArray = conditionPath.split(".");
      const condition = findConditionByPath(state.rule.conditions, pathArray);

      if (condition) {
        const conditionType = Object.keys(condition).find(
          (key) => key === "or" || key === "and" || key === "none",
        ) as ConditionType;

        if (conditionType) {
          const updatedCondition = {
            ...condition,
            [conditionType]: [...(condition[conditionType] || []), constraint],
          };
          updateCondition(conditionPath, updatedCondition);
        }
      }
    },
    [state.rule.conditions, findConditionByPath, updateCondition],
  );

  const updateConstraint = useCallback(
    (path: string, constraint: Constraint) => {
      const pathParts = path.split(".");
      const constraintIndex = Number.parseInt(pathParts.pop() || "0");
      const conditionPath = pathParts.join(".");

      const condition = findConditionByPath(state.rule.conditions, pathParts);

      if (condition) {
        const conditionType = Object.keys(condition).find(
          (key) => key === "or" || key === "and" || key === "none",
        ) as ConditionType;

        if (conditionType && condition[conditionType]) {
          const constraints = [...condition[conditionType]!];
          constraints[constraintIndex] = constraint;

          const updatedCondition = {
            ...condition,
            [conditionType]: constraints,
          };
          updateCondition(conditionPath, updatedCondition);
        }
      }
    },
    [state.rule.conditions, findConditionByPath, updateCondition],
  );

  const removeConstraint = useCallback(
    (path: string) => {
      const pathParts = path.split(".");
      const constraintIndex = Number.parseInt(pathParts.pop() || "0");
      const conditionPath = pathParts.join(".");

      const condition = findConditionByPath(state.rule.conditions, pathParts);

      if (condition) {
        const conditionType = Object.keys(condition).find(
          (key) => key === "or" || key === "and" || key === "none",
        ) as ConditionType;

        if (conditionType && condition[conditionType]) {
          const constraints = condition[conditionType]!.filter(
            (_, index) => index !== constraintIndex,
          );

          const updatedCondition = {
            ...condition,
            [conditionType]: constraints,
          };
          updateCondition(conditionPath, updatedCondition);
        }
      }
    },
    [state.rule.conditions, findConditionByPath, updateCondition],
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
