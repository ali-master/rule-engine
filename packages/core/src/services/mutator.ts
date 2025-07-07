// Utilities
import { clone } from "@root/utils";
import { createHash } from "node:crypto";
import { EventEmitter } from "eventemitter3";
import { Logger } from "@root/services/logger";
import { ObjectDiscovery } from "@root/services/object-discovery";
// Types
import type { CriteriaObject, Criteria } from "@root/types";

/**
 * The Mutator class allows for the modification of criteria objects before they are evaluated against a rule.
 * Mutations are added to the mutator instance and are executed when the criteria object contains the mutation key.
 * Mutations are cached to prevent duplicate executions of the same mutation on the same object.
 *
 * @example
 * const mutator = new Mutator();
 * mutator.add("uppercase", (value) => value.toUpperCase());
 * mutator.add("lowercase", (value) => value.toLowerCase());
 * mutator.add("reverse", (value) => value.split("").reverse().join(""));
 * mutator.add("trim", (value) => value.trim());
 * mutator.add("replace", (value, criteria) => {
 *  const { find, replace } = criteria;
 *  return value.replace(find, replace);
 * });
 * mutator.mutate({ name: "John Doe" }); // { name: "John Doe" }
 * mutator.mutate({ name: "John Doe", find: "John", replace: "Jane" }); // { name: "Jane Doe", find: "John", replace: "Jane" }
 * mutator.applyMutations({ name: "John Doe", find: "John", replace: "Jane" }); // { name: "Jane Doe", find: "John", replace: "Jane" }
 */
export class Mutator {
  private readonly cache = new Map<string, any>();
  private readonly buffer = new Map<string, boolean>();
  private readonly mutations = new Map<string, Function>();
  private readonly eventEmitter = new EventEmitter();
  private readonly discovery = new ObjectDiscovery();

  /**
   * Adds a mutation or mutations to the mutator instance.
   * The mutation(s) will be executed when the criteria object contains the mutation key.
   *
   * @param options The mutation name and function to execute.
   * @example
   * mutator.add("uppercase", (value) => value.toUpperCase());
   * mutator.add("lowercase", (value) => value.toLowerCase());
   * mutator.add("reverse", (value) => value.split("").reverse().join(""));
   * mutator.add("trim", (value) => value.trim());
   * mutator.add("replace", (value, criteria) => { const { find, replace } = criteria; return value.replace(find, replace); });
   * mutator.add([{ name: "uppercase", mutation: (value) => value.toUpperCase() }, { name: "lowercase", mutation: (value) => value.toLowerCase() }]);
   */
  add(options: Array<{ name: string; mutation: Function }>): void;
  add(options: string, mutation: Function): void;
  add(
    options: string | Array<{ name: string; mutation: Function }>,
    mutation?: Function,
  ): void {
    if (Array.isArray(options)) {
      for (const { name, mutation } of options) {
        this.mutations.set(name, mutation);
      }
      return;
    }

    this.mutations.set(options, mutation!);
  }

  /**
   * Removes a mutation or mutations from the mutator instance.
   * Any cached mutation values for this mutation will be purged.
   *
   * @param {string | Array<string>} names The name of the mutation.
   * @example
   * mutator.remove("uppercase");
   * mutator.remove(["reverse", "trim"]);
   */
  remove(names: Array<string>): void;
  remove(names: string): void;
  remove(names: string | Array<string>): void {
    if (Array.isArray(names)) {
      for (const name of names) {
        this.clearCache(name);
        this.mutations.delete(name);
      }
      return;
    }

    this.clearCache(names);
    this.mutations.delete(names);
  }

  /**
   * Removes all mutations from the mutator instance.
   * Clears all cached mutation values.
   */
  removeAll(): void {
    this.mutations.clear();
    this.cache.clear();
  }

