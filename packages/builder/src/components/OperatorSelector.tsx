import type { OperatorsType } from "@usex/rule-engine";
import type { OperatorSelectorProps } from "../types";
import { Search } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { cn } from "../lib/utils";
import {
  getOperatorConfig,
  getOperatorsForFieldType,
  operatorConfigs,
} from "../utils/operators";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ExtendedOperatorSelectorProps extends OperatorSelectorProps {
  customOperators?: Record<string, any>;
  fieldType?: string;
}

export const OperatorSelector: React.FC<ExtendedOperatorSelectorProps> = ({
  value,
  onChange,
  operators = operatorConfigs,
  fieldType,
  disabled = false,
  className,
  customOperators,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const availableOperators = React.useMemo(() => {
    const fieldOperators = getOperatorsForFieldType(fieldType);
    const baseOperators = operators.filter((op) =>
      fieldOperators.some((fo) => fo.name === op.name),
    );

    // Add custom operators if provided
    if (customOperators) {
      const customOps = Object.entries(customOperators).map(
        ([name, config]) => ({
          name,
          label: config.label || name,
          category: config.category || "Custom",
          ...config,
        }),
      );
      return [...baseOperators, ...customOps];
    }

    return baseOperators;
  }, [operators, fieldType, customOperators]);

  // Filter operators based on search term
  const filteredOperators = useMemo(() => {
    if (!searchTerm) return availableOperators;

    const search = searchTerm.toLowerCase();
    return availableOperators.filter((operator) => {
      const label = (operator.label || operator.name).toLowerCase();
      const category = (operator.category || "").toLowerCase();
      const description = (operator.description || "").toLowerCase();

      return (
        label.includes(search) ||
        category.includes(search) ||
        description.includes(search) ||
        operator.name.toLowerCase().includes(search)
      );
    });
  }, [availableOperators, searchTerm]);

  const groupedOperators = React.useMemo(() => {
    const groups: Record<string, typeof filteredOperators> = {};

    filteredOperators.forEach((operator) => {
      const category = operator.category || "Other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(operator);
    });

    return groups;
  }, [filteredOperators]);

  const selectedOperator = getOperatorConfig(value);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset search when closing
      setSearchTerm("");
    }
  };

  // Keep focus on search input when operators change
  useEffect(() => {
    if (open && inputRef.current) {
      // Use a small timeout to ensure the input is rendered
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [open, filteredOperators]);

  const handleSelect = (newValue: string) => {
    onChange(newValue as OperatorsType);
    setSearchTerm("");
    setOpen(false);
  };

  return (
    <Select
      value={value}
      onValueChange={handleSelect}
      disabled={disabled}
      open={open}
      onOpenChange={handleOpenChange}
    >
      <SelectTrigger className={cn("min-w-[200px]", className)}>
        <SelectValue placeholder="Select operator">
          {selectedOperator?.label || value}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {/* Search Input */}
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search operators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8"
              autoFocus
              onKeyDown={(e) => {
                // Prevent the select from closing on space or enter in search
                if (e.key === " " || e.key === "Enter") {
                  e.stopPropagation();
                }
              }}
            />
          </div>
        </div>

        {/* Operator Groups */}
        <div className="max-h-[300px] overflow-y-auto">
          {Object.entries(groupedOperators).length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No operators found matching "{searchTerm}"
            </div>
          ) : (
            Object.entries(groupedOperators).map(([category, ops]) => (
              <SelectGroup key={category}>
                <SelectLabel className="text-xs font-medium text-muted-foreground">
                  {category} ({ops.length})
                </SelectLabel>
                {ops.map((operator) => (
                  <SelectItem
                    key={operator.name}
                    value={operator.name}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col py-1">
                      <span className="font-medium">
                        {operator.label || operator.name}
                      </span>
                      {operator.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {operator.description}
                        </span>
                      )}
                      {searchTerm && (
                        <span className="text-xs text-primary/60">
                          {operator.name}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))
          )}
        </div>

        {/* Results count */}
        {searchTerm && (
          <div className="p-2 border-t text-xs text-center text-muted-foreground">
            {filteredOperators.length} of {availableOperators.length} operators
          </div>
        )}
      </SelectContent>
    </Select>
  );
};
