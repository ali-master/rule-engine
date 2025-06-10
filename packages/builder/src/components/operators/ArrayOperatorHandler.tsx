import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
  Select,
} from "../ui/select";
import { X, Plus, Info } from "lucide-react";
import {
  TooltipTrigger,
  TooltipProvider,
  TooltipContent,
  Tooltip,
} from "../ui/tooltip";
import { AlertDescription, Alert } from "../ui/alert";
import type { OperatorHandlerProps } from "./index";

export const ArrayOperatorHandler: React.FC<OperatorHandlerProps> = ({
  operator,
  value,
  onChange,
  field,
  fieldType,
  disabled,
}) => {
  const items = Array.isArray(value) ? value : value ? [value] : [];

  const addItem = () => {
    onChange([...items, ""]);
  };

  const updateItem = (index: number, newValue: any) => {
    const newItems = [...items];
    newItems[index] = newValue;
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const parseValue = (val: string, type?: string) => {
    if (type === "number" || fieldType === "number") {
      const num = Number.parseFloat(val);
      return Number.isNaN(num) ? val : num;
    }
    if (type === "boolean" || fieldType === "boolean") {
      return val === "true";
    }
    return val;
  };

  const getOperatorDescription = () => {
    const descriptions = {
      in: "Value must be one of the items in the list",
      "not-in": "Value must NOT be in the list",
      contains: "Array field contains the specified value",
      "not-contains": "Array field does NOT contain the specified value",
      "contains-any": "Array field contains ANY of the specified values",
      "contains-all": "Array field contains ALL of the specified values",
      "not-contains-any":
        "Array field does NOT contain ANY of the specified values",
      "not-contains-all":
        "Array field does NOT contain ALL of the specified values",
    };
    return descriptions[operator as keyof typeof descriptions] || operator;
  };

  const isArrayFieldOperator = [
    "contains",
    "not-contains",
    "contains-any",
    "contains-all",
    "not-contains-any",
    "not-contains-all",
  ].includes(operator);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Label>
            {isArrayFieldOperator ? "Values to Check" : "Allowed Values"}
          </Label>
          <Badge variant="outline" className="text-xs">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-1">
                  {operator.toUpperCase()} Operator
                </p>
                <p className="text-xs">{getOperatorDescription()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Alert className="mb-3">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {isArrayFieldOperator ? (
              <span>
                Checking if <strong>{field}</strong> (array){" "}
                {getOperatorDescription().toLowerCase()}
              </span>
            ) : (
              <span>
                Checking if <strong>{field}</strong>{" "}
                {getOperatorDescription().toLowerCase()}
              </span>
            )}
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-1">
              {fieldType === "boolean" ? (
                <Select
                  value={item?.toString() || ""}
                  onValueChange={(val) => updateItem(index, val === "true")}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select boolean value" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={fieldType === "number" ? "number" : "text"}
                  value={item || ""}
                  onChange={(e) =>
                    updateItem(index, parseValue(e.target.value, fieldType))
                  }
                  placeholder={`Enter ${fieldType || "value"}`}
                  disabled={disabled}
                  className="font-mono"
                />
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeItem(index)}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={addItem}
          disabled={disabled}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {items.length > 0 && (
        <div className="p-3 bg-muted rounded-md">
          <p className="text-xs text-muted-foreground mb-2">Preview:</p>
          <code className="text-xs font-mono">
            {field} {operator} [
            {items
              .map((i) => (typeof i === "string" ? `"${i}"` : i))
              .join(", ")}
            ]
          </code>
        </div>
      )}
    </div>
  );
};
