import { useEffect, useCallback } from "react";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description?: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        // Check modifier keys
        const ctrlOrCmd = shortcut.ctrl || shortcut.cmd;
        const isCtrlOrCmdPressed = ctrlOrCmd
          ? event.ctrlKey || event.metaKey
          : !(event.ctrlKey || event.metaKey);
        const isShiftPressed = shortcut.shift
          ? event.shiftKey
          : !event.shiftKey;
        const isAltPressed = shortcut.alt ? event.altKey : !event.altKey;

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          isCtrlOrCmdPressed &&
          isShiftPressed &&
          isAltPressed
        ) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    },
    [shortcuts],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
};

// Common shortcuts
export const commonShortcuts = {
  undo: { key: "z", ctrl: true },
  redo: { key: "y", ctrl: true },
  redoAlt: { key: "z", ctrl: true, shift: true },
  save: { key: "s", ctrl: true },
  expandAll: { key: "e", ctrl: true, shift: true },
  collapseAll: { key: "c", ctrl: true, shift: true },
  addRule: { key: "r", ctrl: true },
  addGroup: { key: "g", ctrl: true },
  delete: { key: "Delete" },
  duplicate: { key: "d", ctrl: true },
  help: { key: "?", shift: true },
  search: { key: "f", ctrl: true },
  test: { key: "t", ctrl: true },
};
