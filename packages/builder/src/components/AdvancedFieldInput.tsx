"use client";

import type { FieldConfig } from "../types";
import { Command as CommandPrimitive } from "cmdk";
import {
  ArrowRight,
  Braces,
  Calendar,
  Clock,
  Code2,
  Command,
  CornerDownLeft,
  Eye,
  FileJson,
  Hash,
  List,
  Search,
  Sparkles,
  ToggleRight,
  TrendingUp,
  Type,
  Zap,
} from "lucide-react";
import * as React from "react";
import { cn } from "../lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";

interface AdvancedFieldInputProps {
  value: string;
  onChange: (value: string) => void;
  fields?: FieldConfig[];
  sampleData?: Record<string, any>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowJsonPath?: boolean;
  showPreview?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

interface FieldSuggestion {
  path: string;
  label: string;
  type: string;
  value?: any;
  category: "field" | "recent" | "popular" | "ai" | "path";
  matchScore?: number;
  usageCount?: number;
  lastUsed?: Date;
  preview?: string;
  description?: string;
}

const typeIcons = {
  string: Type,
  number: Hash,
  boolean: ToggleRight,
  date: Calendar,
  array: List,
  object: Braces,
  null: FileJson,
  undefined: FileJson,
};

const categoryIcons = {
  field: FileJson,
  recent: Clock,
  popular: TrendingUp,
  ai: Sparkles,
  path: Code2,
};

const RECENT_FIELDS_KEY = "rule-builder-recent-fields";
const POPULAR_FIELDS_KEY = "rule-builder-popular-fields";
const MAX_RECENT_FIELDS = 10;
const MAX_SUGGESTIONS = 50;

// AI-powered field suggestions based on common patterns
const AI_FIELD_PATTERNS = [
  {
    pattern: /user|customer|person/i,
    suggestions: ["id", "name", "email", "age", "status", "role", "createdAt"],
  },
  {
    pattern: /product|item/i,
    suggestions: ["id", "name", "price", "category", "stock", "sku", "inStock"],
  },
  {
    pattern: /order|transaction/i,
    suggestions: ["id", "status", "total", "items", "date", "customerId"],
  },
  {
    pattern: /address|location/i,
    suggestions: ["street", "city", "state", "zip", "country", "coordinates"],
  },
  {
    pattern: /payment|billing/i,
    suggestions: ["method", "status", "amount", "currency", "cardLast4"],
  },
  {
    pattern: /settings|config/i,
    suggestions: ["theme", "notifications", "language", "timezone"],
  },
];

// Smart JSON path templates
const JSON_PATH_TEMPLATES = [
  {
    label: "Array filter by property",
    path: "$.[?(@.property == 'value')]",
    description: "Filter array items by property value",
  },
  {
    label: "Array map property",
    path: "$.[*].property",
    description: "Get property from all array items",
  },
  {
    label: "Nested array access",
    path: "$.parent[*].child[*].property",
    description: "Access nested arrays",
  },
  {
    label: "Conditional access",
    path: "$..[?(@.active == true)].name",
    description: "Get names of active items",
  },
  {
    label: "Array slice",
    path: "$.[0:5]",
    description: "Get first 5 items from array",
  },
  {
    label: "Recursive descent",
    path: "$..property",
    description: "Find property at any depth",
  },
  {
    label: "Multiple properties",
    path: "$.['prop1','prop2']",
    description: "Select multiple properties",
  },
];

function getFieldType(value: any): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return "array";
  if (value instanceof Date) return "date";
  return typeof value;
}

