import { it, expect, describe, beforeAll } from "vitest";
import {
  RuleEngine,
  registerCustomOperator,
  OperatorCategory,
  BaseOperatorStrategy,
} from "@root";
import type { OperatorMetadata, OperatorContext } from "@root";

describe("rule engine", () => {
  let engine: RuleEngine;

  beforeAll(() => {
    // Initialize with custom config
    engine = RuleEngine.getInstance({
      autoInitializeOperators: true,
      enableCaching: true,
      maxCacheSize: 100,
    });
  });

  describe("basic Evaluation", () => {
    it("should evaluate simple rules", async () => {
      const rule = {
        conditions: {
          and: [
            { field: "age", operator: "greater-than" as any, value: 18 },
            { field: "status", operator: "equals" as any, value: "active" },
          ],
        },
      };

      const result = await engine.evaluate(rule, {
        age: 25,
        status: "active",
      });

      expect(result).toMatchObject({
        isPassed: true,
        value: true,
      });
    });

    it("should handle array criteria", async () => {
      const rule = {
        conditions: {
          and: [{ field: "score", operator: "greater-than" as any, value: 60 }],
        },
      };

      const results = await engine.evaluate(rule, [
        { score: 70 },
        { score: 50 },
        { score: 80 },
      ]);

      expect(Array.isArray(results)).toBe(true);
      if (Array.isArray(results)) {
        expect(results).toHaveLength(3);
        expect(results[0].isPassed).toBe(true);
        expect(results[1].isPassed).toBe(false);
        expect(results[2].isPassed).toBe(true);
      }
    });
  });

  describe("enhanced Introspection", () => {
    it("should provide operator metadata", () => {
      const rule = {
        conditions: [
          {
            and: [
              { field: "name", operator: "like" as any, value: "John%" },
              { field: "age", operator: "between" as any, value: [18, 65] },
            ],
            result: { status: "eligible" },
          },
        ],
      };

      // @ts-ignore
      const introspection = engine.introspect(rule, {
        includeMetadata: true,
        includeComplexity: true,
      });

      expect(introspection.operatorMetadata).toBeDefined();
      expect(introspection.operatorMetadata?.usedOperators).toContain("like");
      expect(introspection.operatorMetadata?.usedOperators).toContain(
        "between",
      );

      expect(introspection.complexity).toBeDefined();
      expect(introspection.complexity?.totalConstraints).toBe(2);
      expect(introspection.complexity?.uniqueFields).toBe(2);
    });
  });

  describe("custom Operators", () => {
    // Define a custom postal code operator
    class PostalCodeOperator extends BaseOperatorStrategy<string, string> {
      readonly metadata: OperatorMetadata = {
        name: "postal-code" as any,
        displayName: "Postal Code",
        category: OperatorCategory.PATTERN,
        description: "Validates postal codes by country",
        acceptedFieldTypes: ["string"],
        expectedValueType: "string",
        requiresValue: true,
        example: '{ field: "zipCode", operator: "postal-code", value: "US" }',
      };

      evaluate(context: OperatorContext): boolean {
        const { fieldValue, constraintValue } = context;

        if (
          typeof fieldValue !== "string" ||
          typeof constraintValue !== "string"
        ) {
          return false;
        }

        const patterns: Record<string, RegExp> = {
          US: /^\d{5}(-\d{4})?$/,
          UK: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
          CA: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i,
          DE: /^\d{5}$/,
          FR: /^\d{5}$/,
        };

        const pattern = patterns[constraintValue.toUpperCase()];
        return pattern ? pattern.test(fieldValue) : false;
      }

      isValidFieldType(value: unknown): value is string {
        return typeof value === "string";
      }

      isValidConstraintType(value: unknown): value is string {
        const validCountries = ["US", "UK", "CA", "DE", "FR"];
        return (
          typeof value === "string" &&
          validCountries.includes(value.toUpperCase())
        );
      }
    }

    it("should support custom operators", async () => {
      // Register custom operator
      registerCustomOperator(PostalCodeOperator);

      const rule = {
        conditions: {
          and: [
            { field: "zipCode", operator: "postal-code" as any, value: "US" },
          ],
        },
      };

      // Test valid US postal code
      const result1 = await engine.evaluate(rule, {
        zipCode: "12345",
      });
      expect(result1.isPassed).toBe(true);

      // Test invalid US postal code
      const result2 = await engine.evaluate(rule, { zipCode: "1234" });
      expect(result2.isPassed).toBe(false);

      // Test valid US postal code with +4
      const result3 = await engine.evaluate(rule, {
        zipCode: "12345-6789",
      });
      expect(result3.isPassed).toBe(true);
    });
  });

  describe("performance Features", () => {
    it("should cache evaluation results", async () => {
      const rule = {
        conditions: {
          and: [{ field: "value", operator: "equals" as any, value: 42 }],
        },
      };

      const criteria = { value: 42 };

      // First evaluation
      const result1 = await engine.evaluate(rule, criteria);

      // Second evaluation (should be cached)
      const result2 = await engine.evaluate(rule, criteria);

      expect(result1.isPassed).toBe(true);
      expect(result2.isPassed).toBe(true);

      // Ensure results are the same
      expect(result1).toEqual(result2);
      // Cached evaluation should be faster (though timing can be unreliable in tests)
      // In a real scenario, cached would be significantly faster
    });

    it("should handle trust mode", async () => {
      const invalidRule = {
        conditions: {
          // Missing operator type
          and: [{ field: "test" }],
        },
      } as any;

      // Should throw without trust mode
      await expect(engine.evaluate(invalidRule, { test: 1 })).rejects.toThrow();

      // Should not throw with trust mode
      const result = await engine.evaluate(invalidRule, { test: 1 }, true);
      expect(result).toBeDefined();
    });
  });

  describe("operator Validation", () => {
    it("should validate operators in rules", () => {
      const rule = {
        conditions: {
          and: [
            { field: "valid", operator: "equals" as any, value: 1 },
            { field: "invalid", operator: "non-existent-op" as any, value: 2 },
          ],
        },
      };

      const validation = engine.validateOperators(rule);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0]).toContain("non-existent-op");
    });

    it("should get used operators", () => {
      const rule = {
        conditions: {
          or: [
            { field: "a", operator: "equals" as any, value: 1 },
            { field: "b", operator: "greater-than" as any, value: 2 },
            {
              and: [
                { field: "c", operator: "like" as any, value: "test%" },
                { field: "d", operator: "between" as any, value: [1, 10] },
              ],
            },
          ],
        },
      };

      const operators = engine.getUsedOperators(rule);
      expect(operators.size).toBe(4);
      expect(operators).toContain("equals");
      expect(operators).toContain("greater-than");
      expect(operators).toContain("like");
      expect(operators).toContain("between");
    });
  });

  describe("type Safety", () => {
    it("should provide type-safe evaluation results", async () => {
      interface UserData {
        name: string;
        age: number;
        isActive: boolean;
      }

      interface RuleResult {
        accessLevel: "admin" | "user" | "guest";
        permissions: string[];
      }

      const rule = {
        conditions: [
          {
            and: [
              {
                field: "age",
                operator: "greater-than-or-equals" as any,
                value: 21,
              },
              { field: "isActive", operator: "equals" as any, value: true },
            ],
            result: {
              value: {
                accessLevel: "admin" as const,
                permissions: ["read", "write", "delete"],
              },
            },
          },
        ],
        default: {
          value: {
            accessLevel: "guest" as const,
            permissions: ["read"],
          },
        },
      };

      // @ts-ignore
      const result = await engine.evaluate<RuleResult>(rule, {
        name: "John",
        age: 25,
        isActive: true,
      } as unknown as UserData);

      if (!Array.isArray(result)) {
        expect(result.value.accessLevel).toBe("admin");
        expect(result.value.permissions).toContain("write");
      }
    });
  });

  describe("backward Compatibility", () => {
    it("should work with legacy rule format", async () => {
      const legacyRule = {
        conditions: {
          and: [
            { field: "status", operator: "equals" as any, value: "active" },
            { field: "score", operator: "greater-than" as any, value: 50 },
          ],
        },
      };

      const result = await RuleEngine.evaluate(legacyRule, {
        status: "active",
        score: 75,
      });

      expect(result.isPassed).toBe(true);
    });

    it("should support static methods", async () => {
      const rule = {
        conditions: {
          and: [{ field: "test", operator: "equals" as any, value: "value" }],
        },
      };

      // Test static methods
      const isPassed = await RuleEngine.checkIsPassed(rule, { test: "value" });
      expect(isPassed).toBe(true);

      const value = await RuleEngine.getEvaluateResult(rule, { test: "value" });
      expect(value).toBe(true);

      const validation = RuleEngine.validate(rule);
      expect(validation.isValid).toBe(true);
    });
  });
});
