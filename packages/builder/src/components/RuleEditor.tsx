import React from "react";
import { CardTitle, CardHeader, CardContent, Card } from "./ui/card";
import { Button } from "./ui/button";
import { Undo2, Redo2, Plus, Download } from "lucide-react";
import { ConditionGroup } from "./ConditionGroup";
import { RuleImportModal } from "./RuleImportModal";
import { HistoryViewer } from "./HistoryViewer";
import { useRuleBuilder } from "../stores/unified-rule-store";
import { ConditionTypes } from "@usex/rule-engine";
import type { RuleEditorProps } from "../types";
import { cn } from "../lib/utils";

// Extract default props to prevent infinite re-renders
const defaultFields: any[] = [];
const defaultOperators: any[] = [];

export const RuleEditor: React.FC<RuleEditorProps> = ({
  className,
  readOnly = false,
  fields = defaultFields,
  operators = defaultOperators,
}) => {
  const {
    state,
    addCondition,
    updateCondition,
    importRule,
    exportRule,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useRuleBuilder();

  const hasConditions = React.useMemo(() => {
    if (!state.rule.conditions) {
      return false;
    }

    const conditions = state.rule.conditions;

    // Handle both single condition and array of conditions
    if (Array.isArray(conditions)) {
      return conditions.length > 0;
    }

    // Single condition object
    const condition = conditions as any;

    // Check if the conditions object is empty (no keys)
    if (Object.keys(condition).length === 0) {
      return false;
    }

    // If there are condition type keys (and, or, none), we have conditions
    // even if the arrays are empty (user can add constraints to them)
    return !!(
      condition.and !== undefined ||
      condition.or !== undefined ||
      condition.none !== undefined
    );
  }, [state.rule.conditions]);

  const handleAddRootCondition = () => {
    addCondition("", ConditionTypes.AND);
  };

  const handleExport = () => {
    const rule = exportRule();
    const json = JSON.stringify(rule, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rule-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900 dark:text-white">
            Rule Editor
          </CardTitle>
          {!readOnly && (
            <div className="flex items-center gap-2">
              {/* History Controls */}
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={!canUndo()}
                title="Undo"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={!canRedo()}
                title="Redo"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
              <HistoryViewer />

              {/* Import/Export Controls */}
              <RuleImportModal onImport={importRule} />
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                title="Export Rule JSON"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasConditions ? (
          <div className="text-center py-12 rounded-lg bg-gray-50 dark:bg-background/50 border border-dashed border-gray-300 dark:border-gray-600">
            <p className="text-muted-foreground mb-4">
              No conditions defined. Start by adding a condition group.
            </p>
            {!readOnly && (
              <Button onClick={handleAddRootCondition} className="shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Condition Group
              </Button>
            )}
          </div>
        ) : (
          <>
            <ConditionGroup
              key="root-condition"
              condition={state.rule.conditions as any}
              path=""
              fields={fields}
              operators={operators}
              readOnly={readOnly}
              onUpdate={(updatedCondition) =>
                updateCondition("", updatedCondition)
              }
              onRemove={() => {
                // Reset to empty condition
                addCondition("", ConditionTypes.AND);
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
