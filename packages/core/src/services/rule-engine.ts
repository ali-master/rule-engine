import { Builder } from "@root/services/builder";
import { Mutator } from "@root/services/mutator";
import { Evaluator } from "@root/services/evaluator";
import { Validator } from "@root/services/validator";
import { Introspector } from "@root/services/introspector";
// Utilities
import { isObject, RuleError } from "@root/utils";
// Types
import type {
  Criteria,
  EngineResult,
  EvaluationResult,
  IntrospectionResult,
  RuleType,
  ValidationResult,
} from "@root/types";

export class RuleEngine<T = any> {
  // Singleton instance of the RuleEngine class. Used to access the RuleEngine class methods.
  static self = new RuleEngine();

  // Services
  /**
   * The mutator service instance. Used to mutate criteria before evaluation.
   * @private
   */
  private readonly mutator: Mutator = new Mutator();
  /**
   * The validator service instance. Used to validate rules before evaluation.
   * @private
   */
  private readonly validator: Validator = new Validator<T>();
  /**
   * The evaluator service instance. Used to evaluate rules against criteria.
   * @private
   */
  private readonly evaluator: Evaluator = new Evaluator<T>();
  /**
   * The introspector service instance. Used to introspect rules.
   * @private
   */
  private readonly introspector: Introspector = new Introspector();

  /**
   * Returns a rule builder class instance.
   * Allows for the construction of rules using a fluent interface.
   *
   * @returns A new instance of the Builder class.
   */
  builder(): Builder {
    return new Builder(this.validator);
  }

  /**
   * Adds a mutation to the rule engine instance.
   * Mutations allow for the modification of the criteria before
   * it is evaluated against a rule.
   *
   * @param name The name of the mutation.
   * @param mutation The mutation function.
   * @returns The RuleEngine instance.
   */
  addMutation(name: string, mutation: Function): RuleEngine {
    this.mutator.add(name, mutation);

    return this;
  }

  /**
   * Removes a mutation to the rule engine instance.
   * Any cached mutation values for this mutation will be purged.
   *
   * @param name The name of the mutation.
   * @returns The RuleEngine instance.
   */
  removeMutation(name: string): RuleEngine {
    this.mutator.remove(name);

    return this;
  }

  /**
   * Clears the mutator cache.
   * The entire cache, or cache for a specific mutator can be cleared
   * by passing or omitting the mutator name as an argument.
   *
   * @param name The mutator name to clear the cache for.
   * @returns The RuleEngine instance.
   */
  clearMutationCache(name?: string): RuleEngine {
    this.mutator.clearCache(name);

    return this;
  }

  /**
   * Evaluates a rule against a set of criteria and returns the result.
   * * If the criteria is an array (indicating multiple criteria to test), the rule will be evaluated against each item in the array and an array of results will be returned.
   * * If the rule is passed, the result will be true.
   * * If the rule is not passed, the result will be false.
   * * If the rule is not granular, the result will be false.
   * * If the trustRule is set to true, the rule will be evaluated without validation.
   * * If the trustRule is set to false, the rule will be validated before evaluation.
   * * If the rule is invalid, a RuleError will be thrown.
   * * If the rule is not granular, a RuleTypeError will be thrown.
   * * The criteria will be mutated before evaluation.
   * * The result will be an EvaluationResult object.
   * * If the criteria is an array, the result will be an array of EvaluationResult objects.
   *
   * @param rule The rule to evaluate.
   * @param criteria The criteria to evaluate the rule against.
   * @param trustRule Set true to avoid validating the rule before evaluating it (faster).
   * @throws RuleError if the rule is invalid.
   */

  async evaluate(
    rule: RuleType<T>,
    criteria: Criteria,
    trustRule = false,
  ): Promise<EvaluationResult<T> | Array<EvaluationResult<T>>> {
    // Before we evaluate the rule, we should validate it.
    // If `trustRuleset` is set to true, we will skip validation.
    const validationResult = (!trustRule ? this.validate(rule) : {}) as ValidationResult;
    if (!trustRule && !validationResult.isValid) {
      if (isObject(validationResult) && validationResult.isValid) {
        throw validationResult;
      }
      throw new RuleError({
        isValid: false,
        error: {
          message: "Invalid rule.",
          element: rule,
        },
      });
    }

    const mutatedCriteria = await this.mutator.mutate(criteria);

    return this.evaluator.evaluate(rule, mutatedCriteria);
  }

  /**
   * Checks if a rule is passed against a set of criteria.
   * * If the criteria is an array (indicating multiple criteria to test), the rule will be evaluated against each item in the array and an array of results will be returned.
   * * If the rule is passed, the result will be true.
   * * If the rule is not passed, the result will be false.
   * * If the rule is not granular, the result will be false.
   * @param rule The rule to evaluate.
   * @param criteria The criteria to evaluate the rule against.
   * @param trustRule Set true to avoid validating the rule before evaluating it (faster).
   * @returns A boolean indicating whether the rule is passed or not.
   */
  async checkIsPassed(rule: RuleType<T>, criteria: Criteria, trustRule = false): Promise<boolean> {
    const result = await this.evaluate(rule, criteria, trustRule);

    if (Array.isArray(result)) {
      return result.every((r) => r.isPassed);
    }

    return result.isPassed;
  }

