import React from "react";
import { CardHeader, CardContent, Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
  Select,
} from "./ui/select";
import { Label } from "./ui/label";
import { Trash2, Plus, ChevronRight, ChevronDown } from "lucide-react";
import { ConstraintEditor } from "./ConstraintEditor";
import { useRuleBuilder } from "../stores/unified-rule-store";
import { ConditionTypes } from "@usex/rule-engine";
import type { Constraint, ConditionType, Condition } from "@usex/rule-engine";
import type { ConditionGroupProps } from "../types";
import { cn } from "../lib/utils";

// Extract default props to prevent infinite re-renders
const defaultFields: ConditionGroupProps["fields"] = [];
const defaultOperators: ConditionGroupProps["operators"] = [];

const isConstraint = (item: Constraint | Condition): item is Constraint => {
  return "field" in item && "operator" in item;
};

export const ConditionGroup: React.FC<ConditionGroupProps> = ({
  condition,
  path,
  depth = 0,
  readOnly = false,
  fields = defaultFields,
  operators = defaultOperators,
  onRemove,
}) => {
  const {
    addConstraint,
    removeConstraint,
    addCondition,
    updateConstraint,
    updateCondition,
    removeCondition,
  } = useRuleBuilder();
  const [collapsed, setCollapsed] = React.useState(false);

  const conditionType = React.useMemo(() => {
    if (condition.or) return ConditionTypes.OR;
    if (condition.and) return ConditionTypes.AND;
    if (condition.none) return ConditionTypes.NONE;
    return ConditionTypes.OR;
  }, [condition]);

  const items = React.useMemo(() => {
    return condition[conditionType] || [];
  }, [condition, conditionType]);

  const handleConditionTypeChange = (newType: ConditionType) => {
    if (newType === conditionType) return;

    const newCondition: Condition = {
      [newType]: items,
      result: condition.result,
    };

    // Update condition directly through store
    updateCondition(path, newCondition);
  };

  const handleAddConstraint = () => {
    const newConstraint: Constraint = {
      field: "",
      operator: "equals" as any,
      value: "",
    };
    // Add constraint to this condition group by appending the condition type to the path
    const constraintPath = path ? `${path}.${conditionType}` : conditionType;
    addConstraint(constraintPath, newConstraint);
  };

  const handleAddConditionGroup = () => {
    // Add new condition group to this condition group by appending the condition type to the path
    const parentPath = path ? `${path}.${conditionType}` : conditionType;
    addCondition(parentPath, ConditionTypes.AND);
  };

  const handleUpdateItem = (index: number, item: Constraint | Condition) => {
    if (isConstraint(item)) {
      // Update constraint directly through store
      const itemPath = path
        ? `${path}.${conditionType}.${index}`
        : `${conditionType}.${index}`;
      updateConstraint(itemPath, item);
    } else {
      // Update condition directly through store
      const itemPath = path
        ? `${path}.${conditionType}.${index}`
        : `${conditionType}.${index}`;
      updateCondition(itemPath, item);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (isConstraint(items[index])) {
      // Remove constraint using store function
      const itemPath = path
        ? `${path}.${conditionType}.${index}`
        : `${conditionType}.${index}`;
      removeConstraint(itemPath);
    } else {
      // Remove condition using store function
      const itemPath = path
        ? `${path}.${conditionType}.${index}`
        : `${conditionType}.${index}`;
      removeCondition(itemPath);
    }
  };

  const conditionTypeColor = {
    [ConditionTypes.OR]:
      "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    [ConditionTypes.AND]:
      "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    [ConditionTypes.NONE]:
      "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
  };

  return (
    <Card
      className={cn(
        "rounded-lg shadow-sm border-2",
        conditionTypeColor[conditionType],
        depth > 0 && "ml-8",
      )}
    >
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="p-0 h-auto"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Label className="text-gray-900 dark:text-gray-100 font-medium">
                Condition Type:
              </Label>
              <Select
                value={conditionType}
                onValueChange={handleConditionTypeChange}
                disabled={readOnly}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ConditionTypes.OR}>OR</SelectItem>
                  <SelectItem value={ConditionTypes.AND}>AND</SelectItem>
                  <SelectItem value={ConditionTypes.NONE}>NONE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!readOnly && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddConstraint}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddConditionGroup}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Group
                </Button>
              </>
            )}
            {!readOnly && onRemove && depth > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="p-4 pt-0 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No rules in this group. Add a rule or condition group to get
              started.
            </div>
          ) : (
            items.map((item, index) => {
              const itemPath = path
                ? `${path}.${conditionType}.${index}`
                : `${conditionType}.${index}`;

              if (isConstraint(item)) {
                return (
                  <ConstraintEditor
                    key={itemPath}
                    constraint={item}
                    path={itemPath}
                    fields={fields}
                    operators={operators}
                    readOnly={readOnly}
                    onUpdate={(constraint) =>
                      updateConstraint(itemPath, constraint)
                    }
                    onRemove={() => handleRemoveItem(index)}
                  />
                );
              } else {
                return (
                  <ConditionGroup
                    key={itemPath}
                    condition={item}
                    path={itemPath}
                    depth={depth + 1}
                    fields={fields}
                    operators={operators}
                    readOnly={readOnly}
                    onUpdate={(condition) => handleUpdateItem(index, condition)}
                    onRemove={() => handleRemoveItem(index)}
                  />
                );
              }
            })
          )}
        </CardContent>
      )}
    </Card>
  );
};
