import type { OperatorsType } from "@usex/rule-engine";
import type { OperatorSelectorProps } from "../types";
import { Command as CommandPrimitive } from "cmdk";
import {
  Zap,
  Type,
  TrendingUp,
  ToggleRight,
  Star,
  Sparkles,
  Search,
  List,
  Hash,
  FileJson,
  Clock,
  ChevronRight,
  Calendar,
  Braces,
} from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import { cn } from "../lib/utils";
import {
  operatorConfigs,
  getOperatorsForFieldType,
  getOperatorConfig,
} from "../utils/operators";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { PopoverTrigger, PopoverContent, Popover } from "./ui/popover";
import { Separator } from "./ui/separator";

interface ExtendedOperatorSelectorProps extends OperatorSelectorProps {
  customOperators?: Record<string, any>;
  fieldType?: string;
  fieldName?: string;
}

const RECENT_OPERATORS_KEY = "rule-builder-recent-operators";
const OPERATOR_USAGE_KEY = "rule-builder-operator-usage";
const MAX_RECENT_OPERATORS = 5;

// Smart operator recommendations based on field patterns
const SMART_RECOMMENDATIONS = [
  {
    fieldPattern: /age|year|count|quantity|amount|price|total/i,
    operators: ["greater-than", "less-than", "between", "equals"],
    reason: "Numeric comparison",
  },
  {
    fieldPattern: /date|time|created|updated|expires/i,
    operators: ["date-after", "date-before", "date-between", "date-after-now"],
    reason: "Date/time comparison",
  },
  {
    fieldPattern: /status|state|type|category|role/i,
    operators: ["equals", "not-equals", "in", "not-in"],
    reason: "Categorical matching",
  },
  {
    fieldPattern: /email|url|id|code|key/i,
    operators: ["equals", "matches", "contains", "empty"],
    reason: "String validation",
  },
  {
    fieldPattern: /active|enabled|verified|premium|default/i,
    operators: ["equals", "truthy", "falsy"],
    reason: "Boolean check",
  },
  {
    fieldPattern: /items|tags|categories|benefits|permissions/i,
    operators: ["contains", "contains-all", "contains-any", "empty"],
    reason: "Array operations",
  },
  {
    fieldPattern: /name|description|message|text|title/i,
    operators: ["contains", "matches", "empty", "not-empty"],
    reason: "Text search",
  },
];

const categoryOrder = [
  "recommended",
  "recent",
  "popular",
  "comparison",
  "validation",
  "array",
  "date",
  "other",
];

const operatorIcons: Record<string, React.ElementType> = {
  equals: Hash,
  contains: Type,
  "greater-than": TrendingUp,
  "less-than": TrendingUp,
  "date-after": Calendar,
  "date-before": Calendar,
  in: List,
  matches: FileJson,
  empty: Braces,
  truthy: ToggleRight,
  falsy: ToggleRight,
};

const operatorColors: Record<string, string> = {
  // Comparison
  equals: "text-blue-600 dark:text-blue-400",
  "not-equals": "text-blue-600 dark:text-blue-400",
  "greater-than": "text-green-600 dark:text-green-400",
  "less-than": "text-green-600 dark:text-green-400",
  "greater-than-or-equals": "text-green-600 dark:text-green-400",
  "less-than-or-equals": "text-green-600 dark:text-green-400",
  between: "text-green-600 dark:text-green-400",
  "not-between": "text-green-600 dark:text-green-400",

  // String
  contains: "text-purple-600 dark:text-purple-400",
  "not-contains": "text-purple-600 dark:text-purple-400",
  "contains-any": "text-purple-600 dark:text-purple-400",
  "contains-all": "text-purple-600 dark:text-purple-400",
  matches: "text-indigo-600 dark:text-indigo-400",
  "not-matches": "text-indigo-600 dark:text-indigo-400",
  like: "text-purple-600 dark:text-purple-400",
  "not-like": "text-purple-600 dark:text-purple-400",

  // Array
  in: "text-yellow-600 dark:text-yellow-400",
  "not-in": "text-yellow-600 dark:text-yellow-400",
  "self-contains-any": "text-yellow-600 dark:text-yellow-400",
  "self-contains-all": "text-yellow-600 dark:text-yellow-400",

  // Date
  "date-after": "text-orange-600 dark:text-orange-400",
  "date-before": "text-orange-600 dark:text-orange-400",
  "date-between": "text-orange-600 dark:text-orange-400",
  "date-equals": "text-orange-600 dark:text-orange-400",
  "date-after-now": "text-orange-600 dark:text-orange-400",
  "date-before-now": "text-orange-600 dark:text-orange-400",

  // Boolean
  truthy: "text-emerald-600 dark:text-emerald-400",
  falsy: "text-red-600 dark:text-red-400",
  boolean: "text-emerald-600 dark:text-emerald-400",
  "not-boolean": "text-emerald-600 dark:text-emerald-400",

  // Existence
  exists: "text-teal-600 dark:text-teal-400",
  "not-exists": "text-teal-600 dark:text-teal-400",
  empty: "text-gray-600 dark:text-gray-400",
  "not-empty": "text-gray-600 dark:text-gray-400",
  "null-or-undefined": "text-gray-600 dark:text-gray-400",
  "not-null-or-undefined": "text-gray-600 dark:text-gray-400",
};

