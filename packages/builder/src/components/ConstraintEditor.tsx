import React from "react";
import { CardContent, Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Trash2, AlertCircle } from "lucide-react";
import { FieldSelector } from "./FieldSelector";
import { OperatorSelector } from "./OperatorSelector";
import { ValueInput } from "./ValueInput";
import type { ConstraintEditorProps } from "../types";
import { cn } from "../lib/utils";

export const ConstraintEditor: React.FC<ConstraintEditorProps> = ({
  constraint,
  path,
  fields,
  operators,
  readOnly = false,
  onUpdate,
  onRemove,
}) => {
  const handleFieldChange = (field: string) => {
    if (onUpdate) {
      onUpdate({ ...constraint, field });
    }
  };

  const handleOperatorChange = (operator: any) => {
    if (onUpdate) {
      onUpdate({ ...constraint, operator });
    }
  };

  const handleValueChange = (value: any) => {
    if (onUpdate) {
      onUpdate({ ...constraint, value });
    }
  };

  const handleMessageChange = (message: string) => {
    if (onUpdate) {
      onUpdate({ ...constraint, message: message || undefined });
    }
  };

  return (
    <Card className={cn("relative", readOnly && "opacity-75")}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${path}-field`}>Field</Label>
                <FieldSelector
                  value={constraint.field}
                  onChange={handleFieldChange}
                  fields={fields}
                  disabled={readOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${path}-operator`}>Operator</Label>
                <OperatorSelector
                  value={constraint.operator}
                  onChange={handleOperatorChange}
                  operators={operators}
                  field={constraint.field}
                  disabled={readOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${path}-value`}>Value</Label>
                <ValueInput
                  value={constraint.value}
                  onChange={handleValueChange}
                  operator={constraint.operator}
                  field={constraint.field}
                  disabled={readOnly}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor={`${path}-message`}
                className="flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Error Message (Optional)
              </Label>
              <Input
                id={`${path}-message`}
                value={constraint.message || ""}
                onChange={(e) => handleMessageChange(e.target.value)}
                placeholder="Custom error message"
                disabled={readOnly}
              />
            </div>
          </div>

          {!readOnly && onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
