import { RuleTypeError, clone } from "@root/utils";
import { Logger } from "@root/services/logger";
import { ObjectDiscovery } from "@root/services/object-discovery";
import { operatorRegistry } from "@root/operators/registry";
// Enums
import { Operators, ConditionTypes } from "@root/enums";
// Types
import type {
  RuleType,
  OperatorsType,
  IntrospectionStep,
  IntrospectionResult,
  EngineResult,
  CriteriaRange,
  Constraint,
  ConditionType,
  Condition,
} from "@root/types";

/**
 * Enhanced introspection result with operator metadata
 */
export interface EnhancedIntrospectionResult<R = any>
  extends IntrospectionResult<R> {
  /**
   * Metadata about operators used in the rule
   */
  operatorMetadata?: {
    /**
     * All operators used in the rule
     */
    usedOperators: Set<OperatorsType>;

    /**
     * Operators grouped by category
     */
    operatorsByCategory: Record<string, OperatorsType[]>;

    /**
     * Field types expected by the rule
     */
    expectedFieldTypes: Record<string, Set<string>>;

    /**
     * Validation warnings
     */
    warnings?: string[];
  };

  /**
   * Rule complexity metrics
   */
  complexity?: {
    /**
     * Maximum nesting depth
     */
    maxDepth: number;

    /**
     * Total number of conditions
     */
    totalConditions: number;

    /**
     * Total number of constraints
     */
    totalConstraints: number;

    /**
     * Number of unique fields referenced
     */
    uniqueFields: number;
  };
}

export class Introspector {
  private steps: IntrospectionStep[] | undefined;
  private readonly discovery = new ObjectDiscovery();
  private usedOperators: Set<OperatorsType> = new Set();
  private fieldTypes: Map<string, Set<string>> = new Map();
  private warnings: string[] = [];
  private maxDepth = 0;
  private totalConditions = 0;
  private totalConstraints = 0;
  private uniqueFields: Set<string> = new Set();

  /**
   * Given a rule, checks the constraints and conditions to determine
   * the possible range of input criteria which would be satisfied by the rule.
   * Enhanced with operator metadata and validation.
   *
   * @template R The type of the rule result.
   * @param rule The rule to evaluate.
   * @param options Introspection options
   * @throws RuleTypeError if the rule is not granular
   */
  introspect<R = any>(
    rule: RuleType<R>,
    options?: {
      includeMetadata?: boolean;
      includeComplexity?: boolean;
      validateOperators?: boolean;
    },
  ): EnhancedIntrospectionResult<R> {
    // Reset state
    this.resetState();

    // The ruleset needs to be granular for this operation to work
    if (!this.discovery.isGranular(rule)) {
      throw new RuleTypeError(
        "The provided rule is not granular. A granular rule is required for Introspection",
      );
    }

    // Initialize a clean steps array each time we introspect
    this.steps = [];

    const conditions = this.discovery.getConditions(rule);

    // Then we map each result to the condition that produces
    // it to create a map of results to conditions
    const conditionMap = new Map<EngineResult<R>, Array<Condition<R>>>();
    for (const condition of conditions) {
      const result = condition.result!;
      const data = conditionMap.get(result) ?? [];
      if (!data.length) {
        conditionMap.set(result, data);
      }

      data.push(condition);
    }

    // Using this information, we can build the skeleton of the introspected criteria range
    const criteriaRange: Array<CriteriaRange<R>> = [];
    for (const result of conditionMap.keys()) {
      criteriaRange.push({
        result,
        options: [],
      });
    }

    // Populate criteria ranges
    const results = this.resolveCriteriaRanges(criteriaRange, conditionMap);

    // Build the base introspection result
    const baseResult: IntrospectionResult<R> = {
      results,
      ...("default" in rule && rule.default !== undefined
        ? { default: rule.default }
        : {}),
    };

    // Add enhanced metadata if requested
    if (options?.includeMetadata || options?.includeComplexity) {
      const enhancedResult: EnhancedIntrospectionResult<R> = {
        ...baseResult,
      };

      if (options.includeMetadata) {
        enhancedResult.operatorMetadata = this.buildOperatorMetadata();
      }

      if (options.includeComplexity) {
        enhancedResult.complexity = {
          maxDepth: this.maxDepth,
          totalConditions: this.totalConditions,
          totalConstraints: this.totalConstraints,
          uniqueFields: this.uniqueFields.size,
        };
      }

      return enhancedResult;
    }

    return baseResult;
  }

