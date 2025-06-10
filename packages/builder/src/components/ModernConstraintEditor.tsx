import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Trash2, Info, GripVertical, Copy, AlertCircle } from "lucide-react";
import { DynamicFieldSelector } from "./DynamicFieldSelector";
import { OperatorSelector } from "./OperatorSelector";
import { OperatorHandler } from "./operators";
import {
  TooltipTrigger,
  TooltipProvider,
  TooltipContent,
  Tooltip,
} from "./ui/tooltip";
import type { Constraint } from "@usex/rule-engine";
import type { FieldConfig } from "../types";
import { getOperatorConfig } from "../utils/operators";
import { cn } from "../lib/utils";

interface ModernConstraintEditorProps {
  id: string;
  constraint: Constraint;
  fields?: FieldConfig[];
  sampleData?: Record<string, any>;
  customOperators?: Record<string, any>;
  onUpdate: (constraint: Constraint) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  readOnly?: boolean;
}

export const ModernConstraintEditor: React.FC<ModernConstraintEditorProps> = ({
  id,
  constraint,
  fields,
  sampleData,
  customOperators,
  onUpdate,
  onRemove,
  onDuplicate,
  readOnly = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: readOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const operatorConfig = getOperatorConfig(constraint.operator);
  const selectedField = fields?.find((f) => f.name === constraint.field);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("animate-fadeIn", isDragging && "opacity-50")}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex items-start gap-3">
            {!readOnly && (
              <button
                className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-5 w-5" />
              </button>
            )}

            <div className="flex-1 space-y-4">
              {/* Field and Operator Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`${id}-field`}
                      className="text-sm font-medium"
                    >
                      Field
                    </Label>
                    {selectedField?.description && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              {selectedField.description}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <DynamicFieldSelector
                    value={constraint.field}
                    onChange={(field) => onUpdate({ ...constraint, field })}
                    fields={fields}
                    sampleData={sampleData}
                    disabled={readOnly}
                    allowCustom={true}
                    showJsonPath={true}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor={`${id}-operator`}
                    className="text-sm font-medium"
                  >
                    Operator
                  </Label>
                  <OperatorSelector
                    value={constraint.operator}
                    onChange={(operator) =>
                      onUpdate({ ...constraint, operator })
                    }
                    field={constraint.field}
                    disabled={readOnly}
                    customOperators={customOperators}
                  />
                </div>
              </div>

              {/* Value Input */}
              {operatorConfig?.valueType !== "none" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`${id}-value`}
                      className="text-sm font-medium"
                    >
                      Value
                    </Label>
                    {operatorConfig?.valueType && (
                      <Badge variant="outline" className="text-xs">
                        {operatorConfig.valueType}
                      </Badge>
                    )}
                  </div>
                  <OperatorHandler
                    operator={constraint.operator}
                    value={constraint.value}
                    onChange={(value) => onUpdate({ ...constraint, value })}
                    field={constraint.field}
                    fieldType={selectedField?.type}
                    sampleData={sampleData}
                    disabled={readOnly}
                  />
                </div>
              )}

              {/* Error Message */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={`${id}-message`}
                    className="text-sm font-medium"
                  >
                    Error Message
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    Optional
                  </Badge>
                </div>
                <div className="relative">
                  <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id={`${id}-message`}
                    value={constraint.message || ""}
                    onChange={(e) =>
                      onUpdate({
                        ...constraint,
                        message: e.target.value || undefined,
                      })
                    }
                    placeholder="Custom error message when this rule fails"
                    disabled={readOnly}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            {!readOnly && (
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onDuplicate}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={onRemove}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Preview */}
          <Separator className="my-4" />
          <div className="text-xs text-muted-foreground font-mono">
            {constraint.field} {operatorConfig?.label || constraint.operator}
            {constraint.value !== undefined && (
              <> {JSON.stringify(constraint.value)}</>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