  /**
   * Evaluates a rule against a set of criteria and returns the result.
   * * If the criteria is an array (indicating multiple criteria to test), the rule will be evaluated against each item in the array and an array of results will be returned.
   * * If the rule is passed, the result will be true.
   * * If the rule is not passed, the result will be false.
   * * If the rule is not granular, the result will be false.
   * * If the trustRule is set to true, the rule will be evaluated without validation.
   * * If the trustRule is set to false, the rule will be validated before evaluation.
   * * If the rule is invalid, a RuleError will be thrown.
   * * If the rule is not granular, a RuleTypeError will be thrown.
   *
   * @param rule The rule to evaluate.
   * @param criteria The criteria to evaluate the rule against.
   * @param trustRule Set true to avoid validating the rule before evaluating it (faster).
   * @returns A boolean indicating whether the rule is passed or not.
   */
  async getEvaluateResult(
    rule: RuleType<T>,
    criteria: Criteria,
    trustRule = false,
  ): Promise<T | Array<T>> {
    const result = await this.evaluate(rule, criteria, trustRule);

    if (Array.isArray(result)) {
      return result.map((ruleResult) => ruleResult.value);
    }

    return result.value;
  }

  /**
   * Evaluates multiple rules against a set of criteria and returns the results.
   * - If the criteria is an array (indicating multiple criteria to test), the rules will be evaluated against each item in the array and an array of results will be returned.
   *
   * @param rules The rules to evaluate. Each rule will be evaluated against the criteria. If the rule is invalid, it will be skipped.
   * @param criteria The criteria to evaluate the rule against.
   * @param trustRule Set true to avoid validating the rule before evaluating it (faster).
   */
  async evaluateMultiple(
    rules: Array<RuleType<T>>,
    criteria: Criteria,
    trustRule = false,
  ): Promise<Array<EvaluationResult<T> | Array<EvaluationResult<T>>>> {
    return Promise.all(rules.map((rule) => this.evaluate(rule, criteria, trustRule)));
  }

  /**
   * Given a rule, checks the constraints and conditions to determine
   * the possible range of input criteria which would be satisfied by the rule.
   *
   * @param rule The rule to evaluate.
   * @throws RuleError if the rule is invalid
   * @throws RuleTypeError if the rule is not granular
   */
  introspect(rule: RuleType<T>): IntrospectionResult<T> {
    // Before we proceed with the rule, we should validate it.
    const validationResult = this.validate(rule);
    if (!validationResult.isValid) {
      throw validationResult;
    }

    return this.introspector.introspect<T>(rule);
  }

  /**
   * Takes in a rule as a parameter and returns a ValidationResult
   * indicating whether the rule is valid or not.
   *
   * Invalid rules will contain an error property which contains a message and the element
   * that caused the validation to fail.
   *
   * @param rule The rule to validate.
   */
  validate(rule: RuleType<T>) {
    return this.validator.validate(rule);
  }

  /**
   * Returns a rule builder class instance.
   * Allows for the construction of rules using a fluent interface.
   */
  static builder<T = EngineResult>(): Builder<T> {
    return this.self.builder();
  }

  /**
   * Evaluates a rule against a set of criteria and returns the result.
   * If the criteria is an array (indicating multiple criteria to test),
   * the rule will be evaluated against each item in the array and
   * an array of results will be returned.
   *
   * @param rule The rule to evaluate.
   * @param criteria The criteria to evaluate the rule against.
   * @param trustRule Set true to avoid validating the rule before evaluating it (faster).
   * @throws RuleError if the rule is invalid.
   */
  static async evaluate<T = EngineResult>(
    rule: RuleType<T>,
    criteria: Criteria,
    trustRule = false,
  ): Promise<EvaluationResult<T> | Array<EvaluationResult<T>>> {
    return RuleEngine.self.evaluate(rule, criteria, trustRule);
  }

  static async getEvaluateResult<T = EngineResult>(
    rule: RuleType<T>,
    criteria: Criteria,
    trustRule = false,
  ): Promise<T | Array<T>> {
    return RuleEngine.self.getEvaluateResult(rule, criteria, trustRule);
  }

  /**
   * Given a rule, checks the constraints and conditions to determine
   * the possible range of input criteria which would be satisfied by the rule.
   *
   * @param rule The rule to introspect.
   * @throws RuleError if the rule is invalid
   * @throws RuleTypeError if the rule is not granular
   */
  static introspect<T>(rule: RuleType<T>): IntrospectionResult<T> {
    return RuleEngine.self.introspect(rule);
  }

  /**
   * Takes in a rule as a parameter and returns a ValidationResult
   * indicating whether the rule is valid or not.
   *
   * Invalid rules will contain an error property which contains a message and the element
   * that caused the validation to fail.
   *
   * @param rule The rule to validate.
   */
  static validate<T = EngineResult>(rule: RuleType<T>) {
    return RuleEngine.self.validate(rule);
  }

  /**
   * Adds a mutation.
   *
   * Mutations allow for the modification of the criteria before
   * it is evaluated against a rule.
   *
   * @param name The name of the mutation.
   * @param mutation The mutation function.
   */
  static addMutation(name: string, mutation: Function): RuleEngine {
    return RuleEngine.self.addMutation(name, mutation);
  }

  /**
   * Removes a mutation to the rule engine instance.
   * Any cached mutation values for this mutation will be purged.
   *
   * @param name The name of the mutation.
   */
  static removeMutation(name: string): RuleEngine {
    return RuleEngine.self.removeMutation(name);
  }

  /**
   * Clears the mutator cache.
   * The entire cache, or cache for a specific mutator can be cleared
   * by passing or omitting the mutator name as an argument.
   *
   * @param name The mutator name to clear the cache for.
   */
  static clearMutationCache(name?: string): RuleEngine {
    return RuleEngine.self.clearMutationCache(name);
  }
}
