import React, { useState, useRef } from "react";
import NumberFlow, { useCanAnimate } from "@number-flow/react";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";

interface AnimatedNumberInputProps {
  value?: number | string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  format?: Intl.NumberFormatOptions;
}

export const AnimatedNumberInput: React.FC<AnimatedNumberInputProps> = ({
  value,
  onChange,
  placeholder = "Enter a number",
  disabled = false,
  className,
  min,
  max,
  step = 1,
  format = {},
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const canAnimate = useCanAnimate();

  const numericValue =
    typeof value === "string" ? Number.parseFloat(value) || 0 : value || 0;

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(numericValue.toString());
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Allow empty value, negative sign, and decimal point
    if (newValue === "" || newValue === "-" || newValue === ".") {
      setEditValue(newValue);
      return;
    }

    // Validate number format
    const numberRegex = /^-?\d*(?:\.\d*)?$/;
    if (!numberRegex.test(newValue)) {
      return;
    }

    setEditValue(newValue);
  };

  const handleBlur = () => {
    const numValue = Number.parseFloat(editValue);

    if (!Number.isNaN(numValue)) {
      let finalValue = numValue;

      // Apply constraints
      if (min !== undefined && finalValue < min) finalValue = min;
      if (max !== undefined && finalValue > max) finalValue = max;

      onChange(finalValue.toString());
    }

    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const adjustValue = (delta: number) => {
    const newValue = numericValue + delta;

    // Check constraints
    if (min !== undefined && newValue < min) return;
    if (max !== undefined && newValue > max) return;

    onChange(newValue.toString());
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={editValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("font-mono", className)}
        autoFocus
      />
    );
  }

  return (
    <div className={cn("relative group", className)}>
      <div
        onClick={handleStartEdit}
        className={cn(
          "flex items-center justify-between px-3 py-2 text-sm rounded-md border border-input bg-background cursor-text transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        )}
      >
        <div className="font-mono">
          {canAnimate ? (
            <NumberFlow
              value={numericValue}
              format={{
                ...format,
                notation:
                  format.notation === "scientific" ||
                  format.notation === "engineering"
                    ? "standard"
                    : format.notation,
              }}
              animated
            />
          ) : (
            new Intl.NumberFormat(undefined, format).format(numericValue)
          )}
        </div>

        <div className="flex flex-col -space-y-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              adjustValue(step);
            }}
            disabled={disabled || (max !== undefined && numericValue >= max)}
            className="p-0.5 hover:bg-muted rounded disabled:opacity-50"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              adjustValue(-step);
            }}
            disabled={disabled || (min !== undefined && numericValue <= min)}
            className="p-0.5 hover:bg-muted rounded disabled:opacity-50"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