  /**
   * Validate that all operators in the rule are registered
   */
  validateOperators(rule: RuleType): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const conditions = this.discovery.getConditions(rule);

    this.validateConditionsOperators(conditions, errors);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get all operators used in a rule
   */
  getUsedOperators(rule: RuleType): Set<OperatorsType> {
    const operators = new Set<OperatorsType>();
    const conditions = this.discovery.getConditions(rule);

    this.collectOperatorsFromConditions(conditions, operators);

    return operators;
  }

  /**
   * Validate operators in conditions recursively
   */
  private validateConditionsOperators(
    conditions: Condition[],
    errors: string[],
  ): void {
    for (const condition of conditions) {
      const type = this.discovery.conditionType(condition);
      if (!type) continue;

      for (const node of condition[type]!) {
        if (this.discovery.isConstraint(node)) {
          const constraint = node as Constraint;

          if (!operatorRegistry.has(constraint.operator)) {
            errors.push(
              `Unknown operator "${constraint.operator}" for field "${constraint.field}"`,
            );
          }
        } else if (this.discovery.isCondition(node)) {
          this.validateConditionsOperators([node as Condition], errors);
        }
      }
    }
  }

  /**
   * Collect operators from conditions recursively
   */
  private collectOperatorsFromConditions(
    conditions: Condition[],
    operators: Set<OperatorsType>,
  ): void {
    for (const condition of conditions) {
      const type = this.discovery.conditionType(condition);
      if (!type) continue;

      for (const node of condition[type]!) {
        if (this.discovery.isConstraint(node)) {
          const constraint = node as Constraint;
          operators.add(constraint.operator);
        } else if (this.discovery.isCondition(node)) {
          this.collectOperatorsFromConditions([node as Condition], operators);
        }
      }
    }
  }

  /**
   * Build operator metadata from collected information
   */
  private buildOperatorMetadata() {
    const operatorsByCategory: Record<string, OperatorsType[]> = {};

    // Group operators by category
    for (const operatorName of this.usedOperators) {
      const operator = operatorRegistry.get(operatorName);
      if (operator) {
        const category = operator.metadata.category;
        if (!operatorsByCategory[category]) {
          operatorsByCategory[category] = [];
        }
        operatorsByCategory[category].push(operatorName);
      }
    }

    // Convert field types map to record
    const expectedFieldTypes: Record<string, Set<string>> = {};
    for (const [field, types] of this.fieldTypes) {
      expectedFieldTypes[field] = types;
    }

    return {
      usedOperators: this.usedOperators,
      operatorsByCategory,
      expectedFieldTypes,
      warnings: this.warnings.length > 0 ? this.warnings : undefined,
    };
  }

  /**
   * Reset internal state
   */
  private resetState(): void {
    this.steps = undefined;
    this.usedOperators.clear();
    this.fieldTypes.clear();
    this.warnings = [];
    this.maxDepth = 0;
    this.totalConditions = 0;
    this.totalConstraints = 0;
    this.uniqueFields.clear();
  }

