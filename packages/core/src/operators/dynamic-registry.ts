import type {
  OperatorStrategy,
  OperatorMetadata,
  OperatorFactory,
  OperatorConstructor,
  OperatorCategory,
} from "./base";
import type {
  OperatorIntelliSenseInfo,
  IntelliSenseRegistry,
} from "@root/types/operator-intellisense";

/**
 * Enhanced operator registry with dynamic TypeScript auto-completion support
 * Provides intelligent IntelliSense for both built-in and runtime registered operators
 */
export class DynamicOperatorRegistry {
  private static instance: DynamicOperatorRegistry;
  private operators: Map<string, OperatorFactory> = new Map();
  private metadata: Map<string, OperatorMetadata> = new Map();
  private intelliSenseData: IntelliSenseRegistry = {};
  private typeDeclarations: string[] = [];
  private initialized = false;

  private constructor() {
    // Private constructor for singleton
    this.setupBuiltInOperators();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DynamicOperatorRegistry {
    if (!DynamicOperatorRegistry.instance) {
      DynamicOperatorRegistry.instance = new DynamicOperatorRegistry();
    }
    return DynamicOperatorRegistry.instance;
  }

  /**
   * Register a new operator with full TypeScript support
   * @param operator The operator class or factory function
   * @param options Registration options
   */
  register(
    operator: OperatorConstructor | OperatorFactory,
    options: {
      override?: boolean;
      generateTypes?: boolean;
      category?: OperatorCategory;
      examples?: string[];
      documentation?: string;
    } = {},
  ): void {
    const {
      override = false,
      generateTypes = true,
      examples = [],
      documentation,
    } = options;

    // Create instance to get metadata
    const instance = this.createInstance(operator);
    const { name } = instance.metadata;

    if (this.operators.has(name) && !override) {
      throw new Error(
        `Operator "${name}" is already registered. Use override=true to replace.`,
      );
    }

    // Store factory function
    const factory =
      typeof operator === "function" && operator.prototype
        ? () => new (operator as OperatorConstructor)()
        : (operator as OperatorFactory);

    this.operators.set(name, factory);
    this.metadata.set(name, instance.metadata);

    // Create IntelliSense metadata
    const intelliSenseInfo: OperatorIntelliSenseInfo = {
      name,
      displayName: instance.metadata.displayName,
      description: instance.metadata.description,
      category: instance.metadata.category,
      acceptedFieldTypes: instance.metadata.acceptedFieldTypes,
      expectedValueType: instance.metadata.expectedValueType,
      requiresValue: instance.metadata.requiresValue,
      examples:
        examples.length > 0
          ? examples
          : [instance.metadata.example || `field: "${name}"`],
      documentation,
    };

    this.intelliSenseData[name] = intelliSenseInfo;

    // Generate TypeScript declarations for IDE auto-completion
    if (generateTypes) {
      this.generateTypeDeclaration(name, intelliSenseInfo);
    }

    // Notify IDE of new operator (in development mode)
    if (process.env.NODE_ENV === "development") {
      this.notifyIDEOfNewOperator(name, intelliSenseInfo);
    }
  }

  /**
   * Register multiple operators with bulk type generation
   */
  registerMany(
    operators: Array<{
      operator: OperatorConstructor | OperatorFactory;
      options?: {
        override?: boolean;
        generateTypes?: boolean;
        category?: OperatorCategory;
        examples?: string[];
        documentation?: string;
      };
    }>,
    bulkOptions?: {
      override?: boolean;
      generateTypes?: boolean;
    },
  ): void {
    const { override = false, generateTypes = true } = bulkOptions || {};

    // Disable individual type generation for performance
    for (const { operator, options } of operators) {
      this.register(operator, {
        ...options,
        override,
        generateTypes: false,
      });
    }

    // Generate all types at once
    if (generateTypes) {
      this.generateBulkTypeDeclarations();
    }
  }

  /**
   * Get operator with type safety
   */
  get(name: string): OperatorStrategy | null {
    const factory = this.operators.get(name);
    return factory ? factory() : null;
  }

  /**
   * Check if operator exists with type narrowing
   */
  has(name: string): boolean {
    return this.operators.has(name);
  }

  /**
   * Get all registered operator names with proper typing
   */
  getOperatorNames(): string[] {
    return Array.from(this.operators.keys());
  }

  /**
   * Get IntelliSense data for IDE integration
   */
  getIntelliSenseData(): IntelliSenseRegistry {
    return { ...this.intelliSenseData };
  }

  /**
   * Get operators by category with type filtering
   */
  getByCategory<C extends OperatorCategory>(
    category: C,
  ): Array<{
    name: string;
    metadata: OperatorIntelliSenseInfo;
  }> {
    return Object.entries(this.intelliSenseData)
      .filter(([_, meta]) => meta.category === category)
      .map(([name, metadata]) => ({
        name,
        metadata,
      }));
  }

  /**
   * Get operators compatible with a field type
   */
  getCompatibleOperators<T>(fieldType: T): Array<{
    name: string;
    metadata: OperatorIntelliSenseInfo;
    compatibility: "exact" | "compatible" | "any";
  }> {
    const jsType = this.inferJSType(fieldType);
    const fieldTypeStr = this.mapToFieldType(jsType);

    return Object.entries(this.intelliSenseData)
      .map(([name, metadata]) => {
        let compatibility: "exact" | "compatible" | "any" = "any";

        if (metadata.acceptedFieldTypes.includes(fieldTypeStr as any)) {
          compatibility = "exact";
        } else if (metadata.acceptedFieldTypes.includes("any")) {
          compatibility = "compatible";
        }

        return {
          name,
          metadata,
          compatibility,
        };
      })
      .filter(({ compatibility }) => compatibility !== "any")
      .sort((a, b) => {
        // Prioritize exact matches
        if (a.compatibility === "exact" && b.compatibility !== "exact")
          return -1;
        if (b.compatibility === "exact" && a.compatibility !== "exact")
          return 1;
        return a.name.localeCompare(b.name);
      });
  }

  /**
   * Get auto-completion suggestions based on partial input
   */
  getAutoCompletionSuggestions(
    partial: string,
    fieldType?: string,
    limit: number = 10,
  ): Array<{
    name: string;
    metadata: OperatorIntelliSenseInfo;
    score: number;
  }> {
    const normalizedPartial = partial.toLowerCase();

    return Object.entries(this.intelliSenseData)
      .map(([name, metadata]) => {
        let score = 0;

        // Exact prefix match gets highest score
        if (name.toLowerCase().startsWith(normalizedPartial)) {
          score += 100;
        }

        // Contains match gets medium score
        else if (name.toLowerCase().includes(normalizedPartial)) {
          score += 50;
        }

        // Display name or description match gets lower score
        else if (
          metadata.displayName.toLowerCase().includes(normalizedPartial) ||
          metadata.description.toLowerCase().includes(normalizedPartial)
        ) {
          score += 25;
        }

        // Boost score for field type compatibility
        if (
          fieldType &&
          metadata.acceptedFieldTypes.includes(fieldType as any)
        ) {
          score += 20;
        }

        return {
          name,
          metadata,
          score,
        };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Generate TypeScript module augmentation for new operators
   */
  private generateTypeDeclaration(
    name: string,
    metadata: OperatorIntelliSenseInfo,
  ): void {
    const typeDeclaration = `
declare module '@usex/rule-engine' {
  interface CustomOperatorNames {
    '${name}': {
      name: '${name}';
      displayName: '${metadata.displayName}';
      category: '${metadata.category}';
      description: '${metadata.description}';
      acceptedFieldTypes: [${metadata.acceptedFieldTypes.map((t) => `'${t}'`).join(", ")}];
      expectedValueType: '${metadata.expectedValueType}';
      requiresValue: ${metadata.requiresValue};
    };
  }
}`;

    this.typeDeclarations.push(typeDeclaration);
  }

  /**
   * Generate bulk type declarations for better performance
   */
  private generateBulkTypeDeclarations(): void {
    const customOperators = Array.from(this.operators.keys()).filter(
      (name) => !this.isBuiltInOperator(name),
    );

    if (customOperators.length === 0) return;

    const typeDeclaration = `
declare module '@usex/rule-engine' {
  interface CustomOperatorNames {
${customOperators
  .map((name) => {
    const metadata = this.intelliSenseData[name];
    if (!metadata) return "";
    return `    '${name}': {
      name: '${name}';
      displayName: '${metadata.displayName}';
      category: '${metadata.category}';
      description: '${metadata.description}';
      acceptedFieldTypes: [${metadata.acceptedFieldTypes.map((t) => `'${t}'`).join(", ")}];
      expectedValueType: '${metadata.expectedValueType}';
      requiresValue: ${metadata.requiresValue};
    };`;
  })
  .filter(Boolean)
  .join("\n")}
  }
}`;

    this.typeDeclarations.push(typeDeclaration);
  }

  /**
   * Export type declarations for IDE consumption
   */
  exportTypeDeclarations(): string {
    return this.typeDeclarations.join("\n\n");
  }

  /**
   * Notify IDE of new operator (development mode only)
   */
  private notifyIDEOfNewOperator(
    name: string,
    metadata: OperatorIntelliSenseInfo,
  ): void {
    // In a real implementation, this would communicate with TypeScript Language Server
    // For now, we'll log for development purposes
    console.log(`[Rule Engine] New operator registered: ${name}`, {
      category: metadata.category,
      description: metadata.description,
      examples: metadata.examples,
    });
  }

  /**
   * Setup built-in operators metadata
   */
  private setupBuiltInOperators(): void {
    // This would be populated with all built-in operators
    // For brevity, showing a few examples
    const builtInOperators: Record<string, OperatorIntelliSenseInfo> = {
      equals: {
        name: "equals",
        displayName: "Equals",
        description: "Checks if field value equals the specified value",
        category: "comparison" as OperatorCategory,
        acceptedFieldTypes: ["any"],
        expectedValueType: "any",
        requiresValue: true,
        examples: [
          '{ field: "name", operator: "equals", value: "John" }',
          '{ field: "age", operator: "equals", value: 25 }',
        ],
      },
      "greater-than": {
        name: "greater-than",
        displayName: "Greater Than",
        description:
          "Checks if field value is greater than the specified value",
        category: "comparison" as OperatorCategory,
        acceptedFieldTypes: ["number", "date"],
        expectedValueType: "number",
        requiresValue: true,
        examples: [
          '{ field: "age", operator: "greater-than", value: 18 }',
          '{ field: "salary", operator: "greater-than", value: 50000 }',
        ],
      },
      contains: {
        name: "contains",
        displayName: "Contains",
        description: "Checks if array or string contains the specified value",
        category: "array" as OperatorCategory,
        acceptedFieldTypes: ["array", "string"],
        expectedValueType: "any",
        requiresValue: true,
        examples: [
          '{ field: "tags", operator: "contains", value: "urgent" }',
          '{ field: "description", operator: "contains", value: "important" }',
        ],
      },
      email: {
        name: "email",
        displayName: "Email",
        description: "Validates if field value is a valid email address",
        category: "string" as OperatorCategory,
        acceptedFieldTypes: ["string"],
        expectedValueType: "boolean",
        requiresValue: true,
        examples: ['{ field: "email", operator: "email", value: true }'],
      },
    };

    Object.entries(builtInOperators).forEach(([name, metadata]) => {
      this.intelliSenseData[name] = metadata;
    });
  }

  /**
   * Check if operator is built-in
   */
  private isBuiltInOperator(name: string): boolean {
    const builtInOperators = [
      "equals",
      "not-equals",
      "greater-than",
      "less-than",
      "greater-than-or-equals",
      "less-than-or-equals",
      "like",
      "not-like",
      "starts-with",
      "ends-with",
      "contains",
      "not-contains",
      "in",
      "not-in",
      "matches",
      "not-matches",
      "exists",
      "not-exists",
      "empty",
      "not-empty",
      "email",
      "url",
      "between",
      "date-after",
      "date-before",
      "truthy",
      "falsy",
      "array-length",
      // Add more built-in operators as needed
    ];
    return builtInOperators.includes(name);
  }

  /**
   * Infer JavaScript type from value
   */
  private inferJSType(value: any): string {
    if (value === null || value === undefined) return "any";
    if (Array.isArray(value)) return "array";
    if (value instanceof Date) return "date";
    return typeof value;
  }

  /**
   * Map JavaScript type to FieldType
   */
  private mapToFieldType(jsType: string): string {
    const typeMap: Record<string, string> = {
      string: "string",
      number: "number",
      boolean: "boolean",
      date: "date",
      array: "array",
      object: "object",
    };
    return typeMap[jsType] || "any";
  }

  /**
   * Create an instance from a constructor or factory
   */
  private createInstance(
    operator: OperatorConstructor | OperatorFactory,
  ): OperatorStrategy {
    if (typeof operator === "function" && operator.prototype) {
      return new (operator as OperatorConstructor)();
    }
    return (operator as OperatorFactory)();
  }

  /**
   * Clear all operators (useful for testing)
   */
  clear(): void {
    this.operators.clear();
    this.metadata.clear();
    this.intelliSenseData = {};
    this.typeDeclarations = [];
    this.initialized = false;
    this.setupBuiltInOperators(); // Restore built-ins
  }

  /**
   * Export registry state for debugging/introspection
   */
  exportState(): {
    operators: string[];
    intelliSenseData: IntelliSenseRegistry;
    typeDeclarations: string[];
  } {
    return {
      operators: Array.from(this.operators.keys()),
      intelliSenseData: { ...this.intelliSenseData },
      typeDeclarations: [...this.typeDeclarations],
    };
  }
}

// Export singleton instance
export const dynamicOperatorRegistry = DynamicOperatorRegistry.getInstance();

// Export utility functions for TypeScript integration
export const OperatorIntelliSense = {
  /**
   * Get auto-completion suggestions for IDE
   */
  getSuggestions: (partial: string, fieldType?: string, limit?: number) =>
    dynamicOperatorRegistry.getAutoCompletionSuggestions(
      partial,
      fieldType,
      limit,
    ),

  /**
   * Get operators compatible with a field type
   */
  getCompatibleOperators: <T>(fieldType: T) =>
    dynamicOperatorRegistry.getCompatibleOperators(fieldType),

  /**
   * Get all operator metadata for IDE integration
   */
  getAllMetadata: () => dynamicOperatorRegistry.getIntelliSenseData(),

  /**
   * Export type declarations for TypeScript integration
   */
  exportTypes: () => dynamicOperatorRegistry.exportTypeDeclarations(),
};
