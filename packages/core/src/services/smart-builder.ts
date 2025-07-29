import type {
  ValueSelector,
  SmartRuleBuilder,
  SmartRule,
  SmartConstraint,
  SmartCondition,
  OperatorSelector,
  InferValueTypeForOperator,
  ConstraintBuilder,
  AutoCompletionContext,
} from "@root/types/operator-intellisense";
import { dynamicOperatorRegistry } from "@root/operators/dynamic-registry";

/**
 * Smart rule builder with TypeScript auto-completion and intelligent operator suggestions
 * Provides IDE-friendly interface for building type-safe rules
 */
export class TypeSafeRuleBuilder<TResult = any, TData = any>
  implements SmartRuleBuilder<TResult, TData>
{
  private currentRule: Partial<SmartRule<TResult, TData>> = {};
  private currentConditions: Array<SmartCondition<TResult, TData>> = [];
  private context: AutoCompletionContext<TData>;

  constructor(context?: Partial<AutoCompletionContext<TData>>) {
    this.context = {
      availableFields: [],
      suggestedOperators: [],
      operatorMetadata: {},
      ...context,
    };

    // Initialize with current operator metadata
    this.context.operatorMetadata =
      dynamicOperatorRegistry.getIntelliSenseData();
    this.context.suggestedOperators =
      dynamicOperatorRegistry.getOperatorNames();
  }

  /**
   * Start building a constraint with intelligent field suggestions
   */
  field<K extends keyof TData>(
    field: K,
  ): OperatorSelector<TData[K], TResult, TData>;
  field(field: string): OperatorSelector<any, TResult, TData>;
  field<K extends keyof TData>(
    field: K | string,
  ): OperatorSelector<TData[K], TResult, TData> {
    return new TypeSafeOperatorSelector<TData[K], TResult, TData>(
      field as string,
      this.context,
      this,
    );
  }

  /**
   * Add a pre-built condition to the rule
   */
  addCondition(condition: SmartCondition<TResult, TData>): this {
    this.currentConditions.push(condition);
    return this;
  }

  /**
   * Set the default result for the rule
   */
  default(result: TResult): this {
    this.currentRule.default = result;
    return this;
  }

  /**
   * Build the final rule with type safety
   */
  build(): SmartRule<TResult, TData> {
    if (this.currentConditions.length === 0) {
      throw new Error("Cannot build rule with no conditions");
    }

    const conditions =
      this.currentConditions.length === 1
        ? this.currentConditions[0]! // Non-null assertion since we checked length
        : this.currentConditions;

    return {
      conditions,
      ...(this.currentRule.default && { default: this.currentRule.default }),
    };
  }

  /**
   * Get auto-completion context for IDE integration
   */
  getContext(): AutoCompletionContext<TData> {
    return { ...this.context };
  }

  /**
   * Update available fields for better auto-completion
   */
  withFields<T>(
    fields: Array<{
      name: keyof T | string;
      type:
        | "string"
        | "number"
        | "boolean"
        | "date"
        | "array"
        | "object"
        | "any";
      description?: string;
    }>,
  ): TypeSafeRuleBuilder<TResult, T> {
    const newBuilder = new TypeSafeRuleBuilder<TResult, T>({
      availableFields: fields.map((f) => ({
        name: f.name as string,
        type: f.type,
        description: f.description,
      })),
      suggestedOperators: this.context.suggestedOperators,
      operatorMetadata: this.context.operatorMetadata,
    });

    return newBuilder;
  }

  /**
   * Create a new builder from existing conditions
   */
  static from<TResult, TData>(
    conditions: Array<SmartCondition<TResult, TData>>,
    context?: Partial<AutoCompletionContext<TData>>,
  ): TypeSafeRuleBuilder<TResult, TData> {
    const builder = new TypeSafeRuleBuilder<TResult, TData>(context);
    conditions.forEach((condition) => builder.addCondition(condition));
    return builder;
  }
}

/**
 * Operator selector with intelligent suggestions based on field type
 */
