import { Validator } from "@root/services/validator";
import { Evaluator } from "@root/services/evaluator";
import { Mutator } from "@root/services/mutator";
import { Introspector } from "@root/services/introspector";
import { RuleBuilder } from "@root/services/builder";
import { operatorRegistry, initializeOperators } from "@root/operators/factory";
import type {
  RuleType,
  EvaluationResult,
  CriteriaObject,
  Criteria,
} from "@root/types";
import type { EnhancedIntrospectionResult } from "./introspector";

/**
 * Configuration options for RuleEngineV2
 */
export interface RuleEngineConfig {
  /**
   * Whether to skip validation for trusted rules
   */
  trustMode?: boolean;

  /**
   * Whether to initialize built-in operators automatically
   */
  autoInitializeOperators?: boolean;

  /**
   * Custom operator initialization function
   */
  customOperatorInit?: () => void;

  /**
   * Enable performance optimizations
   */
  enableOptimizations?: boolean;

  /**
   * Cache evaluation results
   */
  enableCaching?: boolean;

  /**
   * Maximum cache size
   */
  maxCacheSize?: number;
}

/**
 * Enhanced Rule Engine with Strategy pattern and improved type safety
 */
export class RuleEngine {
  private static instance: RuleEngine;
  private readonly validator = new Validator();
  private readonly evaluator = new Evaluator();
  private readonly mutator = new Mutator();
  private readonly introspector = new Introspector();
  private config: RuleEngineConfig = {};
  private cache?: Map<string, any>;
  private initialized = false;

  /**
   * Private constructor for singleton pattern
   */
  private constructor(config?: RuleEngineConfig) {
    this.configure(config);
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: RuleEngineConfig): RuleEngine {
    if (!RuleEngine.instance) {
      RuleEngine.instance = new RuleEngine(config);
    }
    return RuleEngine.instance;
  }

  /**
   * Configure the rule engine
   */
  configure(config?: RuleEngineConfig): void {
    this.config = {
      autoInitializeOperators: true,
      enableOptimizations: true,
      ...config,
    };

    // Initialize operators if needed
    if (!this.initialized && this.config.autoInitializeOperators) {
      initializeOperators();
      this.initialized = true;
    }

    // Run custom initialization if provided
    if (this.config.customOperatorInit) {
      this.config.customOperatorInit();
    }

    // Setup caching if enabled
    if (this.config.enableCaching) {
      this.cache = new Map();
    }
  }

  /**
   * Evaluates a rule against a single criteria object and returns a single result.
   * @param rule The rule to evaluate
   * @param criteria The criteria object to evaluate against
   * @param trustRule Whether to skip validation
   */
  async evaluate<T = any>(
    rule: RuleType,
    criteria: CriteriaObject<T>,
    trustRule?: boolean,
  ): Promise<EvaluationResult<T>>;

  /**
   * Evaluates a rule against an array of criteria and returns an array of results.
   * @param rule The rule to evaluate
   * @param criteria The array of criteria to evaluate against
   * @param trustRule Whether to skip validation
   */
  async evaluate<T = any>(
    rule: RuleType,
    criteria: Array<T>,
    trustRule?: boolean,
  ): Promise<Array<EvaluationResult<T>>>;

  /**
   * Evaluates a rule against given criteria
   * @param rule The rule to evaluate
   * @param criteria The criteria to test against
   * @param trustRule Whether to skip validation
   */
  async evaluate<T = any>(
    rule: RuleType,
    criteria: Criteria,
    trustRule?: boolean,
  ): Promise<EvaluationResult<T> | Array<EvaluationResult<T>>> {
    // Validate unless in trust mode
    if (!trustRule && !this.config.trustMode) {
      const validation = this.validator.validate(rule);
      if (!validation.isValid) {
        throw validation;
      }
    }

    // Check cache if enabled
    if (this.config.enableCaching && this.cache) {
      const cacheKey = this.getCacheKey(rule, criteria);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }
    }

    // Apply mutations if any
    const mutatedCriteria = await this.mutator.mutate(criteria);

    // Evaluate the rule
    const result = this.evaluator.evaluate(rule, mutatedCriteria);