function extractFieldsFromData(
  data: any,
  path = "$",
  fields: FieldSuggestion[] = [],
  depth = 0,
  maxDepth = 5,
): FieldSuggestion[] {
  if (depth > maxDepth) return fields;

  const type = getFieldType(data);

  if (type === "object" && data !== null) {
    Object.entries(data).forEach(([key, value]) => {
      const fieldPath = `${path}.${key}`;
      const fieldType = getFieldType(value);

      fields.push({
        path: fieldPath,
        label: key,
        type: fieldType,
        value:
          fieldType === "object" || fieldType === "array" ? undefined : value,
        category: "field",
        preview:
          fieldType === "string" && value ? value.slice(0, 50) : undefined,
      });

      if (fieldType === "object" || fieldType === "array") {
        extractFieldsFromData(value, fieldPath, fields, depth + 1, maxDepth);
      }
    });
  } else if (type === "array" && data?.length > 0) {
    // Sample first item for array structure
    const sample = data[0];
    if (typeof sample === "object" && sample !== null) {
      extractFieldsFromData(sample, `${path}[*]`, fields, depth + 1, maxDepth);
    }
  }

  return fields;
}

function fuzzyMatch(input: string, target: string): number {
  const inputLower = input.toLowerCase();
  const targetLower = target.toLowerCase();

  // Exact match
  if (targetLower === inputLower) return 100;

  // Starts with
  if (targetLower.startsWith(inputLower)) return 90;

  // Contains
  if (targetLower.includes(inputLower)) return 70;

  // Fuzzy character matching
  let score = 0;
  let j = 0;
  for (let i = 0; i < inputLower.length; i++) {
    const index = targetLower.indexOf(inputLower[i], j);
    if (index === -1) continue;
    score += (10 - (index - j)) * (i === 0 ? 2 : 1);
    j = index + 1;
  }

  return Math.min(score, 60);
}

