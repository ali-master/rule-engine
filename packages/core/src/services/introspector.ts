import { RuleTypeError } from "@root/utils";
import { Logger } from "@root/services/logger";
import { ObjectDiscovery } from "@root/services/object-discovery";
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

export class Introspector {
  private steps: IntrospectionStep[] | undefined;
  private readonly discovery = new ObjectDiscovery();

  /**
   * Given a rule, checks the constraints and conditions to determine
   * the possible range of input criteria which would be satisfied by the rule.
   * The rule must be a granular rule to be introspected.
   * @param rule The rule to evaluate.
   * @throws RuleTypeError if the rule is not granular
   */
  introspect<R = any>(rule: RuleType<R>): IntrospectionResult<R> {
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

    // For we need to populate each item in the `criteriaRange` with
    // the possible range of input values (in the criteria) which
    // would resolve to the given result. Rules are recursive.
    return {
      results: this.resolveCriteriaRanges(criteriaRange, conditionMap),
      ...("default" in rule && rule.default !== undefined
        ? { default: rule.default }
        : {}),
    };
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
    // For each set of conditions which produce the same result
    for (const [result, conditions] of conditionMap) {
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
   * @param criteriaRange The criteria range entry to update.
   * @param condition The condition to update the criteria range entry with.
   * @param depth The current recursion depth.
   * @param parentType The type of the parent condition.
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
            prev[key] = prev.hasOwnProperty(key)
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
    const $constraint = structuredClone(constraint);

    // We can consider a 'None' as a not 'All' and flip all the operators
    // To be done on any 'None' type condition or on any child
    // of a 'None' type condition.
    if (
      type === ConditionTypes.NONE ||
      this.isCurrentStepChildOf(ConditionTypes.NONE)
    ) {
      // @ts-ignore
      const reveredOperator: Record<OperatorsType, OperatorsType> = {
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
        [Operators.SelfContainsAny]: Operators.SelfNotContainsAny,
        [Operators.NotContainsAny]: Operators.ContainsAny,
        [Operators.SelfNotContainsAny]: Operators.SelfContainsAny,
        [Operators.ContainsAll]: Operators.NotContainsAll,
        [Operators.SelfContainsAll]: Operators.SelfNotContainsAll,
        [Operators.NotContainsAll]: Operators.ContainsAll,
        [Operators.SelfNotContainsAll]: Operators.SelfContainsAll,
        [Operators.Matches]: Operators.NotMatches,
        [Operators.NotMatches]: Operators.Matches,
        [Operators.Exists]: Operators.NotExists,
        [Operators.NotExists]: Operators.Exists,
        [Operators.NullOrUndefined]: Operators.NotNullOrUndefined,
        [Operators.NotNullOrUndefined]: Operators.NullOrUndefined,
        [Operators.Empty]: Operators.NotEmpty,
        [Operators.NotEmpty]: Operators.Empty,
        [Operators.DateAfter]: Operators.DateBefore,
        [Operators.DateBefore]: Operators.DateAfter,
        [Operators.DateAfterOrEquals]: Operators.DateBeforeOrEquals,
        [Operators.DateBeforeOrEquals]: Operators.DateAfterOrEquals,
        [Operators.DateEquals]: Operators.DateNotEquals,
        [Operators.DateNotEquals]: Operators.DateEquals,
        [Operators.DateBetween]: Operators.DateNotBetween,
        [Operators.DateNotBetween]: Operators.DateBetween,
        [Operators.TimeAfter]: Operators.TimeBefore,
        [Operators.TimeBefore]: Operators.TimeAfter,
        [Operators.TimeAfterOrEquals]: Operators.TimeBeforeOrEquals,
        [Operators.TimeBeforeOrEquals]: Operators.TimeAfterOrEquals,
        [Operators.TimeEquals]: Operators.TimeNotEquals,
        [Operators.TimeNotEquals]: Operators.TimeEquals,
        [Operators.TimeBetween]: Operators.TimeNotBetween,
        [Operators.TimeNotBetween]: Operators.TimeBetween,
        // TODO: Add the rest of the operators
      };
      $constraint.operator = reveredOperator[$constraint.operator];
    }

    if (!option.hasOwnProperty($constraint.field)) {
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
        const baseOption = structuredClone(
          entry.options?.[entry.options.length - 1],
        )!;

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
          baseOption[key] = baseOption.hasOwnProperty(key)
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