    // Cache result if enabled
    if (this.config.enableCaching && this.cache) {
      const cacheKey = this.getCacheKey(rule, criteria);
      this.cache.set(cacheKey, result);

      // Manage cache size
      if (
        this.config.maxCacheSize &&
        this.cache.size > this.config.maxCacheSize
      ) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey!);
      }
    }

    return result;
  }

  /**
   * Quick check if a rule passes for a single criteria object
   */
  async checkIsPassed(
    rule: RuleType,
    criteria: CriteriaObject,
    trustRule?: boolean,
  ): Promise<boolean>;

  /**
   * Quick check if a rule passes for an array of criteria
   * Returns single boolean if all pass/fail uniformly, otherwise array of booleans
   */
  async checkIsPassed<T = any>(
    rule: RuleType,
    criteria: Array<T>,
    trustRule?: boolean,
  ): Promise<boolean | boolean[]>;

  /**
   * Quick check if a rule passes for given criteria
   * When criteria is an array and all pass, returns true
   * When criteria is an array and any fail, returns false
   */
  async checkIsPassed(
    rule: RuleType,
    criteria: Criteria,
    trustRule?: boolean,
  ): Promise<boolean | boolean[]> {
    const result = await this.evaluate(rule, criteria, trustRule);

    if (Array.isArray(result)) {
      // If all criteria pass, return true, otherwise return array of results
      const allPassed = result.every((r) => r.isPassed);
      return result.length === 1 || allPassed
        ? allPassed
        : result.map((r) => r.isPassed);
    }

    return result.isPassed;
  }

  /**
   * Get just the evaluation result value for a single criteria
   */
  async getEvaluateResult<T = any>(
    rule: RuleType,
    criteria: CriteriaObject,
    trustRule?: boolean,
  ): Promise<T>;

  /**
   * Get just the evaluation result values for an array of criteria
   */
  async getEvaluateResult<T = any>(
    rule: RuleType,
    criteria: Array<any>,
    trustRule?: boolean,
  ): Promise<T[]>;

  /**
   * Get just the evaluation result value
   */
  async getEvaluateResult<T = any>(
    rule: RuleType,
    criteria: Criteria,
    trustRule?: boolean,
  ): Promise<T | T[]> {
    const result = await this.evaluate(rule, criteria, trustRule);

    if (Array.isArray(result)) {
      return result.map((r) => r.value);
    }

    return result.value;
  }

  /**
   * Evaluate multiple rules against a single criteria object
   */
  async evaluateMany<T = any>(
    rules: RuleType[],
    criteria: CriteriaObject<T>,
    trustRule?: boolean,
  ): Promise<Array<EvaluationResult<T>>>;

  /**
   * Evaluate multiple rules against an array of criteria
   */
  async evaluateMany<T = any>(
    rules: RuleType[],
    criteria: Array<T>,
    trustRule?: boolean,
  ): Promise<Array<Array<EvaluationResult<T>>>>;

  /**
   * Evaluate multiple rules against the same criteria
   */
  async evaluateMany<T = any>(
    rules: RuleType[],
    criteria: Criteria,
    trustRule?: boolean,
  ): Promise<Array<EvaluationResult<T>> | Array<Array<EvaluationResult<T>>>> {
    if (Array.isArray(criteria)) {
      // When criteria is an array, each rule gets evaluated against the array
      const results = await Promise.all(
        rules.map((rule) => this.evaluate<T>(rule, criteria, trustRule)),
      );
      return results as Array<Array<EvaluationResult<T>>>;
    } else {
      // When criteria is a single object, each rule gets evaluated against it
      const results = await Promise.all(
        rules.map((rule) => this.evaluate<T>(rule, criteria, trustRule)),
      );
      return results as Array<EvaluationResult<T>>;
    }
  }

  /**
   * Introspect a rule to understand its structure and requirements
   */
  introspect<R = any>(
    rule: RuleType<R>,
    options?: {
      includeMetadata?: boolean;
      includeComplexity?: boolean;
      validateOperators?: boolean;
    },
  ): EnhancedIntrospectionResult<R> {
    // Validate the rule first
    const validation = this.validator.validate(rule);
    if (!validation.isValid) {
      throw validation;
    }

    return this.introspector.introspect(rule, options);
  }

  /**
   * Validate a rule
   */
  validate(rule: RuleType): ReturnType<Validator["validate"]> {
    return this.validator.validate(rule);
  }

  /**
   * Validate operators in a rule
   */
  validateOperators(rule: RuleType): { isValid: boolean; errors: string[] } {
    return this.introspector.validateOperators(rule);
  }

  /**
   * Get all operators used in a rule
   */
  getUsedOperators(rule: RuleType): Set<string> {
    return this.introspector.getUsedOperators(rule);
  }

  /**
   * Create a rule builder
   */
  builder(): RuleBuilder {
    return new RuleBuilder(this.validator);
  }

  /**
   * Register mutations
   */
  registerMutation(field: string, mutation: (value: any) => any): void {
    this.mutator.add(field, mutation);
  }

  /**
   * Add mutation (backward compatibility)
   */
  addMutation(field: string, mutation: (value: any) => any): void {
    this.registerMutation(field, mutation);
  }

  /**
   * Remove mutation (backward compatibility)
   */
  removeMutation(field: string): void {
    this.mutator.remove(field);
  }

  /**
   * Clear mutation cache
   */
  clearMutationCache(field?: string): void {
    this.mutator.clearCache(field);
  }

  /**
   * Clear all mutations
   */
  clearMutations(): void {
    this.mutator.removeAll();
  }

  /**
   * Clear evaluation cache
   */
  clearCache(): void {
    this.cache?.clear();
  }

  /**
   * Get operator registry for advanced usage
   */
  getOperatorRegistry() {
    return operatorRegistry;
  }

  /**
   * Generate cache key for rule and criteria
   */
  private getCacheKey(rule: RuleType, criteria: Criteria): string {
    return JSON.stringify({ rule, criteria });
  }

  // Static convenience methods
  /**
   * Static method: Evaluates a rule against a single criteria object
   */
  static async evaluate<T = any>(
    rule: RuleType,
    criteria: CriteriaObject<T>,
    trustRule?: boolean,
  ): Promise<EvaluationResult<T>>;

  /**
   * Static method: Evaluates a rule against an array of criteria
   */
  static async evaluate<T = any>(
    rule: RuleType,
    criteria: Array<T>,
    trustRule?: boolean,
  ): Promise<Array<EvaluationResult<T>>>;

  /**
   * Static method: Evaluates a rule against criteria
   */
  static async evaluate<T = any>(
    rule: RuleType,
    criteria: Criteria,
    trustRule?: boolean,
  ): Promise<EvaluationResult<T> | Array<EvaluationResult<T>>> {
    return RuleEngine.getInstance().evaluate(rule, criteria, trustRule);
  }

  /**
   * Static method: Quick check if a rule passes for a single criteria
   */
  static async checkIsPassed(
    rule: RuleType,
    criteria: CriteriaObject,
    trustRule?: boolean,
  ): Promise<boolean>;

  /**
   * Static method: Quick check if a rule passes for an array of criteria
   */
  static async checkIsPassed<T = any>(
    rule: RuleType,
    criteria: Array<T>,
    trustRule?: boolean,
  ): Promise<boolean | boolean[]>;

  /**
   * Static method: Quick check if a rule passes
   */
  static async checkIsPassed(
    rule: RuleType,
    criteria: Criteria,
    trustRule?: boolean,
  ): Promise<boolean | boolean[]> {
    return RuleEngine.getInstance().checkIsPassed(rule, criteria, trustRule);
  }

  /**
   * Static method: Get evaluation result value for a single criteria
   */
  static async getEvaluateResult<T = any>(
    rule: RuleType,
    criteria: CriteriaObject,
    trustRule?: boolean,
  ): Promise<T>;

  /**
   * Static method: Get evaluation result values for an array of criteria
   */
  static async getEvaluateResult<T = any>(
    rule: RuleType,
    criteria: Array<any>,
    trustRule?: boolean,
  ): Promise<T[]>;

  /**
   * Static method: Get evaluation result value
   */
  static async getEvaluateResult<T = any>(
    rule: RuleType,
    criteria: Criteria,
    trustRule?: boolean,
  ): Promise<T | T[]> {
    return RuleEngine.getInstance().getEvaluateResult(
      rule,
      criteria,
      trustRule,
    );
  }

  static introspect<R = any>(
    rule: RuleType<R>,
    options?: {
      includeMetadata?: boolean;
      includeComplexity?: boolean;
      validateOperators?: boolean;
    },
  ): EnhancedIntrospectionResult<R> {
    return RuleEngine.getInstance().introspect(rule, options);
  }

  static validate(rule: RuleType): ReturnType<Validator["validate"]> {
    return RuleEngine.getInstance().validate(rule);
  }

  static builder(): RuleBuilder {
    return RuleEngine.getInstance().builder();
  }

  // Static mutation methods for backward compatibility
  static addMutation(field: string, mutation: (value: any) => any): void {
    RuleEngine.getInstance().addMutation(field, mutation);
  }

  static removeMutation(field: string): void {
    RuleEngine.getInstance().removeMutation(field);
  }

  static clearMutationCache(field?: string): void {
    RuleEngine.getInstance().clearMutationCache(field);
  }
}
