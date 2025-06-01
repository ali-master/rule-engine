/**
 * Operator Registry - Central management for all operators
 */

import { Operators } from "@root/enums";
import type { OperatorsType } from "@root/types";
import type {
  OperatorStrategy,
  OperatorMetadata,
  OperatorFactory,
  OperatorConstructor,
  OperatorCategory,
} from "./base";

/**
 * Registry for managing operators
 */
export class OperatorRegistry {
  private static instance: OperatorRegistry;
  private operators: Map<OperatorsType, OperatorFactory> = new Map();
  private metadata: Map<OperatorsType, OperatorMetadata> = new Map();
  private initialized = false;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): OperatorRegistry {
    if (!OperatorRegistry.instance) {
      OperatorRegistry.instance = new OperatorRegistry();
    }
    return OperatorRegistry.instance;
  }

  /**
   * Register a new operator
   * @param operator The operator class or factory function
   * @param override Whether to override existing operator
   */
  register(
    operator: OperatorConstructor | OperatorFactory,
    override = false,
  ): void {
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
  }

  /**
   * Register multiple operators at once
   * @param operators Array of operator classes or factories
   * @param override Whether to override existing operators
   */
  registerMany(
    operators: Array<OperatorConstructor | OperatorFactory>,
    override = false,
  ): void {
    for (const operator of operators) {
      this.register(operator, override);
    }
  }

  /**
   * Unregister an operator
   * @param name The operator name
   */
  unregister(name: OperatorsType): boolean {
    const deleted = this.operators.delete(name);
    this.metadata.delete(name);
    return deleted;
  }

  /**
   * Get an operator instance by name
   * @param name The operator name
   * @returns The operator instance or null
   */
  get(name: OperatorsType): OperatorStrategy | null {
    const factory = this.operators.get(name);
    return factory ? factory() : null;
  }

  /**
   * Check if an operator is registered
   * @param name The operator name
   */
  has(name: OperatorsType): boolean {
    return this.operators.has(name);
  }

  /**
   * Get all registered operator names
   */
  getOperatorNames(): OperatorsType[] {
    return Array.from(this.operators.keys());
  }

  /**
   * Get all operator metadata
   */
  getAllMetadata(): OperatorMetadata[] {
    return Array.from(this.metadata.values());
  }

  /**
   * Get operators by category
   * @param category The operator category
   */
  getByCategory(category: OperatorCategory): OperatorMetadata[] {
    return this.getAllMetadata().filter((meta) => meta.category === category);
  }

  /**
   * Get operators that accept a specific field type
   * @param fieldType The field type
   */
  getByFieldType(fieldType: string): OperatorMetadata[] {
    return this.getAllMetadata().filter((meta) =>
      meta.acceptedFieldTypes.includes(fieldType as any),
    );
  }

  /**
   * Clear all registered operators
   */
  clear(): void {
    this.operators.clear();
    this.metadata.clear();
    this.initialized = false;
  }

  /**
   * Check if operators have been initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Mark as initialized
   */
  markInitialized(): void {
    this.initialized = true;
  }

  /**
   * Get negated operator for a given operator
   * @param name The operator name
   * @returns The negated operator name or null
   */
  getNegatedOperator(name: OperatorsType): OperatorsType | null {
    // Map of operators to their negated versions
    const negationMap: Partial<Record<OperatorsType, OperatorsType>> = {
      [Operators.Equals]: Operators.NotEquals,
      [Operators.NotEquals]: Operators.Equals,
      [Operators.Like]: Operators.NotLike,
      [Operators.NotLike]: Operators.Like,
      [Operators.GreaterThan]: Operators.LessThanOrEquals,
      [Operators.LessThan]: Operators.GreaterThanOrEquals,
      [Operators.GreaterThanOrEquals]: Operators.LessThan,
      [Operators.LessThanOrEquals]: Operators.GreaterThan,
      [Operators.In]: Operators.NotIn,
      [Operators.NotIn]: Operators.In,
      [Operators.Contains]: Operators.NotContains,
      [Operators.NotContains]: Operators.Contains,
      [Operators.ContainsAny]: Operators.NotContainsAny,
      [Operators.NotContainsAny]: Operators.ContainsAny,
      [Operators.ContainsAll]: Operators.NotContainsAll,
      [Operators.NotContainsAll]: Operators.ContainsAll,
      [Operators.Matches]: Operators.NotMatches,
      [Operators.NotMatches]: Operators.Matches,
      [Operators.Exists]: Operators.NotExists,
      [Operators.NotExists]: Operators.Exists,
      [Operators.Empty]: Operators.NotEmpty,
      [Operators.NotEmpty]: Operators.Empty,
      [Operators.NullOrUndefined]: Operators.NotNullOrUndefined,
      [Operators.NotNullOrUndefined]: Operators.NullOrUndefined,
      [Operators.DateAfter]: Operators.DateBeforeOrEquals,
      [Operators.DateBefore]: Operators.DateAfterOrEquals,
      [Operators.DateAfterOrEquals]: Operators.DateBefore,
      [Operators.DateBeforeOrEquals]: Operators.DateAfter,
      [Operators.DateEquals]: Operators.DateNotEquals,
      [Operators.DateNotEquals]: Operators.DateEquals,
      [Operators.DateBetween]: Operators.DateNotBetween,
      [Operators.DateNotBetween]: Operators.DateBetween,
      [Operators.Boolean]: Operators.NotBoolean,
      [Operators.NotBoolean]: Operators.Boolean,
      [Operators.String]: Operators.NotString,
      [Operators.NotString]: Operators.String,
      [Operators.Number]: Operators.NotNumber,
      [Operators.NotNumber]: Operators.Number,
      [Operators.Array]: Operators.NotArray,
      [Operators.NotArray]: Operators.Array,
      [Operators.Object]: Operators.NotObject,
      [Operators.NotObject]: Operators.Object,
      // Add more mappings as needed
    };

    return negationMap[name] || null;
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
   * Export registry data for introspection
   */
  export(): {
    operators: Array<{
      name: OperatorsType;
      metadata: OperatorMetadata;
    }>;
  } {
    return {
      operators: Array.from(this.metadata.entries()).map(
        ([name, metadata]) => ({
          name,
          metadata,
        }),
      ),
    };
  }

  /**
   * Import registry data (useful for testing or configuration)
   */
  import(data: {
    operators: Array<{
      name: OperatorsType;
      factory: OperatorFactory;
    }>;
  }): void {
    this.clear();
    for (const { name, factory } of data.operators) {
      const instance = factory();
      this.operators.set(name, factory);
      this.metadata.set(name, instance.metadata);
    }
  }
}

// Export singleton instance
export const operatorRegistry = OperatorRegistry.getInstance();
