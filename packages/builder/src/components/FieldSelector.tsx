import React from "react";
import {
  SelectValue,
  SelectTrigger,
  SelectLabel,
  SelectItem,
  SelectGroup,
  SelectContent,
  Select,
} from "./ui/select";
import { Input } from "./ui/input";
import type { FieldSelectorProps } from "../types";
import { cn } from "../lib/utils";

export const FieldSelector: React.FC<FieldSelectorProps> = ({
  value,
  onChange,
  fields = [],
  placeholder = "Select or enter field",
  disabled = false,
  className,
}) => {
  const [isCustom, setIsCustom] = React.useState(false);
  const [customValue, setCustomValue] = React.useState(value || "");

  React.useEffect(() => {
    if (value && !fields.some((f) => f.name === value)) {
      setIsCustom(true);
      setCustomValue(value);
    }
  }, [value, fields]);

  const groupedFields = React.useMemo(() => {
    const groups: Record<string, typeof fields> = {};
    const ungrouped: typeof fields = [];

    fields.forEach((field) => {
      if (field.group) {
        if (!groups[field.group]) {
          groups[field.group] = [];
        }
        groups[field.group].push(field);
      } else {
        ungrouped.push(field);
      }
    });

    return { groups, ungrouped };
  }, [fields]);

  if (isCustom || fields.length === 0) {
    return (
      <div className={cn("relative", className)}>
        <Input
          value={customValue}
          onChange={(e) => {
            setCustomValue(e.target.value);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            value?.startsWith("$.") && "font-mono text-xs",
            className,
          )}
        />
        {fields.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setIsCustom(false);
              setCustomValue("");
              onChange("");
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            disabled={disabled}
          >
            Select from list
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {groupedFields.ungrouped.length > 0 && (
            <SelectGroup>
              {groupedFields.ungrouped.map((field) => (
                <SelectItem key={field.name} value={field.name}>
                  <div className="flex flex-col">
                    <span>{field.label || field.name}</span>
                    {field.description && (
                      <span className="text-xs text-muted-foreground">
                        {field.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          {Object.entries(groupedFields.groups).map(([group, groupFields]) => (
            <SelectGroup key={group}>
              <SelectLabel>{group}</SelectLabel>
              {groupFields.map((field) => (
                <SelectItem key={field.name} value={field.name}>
                  <div className="flex flex-col">
                    <span>{field.label || field.name}</span>
                    {field.description && (
                      <span className="text-xs text-muted-foreground">
                        {field.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}

          <SelectGroup>
            <SelectLabel>Advanced</SelectLabel>
            <SelectItem value="__custom__" onSelect={() => setIsCustom(true)}>
              <div className="flex flex-col">
                <span>Custom Field (JSONPath)</span>
                <span className="text-xs text-muted-foreground">
                  Enter a custom field path or JSONPath expression
                </span>
              </div>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
