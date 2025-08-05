import React from "react";
import { Input } from "../ui/input";
import { DateInput } from "./DateInput";
import { AnimatedNumberInput } from "./AnimatedNumberInput";
import { BooleanInput } from "./BooleanInput";
import { ArrayInput } from "./ArrayInput";
import {
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
  Select,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Info } from "lucide-react";
import {
  TooltipTrigger,
  TooltipProvider,
  TooltipContent,
  Tooltip,
} from "../ui/tooltip";
import { getOperatorConfig } from "../../utils/operators";
import type { OperatorsType } from "@usex/rule-engine";
import type { FieldConfig } from "../../types";
import { cn } from "../../lib/utils";

interface SmartValueInputProps {
  value: any;
  onChange: (value: any) => void;
  operator: OperatorsType;
  field?: FieldConfig;
  sampleData?: Record<string, any>;
  disabled?: boolean;
  className?: string;
}

export const SmartValueInput: React.FC<SmartValueInputProps> = ({
  value,
  onChange,
  operator,
  field,
  sampleData: _sampleData,
  disabled = false,
  className,
}) => {
  const operatorConfig = getOperatorConfig(operator);
  const valueType = operatorConfig?.valueType || "single";

  // No input needed for these operators
  if (valueType === "none") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm text-muted-foreground",
          className,
        )}
      >
        <Info className="h-4 w-4" />
        <span>No value needed</span>
      </div>
    );
  }

  // For predefined values
  if (field?.values && field.values.length > 0) {
    if (valueType === "multiple") {
      return (
        <div className={cn("space-y-2", className)}>
          <Select
            value=""
            onValueChange={(newValue) => {
              const currentArray = Array.isArray(value) ? value : [];
              if (!currentArray.includes(newValue)) {
                onChange([...currentArray, newValue]);
              }
            }}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select values..." />
            </SelectTrigger>
            <SelectContent>
              {field.values.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {Array.isArray(value) && value.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {value.map((v, index) => (
                <Badge key={index} variant="secondary">
                  {field.values?.find((opt) => opt.value === v)?.label || v}
                  <button
                    type="button"
                    onClick={() =>
                      onChange(value.filter((_, i) => i !== index))
                    }
                    className="ml-1"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Select value..." />
        </SelectTrigger>
        <SelectContent>
          {field.values.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // For range values (between operators)
  if (valueType === "range") {
    const rangeValue = Array.isArray(value) ? value : [value || "", ""];

    if (field?.type === "date" || operator.includes("date")) {
      return (
        <div className={cn("space-y-2", className)}>
          <div>
            <label className="text-xs text-muted-foreground">From</label>
            <DateInput
              value={rangeValue[0]}
              onChange={(newValue) => onChange([newValue, rangeValue[1]])}
              disabled={disabled}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">To</label>
            <DateInput
              value={rangeValue[1]}
              onChange={(newValue) => onChange([rangeValue[0], newValue])}
              disabled={disabled}
            />
          </div>
        </div>
      );
    }

    return (
      <div className={cn("space-y-2", className)}>
        <div>
          <label className="text-xs text-muted-foreground">From</label>
          <AnimatedNumberInput
            value={rangeValue[0]}
            onChange={(newValue) => onChange([newValue, rangeValue[1]])}
            disabled={disabled}
            format={{
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">To</label>
          <AnimatedNumberInput
            value={rangeValue[1]}
            onChange={(newValue) => onChange([rangeValue[0], newValue])}
            disabled={disabled}
            format={{
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }}
          />
        </div>
      </div>
    );
  }

  // For multiple values (in/not-in operators)
  if (valueType === "multiple") {
    return (
      <ArrayInput
        value={value}
        onChange={onChange}
        itemType={field?.type as any}
        disabled={disabled}
        className={className}
      />
    );
  }

  // Single value inputs based on field type
  if (field?.type === "date" || operator.includes("date")) {
    return (
      <DateInput
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={className}
      />
    );
  }

  if (
    field?.type === "number" ||
    operator.includes("length") ||
    ["min", "max"].includes(operator)
  ) {
    return (
      <AnimatedNumberInput
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={className}
        format={{
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }}
      />
    );
  }

  if (field?.type === "boolean") {
    return (
      <BooleanInput
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={className}
      />
    );
  }

  // Check if value is a field reference
  const isFieldReference = typeof value === "string" && value.startsWith("$.");

  return (
    <div className={cn("relative", className)}>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          operator === "matches" ? "Enter regex pattern" : "Enter value"
        }
        disabled={disabled}
        className={cn(isFieldReference && "pr-20 font-mono text-xs")}
      />
      {isFieldReference && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
              >
                Field Ref
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>This value references another field</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