export const SmartOperatorSelector: React.FC<ExtendedOperatorSelectorProps> = ({
  value,
  onChange,
  operators = operatorConfigs,
  fieldType,
  fieldName,
  disabled = false,
  className,
  customOperators,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [recentOperators, setRecentOperators] = useState<string[]>([]);
  const [operatorUsage, setOperatorUsage] = useState<Record<string, number>>(
    {},
  );
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Load recent operators and usage stats
  useEffect(() => {
    const recent = localStorage.getItem(RECENT_OPERATORS_KEY);
    if (recent) {
      setRecentOperators(JSON.parse(recent));
    }

    const usage = localStorage.getItem(OPERATOR_USAGE_KEY);
    if (usage) {
      setOperatorUsage(JSON.parse(usage));
    }
  }, []);

  // Get available operators for field type
  const availableOperators = useMemo(() => {
    const fieldOperators = getOperatorsForFieldType(fieldType);
    const baseOperators = operators.filter((op) =>
      fieldOperators.some((fo) => fo.name === op.name),
    );

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

  // Get smart recommendations
  const recommendations = useMemo(() => {
    if (!fieldName) return [];

    const recommended: typeof availableOperators = [];

    SMART_RECOMMENDATIONS.forEach(
      ({ fieldPattern, operators: recommendedOps, reason }) => {
        if (fieldPattern.test(fieldName)) {
          recommendedOps.forEach((opName) => {
            const operator = availableOperators.find(
              (op) => op.name === opName,
            );
            if (
              operator &&
              !recommended.find((r) => r.name === operator.name)
            ) {
              recommended.push({
                ...operator,
                category: "recommended",
                description: reason,
              });
            }
          });
        }
      },
    );

    return recommended;
  }, [fieldName, availableOperators]);

  // Filter operators based on search
  const filteredOperators = useMemo(() => {
    if (!search) {
      return availableOperators;
    }

    const searchLower = search.toLowerCase();
    return availableOperators.filter((operator) => {
      const label = (operator.label || operator.name).toLowerCase();
      const category = (operator.category || "").toLowerCase();
      const description = (operator.description || "").toLowerCase();

      return (
        label.includes(searchLower) ||
        category.includes(searchLower) ||
        description.includes(searchLower) ||
        operator.name.toLowerCase().includes(searchLower)
      );
    });
  }, [availableOperators, search]);

  // Group operators by category
  const groupedOperators = useMemo(() => {
    const groups: Record<string, typeof availableOperators> = {};

    // Add recommendations first
    if (recommendations.length > 0 && !search) {
      groups.recommended = recommendations;
    }

    // Add recent operators
    const recentOps = recentOperators
      .map((opName) => availableOperators.find((op) => op.name === opName))
      .filter(Boolean)
      .slice(0, MAX_RECENT_OPERATORS);

    if (recentOps.length > 0 && !search) {
      groups.recent = recentOps as typeof availableOperators;
    }

    // Add popular operators (sorted by usage)
    const popularOps = Object.entries(operatorUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([opName]) => availableOperators.find((op) => op.name === opName))
      .filter(Boolean);

    if (popularOps.length > 0 && !search) {
      groups.popular = popularOps as typeof availableOperators;
    }

    // Group remaining operators
    filteredOperators.forEach((operator) => {
      const category = operator.category || "other";
      if (!groups[category]) {
        groups[category] = [];
      }

      // Don't duplicate operators already in special groups
      if (
        !groups.recommended?.find((op) => op.name === operator.name) &&
        !groups.recent?.find((op) => op.name === operator.name) &&
        !groups.popular?.find((op) => op.name === operator.name)
      ) {
        groups[category].push(operator);
      }
    });

    // Sort groups by predefined order
    const sortedGroups: Record<string, typeof availableOperators> = {};
    categoryOrder.forEach((cat) => {
      if (groups[cat]) {
        sortedGroups[cat] = groups[cat];
      }
    });

    // Add any remaining categories
    Object.keys(groups).forEach((cat) => {
      if (!sortedGroups[cat]) {
        sortedGroups[cat] = groups[cat];
      }
    });

    return sortedGroups;
  }, [
    filteredOperators,
    recommendations,
    recentOperators,
    operatorUsage,
    availableOperators,
    search,
  ]);

  const selectedOperator = getOperatorConfig(value);

  const handleSelect = (operator: string) => {
    onChange(operator as OperatorsType);
    setSearch("");
    setOpen(false);

    // Update recent operators
    const newRecent = [
      operator,
      ...recentOperators.filter((op) => op !== operator),
    ].slice(0, MAX_RECENT_OPERATORS);
    setRecentOperators(newRecent);
    localStorage.setItem(RECENT_OPERATORS_KEY, JSON.stringify(newRecent));

    // Update usage statistics
    const newUsage = { ...operatorUsage };
    newUsage[operator] = (newUsage[operator] || 0) + 1;
    setOperatorUsage(newUsage);
    localStorage.setItem(OPERATOR_USAGE_KEY, JSON.stringify(newUsage));
  };

  // Keep focus on search input
  useEffect(() => {
    if (open && inputRef.current) {
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [open, filteredOperators]);

  const categoryIcons = {
    recommended: Sparkles,
    recent: Clock,
    popular: TrendingUp,
    comparison: TrendingUp,
    validation: ToggleRight,
    array: List,
    date: Calendar,
    other: FileJson,
  };

  const categoryLabels = {
    recommended: "AI Recommended",
    recent: "Recently Used",
    popular: "Most Popular",
    comparison: "Comparison",
    validation: "Validation",
    array: "Array Operations",
    date: "Date & Time",
    other: "Other",
  };

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
          <div className="flex items-center gap-2">
            {selectedOperator &&
              operatorIcons[selectedOperator.name] &&
              React.createElement(operatorIcons[selectedOperator.name], {
                className: cn("h-4 w-4", operatorColors[selectedOperator.name]),
              })}
            <span>
              {selectedOperator?.label || value || "Select operator..."}
            </span>
          </div>
          <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0" align="start">
        <CommandPrimitive className="overflow-hidden rounded-md border shadow-md">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search operators..."
              className="flex h-8 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0"
              autoFocus
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {Object.entries(groupedOperators).length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No operators found
              </div>
            ) : (
              Object.entries(groupedOperators).map(([category, ops]) => {
                const CategoryIcon =
                  categoryIcons[category as keyof typeof categoryIcons] ||
                  FileJson;
                const categoryLabel =
                  categoryLabels[category as keyof typeof categoryLabels] ||
                  category;

                return (
                  <div key={category} className="p-2">
                    <div className="mb-2 flex items-center gap-2 px-2 text-xs font-medium text-muted-foreground">
                      <CategoryIcon className="h-3 w-3" />
                      {categoryLabel}
                      {category === "recommended" && (
                        <Badge
                          variant="secondary"
                          className="h-4 text-[10px] px-1"
                        >
                          <Zap className="h-2 w-2 mr-0.5" />
                          AI
                        </Badge>
                      )}
                    </div>

                    {ops.map((operator) => {
                      const isSelected = value === operator.name;
                      const OperatorIcon =
                        operatorIcons[operator.name] || FileJson;
                      const usage = operatorUsage[operator.name];

                      return (
                        <button
                          key={operator.name}
                          onClick={() => handleSelect(operator.name)}
                          className={cn(
                            "relative flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                            "hover:bg-accent hover:text-accent-foreground",
                            "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                            isSelected && "bg-accent text-accent-foreground",
                            "group",
                          )}
                        >
                          <OperatorIcon
                            className={cn(
                              "mr-2 h-4 w-4",
                              operatorColors[operator.name],
                            )}
                          />
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {operator.label || operator.name}
                              </span>
                              {usage && usage > 5 && (
                                <Badge
                                  variant="secondary"
                                  className="h-4 text-[10px] px-1"
                                >
                                  {usage}x
                                </Badge>
                              )}
                              {category === "recommended" && (
                                <Badge
                                  variant="outline"
                                  className="h-4 text-[10px] px-1"
                                >
                                  {operator.description}
                                </Badge>
                              )}
                            </div>
                            {operator.description &&
                              category !== "recommended" && (
                                <div className="text-xs text-muted-foreground">
                                  {operator.description}
                                </div>
                              )}
                          </div>
                          {category === "recent" && (
                            <Clock className="ml-2 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                          )}
                          {category === "popular" && (
                            <Star className="ml-2 h-3 w-3 text-yellow-500 opacity-0 group-hover:opacity-100" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {fieldName && recommendations.length > 0 && (
            <>
              <Separator />
              <div className="p-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI suggestions based on field:{" "}
                  <code className="bg-muted px-1 rounded">{fieldName}</code>
                </div>
              </div>
            </>
          )}
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  );
};
