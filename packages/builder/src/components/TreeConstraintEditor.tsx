import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Trash2, Copy, Info, AlertCircle } from "lucide-react";
import { DynamicFieldSelector } from "./DynamicFieldSelector";
import { OperatorSelector } from "./OperatorSelector";
import { SmartValueInput } from "./inputs/SmartValueInput";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import type { Constraint } from "@usex/rule-engine";
import type { FieldConfig } from "../types";
import { getOperatorConfig } from "../utils/operators";
import { cn } from "../lib/utils";

interface TreeConstraintEditorProps {
  constraint: Constraint;
  path?: number[];
  fields?: FieldConfig[];
  sampleData?: Record<string, any>;
  customOperators?: Record<string, any>;
  onUpdate: (constraint: Constraint) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  readOnly?: boolean;
}

export const TreeConstraintEditor: React.FC<TreeConstraintEditorProps> = ({
  constraint,
  path,
  fields,
  sampleData,
  customOperators,
  onUpdate,
  onRemove,
  onDuplicate,
  readOnly = false,
}) => {
  const [localConstraint, setLocalConstraint] = useState(constraint);
  const [isFieldValid, setIsFieldValid] = useState(true);
  const [isValueValid, setIsValueValid] = useState(true);

  // Update local state when constraint prop changes
  useEffect(() => {
    setLocalConstraint(constraint);
  }, [constraint]);

  const operatorConfig = getOperatorConfig(localConstraint.operator);
  const selectedField = fields?.find((f) => f.name === localConstraint.field);

  const handleFieldChange = (field: string) => {
    const updated = { ...localConstraint, field };
    setLocalConstraint(updated);
    onUpdate(updated);
    setIsFieldValid(!!field);
  };

  const handleOperatorChange = (operator: any) => {
    const updated = { ...localConstraint, operator };
    
    // Reset value if operator changes to one that doesn't need a value
    const newOperatorConfig = getOperatorConfig(operator);
    if (newOperatorConfig?.valueType === 'none') {
      updated.value = undefined;
    }
    
    setLocalConstraint(updated);
    onUpdate(updated);
  };

  const handleValueChange = (value: any) => {
    const updated = { ...localConstraint, value };
    setLocalConstraint(updated);
    onUpdate(updated);
    setIsValueValid(value !== undefined && value !== '');
  };

  const handleMessageChange = (message: string) => {
    const updated = { 
      ...localConstraint, 
      message: message || undefined 
    };
    setLocalConstraint(updated);
    onUpdate(updated);
  };

  // Validate constraint
  const needsValue = operatorConfig?.valueType !== 'none';
  const isValid = isFieldValid && (!needsValue || isValueValid);

  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      "hover:shadow-sm",
      !isValid && "border-destructive"
    )}>
      <div className="p-4 space-y-4">
        {/* Field and Operator Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">
                Field
              </Label>
              {selectedField?.description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{selectedField.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <DynamicFieldSelector
              value={localConstraint.field}
              onChange={handleFieldChange}
              fields={fields}
              sampleData={sampleData}
              disabled={readOnly}
              allowCustom={true}
              showJsonPath={true}
            />
            {!isFieldValid && (
              <p className="text-xs text-destructive">Field is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Operator
            </Label>
            <OperatorSelector
              value={localConstraint.operator}
              onChange={handleOperatorChange}
              field={localConstraint.field}
              fieldType={selectedField?.type}
              disabled={readOnly}
              customOperators={customOperators}
            />
          </div>
        </div>

        {/* Value Input */}
        {operatorConfig?.valueType !== "none" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">
                Value
              </Label>
              {operatorConfig?.valueType && (
                <Badge variant="outline" className="text-xs">
                  {operatorConfig.valueType}
                </Badge>
              )}
            </div>
            <SmartValueInput
              value={localConstraint.value}
              onChange={handleValueChange}
              operator={localConstraint.operator}
              field={selectedField}
              sampleData={sampleData}
              disabled={readOnly}
            />
            {!isValueValid && needsValue && (
              <p className="text-xs text-destructive">Value is required</p>
            )}
          </div>
        )}

        {/* Error Message */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">
              Error Message
            </Label>
            <Badge variant="outline" className="text-xs">
              Optional
            </Badge>
          </div>
          <div className="relative">
            <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={localConstraint.message || ""}
              onChange={(e) => handleMessageChange(e.target.value)}
              placeholder="Custom error message when this rule fails"
              disabled={readOnly}
              className="pl-10"
            />
          </div>
        </div>

        {/* Actions and Preview */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground font-mono">
            {localConstraint.field} {operatorConfig?.label || localConstraint.operator}
            {localConstraint.value !== undefined && (
              <> {JSON.stringify(localConstraint.value)}</>
            )}
          </div>

          {!readOnly && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDuplicate}
                title="Duplicate"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-destructive hover:text-destructive"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};