  /**
   * Populates the criteria range options with the possible range of input values
   * @param criteriaRanges The criteria range to populate.
   * @param conditionMap The map of results to conditions.
   * @param parentType The type of the parent condition.
   * @param depth The current recursion depth.
   */
  private resolveCriteriaRanges<T>(
    criteriaRanges: Array<CriteriaRange<T>>,
    conditionMap: Map<EngineResult<T>, Array<Condition<T>>>,
    parentType?: ConditionType,
    depth = 0,
  ): CriteriaRange<T>[] {
    // Track max depth
    this.maxDepth = Math.max(this.maxDepth, depth);

    // For each set of conditions which produce the same result
    for (const [result, conditions] of conditionMap) {
      this.totalConditions += conditions.length;

      // For each condition in that set
      for (const condition of conditions) {
        const type = this.discovery.conditionType(condition);
        if (!type) {
          continue;
        }

        try {
          Logger.debug(
            `\nIntrospector: Introspecting result "${JSON.stringify(result)}"`,
          );
        } catch {
          Logger.debug(`\nIntrospector: Introspecting result "${result}"`);
        }

        // Find the criteria range object for the result
        let criteriaRangeItem = criteriaRanges.find(
          (criteria) => criteria.result == result,
        )!;
        criteriaRangeItem = this.populateCriteriaRangeOptions<T>(
          criteriaRangeItem,
          condition,
          depth,
          parentType,
        );

        // Iterate over each property of the condition
        for (const node of condition[type]!) {
          if (this.discovery.isCondition(node)) {
            const condition = node as Condition<T>;
            criteriaRangeItem = this.resolveCriteriaRanges<T>(
              [criteriaRangeItem],
              new Map<EngineResult<T>, Condition<T>[]>([[result, [condition]]]),
              type,
              depth + 1,
            ).pop()!;
          }

          // Update the original set of criteria range objects
          // with the updated criteria range object
          const index = criteriaRanges.findIndex(
            (criteria) => criteria.result == result,
          );
          criteriaRanges[index] = criteriaRangeItem;
        }
      }
    }

    return criteriaRanges;
  }

  /**
   * Updates a criteria range entry based on the constraint and condition type.
   * Enhanced with operator validation and metadata collection.
   */
  private populateCriteriaRangeOptions<T>(
    criteriaRange: CriteriaRange<T>,
    condition: Condition,
    depth: number,
    parentType?: ConditionType,
  ): CriteriaRange<T> {
    const type = this.discovery.conditionType(condition) as ConditionType;
    const options = new Map<string, Record<string, unknown>>();

    for (const node of condition[type]!) {
      if (!this.discovery.isConstraint(node)) {
        continue;
      }

      const constraint = node as Constraint;
      this.totalConstraints++;
      this.uniqueFields.add(constraint.field);

      // Collect operator metadata
      this.usedOperators.add(constraint.operator);

      // Validate operator and collect field types
      const operator = operatorRegistry.get(constraint.operator);
      if (operator) {
        // Track expected field types
        if (!this.fieldTypes.has(constraint.field)) {
          this.fieldTypes.set(constraint.field, new Set());
        }
        const fieldTypeSet = this.fieldTypes.get(constraint.field)!;
        operator.metadata.acceptedFieldTypes.forEach((type) =>
          fieldTypeSet.add(type),
        );
      } else {
        this.warnings.push(
          `Unknown operator "${constraint.operator}" for field "${constraint.field}"`,
        );
      }

      Logger.debug(
        `Introspector: Processing "${constraint.field} (${constraint.operator})" in "${type}" condition`,
      );

      // Check if we already have an entry with the same field
      // and if so, update it instead of creating a new one
      let option = options.get(constraint.field) ?? {};
      option = this.updateCriteriaRangeOptions(option, constraint, type);
      options.set(constraint.field, option);
    }

    if ([ConditionTypes.OR, ConditionTypes.NONE].includes(type)) {
      Array.from(options.values()).forEach((option) => {
        criteriaRange = this.addOptionToCriteriaRange<T>(
          type,
          parentType!,
          criteriaRange,
          option,
          depth,
        );

        // Debug the last introspection
        Logger.debug("Introspector: Step complete", this.lastStep);
      });
    }

    if (type === ConditionTypes.AND) {
      criteriaRange = this.addOptionToCriteriaRange<T>(
        type,
        parentType!,
        criteriaRange,
        Array.from(options.values()).reduce((prev, curr) => {
          for (const [key, value] of Object.entries(curr)) {
            prev[key] = Object.prototype.hasOwnProperty.call(prev, key)
              ? [...new Set([prev[key], value].flat())]
              : value;
          }

          return prev;
        }, {}),
        depth,
      );

      // Debug the last introspection
      Logger.debug("Introspector: Step complete", this.lastStep);
    }

    return criteriaRange;
  }

