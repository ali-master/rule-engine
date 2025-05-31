import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Copy,
  Layers,
  GitBranch,
} from "lucide-react";
import { TreeConstraintEditor } from "./TreeConstraintEditor";
import type { Condition, Constraint, ConditionType } from "@usex/rule-engine";
import type { FieldConfig } from "../types";
import { cn } from "../lib/utils";
import { toast } from "sonner";

interface TreeConditionGroupProps {
  condition: Condition;
  path: number[];
  depth: number;
  fields?: FieldConfig[];
  sampleData?: Record<string, any>;
  customOperators?: Record<string, any>;
  maxNestingDepth?: number;
  onUpdate: (condition: Condition) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  readOnly?: boolean;
  labels?: {
    or?: string;
    and?: string;
    none?: string;
    addGroup?: string;
    addRule?: string;
    removeGroup?: string;
    duplicateGroup?: string;
  };
  colors?: {
    or?: string;
    and?: string;
    none?: string;
  };
}

export const TreeConditionGroup: React.FC<TreeConditionGroupProps> = ({
  condition,
  path,
  depth,
  fields = [],
  sampleData,
  customOperators,
  maxNestingDepth = 10,
  onUpdate,
  onRemove,
  onDuplicate,
  readOnly = false,
  labels = {},
  colors = {},
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const conditionType = Object.keys(condition).find(
    (key) => key === "or" || key === "and" || key === "none"
  ) as ConditionType;

  const items = condition[conditionType] || [];

  const isConstraint = (item: any): item is Constraint => {
    return "field" in item && "operator" in item;
  };

  const typeColors = {
    or: colors.or || "border-rule-or/40 bg-rule-or-bg/50",
    and: colors.and || "border-rule-and/40 bg-rule-and-bg/50",
    none: colors.none || "border-rule-none/40 bg-rule-none-bg/50",
  };

  const typeLabels = {
    or: labels.or || "OR",
    and: labels.and || "AND",
    none: labels.none || "NONE",
  };

  const handleTypeChange = (newType: ConditionType) => {
    const newCondition = {
      [newType]: items,
    } as Condition;
    onUpdate(newCondition);
  };

  const addConstraint = () => {
    const newConstraint: Constraint = {
      field: "",
      operator: "equals" as any,
      value: "",
    };

    const updatedItems = [...items, newConstraint];
    onUpdate({ [conditionType]: updatedItems } as Condition);
    toast.success("Added new rule");
  };

  const addNestedGroup = () => {
    if (depth >= maxNestingDepth) {
      toast.error(`Maximum nesting depth (${maxNestingDepth}) reached`);
      return;
    }

    const newCondition: Condition = { and: [] };
    const updatedItems = [...items, newCondition];
    onUpdate({ [conditionType]: updatedItems } as Condition);
    toast.success("Added nested group");
  };

  const updateItem = (index: number, updatedItem: Constraint | Condition) => {
    const updatedItems = [...items];
    updatedItems[index] = updatedItem;
    onUpdate({ [conditionType]: updatedItems } as Condition);
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onUpdate({ [conditionType]: updatedItems } as Condition);
    toast.success("Removed item");
  };

  const duplicateItem = (index: number) => {
    const itemToDuplicate = items[index];
    const duplicated = JSON.parse(JSON.stringify(itemToDuplicate));
    const updatedItems = [...items];
    updatedItems.splice(index + 1, 0, duplicated);
    onUpdate({ [conditionType]: updatedItems } as Condition);
    toast.success("Duplicated item");
  };

  // Calculate indentation based on depth
  const indentClass = cn({
    "ml-0": depth === 0,
    "ml-4": depth === 1,
    "ml-8": depth === 2,
    "ml-12": depth === 3,
    "ml-16": depth >= 4,
  });

  return (
    <div className={cn("relative", indentClass)}>
      {/* Connection line for nested items */}
      {depth > 0 && (
        <div
          className="absolute left-[-16px] top-0 bottom-0 w-px bg-border"
          aria-hidden="true"
        />
      )}

      <Card
        className={cn(
          "transition-all duration-200",
          "hover:shadow-sm",
          depth === 0 ? "border-2" : "border",
          depth === 0 && typeColors[conditionType]
        )}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Select
                  value={conditionType}
                  onValueChange={(value) =>
                    handleTypeChange(value as ConditionType)
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger className="h-8 w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="or">{typeLabels.or}</SelectItem>
                    <SelectItem value="and">{typeLabels.and}</SelectItem>
                    <SelectItem value="none">{typeLabels.none}</SelectItem>
                  </SelectContent>
                </Select>

                <Badge variant="outline" className="text-xs">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </Badge>

                {depth > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Level {depth + 1}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!readOnly && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addConstraint}
                    title="Add rule"
                    className="h-8"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="ml-1.5 hidden sm:inline">Rule</span>
                  </Button>
                  {depth < maxNestingDepth && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addNestedGroup}
                      title="Add nested group"
                      className="h-8"
                    >
                      <GitBranch className="h-3.5 w-3.5" />
                      <span className="ml-1.5 hidden sm:inline">Group</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDuplicate}
                    title="Duplicate group"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemove}
                    className="text-destructive hover:text-destructive"
                    title="Remove group"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          {isExpanded && (
            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 py-8">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      No conditions yet. Start by adding a rule or group.
                    </p>
                    {!readOnly && (
                      <div className="flex justify-center gap-3">
                        <Button
                          variant="secondary"
                          size="default"
                          onClick={addConstraint}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Rule
                        </Button>
                        {depth < maxNestingDepth && (
                          <Button
                            variant="secondary"
                            size="default"
                            onClick={addNestedGroup}
                            className="gap-2"
                          >
                            <Layers className="h-4 w-4" />
                            Add Group
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={`${path.join("-")}-${index}`} className="relative">
                    {/* Connection dot */}
                    {depth > 0 && (
                      <div
                        className="absolute left-[-20px] top-4 w-2 h-2 bg-border rounded-full"
                        aria-hidden="true"
                      />
                    )}

                    {isConstraint(item) ? (
                      <TreeConstraintEditor
                        constraint={item}
                        path={[...path, index]}
                        fields={fields}
                        sampleData={sampleData}
                        customOperators={customOperators}
                        onUpdate={(updated) => updateItem(index, updated)}
                        onRemove={() => removeItem(index)}
                        onDuplicate={() => duplicateItem(index)}
                        readOnly={readOnly}
                      />
                    ) : (
                      <TreeConditionGroup
                        condition={item}
                        path={[...path, index]}
                        depth={depth + 1}
                        fields={fields}
                        sampleData={sampleData}
                        customOperators={customOperators}
                        maxNestingDepth={maxNestingDepth}
                        onUpdate={(updated) => updateItem(index, updated)}
                        onRemove={() => removeItem(index)}
                        onDuplicate={() => duplicateItem(index)}
                        readOnly={readOnly}
                        labels={labels}
                        colors={colors}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