  /**
   * Clears the mutator cache.
   * The entire cache, or cache for a specific mutator can be cleared
   * by passing or omitting the mutator name as an argument.
   *
   * @param name The mutator name to clear the cache for.
   */
  clearCache(name?: string): void {
    if (!name) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.startsWith(name)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Mutates and returns a criteria object.
   * If the criteria is an array, each item in the array will be mutated.
   * If the criteria do not contain any mutations, it will be returned as is.
   * If the criteria is mutable, it will be cloned, mutated and returned.
   *
   * @param criteria The criteria to mutate.
   * @returns The mutated criteria object.
   */
  async mutate(criteria: Criteria): Promise<Criteria> {
    // Handles checking the mutability of a criteria object
    // If it is mutable it will be cloned, mutated and returned
    const exec = async (criteria: CriteriaObject) => {
      // If there are no mutations or the criteria does not contain
      // any of the mutation keys, return the criteria as is.
      if (!this.mutations.size || !this.hasMutations(criteria)) {
        return criteria;
      }

      // Make a copy of the criteria.
      const copy = clone(criteria);

      // Apply the mutations to the copy and return it.
      await this.applyMutations(copy);

      return copy;
    };

    // If the criteria is an array, we want to apply the mutations
    // to each item in the array in parallel.
    if (Array.isArray(criteria)) {
      return Promise.all(
        criteria.map(
          (criteriaObj) =>
            new Promise(async (resolve) => {
              const mutated = await exec(criteriaObj);

              resolve(mutated);
            }),
        ),
      );
    } else {
      return exec(criteria);
    }
  }

  /**
   * Checks if the criteria contains any mutate-able properties.
   * Recurses through nested objects.
   * Returns true if a mutate-able property is found.
   *
   * @param criteria The criteria to check.
   * @param result Whether a mutate-able property has been found.
   */
  private hasMutations(criteria: CriteriaObject, result = false): boolean {
    // If we have already found a mutation, we can stop.
    if (result) return true;

    for (const key of Object.keys(criteria)) {
      if (result) return true;

      // Prepare a dotted path to the current property.
      const path = this.discovery.resolveProperty(key, criteria);

      // If the value is an object, we should recurse.
      result = result || path !== undefined;
    }

    return result;
  }

  /**
   * Recursively applies mutations to the criteria.
   * Mutations are executed in parallel.
   *
   * @param criteria The criteria to mutate.
   */
  private async applyMutations(criteria: CriteriaObject): Promise<void> {
    const promises = [...this.mutations.keys()].map(
      async (key) =>
        new Promise(async (resolve) => {
          // Prepare a dotted path to the current property.
          const value = this.discovery.resolveProperty(key, criteria);
          if (typeof value !== "undefined") {
            const processResult = await this.execMutation(key, criteria);
            criteria = this.discovery.updateProperty(
              key,
              criteria,
              processResult,
            );
          }

          resolve(value);
        }),
    );

    await Promise.all(promises);
  }

  /**
   * Executes a mutation.
   * Defers duplicate executions to the same object from a memory cache.
   * Mutations are executed in parallel.
   *
   * @param mutationKey The criteria property to execute the mutation on.
   * @param criteria The criteria to execute the mutation with.
   * @param mutationKey The key of the mutation to execute.
   */
  private async execMutation(
    mutationKey: string,
    criteria: CriteriaObject,
  ): Promise<any> {
    // Resolve the value of the property to mutate.
    const value = this.discovery.resolveProperty(mutationKey, criteria);

    // Create a cache key
    const cacheKey = `${mutationKey}${createHash("sha256").update(value.toString()).digest("hex")}`;

    // If the mutation has already been executed, return the cached result.
    if (this.cache.has(cacheKey)) {
      Logger.debug(`Cache hit on "${mutationKey}" with param "${value}"`);
      return this.cache.get(cacheKey);
    }

    // If the mutation is already in progress, wait for it to finish.
    if (this.buffer.get(cacheKey)) {
      return await new Promise((resolve) => {
        Logger.debug(
          `Waiting on mutation "${mutationKey}" with param "${value}"`,
        );
        this.eventEmitter.once(`mutation:${cacheKey}`, (result) => {
          Logger.debug(
            `Resolved mutation "${mutationKey}" with param "${value}"`,
          );
          resolve(result);
        });
      });
    }

    // Set the buffer to true to indicate that the mutation is in progress.
    // This prevents duplicate executions of the same mutation.
    this.buffer.set(cacheKey, true);

    // Execute the mutation
    Logger.debug(`Running mutation "${mutationKey}" with param "${value}"`);
    const mutation = this.mutations.get(mutationKey) ?? (() => value);
    const result = await mutation(value, criteria);

    // Cache the result and release the buffer to false.
    this.cache.set(cacheKey, result);
    this.buffer.set(cacheKey, false);

    // Emit an event to indicate that the mutation has been executed.
    this.eventEmitter.emit(`mutation:${cacheKey}`, result);

    return result;
  }
}