class TypeSafeOperatorSelector<TField, TResult, TData>
  implements OperatorSelector<TField, TResult, TData>
{
  constructor(
    private fieldName: string,
    private context: AutoCompletionContext<TData>,
    private builder: TypeSafeRuleBuilder<TResult, TData>,
  ) {
    // Update context with current field
    this.context.currentField = fieldName;
  }

  /**
   * Select an operator with type-safe suggestions
   */
  operator<O extends string>(
    operator: O,
  ): ValueSelector<TField, O, TResult, TData> {
    // Update context with current operator
    this.context.currentOperator = operator as any;

    return new TypeSafeValueSelector<TField, O, TResult, TData>(
      this.fieldName,
      operator,
      this.context,
      this.builder,
    );
  }
}

/**
 * Value selector with type inference for operator values
 */
class TypeSafeValueSelector<TField, TOperator extends string, TResult, TData>
  implements ValueSelector<TField, TOperator, TResult, TData>
{
  constructor(
    private fieldName: string,
    private operator: TOperator,
    private context: AutoCompletionContext<TData>,
    private builder: TypeSafeRuleBuilder<TResult, TData>,
  ) {}

  /**
   * Set value with type inference
   */
  value(
    value: InferValueTypeForOperator<TOperator>,
  ): ConstraintBuilder<TResult, TData> {
    // Update context with current value
    this.context.currentValue = value;

    const constraint: SmartConstraint<TData> = {
      field: this.fieldName,
      operator: this.operator as any,
      value,
    };

    return new TypeSafeConstraintBuilder<TResult, TData>(
      constraint,
      this.context,
      this.builder,
    );
  }

  /**
   * For operators that don't require values
   */
  noValue(): ConstraintBuilder<TResult, TData> {
    const constraint: SmartConstraint<TData> = {
      field: this.fieldName,
      operator: this.operator as any,
    };

    return new TypeSafeConstraintBuilder<TResult, TData>(
      constraint,
      this.context,
      this.builder,
    );
  }
}

/**
 * Constraint builder for chaining conditions
 */
class TypeSafeConstraintBuilder<TResult, TData>
  implements ConstraintBuilder<TResult, TData>
{
  constructor(
    private constraint: SmartConstraint<TData>,
    private context: AutoCompletionContext<TData>,
    private builder: TypeSafeRuleBuilder<TResult, TData>,
  ) {}

  /**
   * Add AND condition
   */
  and(): SmartRuleBuilder<TResult, TData> {
    // Create condition with current constraint and prepare for AND
    const condition: SmartCondition<TResult, TData> = {
      and: [this.constraint],
    };

    this.builder.addCondition(condition);
    return new AndOrBuilder<TResult, TData>(condition, "and", this.context);
  }

  /**
   * Add OR condition
   */
  or(): SmartRuleBuilder<TResult, TData> {
    // Create condition with current constraint and prepare for OR
    const condition: SmartCondition<TResult, TData> = {
      or: [this.constraint],
    };

    this.builder.addCondition(condition);
    return new AndOrBuilder<TResult, TData>(condition, "or", this.context);
  }

  /**
   * Set result for this constraint
   */
  result(result: TResult): SmartRule<TResult, TData> {
    const condition: SmartCondition<TResult, TData> = {
      and: [this.constraint],
      result,
    };

    this.builder.addCondition(condition);
    return this.builder.build();
  }

  /**
   * Build rule with just this constraint
   */
  build(): SmartRule<TResult, TData> {
    const condition: SmartCondition<TResult, TData> = {
      and: [this.constraint],
    };

    this.builder.addCondition(condition);
    return this.builder.build();
  }
}

/**
 * Builder for AND/OR conditions
 */
class AndOrBuilder<TResult, TData> implements SmartRuleBuilder<TResult, TData> {
  constructor(
    private condition: SmartCondition<TResult, TData>,
    private type: "and" | "or",
    private context: AutoCompletionContext<TData>,
  ) {}

  /**
   * Add another field constraint to the AND/OR condition
   */
  field<K extends keyof TData>(
    field: K,
  ): OperatorSelector<TData[K], TResult, TData>;
  field(field: string): OperatorSelector<any, TResult, TData>;
  field<K extends keyof TData>(
    field: K | string,
  ): OperatorSelector<TData[K], TResult, TData> {
    return new ChainedOperatorSelector<TData[K], TResult, TData>(
      field as string,
      this.condition,
      this.type,
      this.context,
    );
  }
}

/**
 * Chained operator selector for AND/OR conditions
 */
