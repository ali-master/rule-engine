import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { X, Plus } from "lucide-react";
import { cn } from "../../lib/utils";

interface ArrayInputProps {
  value?: any[];
  onChange: (value: any[]) => void;
  itemType?: "string" | "number" | "boolean";
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const ArrayInput: React.FC<ArrayInputProps> = ({
  value = [],
  onChange,
  itemType = "string",
  placeholder = "Add item",
  disabled = false,
  className,
}) => {
  const [inputValue, setInputValue] = React.useState("");

  const handleAdd = () => {
    if (!inputValue.trim()) return;

    let newValue: any = inputValue;
    if (itemType === "number") {
      newValue = Number.parseFloat(inputValue);
      if (Number.isNaN(newValue)) return;
    } else if (itemType === "boolean") {
      newValue = inputValue.toLowerCase() === "true";
    }

    onChange([...value, newValue]);
    setInputValue("");
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
          type={itemType === "number" ? "number" : "text"}
        />
        <Button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !inputValue.trim()}
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="pl-2 pr-1 py-1 flex items-center gap-1"
            >
              <span className="text-xs font-normal">
                {typeof item === "string" ? item : JSON.stringify(item)}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