  /**
   * Updates a criteria range option based on the constraint and condition type.
   * @param option The option to update.
   * @param constraint The constraint to update the option with.
   * @param type The current condition type.
   */
  private updateCriteriaRangeOptions(
    option: Record<string, unknown>,
    constraint: Constraint,
    type: ConditionType,
  ): Record<string, unknown> {
    // We need to clone the constraint because we will be modifying it
    const $constraint = clone(constraint);

    // We can consider a 'None' as a not 'All' and flip all the operators
    // To be done on any 'None' type condition or on any child
    // of a 'None' type condition.
    if (
      type === ConditionTypes.NONE ||
      this.isCurrentStepChildOf(ConditionTypes.NONE)
    ) {
      const negatedOperator = operatorRegistry.getNegatedOperator(
        $constraint.operator,
      );
      if (negatedOperator) {
        $constraint.operator = negatedOperator;
      } else {
        this.warnings.push(
          `No negated operator found for "${$constraint.operator}"`,
        );
      }
    }

    if (!Object.prototype.hasOwnProperty.call(option, $constraint.field)) {
      // When condition is an all, we need to create a new object in the criteria range
      // options and add all the possible inputs which would satisfy the condition.
      if (type === ConditionTypes.AND || type === ConditionTypes.NONE) {
        switch ($constraint.operator) {
          case Operators.Equals:
          case Operators.In:
            option[$constraint.field] = $constraint.value;
            break;
          default:
            option[$constraint.field] = {
              operator: $constraint.operator,
              value: $constraint.value,
            };
            break;
        }

        return option;
      }

      // When condition is an any, we need to create a new object in the criteria range
      // options for each criterion in the condition and add all the possible inputs
      // which would satisfy the criterion.
      if (type === ConditionTypes.OR) {
        switch ($constraint.operator) {
          case Operators.Equals:
          case Operators.In:
            return { [$constraint.field]: $constraint.value };
          default:
            return {
              [$constraint.field]: {
                operator: $constraint.operator,
                value: $constraint.value,
              },
            };
        }
      }
    }

    let value = $constraint.value;
    if ($constraint.operator !== Operators.Equals) {
      value = { operator: $constraint.operator, value: $constraint.value };
    }

    option[$constraint.field] = [
      ...new Set([option[$constraint.field], value].flat()),
    ];

    return option;
  }

