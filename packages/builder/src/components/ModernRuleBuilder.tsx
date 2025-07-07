import React from "react";
import {
  useSensors,
  useSensor,
  PointerSensor,
  DragOverlay,
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import {
  verticalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { CardTitle, CardHeader, CardContent, Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { JsonViewer } from "./JsonViewer";
import { DraggableConditionGroup } from "./DraggableConditionGroup";
import { ModernConstraintEditor } from "./ModernConstraintEditor";
import { ThemeToggle } from "./ThemeToggle";
import { Undo2, Save, Redo2, Plus, HelpCircle, FileJson } from "lucide-react";
import { useRuleStore } from "../stores/rule-store";
import { useTheme } from "../hooks/use-theme";
import type { Constraint, ConditionType, Condition } from "@usex/rule-engine";
import type { FieldConfig } from "../types";
import { cn } from "../lib/utils";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";

interface ModernRuleBuilderProps {
  fields?: FieldConfig[];
  sampleData?: Record<string, any>;
  onChange?: (rule: any) => void;
  onSave?: (rule: any) => void | Promise<void>;
  onExport?: (rule: any, format: "json" | "yaml") => void;
  onImport?: (data: string, format: "json" | "yaml") => void;
  readOnly?: boolean;
  className?: string;
  showJsonViewer?: boolean;
  showToolbar?: boolean;
  enableDragDrop?: boolean;
  enableHistory?: boolean;
  maxNestingDepth?: number;
  customOperators?: Record<string, any>;
  theme?: "light" | "dark" | "system";
  labels?: {
    addGroup?: string;
    addRule?: string;
    removeGroup?: string;
    duplicateGroup?: string;
    or?: string;
    and?: string;
    none?: string;
    noRules?: string;
    importSuccess?: string;
    exportSuccess?: string;
    saveSuccess?: string;
  };
  colors?: {
    or?: string;
    and?: string;
    none?: string;
  };
}

export const ModernRuleBuilder: React.FC<ModernRuleBuilderProps> = ({
  fields = [],
  sampleData,
  onChange,
  onSave,
  onExport,
  onImport,
  readOnly = false,
  className,
  showJsonViewer = true,
  showToolbar = true,
  enableDragDrop = true,
  enableHistory = true,
  maxNestingDepth = 10,
  customOperators,
  theme: _propTheme = "system",
  labels = {},
  colors = {},
}) => {
  const { theme: _theme } = useTheme();
  const { rule, updateConditions, undo, redo, canUndo, canRedo } =
    useRuleStore();

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [expandedJson, setExpandedJson] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Merge default labels
  const mergedLabels = {
    addGroup: "Add Condition Group",
    addRule: "Add Rule",
    removeGroup: "Remove Group",
    duplicateGroup: "Duplicate Group",
    or: "OR",
    and: "AND",
    none: "NONE",
    noRules: "No rules defined yet. Start by adding a condition group.",
    importSuccess: "Rule imported successfully",
    exportSuccess: "Rule exported successfully",
    saveSuccess: "Rule saved successfully",
    ...labels,
  };

  const isConstraint = (item: any): item is Constraint => {
    return "field" in item && "operator" in item;
  };

  // Helper functions to find and update nested items
  const findItemPath = (
    items: any[],
    targetId: string,
    currentPath: number[] = [],
  ): number[] | null => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemPath = [...currentPath, i];

      if (isConstraint(item)) {
        // Check if this constraint matches the target ID
        if (`constraint-${itemPath.join("-")}` === targetId) {
          return itemPath;
        }
      } else {
        // Check if this condition matches the target ID
        if (`condition-${itemPath.join("-")}` === targetId) {
          return itemPath;
        }

        // Recursively search in nested conditions
        const type = Object.keys(item).find(
          (k) => k === "or" || k === "and" || k === "none",
        ) as ConditionType;

        if (type && item[type]) {
          const nestedPath = findItemPath(item[type], targetId, itemPath);
          if (nestedPath) return nestedPath;
        }
      }
    }
    return null;
  };

  const updateNestedItem = (
    conditions: Condition[],
    path: number[],
    updater: (item: any) => any,
  ): Condition[] => {
    const newConditions = [...conditions];
    let current: any = newConditions;

    for (let i = 0; i < path.length - 1; i++) {
      const index = path[i];
      if (i === 0) {
        current = current[index];
      } else {
        const type = Object.keys(current).find(
          (k) => k === "or" || k === "and" || k === "none",
        ) as ConditionType;
        if (type) {
          current = current[type][index];
        }
      }
    }

    const lastIndex = path[path.length - 1];
    const type = Object.keys(current).find(
      (k) => k === "or" || k === "and" || k === "none",
    ) as ConditionType;

    if (type) {
      current[type][lastIndex] = updater(current[type][lastIndex]);
    }

    return newConditions;
  };

  const removeNestedItem = (
    conditions: Condition[],
    path: number[],
  ): Condition[] => {
    const newConditions = [...conditions];
    let current: any = newConditions;

    for (let i = 0; i < path.length - 1; i++) {
      const index = path[i];
      if (i === 0) {
        current = current[index];
      } else {
        const type = Object.keys(current).find(
          (k) => k === "or" || k === "and" || k === "none",
        ) as ConditionType;
        if (type) {
          current = current[type][index];
        }
      }
    }

    const lastIndex = path[path.length - 1];
    const type = Object.keys(current).find(
      (k) => k === "or" || k === "and" || k === "none",
    ) as ConditionType;

    if (type) {
      current[type].splice(lastIndex, 1);
    }

    return newConditions;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Debounce onChange to prevent infinite loops
  const onChangeTimerRef = React.useRef<NodeJS.Timeout>(null);

  React.useEffect(() => {
    if (onChange) {
      // Clear previous timer
      if (onChangeTimerRef.current) {
        clearTimeout(onChangeTimerRef.current);
      }

      // Set new timer
      onChangeTimerRef.current = setTimeout(() => {
        onChange(rule);
      }, 100);
    }

    return () => {
      if (onChangeTimerRef.current) {
        clearTimeout(onChangeTimerRef.current);
      }
    };
  }, [rule]); // Intentionally omit onChange to prevent loops

  const conditions = React.useMemo(() => {
    if (!rule.conditions) return [];
    return Array.isArray(rule.conditions) ? rule.conditions : [rule.conditions];
  }, [rule.conditions]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      // Handle reordering logic here
      // This would involve updating the conditions array
    }
  };

  const addRootConditionGroup = (type: "or" | "and" | "none" = "or") => {
    const newCondition: Condition = { [type]: [] };
    updateConditions([...conditions, newCondition]);
    toast.success("Added new condition group");
  };

  const addConstraint = (conditionIndex: number) => {
    const newConstraint: Constraint = {
      field: "",
      operator: "equals" as any,
      value: "",
    };

    const updatedConditions = [...conditions];
    const condition = updatedConditions[conditionIndex];
    const type = Object.keys(condition).find(
      (k) => k === "or" || k === "and" || k === "none",
    ) as ConditionType;

    if (type) {
      condition[type] = [...(condition[type] || []), newConstraint];
      updateConditions(updatedConditions);
      toast.success("Added new rule");
    }
  };

  const addNestedGroup = (conditionIndex: number) => {
    const newCondition: Condition = { and: [] };

    const updatedConditions = [...conditions];
    const condition = updatedConditions[conditionIndex];
    const type = Object.keys(condition).find(
      (k) => k === "or" || k === "and" || k === "none",
    ) as ConditionType;

    if (type) {
      condition[type] = [...(condition[type] || []), newCondition];
      updateConditions(updatedConditions);
      toast.success("Added nested group");
    }
  };

  const updateCondition = (index: number, condition: Condition) => {
    const updatedConditions = [...conditions];
    updatedConditions[index] = condition;
    updateConditions(updatedConditions);
  };

  const removeCondition = (index: number) => {
    updateConditions(conditions.filter((_, i) => i !== index));
    toast.success("Removed condition group");
  };

  const duplicateCondition = (index: number) => {
    const conditionToDuplicate = conditions[index];
    const duplicated = JSON.parse(JSON.stringify(conditionToDuplicate));
    updateConditions([...conditions, duplicated]);
    toast.success("Duplicated condition group");
  };

  const renderItems = (items: any[], parentPath: string, depth: number = 1) => {
    return items.map((item, index) => {
      const itemId = `${parentPath}-${index}`;
      const currentDepth = depth + 1;

      // Check max nesting depth
      if (currentDepth > maxNestingDepth) {
        return (
          <Card key={itemId} className="border-destructive">
            <CardContent className="py-3">
              <p className="text-sm text-destructive">
                Maximum nesting depth ({maxNestingDepth}) reached
              </p>
            </CardContent>
          </Card>
        );
      }

      if (isConstraint(item)) {
        return (
          <ModernConstraintEditor
            key={itemId}
            id={`constraint-${itemId}`}
            constraint={item}
            fields={fields}
            sampleData={sampleData}
            customOperators={customOperators}
            onUpdate={(updated) => {
              const path = findItemPath(conditions, `constraint-${itemId}`);
              if (path) {
                const newConditions = updateNestedItem(
                  conditions,
                  path,
                  () => updated,
                );
                updateConditions(newConditions);
              }
            }}
            onRemove={() => {
              const path = findItemPath(conditions, `constraint-${itemId}`);
              if (path) {
                const newConditions = removeNestedItem(conditions, path);
                updateConditions(newConditions);
                toast.success("Rule removed");
              }
            }}
            onDuplicate={() => {
              const path = findItemPath(conditions, `constraint-${itemId}`);
              if (path) {
                const parentPath = path.slice(0, -1);
                let parent: any = conditions;

                for (let i = 0; i < parentPath.length; i++) {
                  if (i === 0) {
                    parent = parent[parentPath[i]];
                  } else {
                    const type = Object.keys(parent).find(
                      (k) => k === "or" || k === "and" || k === "none",
                    ) as ConditionType;
                    if (type) {
                      parent = parent[type][parentPath[i]];
                    }
                  }
                }

                const type = Object.keys(parent).find(
                  (k) => k === "or" || k === "and" || k === "none",
                ) as ConditionType;

                if (type) {
                  const duplicated = JSON.parse(JSON.stringify(item));
                  parent[type].push(duplicated);
                  updateConditions([...conditions]);
                  toast.success("Rule duplicated");
                }
              }
            }}
            readOnly={readOnly}
          />
        );
      }

      return (
        <DraggableConditionGroup
          key={itemId}
          id={`condition-${itemId}`}
          condition={item}
          depth={currentDepth}
          labels={mergedLabels}
          colors={colors}
          enableDragDrop={enableDragDrop}
          onUpdate={(updated) => {
            const path = findItemPath(conditions, `condition-${itemId}`);
            if (path) {
              const newConditions = updateNestedItem(
                conditions,
                path,
                () => updated,
              );
              updateConditions(newConditions);
            }
          }}
          onRemove={() => {
            const path = findItemPath(conditions, `condition-${itemId}`);
            if (path) {
              const newConditions = removeNestedItem(conditions, path);
              updateConditions(newConditions);
              toast.success(mergedLabels.removeGroup);
            }
          }}
          onDuplicate={() => {
            const path = findItemPath(conditions, `condition-${itemId}`);
            if (path) {
              const parentPath = path.slice(0, -1);

              if (parentPath.length === 0) {
                // Duplicating at root level
                const duplicated = JSON.parse(JSON.stringify(item));
                updateConditions([...conditions, duplicated]);
              } else {
                // Duplicating nested item
                let parent: any = conditions;

                for (let i = 0; i < parentPath.length; i++) {
                  if (i === 0) {
                    parent = parent[parentPath[i]];
                  } else {
                    const type = Object.keys(parent).find(
                      (k) => k === "or" || k === "and" || k === "none",
                    ) as ConditionType;
                    if (type) {
                      parent = parent[type][parentPath[i]];
                    }
                  }
                }

                const type = Object.keys(parent).find(
                  (k) => k === "or" || k === "and" || k === "none",
                ) as ConditionType;

                if (type) {
                  const duplicated = JSON.parse(JSON.stringify(item));
                  parent[type].push(duplicated);
                  updateConditions([...conditions]);
                }
              }
              toast.success(mergedLabels.duplicateGroup);
            }
          }}
          onAddConstraint={() => {
            const path = findItemPath(conditions, `condition-${itemId}`);
            if (path) {
              const newConstraint: Constraint = {
                field: "",
                operator: "equals" as any,
                value: "",
              };

              const newConditions = updateNestedItem(
                conditions,
                path,
                (item) => {
                  const type = Object.keys(item).find(
                    (k) => k === "or" || k === "and" || k === "none",
                  ) as ConditionType;

                  if (type) {
                    return {
                      ...item,
                      [type]: [...(item[type] || []), newConstraint],
                    };
                  }
                  return item;
                },
              );

              updateConditions(newConditions);
              toast.success(mergedLabels.addRule);
            }
          }}
          onAddGroup={() => {
            if (currentDepth >= maxNestingDepth) {
              toast.error(`Maximum nesting depth (${maxNestingDepth}) reached`);
              return;
            }

            const path = findItemPath(conditions, `condition-${itemId}`);
            if (path) {
              const newCondition: Condition = { and: [] };

              const newConditions = updateNestedItem(
                conditions,
                path,
                (item) => {
                  const type = Object.keys(item).find(
                    (k) => k === "or" || k === "and" || k === "none",
                  ) as ConditionType;

                  if (type) {
                    return {
                      ...item,
                      [type]: [...(item[type] || []), newCondition],
                    };
                  }
                  return item;
                },
              );

              updateConditions(newConditions);
              toast.success("Added nested group");
            }
          }}
          readOnly={readOnly}
        >
          {renderItems(
            item.or || item.and || item.none || [],
            itemId,
            currentDepth,
          )}
        </DraggableConditionGroup>
      );
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Toaster position="top-center" />

      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Rule Builder</CardTitle>
              <Badge variant="outline">{conditions.length} groups</Badge>
            </div>
            <div className="flex items-center gap-2">
              {showToolbar && (
                <>
                  {enableHistory && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => undo()}
                        disabled={!canUndo() || readOnly}
                        title="Undo"
                      >
                        <Undo2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => redo()}
                        disabled={!canRedo() || readOnly}
                        title="Redo"
                      >
                        <Redo2 className="h-4 w-4" />
                      </Button>
                      <Separator orientation="vertical" className="h-6" />
                    </>
                  )}
                  {onSave && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          setIsSaving(true);
                          try {
                            await onSave(rule);
                            toast.success(mergedLabels.saveSuccess);
                          } catch {
                            toast.error("Failed to save rule");
                          } finally {
                            setIsSaving(false);
                          }
                        }}
                        disabled={readOnly || isSaving}
                        title="Save"
                      >
                        <Save
                          className={cn("h-4 w-4", isSaving && "animate-pulse")}
                        />
                      </Button>
                      <Separator orientation="vertical" className="h-6" />
                    </>
                  )}
                  {onExport && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          onExport(rule, "json");
                          toast.success(mergedLabels.exportSuccess);
                        }}
                        title="Export JSON"
                      >
                        <FileJson className="h-4 w-4" />
                      </Button>
                      <Separator orientation="vertical" className="h-6" />
                    </>
                  )}
                  <Button variant="ghost" size="icon" title="Help">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Builder Area */}
        <div className="lg:col-span-2 space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={conditions.map((_, i) => `condition-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              {conditions.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">
                      {mergedLabels.noRules}
                    </p>
                    {!readOnly && (
                      <div className="flex justify-center gap-2">
                        <Button onClick={() => addRootConditionGroup("or")}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add {mergedLabels.or} Group
                        </Button>
                        <Button
                          onClick={() => addRootConditionGroup("and")}
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add {mergedLabels.and} Group
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  {conditions.map((condition, index) => (
                    <DraggableConditionGroup
                      key={`condition-${index}`}
                      id={`condition-${index}`}
                      condition={condition}
                      depth={0}
                      onUpdate={(updated) => updateCondition(index, updated)}
                      onRemove={() => removeCondition(index)}
                      onDuplicate={() => duplicateCondition(index)}
                      onAddConstraint={() => addConstraint(index)}
                      onAddGroup={() => addNestedGroup(index)}
                      readOnly={readOnly}
                    >
                      {renderItems(
                        condition.or || condition.and || condition.none || [],
                        `condition-${index}`,
                        0,
                      )}
                    </DraggableConditionGroup>
                  ))}
                  {!readOnly && (
                    <Button
                      onClick={() => addRootConditionGroup()}
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {mergedLabels.addGroup}
                    </Button>
                  )}
                </>
              )}
            </SortableContext>

            <DragOverlay>
              {activeId ? (
                <div className="opacity-50">
                  {/* Render the dragged item */}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* JSON Viewer */}
        {showJsonViewer && (
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <JsonViewer
                rule={rule}
                onImport={(imported) => {
                  if (onImport) {
                    onImport(JSON.stringify(imported), "json");
                  }
                  updateConditions(imported.conditions);
                  toast.success(mergedLabels.importSuccess);
                }}
                expanded={expandedJson}
                onExpandedChange={setExpandedJson}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