export function AdvancedFieldInput({
  value,
  onChange,
  fields = [],
  sampleData,
  placeholder = "Select or type a field path...",
  disabled = false,
  className,
  allowJsonPath = true,
  showPreview = true,
  onFocus,
  onBlur,
}: AdvancedFieldInputProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null,
  );
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [recentFields, setRecentFields] = React.useState<string[]>([]);
  const [popularFields, setPopularFields] = React.useState<
    Record<string, number>
  >({});
  const [previewValue, setPreviewValue] = React.useState<any>(null);
  const [isComposing, setIsComposing] = React.useState(false);

  // Load recent and popular fields from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem(RECENT_FIELDS_KEY);
    if (stored) {
      setRecentFields(JSON.parse(stored));
    }

    const storedPopular = localStorage.getItem(POPULAR_FIELDS_KEY);
    if (storedPopular) {
      setPopularFields(JSON.parse(storedPopular));
    }
  }, []);

  // Extract available fields from sample data
  const extractedFields = React.useMemo(() => {
    if (!sampleData) return [];
    return extractFieldsFromData(sampleData);
  }, [sampleData]);

  // Generate AI suggestions based on field names
  const aiSuggestions = React.useMemo(() => {
    const suggestions: FieldSuggestion[] = [];
    const currentPath = value || search;

    if (currentPath) {
      const parts = currentPath.split(".");
      const lastPart = parts[parts.length - 1];

      AI_FIELD_PATTERNS.forEach(
        ({ pattern, suggestions: fieldSuggestions }) => {
          if (pattern.test(lastPart)) {
            fieldSuggestions.forEach((suggestion) => {
              const suggestedPath = [...parts.slice(0, -1), suggestion].join(
                ".",
              );
              suggestions.push({
                path: suggestedPath.startsWith("$")
                  ? suggestedPath
                  : `$.${suggestedPath}`,
                label: suggestion,
                type: "unknown",
                category: "ai",
                description: `Suggested field for ${lastPart}`,
              });
            });
          }
        },
      );
    }

    return suggestions;
  }, [value, search]);

  // Combine all suggestions
  const allSuggestions = React.useMemo(() => {
    const suggestions: FieldSuggestion[] = [];

    // Add defined fields
    fields.forEach((field) => {
      suggestions.push({
        path: field.name,
        label: field.label || field.name,
        type: field.type || "unknown",
        category: "field",
        description: field.description,
      });
    });

    // Add extracted fields
    suggestions.push(...extractedFields);

    // Add recent fields
    recentFields.forEach((path) => {
      if (!suggestions.find((s) => s.path === path)) {
        suggestions.push({
          path,
          label: path.split(".").pop() || path,
          type: "unknown",
          category: "recent",
        });
      }
    });

    // Add popular fields
    Object.entries(popularFields)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([path, count]) => {
        const existing = suggestions.find((s) => s.path === path);
        if (existing) {
          existing.usageCount = count;
        } else {
          suggestions.push({
            path,
            label: path.split(".").pop() || path,
            type: "unknown",
            category: "popular",
            usageCount: count,
          });
        }
      });

    // Add AI suggestions
    suggestions.push(...aiSuggestions);

    // Add JSON path templates if allowed
    if (allowJsonPath && search.includes("$")) {
      JSON_PATH_TEMPLATES.forEach((template) => {
        suggestions.push({
          path: template.path,
          label: template.label,
          type: "path",
          category: "path",
          description: template.description,
        });
      });
    }

    return suggestions;
  }, [
    fields,
    extractedFields,
    recentFields,
    popularFields,
    aiSuggestions,
    allowJsonPath,
    search,
  ]);

  // Filter and score suggestions
  const filteredSuggestions = React.useMemo(() => {
    let filtered = allSuggestions;

    // Filter by search
    if (search) {
      filtered = filtered
        .map((suggestion) => ({
          ...suggestion,
          matchScore:
            fuzzyMatch(search, suggestion.path) +
            fuzzyMatch(search, suggestion.label),
        }))
        .filter((s) => s.matchScore && s.matchScore > 30)
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    return filtered.slice(0, MAX_SUGGESTIONS);
  }, [allSuggestions, search, selectedCategory]);

  // Group suggestions by category
  const groupedSuggestions = React.useMemo(() => {
    const groups: Record<string, FieldSuggestion[]> = {};

    filteredSuggestions.forEach((suggestion) => {
      if (!groups[suggestion.category]) {
        groups[suggestion.category] = [];
      }
      groups[suggestion.category].push(suggestion);
    });

    return groups;
  }, [filteredSuggestions]);

  // Calculate preview value
  React.useEffect(() => {
    if (!sampleData || !value) {
      setPreviewValue(null);
      return;
    }

    try {
      const pathParts = value
        .replace("$", "")
        .split(/[.[\]]/)
        .filter(Boolean);
      let current = sampleData;

      for (const part of pathParts) {
        if (current === null || current === undefined) {
          setPreviewValue(null);
          return;
        }

        if (part === "*") {
          setPreviewValue(Array.isArray(current) ? "[Array items]" : null);
          return;
        }

        current = current[part];
      }

      setPreviewValue(current);
    } catch {
      setPreviewValue(null);
    }
  }, [value, sampleData]);

  const handleSelect = (suggestion: FieldSuggestion) => {
    onChange(suggestion.path);
    setSearch("");

    // Update recent fields
    const newRecent = [
      suggestion.path,
      ...recentFields.filter((f) => f !== suggestion.path),
    ].slice(0, MAX_RECENT_FIELDS);
    setRecentFields(newRecent);
    localStorage.setItem(RECENT_FIELDS_KEY, JSON.stringify(newRecent));

    // Update popular fields
    const newPopular = { ...popularFields };
    newPopular[suggestion.path] = (newPopular[suggestion.path] || 0) + 1;
    setPopularFields(newPopular);
    localStorage.setItem(POPULAR_FIELDS_KEY, JSON.stringify(newPopular));

    // Delay closing to prevent flicker
    setTimeout(() => {
      setOpen(false);
      inputRef.current?.focus();
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearch(newValue);

    if (!isComposing) {
      onChange(newValue);
    }

    if (!open && newValue) {
      setOpen(true);
    }
  };

  const handleInputFocus = () => {
    // Small delay to prevent immediate close
    setTimeout(() => {
      setOpen(true);
    }, 100);
    onFocus?.();
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Don't close if clicking within the popover
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget?.closest('[role="dialog"]')) {
      return;
    }

    // Small delay to allow click events to fire
    setTimeout(() => {
      setOpen(false);
      onBlur?.();
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown" && !open) {
      setOpen(true);
    }
  };

  const fieldType =
    value && previewValue !== null ? getFieldType(previewValue) : null;
  const TypeIcon =
    fieldType && fieldType in typeIcons
      ? typeIcons[fieldType as keyof typeof typeIcons]
      : value
        ? FileJson
        : Search;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <TypeIcon
              className={cn(
                "h-4 w-4",
                value && previewValue !== null
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => {
              setIsComposing(false);
              onChange(search);
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
          />
          {showPreview && previewValue !== null && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
              <Badge variant="secondary" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                {typeof previewValue === "string"
                  ? previewValue.slice(0, 20)
                  : getFieldType(previewValue)}
              </Badge>
            </div>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 w-[600px]"
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <CommandPrimitive className="overflow-hidden rounded-md border shadow-md">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fields..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">ESC</span>
            </kbd>
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-1 border-b px-3 py-2">
            <Button
              variant={selectedCategory === null ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {Object.entries(categoryIcons).map(([category, Icon]) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSelectedCategory(category)}
              >
                <Icon className="h-3 w-3 mr-1" />
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          <div className="max-h-[400px] overflow-y-auto p-2">
            {Object.entries(groupedSuggestions).length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No fields found
              </div>
            ) : (
              Object.entries(groupedSuggestions).map(
                ([category, suggestions]) => {
                  const CategoryIcon =
                    categoryIcons[category as keyof typeof categoryIcons] ||
                    FileJson;

                  return (
                    <div key={category} className="mb-4 last:mb-0">
                      <div className="mb-2 flex items-center gap-2 px-2 text-xs font-medium text-muted-foreground">
                        <CategoryIcon className="h-3 w-3" />
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </div>

                      {suggestions.map((suggestion, index) => {
                        const FieldTypeIcon =
                          typeIcons[
                            suggestion.type as keyof typeof typeIcons
                          ] || FileJson;

                        return (
                          <button
                            key={`${suggestion.path}-${index}`}
                            onClick={() => handleSelect(suggestion)}
                            className={cn(
                              "relative flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                              "hover:bg-accent hover:text-accent-foreground",
                              "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                              "group",
                            )}
                          >
                            <FieldTypeIcon className="h-4 w-4 text-muted-foreground" />

                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {suggestion.label}
                                </span>
                                {suggestion.path !== suggestion.label && (
                                  <code className="text-xs text-muted-foreground">
                                    {suggestion.path}
                                  </code>
                                )}
                                {suggestion.usageCount &&
                                  suggestion.usageCount > 1 && (
                                    <Badge
                                      variant="secondary"
                                      className="h-5 text-[10px]"
                                    >
                                      {suggestion.usageCount}x
                                    </Badge>
                                  )}
                              </div>
                              {suggestion.description && (
                                <div className="text-xs text-muted-foreground">
                                  {suggestion.description}
                                </div>
                              )}
                              {suggestion.preview && (
                                <div className="text-xs text-muted-foreground truncate">
                                  Preview: {suggestion.preview}
                                </div>
                              )}
                            </div>

                            {suggestion.category === "ai" && (
                              <Zap className="h-3 w-3 text-yellow-500" />
                            )}

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                <CornerDownLeft className="h-3 w-3" />
                              </kbd>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                },
              )
            )}
          </div>

          {allowJsonPath && (
            <>
              <Separator />
              <div className="p-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Command className="h-3 w-3" />
                  <span>Pro tip: Use $ for JSON path expressions</span>
                  <ArrowRight className="h-3 w-3" />
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">{`$.users[?(@.age > 18)]`}</code>
                </div>
              </div>
            </>
          )}
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  );
}
