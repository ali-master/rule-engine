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
    or: colors.or || "text-blue-600 bg-blue-50 border-blue-200",
    and: colors.and || "text-green-600 bg-green-50 border-green-200",
    none: colors.none || "text-purple-600 bg-purple-50 border-purple-200",
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
          "transition-all",
          "hover:shadow-md",
          depth === 0 && "border-2",
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
                    variant="ghost"
                    size="sm"
                    onClick={addConstraint}
                    title="Add rule"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">Rule</span>
                  </Button>
                  {depth < maxNestingDepth && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addNestedGroup}
                      title="Add nested group"
                    >
                      <GitBranch className="h-4 w-4" />
                      <span className="ml-1 hidden sm:inline">Group</span>
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
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No conditions yet.
                  {!readOnly && (
                    <div className="mt-2 flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addConstraint}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Rule
                      </Button>
                      {depth < maxNestingDepth && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addNestedGroup}
                        >
                          <Layers className="h-4 w-4 mr-1" />
                          Add Group
                        </Button>
                      )}
                    </div>
                  )}
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