import React, { useState, useMemo } from "react";
import {
  CommandSeparator,
  CommandList,
  CommandItem,
  CommandInput,
  CommandGroup,
  CommandEmpty,
  Command,
} from "./ui/command";
import { PopoverTrigger, PopoverContent, Popover } from "./ui/popover";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Type,
  ToggleRight,
  Sparkles,
  List,
  Hash,
  FileJson,
  Code2,
  ChevronsUpDown,
  Calendar,
  Braces,
  AlertCircle,
} from "lucide-react";
import { cn } from "../lib/utils";
import type { FieldConfig } from "../types";
import { useFieldDiscovery } from "../hooks/use-field-discovery";

interface DynamicFieldSelectorProps {
  value: string;
  onChange: (value: string) => void;
  fields?: FieldConfig[];
  sampleData?: Record<string, any>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowCustom?: boolean;
  showJsonPath?: boolean;
}

const typeIcons = {
  string: Type,
  number: Hash,
  boolean: ToggleRight,
  date: Calendar,
  array: List,
  object: Braces,
};

export const DynamicFieldSelector: React.FC<DynamicFieldSelectorProps> = ({
  value,
  onChange,
  fields: providedFields = [],
  sampleData,
  placeholder = "Select or enter field",
  disabled = false,
  className,
  allowCustom = true,
  showJsonPath = true,
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const {
    fields: discoveredFields,
    getSuggestedFields,
    validateJsonPath,
  } = useFieldDiscovery({
    sampleData,
    customFields: providedFields,
  });

  const isJsonPath = value.startsWith("$");
  const validation = useMemo(() => {
    if (isJsonPath) {
      return validateJsonPath(value);
    }
    return { valid: true };
  }, [value, isJsonPath, validateJsonPath]);

  const allFields = useMemo(() => {
    const fieldMap = new Map<string, FieldConfig>();

    // Add discovered fields
    discoveredFields.forEach((field) => {
      fieldMap.set(field.name, field);
    });

    // Add provided fields (override if duplicate)
    providedFields.forEach((field) => {
      fieldMap.set(field.name, field);
    });

    return Array.from(fieldMap.values());
  }, [discoveredFields, providedFields]);

  const suggestions = useMemo(() => {
    return getSuggestedFields(inputValue);
  }, [inputValue, getSuggestedFields]);

  const groupedFields = useMemo(() => {
    const groups: Record<string, FieldConfig[]> = {};

    suggestions.forEach((field) => {
      const group = field.group || "Fields";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(field);
    });

    return groups;
  }, [suggestions]);

  const selectedField = allFields.find((f) => f.name === value);

  const handleSelect = (fieldName: string) => {
    onChange(fieldName);
    setInputValue(fieldName);
    setOpen(false);
    setShowCustomInput(false);
  };

  const handleCustomSubmit = () => {
    onChange(inputValue);
    setOpen(false);
    setShowCustomInput(false);
  };

  if (showCustomInput || (!selectedField && value && !allFields.length)) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="relative">
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              onChange(e.target.value);
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              isJsonPath && "font-mono text-xs pl-10",
              !validation.valid && "border-destructive",
            )}
          />
          {isJsonPath && (
            <FileJson className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
        </div>
        {!validation.valid && validation.error && (
          <div className="flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            {validation.error}
          </div>
        )}
        {allFields.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowCustomInput(false);
              setInputValue(value);
            }}
            className="w-full"
          >
            Select from list
          </Button>
        )}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("justify-between", className)}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedField ? (
              <>
                {React.createElement(
                  typeIcons[selectedField.type as keyof typeof typeIcons] ||
                    FileJson,
                  {
                    className: "h-4 w-4 shrink-0",
                  },
                )}
                <span className="truncate">
                  {selectedField.label || selectedField.name}
                </span>
                {selectedField.jsonPath && (
                  <Badge variant="outline" className="ml-1">
                    JSONPath
                  </Badge>
                )}
              </>
            ) : value ? (
              <>
                <Code2 className="h-4 w-4 shrink-0" />
                <span className="font-mono text-xs truncate">{value}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search fields..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                <p className="text-muted-foreground mb-2">No fields found</p>
                {allowCustom && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCustomInput(true);
                      setOpen(false);
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Enter custom field
                  </Button>
                )}
              </div>
            </CommandEmpty>

            {Object.entries(groupedFields).map(([group, fields]) => (
              <CommandGroup key={group} heading={group}>
                {fields.map((field) => (
                  <CommandItem
                    key={field.name}
                    value={field.name}
                    onSelect={() => handleSelect(field.name)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {React.createElement(
                        typeIcons[field.type as keyof typeof typeIcons] ||
                          FileJson,
                        {
                          className: "h-4 w-4 shrink-0 text-muted-foreground",
                        },
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate">
                            {field.label || field.name}
                          </span>
                          {field.jsonPath && (
                            <Badge variant="outline" className="text-xs">
                              JSONPath
                            </Badge>
                          )}
                        </div>
                        {field.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {field.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="ml-auto">
                        {field.type}
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}

            {allowCustom && inputValue && !selectedField && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Custom">
                  <CommandItem
                    value={inputValue}
                    onSelect={() => handleCustomSubmit()}
                  >
                    <Code2 className="h-4 w-4 mr-2" />
                    <span className="font-mono text-sm">{inputValue}</span>
                    <Badge variant="outline" className="ml-auto">
                      Custom
                    </Badge>
                  </CommandItem>
                </CommandGroup>
              </>
            )}

            {showJsonPath && (
              <>
                <CommandSeparator />
                <CommandGroup heading="JSONPath Examples">
                  <CommandItem
                    value="$.field"
                    onSelect={() => handleSelect("$.field")}
                  >
                    <FileJson className="h-4 w-4 mr-2" />
                    <div>
                      <p className="font-mono text-sm">$.field</p>
                      <p className="text-xs text-muted-foreground">
                        Access a root-level field
                      </p>
                    </div>
                  </CommandItem>
                  <CommandItem
                    value="$.parent.child"
                    onSelect={() => handleSelect("$.parent.child")}
                  >
                    <FileJson className="h-4 w-4 mr-2" />
                    <div>
                      <p className="font-mono text-sm">$.parent.child</p>
                      <p className="text-xs text-muted-foreground">
                        Access nested field
                      </p>
                    </div>
                  </CommandItem>
                  <CommandItem
                    value="$.array[*]"
                    onSelect={() => handleSelect("$.array[*]")}
                  >
                    <FileJson className="h-4 w-4 mr-2" />
                    <div>
                      <p className="font-mono text-sm">$.array[*]</p>
                      <p className="text-xs text-muted-foreground">
                        All array elements
                      </p>
                    </div>
                  </CommandItem>
                  <CommandItem
                    value="$..fieldName"
                    onSelect={() => handleSelect("$..fieldName")}
                  >
                    <FileJson className="h-4 w-4 mr-2" />
                    <div>
                      <p className="font-mono text-sm">$..fieldName</p>
                      <p className="text-xs text-muted-foreground">
                        Recursive search
                      </p>
                    </div>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
