import { useState, useEffect, useCallback } from "react";
import type { FieldConfig } from "../types";

interface UseFieldDiscoveryOptions {
  sampleData?: Record<string, any>;
  maxDepth?: number;
  includeArrayIndices?: boolean;
  customFields?: FieldConfig[];
}

export function useFieldDiscovery(options: UseFieldDiscoveryOptions = {}) {
  const {
    sampleData = {},
    maxDepth = 5,
    includeArrayIndices = false,
    customFields = [],
  } = options;

  const [discoveredFields, setDiscoveredFields] = useState<FieldConfig[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);

  const getFieldType = (value: any): FieldConfig["type"] => {
    if (value === null || value === undefined) return "string";
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (value instanceof Date) return "date";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return "object";
    return "string";
  };

  const discoverFields = useCallback(
    (
      obj: any,
      prefix = "",
      depth = 0,
      discovered: Map<string, FieldConfig> = new Map(),
    ): Map<string, FieldConfig> => {
      if (depth > maxDepth) return discovered;

      Object.entries(obj).forEach(([key, value]) => {
        const fieldPath = prefix ? `${prefix}.${key}` : key;
        const jsonPath = `$.${fieldPath}`;

        // Skip if already discovered
        if (discovered.has(fieldPath)) return;

        const fieldType = getFieldType(value);
        const fieldConfig: FieldConfig = {
          name: fieldPath,
          label:
            key.charAt(0).toUpperCase() +
            key
              .slice(1)
              .replace(/([A-Z])/g, " $1")
              .trim(),
          type: fieldType,
          jsonPath: true,
          group: prefix ? prefix.split(".")[0] : "Root",
          description: `Field at path: ${jsonPath}`,
        };

        discovered.set(fieldPath, fieldConfig);

        // Recursively discover nested fields
        if (fieldType === "object" && value !== null) {
          discoverFields(
            value as Record<string, any>,
            fieldPath,
            depth + 1,
            discovered,
          );
        } else if (
          fieldType === "array" &&
          Array.isArray(value) &&
          value.length > 0
        ) {
          // Discover fields from first array item
          const firstItem = value[0];
          if (typeof firstItem === "object" && firstItem !== null) {
            if (includeArrayIndices) {
              // Include specific array indices
              (value as any[]).forEach((item: any, index: number) => {
                if (typeof item === "object" && item !== null) {
                  discoverFields(
                    item,
                    `${fieldPath}[${index}]`,
                    depth + 1,
                    discovered,
                  );
                }
              });
            } else {
              // Use wildcard for arrays
              discoverFields(
                firstItem,
                `${fieldPath}[*]`,
                depth + 1,
                discovered,
              );
            }
          }
        }
      });

      return discovered;
    },
    [maxDepth, includeArrayIndices],
  );

  const discoverFromData = useCallback(
    (data: any) => {
      if (!data || typeof data !== "object") return;

      setIsDiscovering(true);
      try {
        const discovered = discoverFields(data);
        const fields = Array.from(discovered.values());

        // Add common JSONPath expressions
        const commonPaths: FieldConfig[] = [
          {
            name: "$",
            label: "Root Object",
            type: "object",
            jsonPath: true,
            group: "JSONPath",
            description: "The entire data object",
          },
          {
            name: "$..*",
            label: "All Fields (Recursive)",
            type: "array",
            jsonPath: true,
            group: "JSONPath",
            description: "All fields at any depth",
          },
        ];

        // Merge with custom fields
        const allFields = [...commonPaths, ...fields, ...customFields];

        // Remove duplicates by name
        const uniqueFields = Array.from(
          new Map(allFields.map((field) => [field.name, field])).values(),
        );

        setDiscoveredFields(uniqueFields);
      } finally {
        setIsDiscovering(false);
      }
    },
    [discoverFields, customFields],
  );

  // Auto-discover from sample data
  useEffect(() => {
    if (!sampleData || typeof sampleData !== "object") return;

    // Use a timeout to avoid synchronous state updates
    const timeoutId = setTimeout(() => {
      discoverFromData(sampleData);
    }, 0);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Get suggested fields based on input
  const getSuggestedFields = useCallback(
    (input: string): FieldConfig[] => {
      if (!input) return discoveredFields;

      const inputLower = input.toLowerCase();

      // If input looks like JSONPath, suggest JSONPath completions
      if (input.startsWith("$")) {
        const pathSuggestions: FieldConfig[] = [];

        // Extract the partial path
        const partialPath = input.substring(2); // Remove $. prefix

        discoveredFields.forEach((field) => {
          if (field.name.toLowerCase().includes(partialPath.toLowerCase())) {
            pathSuggestions.push({
              ...field,
              name: `$.${field.name}`,
              label: `$.${field.name}`,
            });
          }
        });

        // Add recursive descent suggestions
        if (partialPath.includes(".")) {
          const lastPart = partialPath.split(".").pop() || "";
          pathSuggestions.push({
            name: `$..${lastPart}`,
            label: `All "${lastPart}" fields (recursive)`,
            type: "array",
            jsonPath: true,
            group: "JSONPath",
            description: "Search for this field at any depth",
          });
        }

        return pathSuggestions;
      }

      // Regular field search
      return discoveredFields.filter(
        (field) =>
          field.name.toLowerCase().includes(inputLower) ||
          field.label?.toLowerCase().includes(inputLower) ||
          field.group?.toLowerCase().includes(inputLower),
      );
    },
    [discoveredFields],
  );

  // Validate JSONPath expression
  const validateJsonPath = useCallback(
    (path: string): { valid: boolean; error?: string } => {
      try {
        // Basic JSONPath validation
        if (!path.startsWith("$")) {
          return { valid: false, error: "JSONPath must start with $" };
        }

        // Check for valid JSONPath syntax
        const validPatterns = [
          /^\$$/, // Root
          /^\$\.[a-z_]\w*$/i, // Simple property
          /^\$\.\w+(\.\w+)*$/, // Nested properties
          /^\$\.\w+\[\d+\]$/, // Array index
          /^\$\.\w+\[\*\]$/, // Array wildcard
          /^\$\.\.\w+$/, // Recursive descent
          /^\$\.\w+\[([?@])[^\]]+\]$/, // Filter expression
        ];

        const isValid = validPatterns.some((pattern) => pattern.test(path));

        if (!isValid && path.length > 2) {
          return { valid: false, error: "Invalid JSONPath syntax" };
        }

        return { valid: true };
      } catch {
        return { valid: false, error: "Invalid JSONPath expression" };
      }
    },
    [],
  );

  return {
    fields: discoveredFields,
    isDiscovering,
    discoverFromData,
    getSuggestedFields,
    validateJsonPath,
  };
}