  /**
   * Adds an option to a criteria range entry based on the condition type and parent type.
   * @param currType The current condition type.
   * @param parentType The type of the parent condition.
   * @param entry The criteria range entry to update.
   * @param option The option to update the criteria range entry with.
   * @param depth The current recursion depth.
   */
  private addOptionToCriteriaRange<T>(
    currType: ConditionType,
    parentType: ConditionType,
    entry: CriteriaRange<T>,
    option: Record<string, unknown>,
    depth: number,
  ): CriteriaRange<T> {
    const lastIdx = entry.options?.length! - 1;

    // We create new objects in the option array
    if (
      [ConditionTypes.AND, ConditionTypes.NONE].includes(currType) &&
      parentType === ConditionTypes.OR
    ) {
      // If we encounter this pair in a deeply nested condition, we need to clone
      // the last option and add the options from the all by either appending
      // them if the key is new, or replacing the 'any' with the new values.
      if (depth > 1) {
        // We should start based on the last option added
        const baseOption = clone(entry.options?.[entry.options.length - 1])!;

        // If the previous step added anything to the base option, then we must first
        // remove these changes. For condition types of 'Any' or 'None' a step
        // is created for each property in the condition. Therefore, we must
        // remove the changes from step(s) which are at the same depth of
        // the last step.
        if (this.lastStep?.changes && this.lastStep.changes.length) {
          const depth = this.lastStep.depth;

          const steps = [...(this.steps ?? [])];
          let step = steps.pop();

          while (step?.depth === depth) {
            for (const change of step.changes!) {
              if (baseOption[change.key] === change.value) {
                delete baseOption[change.key];
              }

              if (Array.isArray(baseOption[change.key])) {
                baseOption[change.key] = (baseOption[change.key] as []).filter(
                  (o) =>
                    Array.isArray(change.value)
                      ? !change.value.includes(o)
                      : o != change.value,
                );
              }
            }
            step = steps.pop();
          }
        }

        for (const [key, value] of Object.entries(option)) {
          baseOption[key] = Object.prototype.hasOwnProperty.call(
            baseOption,
            key,
          )
            ? [...new Set([baseOption[key], value].flat())]
            : value;
        }

        this.steps?.push({
          parentType,
          currType,
          depth,
          option: baseOption,
        });

        Logger.debug(
          `Introspector: + new option to criteria range based on last root parent"`,
        );

        entry.options?.push(baseOption);
        return entry;
      }

      this.steps?.push({ parentType, currType, depth, option });
      Logger.debug(`Introspector: + new option to criteria range`);

      entry.options?.push(option);

      return entry;
    }

    // We add these options onto the last object in the option array
    if (
      (ConditionTypes.OR === currType && ConditionTypes.OR === parentType) ||
      (ConditionTypes.OR === currType &&
        [ConditionTypes.AND, ConditionTypes.NONE].includes(parentType)) ||
      ([ConditionTypes.AND, ConditionTypes.NONE].includes(currType) &&
        [ConditionTypes.AND, ConditionTypes.NONE].includes(parentType))
    ) {
      const changes: IntrospectionStep["changes"] = [];
      for (const [key, value] of Object.entries(option)) {
        if (entry.options) {
          if (!entry.options[lastIdx]) {
            entry.options[lastIdx] = {};
          }
          // If the last option already has this key, we need to update it
          // eslint-disable-next-line no-prototype-builtins
          entry.options[lastIdx][key] = entry.options?.[lastIdx].hasOwnProperty(
            key,
          )
            ? [...new Set([entry.options[lastIdx][key], value].flat())]
            : value;
        }

        changes.push({ key, value });
      }

      this.steps?.push({
        parentType,
        currType,
        depth,
        option: entry.options?.[lastIdx]!,
        changes,
      });

      Logger.debug(`Introspector: Updating previous option with new values"`);

      return entry;
    }

    this.steps?.push({ parentType, currType, depth, option });
    Logger.debug(`Introspector: + new option to criteria range"`);

    entry.options?.push(option);
    return entry;
  }

  /**
   * Checks if the current condition being introspected is the child
   * of some parent condition with a given type.
   * @param parentType The type of the parent condition.
   */
  private isCurrentStepChildOf(parentType: ConditionType): boolean {
    if (!this.steps?.length) {
      return false;
    }

    // Clone the step array so that we can pop items off it
    const steps = [...this.steps];
    let step = steps.pop();

    // Check ancestors until we reach the first root condition
    while (step?.depth! >= 0) {
      if (step!.currType === parentType || step!.parentType === parentType)
        return true;

      step = steps.pop();
    }

    return false;
  }

  /** Returns the last step in the introspection process. */
  get lastStep(): IntrospectionStep | null {
    // @ts-ignore
    return this.steps?.length ? this.steps[this.steps.length - 1] : null;
  }
}
