import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { RuleType, EngineResult, Condition } from "@usex/rule-engine";

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

interface EnhancedRuleStore {
  // State
  rule: RuleType;
  history: HistoryEntry[];
  historyIndex: number;
  expandedGroups: Set<string>;

  // Actions
  setRule: (rule: RuleType, action?: string, description?: string) => void;
  updateConditions: (
    conditions: Condition | Condition[],
    action?: string,
    description?: string,
  ) => void;
  updateDefaultResult: (result: EngineResult | undefined) => void;

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

  // Expand/Collapse
  toggleGroupExpanded: (path: string) => void;
  isGroupExpanded: (path: string) => boolean;
  expandAll: () => void;
  collapseAll: () => void;

  // Helpers
  addToHistory: (
    rule: RuleType,
    action: string,
    description: string,
    changes?: any,
  ) => void;
  clearHistory: () => void;
}

const MAX_HISTORY = 100;

export const useEnhancedRuleStore = create<EnhancedRuleStore>()(
  devtools(
    (set, get) => ({
      rule: { conditions: [] },
      history: [
        {
          rule: { conditions: [] },
          timestamp: Date.now(),
          action: "Initialize",
          description: "Initial empty rule",
        },
      ],
      historyIndex: 0,
      expandedGroups: new Set<string>(),

      setRule: (rule, action = "Set Rule", description = "Rule updated") => {
        const currentRule = get().rule;
        get().addToHistory(rule, action, description, {
          before: currentRule,
          after: rule,
        });
        set({ rule });
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
        set({ rule: newRule });
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
        set({ rule: newRule });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          set({
            historyIndex: newIndex,
            rule: history[newIndex].rule,
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
        // For expandAll, we create a very large set that will match any path
        const allPaths = new Set<string>();
        // Add common path patterns
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            allPaths.add(`${i}`);
            allPaths.add(`${i}-${j}`);
            for (let k = 0; k < 10; k++) {
              allPaths.add(`${i}-${j}-${k}`);
            }
          }
        }
        set({ expandedGroups: allPaths });
      },

      collapseAll: () => {
        set({ expandedGroups: new Set<string>() });
      },

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
      name: "rule-builder-store",
    },
  ),
);
