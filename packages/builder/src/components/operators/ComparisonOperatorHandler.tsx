import type { OperatorHandlerProps } from "./index";
import { Hash, Info, Sparkles } from "lucide-react";
import React from "react";
import { DynamicFieldSelector } from "../DynamicFieldSelector";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export const ComparisonOperatorHandler: React.FC<OperatorHandlerProps> = ({
  operator,
  value,
  onChange,
  field,
  fieldType,
  sampleData,
  disabled,
}) => {
  const [inputMode, setInputMode] = React.useState<"value" | "field">(
    typeof value === "string" && value.startsWith("$.") ? "field" : "value",
  );
  const isLikeOperator = operator === "like" || operator === "not-like";
  const isNumericOperator = [
    "greater-than",
    "less-than",
    "greater-than-or-equals",
    "less-than-or-equals",
  ].includes(operator);

  // Common header with mode toggle
  const renderHeader = () => (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Label>Value</Label>
        {fieldType && (
          <Badge variant="outline" className="text-xs">
            {fieldType}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant={inputMode === "value" ? "secondary" : "ghost"}
          size="sm"
          className="h-7 px-2"
          onClick={() => setInputMode("value")}
          disabled={disabled}
        >
          <Hash className="h-3 w-3 mr-1" />
          Static
        </Button>
        <Button
          variant={inputMode === "field" ? "secondary" : "ghost"}
          size="sm"
          className="h-7 px-2"
          onClick={() => setInputMode("field")}
          disabled={disabled}
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Dynamic
        </Button>
      </div>
    </div>
  );

  // For numeric comparisons
  if (isNumericOperator) {
    return (
      <div className="space-y-3">
        {renderHeader()}
        {inputMode === "field" ? (
          <>
            <DynamicFieldSelector
              value={value}
              onChange={onChange}
              sampleData={sampleData}
              placeholder="Select field to compare"
              disabled={disabled}
            />
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Compare {field} with the value from another field
              </AlertDescription>
            </Alert>
          </>
        ) : (
          <>
            <Input
              type="number"
              value={value || ""}
              onChange={(e) =>
                onChange(
                  e.target.value
                    ? Number.parseFloat(e.target.value)
                    : undefined,
                )
              }
              placeholder="Enter number"
              disabled={disabled}
              className="font-mono"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange(0)}
                disabled={disabled}
              >
                Zero
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange(100)}
                disabled={disabled}
              >
                100
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange(1000)}
                disabled={disabled}
              >
                1K
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  // For like/not-like operators (pattern matching)
  if (isLikeOperator) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label>Pattern</Label>
          <Badge variant="outline" className="text-xs">
            SQL LIKE
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-1">Pattern matching:</p>
                <ul className="text-xs space-y-1">
                  <li>• % - matches any sequence of characters</li>
                  <li>• _ - matches any single character</li>
                  <li>
                    • Example: "%john%" matches "john", "johnny", "big john"
                  </li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter pattern (e.g., %value%)"
          disabled={disabled}
          className="font-mono"
        />
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Quick patterns:
          </Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentValue = value?.toString().replace(/%/g, "") || "";
                onChange(`%${currentValue}%`);
              }}
              disabled={disabled}
            >
              Contains
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentValue = value?.toString().replace(/%/g, "") || "";
                onChange(`${currentValue}%`);
              }}
              disabled={disabled}
            >
              Starts with
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentValue = value?.toString().replace(/%/g, "") || "";
                onChange(`%${currentValue}`);
              }}
              disabled={disabled}
            >
              Ends with
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange(`%__%`)}
              disabled={disabled}
            >
              At least 2 chars
            </Button>
          </div>
        </div>
        {value && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Pattern preview:{" "}
              <code className="font-mono bg-muted px-1">{value}</code>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Default comparison (equals/not-equals)
  return (
    <div className="space-y-3">
      {renderHeader()}
      {inputMode === "field" ? (
        <>
          <DynamicFieldSelector
            value={value}
            onChange={onChange}
            sampleData={sampleData}
            placeholder="Select field to compare"
            disabled={disabled}
          />
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Compare {field} with the value from another field dynamically
            </AlertDescription>
          </Alert>
        </>
      ) : (
        <>
          {/* Conditional inputs based on field type */}
          {fieldType === "boolean" ? (
            <Select
              value={value?.toString()}
              onValueChange={(v) => onChange(v === "true")}
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
          ) : fieldType === "number" ? (
            <Input
              type="number"
              value={value || ""}
              onChange={(e) =>
                onChange(
                  e.target.value
                    ? Number.parseFloat(e.target.value)
                    : undefined,
                )
              }
              placeholder="Enter number"
              disabled={disabled}
              className="font-mono"
            />
          ) : (
            <Input
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter value to compare"
              disabled={disabled}
            />
          )}

          {/* Quick values based on field type */}
          {fieldType === "string" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange("")}
                disabled={disabled}
              >
                Empty
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange("null")}
                disabled={disabled}
              >
                "null"
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange("undefined")}
                disabled={disabled}
              >
                "undefined"
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
