import React, { useState, useCallback } from "react";
import { CardContent, Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Undo2,
  Sparkles,
  Settings,
  Redo2,
  Plus,
  Layers,
  Download,
  ChevronDown,
} from "lucide-react";
import { ConditionGroup } from "./condition-group";
import { RuleImportModal } from "./rule-import-modal";
import { HistoryViewer } from "./history-viewer";
import { useRuleBuilder } from "../stores/unified-rule-store";
import { ConditionTypes } from "@usex/rule-engine";
import type { RuleEditorProps } from "../types";
import { cn } from "../lib/utils";

// Extract default props to prevent infinite re-renders
const defaultFields: any[] = [];
const defaultOperators: any[] = [];

/**
 * Modern Rule Editor with enhanced UX and mobile-first design
 *
 * Design Features:
 * - Progressive disclosure of complexity
 * - Clear visual hierarchy with proper spacing
 * - Mobile-optimized toolbar with smart grouping
 * - Enhanced empty state with better onboarding
 * - Consistent dark mode support
 * - Improved accessibility
 */
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

  const [showAdvancedTools, setShowAdvancedTools] = useState(false);

  // Determine if we have conditions to display
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

  // Add root condition handler
  const handleAddRootCondition = useCallback(() => {
    addCondition("", ConditionTypes.AND);
  }, [addCondition]);

  // Export rule as JSON
  const handleExport = useCallback(() => {
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
  }, [exportRule]);

  // Get condition statistics for display
  const conditionStats = React.useMemo(() => {
    if (!hasConditions) return null;

    let totalConditions = 0;
    let totalConstraints = 0;

    const countConditions = (condition: any): void => {
      if (Array.isArray(condition)) {
        condition.forEach(countConditions);
        return;
      }

      if (condition?.and) {
        totalConditions++;
        condition.and.forEach((item: any) => {
          if (item.field) totalConstraints++;
          else countConditions(item);
        });
      }
      if (condition?.or) {
        totalConditions++;
        condition.or.forEach((item: any) => {
          if (item.field) totalConstraints++;
          else countConditions(item);
        });
      }
      if (condition?.none) {
        totalConditions++;
        condition.none.forEach((item: any) => {
          if (item.field) totalConstraints++;
          else countConditions(item);
        });
      }
    };

    countConditions(state.rule.conditions);
    return { totalConditions, totalConstraints };
  }, [state.rule.conditions, hasConditions]);

  return (
    <Card className={cn("h-full flex flex-col shadow-sm", className)}>
      {/* Modern Header with Progressive Disclosure */}
      <div className="flex flex-col gap-3 p-4 sm:p-6 border-b bg-gradient-to-r from-background via-muted/5 to-background">
        {/* Title and Stats Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Layers className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-foreground">
                  Rule Editor
                </h2>
                {conditionStats && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {conditionStats.totalConditions} groups
                    </Badge>
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      {conditionStats.totalConstraints} rules
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions - Always Visible */}
          {!readOnly && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={!canUndo()}
                title="Undo (Ctrl+Z)"
                className="h-8 w-8 p-0"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={!canRedo()}
                title="Redo (Ctrl+Y)"
                className="h-8 w-8 p-0"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedTools(!showAdvancedTools)}
                className="h-8 px-2"
              >
                <Settings className="h-4 w-4" />
                <ChevronDown
                  className={cn(
                    "h-3 w-3 ml-1 transition-transform duration-200",
                    showAdvancedTools && "rotate-180",
                  )}
                />
              </Button>
            </div>
          )}
        </div>

        {/* Advanced Tools - Progressive Disclosure */}
        {!readOnly && showAdvancedTools && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
            <div className="flex items-center gap-1">
              <HistoryViewer />
              <RuleImportModal onImport={importRule} />
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                title="Export Rule JSON"
                className="h-8"
              >
                <Download className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <CardContent className="flex-1 min-h-0 p-4 sm:p-6">
        {!hasConditions ? (
          /* Enhanced Empty State */
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md mx-auto space-y-6">
              {/* Visual Element */}
              <div className="relative">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 border-2 border-dashed border-primary/30 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-primary/70" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent/20 border border-accent/40" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-secondary/20 border border-secondary/40" />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">
                  Create Your First Rule
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Start building powerful business logic with condition groups.
                  Add rules that evaluate data and trigger actions based on your
                  criteria.
                </p>
              </div>

              {/* Call to Action */}
              {!readOnly && (
                <div className="space-y-3">
                  <Button
                    onClick={handleAddRootCondition}
                    size="lg"
                    className="h-11 px-6 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Condition Group
                  </Button>

                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500/60" />
                      <span>AND logic</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500/60" />
                      <span>OR logic</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500/60" />
                      <span>NOT logic</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Condition Groups */
          <div className="h-full overflow-auto">
            <div className="space-y-4 pb-4">
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
            </div>
          </div>
        )}
      </CardContent>

      {/* Status Bar for Desktop */}
      {hasConditions && (
        <div className="hidden sm:flex items-center justify-between px-6 py-3 border-t bg-muted/20 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Status: Active</span>
            {state.isDirty && (
              <Badge variant="secondary" className="text-xs">
                Unsaved changes
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>Last modified: Now</span>
            <span>•</span>
            <span>{JSON.stringify(state.rule).length} bytes</span>
          </div>
        </div>
      )}
    </Card>
  );
};
