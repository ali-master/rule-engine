import { create } from "zustand";
import type { RuleType, Condition, EngineResult } from "@usex/rule-engine";

interface RuleStore {
  // State
  rule: RuleType;
  history: RuleType[];
  historyIndex: number;

  // Actions
  setRule: (rule: RuleType) => void;
  updateConditions: (conditions: Condition | Condition[]) => void;
  updateDefaultResult: (result: EngineResult | undefined) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Helpers
  addToHistory: (rule: RuleType) => void;
  clearHistory: () => void;
}

const MAX_HISTORY = 50;

export const useRuleStore = create<RuleStore>((set, get) => ({
  rule: { conditions: [] },
  history: [{ conditions: [] }],
  historyIndex: 0,

  setRule: (rule) => {
    set((state) => {
      state.addToHistory(rule);
      return { rule };
    });
  },

  updateConditions: (conditions) => {
    set((state) => {
      const newRule = { ...state.rule, conditions };
      state.addToHistory(newRule);
      return { rule: newRule };
    });
  },

  updateDefaultResult: (result) => {
    set((state) => {
      const newRule = { ...state.rule, default: result };
      state.addToHistory(newRule);
      return { rule: newRule };
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        historyIndex: newIndex,
        rule: history[newIndex],
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        historyIndex: newIndex,
        rule: history[newIndex],
      });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  addToHistory: (rule) => {
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(rule);

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
    set({
      history: [get().rule],
      historyIndex: 0,
    });
  },
}));