class ChainedOperatorSelector<TField, TResult, TData>
  implements OperatorSelector<TField, TResult, TData>
{
  constructor(
    private fieldName: string,
    private condition: SmartCondition<TResult, TData>,
    private type: "and" | "or",
    private context: AutoCompletionContext<TData>,
  ) {}

  operator<O extends string>(
    operator: O,
  ): ValueSelector<TField, O, TResult, TData> {
    return new ChainedValueSelector<TField, O, TResult, TData>(
      this.fieldName,
      operator,
      this.condition,
      this.type,
      this.context,
    );
  }
}

/**
 * Chained value selector for AND/OR conditions
 */
class ChainedValueSelector<TField, TOperator extends string, TResult, TData>
  implements ValueSelector<TField, TOperator, TResult, TData>
{
  constructor(
    private fieldName: string,
    private operator: TOperator,
    private condition: SmartCondition<TResult, TData>,
    private type: "and" | "or",
    private context: AutoCompletionContext<TData>,
  ) {}

  value(
    value: InferValueTypeForOperator<TOperator>,
  ): ConstraintBuilder<TResult, TData> {
    const constraint: SmartConstraint<TData> = {
      field: this.fieldName,
      operator: this.operator as any,
      value,
    };

    // Add constraint to existing condition
    if (this.type === "and") {
      if (!this.condition.and) this.condition.and = [];
      this.condition.and.push(constraint);
    } else {
      if (!this.condition.or) this.condition.or = [];
      this.condition.or.push(constraint);
    }

    return new ChainedConstraintBuilder<TResult, TData>(
      this.condition,
      this.context,
    );
  }

  noValue(): ConstraintBuilder<TResult, TData> {
    const constraint: SmartConstraint<TData> = {
      field: this.fieldName,
      operator: this.operator as any,
    };

    // Add constraint to existing condition
    if (this.type === "and") {
      if (!this.condition.and) this.condition.and = [];
      this.condition.and.push(constraint);
    } else {
      if (!this.condition.or) this.condition.or = [];
      this.condition.or.push(constraint);
    }

    return new ChainedConstraintBuilder<TResult, TData>(
      this.condition,
      this.context,
    );
  }
}

/**
 * Constraint builder for chained conditions
 */
class ChainedConstraintBuilder<TResult, TData>
  implements ConstraintBuilder<TResult, TData>
{
  constructor(
    private condition: SmartCondition<TResult, TData>,
    private context: AutoCompletionContext<TData>,
  ) {}

  and(): SmartRuleBuilder<TResult, TData> {
    return new AndOrBuilder<TResult, TData>(
      this.condition,
      "and",
      this.context,
    );
  }

  or(): SmartRuleBuilder<TResult, TData> {
    return new AndOrBuilder<TResult, TData>(this.condition, "or", this.context);
  }

  result(result: TResult): SmartRule<TResult, TData> {
    this.condition.result = result;
    return {
      conditions: this.condition,
    };
  }

  build(): SmartRule<TResult, TData> {
    return {
      conditions: this.condition,
    };
  }
}

// Export utility functions for creating builders
export const RuleBuilder = {
  /**
   * Create a new type-safe rule builder
   */
  create<TResult = any, TData = any>(
    context?: Partial<AutoCompletionContext<TData>>,
  ): TypeSafeRuleBuilder<TResult, TData> {
    return new TypeSafeRuleBuilder<TResult, TData>(context);
  },

  /**
   * Create a builder with predefined field types
   */
  withFields<TResult = any, TData = any>(
    fields: Array<{
      name: keyof TData | string;
      type:
        | "string"
        | "number"
        | "boolean"
        | "date"
        | "array"
        | "object"
        | "any";
      description?: string;
    }>,
  ): TypeSafeRuleBuilder<TResult, TData> {
    return new TypeSafeRuleBuilder<TResult, TData>().withFields(fields);
  },

  /**
   * Create a builder from existing conditions
   */
  from<TResult, TData>(
    conditions: Array<SmartCondition<TResult, TData>>,
    context?: Partial<AutoCompletionContext<TData>>,
  ): TypeSafeRuleBuilder<TResult, TData> {
    return TypeSafeRuleBuilder.from(conditions, context);
  },
};

// Export default builder instance
export const smartRuleBuilder = RuleBuilder.create();
