import { describe, bench } from "vitest";
import type { OperatorsType } from "@root";
import { RuleEngine, Operators } from "@root";
// Assets
import { valid1Json } from "./rulesets/valid1.json";
import { valid3Json } from "./rulesets/valid3.json";
import { valid4Json } from "./rulesets/valid4.json";
import { valid5Json } from "./rulesets/valid5.json";
import { valid13Json } from "./rulesets/valid13.json";
import { Valid10Json } from "./rulesets/valid10.json";
import { Valid11Json } from "./rulesets/valid11.json";
import { selfFieldsConstraintsJson } from "./rulesets/self-fields-constraints.json";

// Sample data for benchmarks
const simpleData = {
  payload: { ProfitPercentage: 9 },
  WinRate: 80,
  AverageTradeDuration: 5,
  Duration: 9000000,
  TotalDaysTraded: 5,
};

const complexData = {
  Monetization: "Real",
  Leverage: 150,
  CountryIso: "FI",
  foo: "bar",
  another: false,
  countries: ["US", "FR"],
  nested: {
    field: "value",
    array: [1, 2, 3, 4, 5],
  },
};

const largnestedData = {
  user: {
    profile: {
      personal: {
        name: "John",
        age: 30,
        preferences: {
          theme: "dark",
          notifications: true,
          settings: {
            privacy: "public",
            language: "en",
          },
        },
      },
    },
  },
  orders: Array.from({ length: 50 }, (_, i) => ({
    id: i,
    total: Math.random() * 1000,
    items: Array.from({ length: 5 }, (_, j) => ({
      id: j,
      price: Math.random() * 100,
    })),
  })),
};

describe("rule Engine Performance Benchmarks", () => {
  describe("simple Rules (3-5 conditions)", () => {
    bench(
      "simple rule - basic evaluation",
      async () => {
        await RuleEngine.getEvaluateResult(valid1Json, simpleData);
      },
      { iterations: 10_000 },
    );

    bench(
      "simple rule - single condition",
      async () => {
        await RuleEngine.getEvaluateResult(valid13Json, {}, false);
      },
      { iterations: 10_000 },
    );

    bench(
      "simple rule - different data",
      async () => {
        await RuleEngine.getEvaluateResult(valid1Json, {
          payload: { ProfitPercentage: 11 },
        });
      },
      { iterations: 10_000 },
    );
  });

  describe("complex Rules (10+ conditions)", () => {
    bench(
      "complex rule - nested evaluation",
      async () => {
        await RuleEngine.getEvaluateResult(valid3Json, complexData);
      },
      { iterations: 10_000 },
    );

    bench(
      "complex rule - priority conditions",
      async () => {
        await RuleEngine.getEvaluateResult(valid4Json, {
          CountryIso: "GB",
          Monetization: "Real",
          Category: 13,
        });
      },
      { iterations: 10_000 },
    );

    bench(
      "complex rule - array operations",
      async () => {
        await RuleEngine.getEvaluateResult(valid5Json, {
          countries: ["US", "FR"],
        });
      },
      { iterations: 10_000 },
    );
  });

  describe("jSONPath Resolution", () => {
    bench(
      "jSONPath - simple nested field",
      async () => {
        await RuleEngine.getEvaluateResult(
          {
            conditions: [
              {
                and: [
                  {
                    field: "$.foo.bar",
                    operator: Operators.Equals,
                    value: "test",
                  },
                ],
              },
            ],
          },
          {
            foo: {
              bar: "test",
            },
          },
        );
      },
      { iterations: 10_000 },
    );

    bench(
      "jSONPath - deep nested access",
      async () => {
        await RuleEngine.getEvaluateResult(
          {
            conditions: [
              {
                and: [
                  {
                    field: "$.user.profile.personal.name",
                    operator: Operators.Equals,
                    value: "John",
                  },
                ],
              },
            ],
          },
          largnestedData,
        );
      },
      { iterations: 10_000 },
    );

    bench(
      "jSONPath - array processing",
      async () => {
        await RuleEngine.getEvaluateResult(
          {
            conditions: [
              {
                and: [
                  {
                    field: "$.foo.bar",
                    operator: Operators.Equals,
                    value: "bar",
                  },
                ],
              },
            ],
          },
          [{ foo: { bar: "test" } }, { foo: { bar: "bar" } }, {}],
        );
      },
      { iterations: 10_000 },
    );
  });

  describe("self-Referencing Rules", () => {
    bench(
      "self-referencing - complex validation",
      async () => {
        await RuleEngine.evaluate(selfFieldsConstraintsJson, {
          meta: {
            default: {
              password: "@john-doe-@john-doe",
            },
          },
          username: "john-doe",
          name: "john",
          family: "doe",
        });
      },
      { iterations: 10_000 },
    );

    bench(
      "self-referencing - field comparison",
      async () => {
        await RuleEngine.evaluate(selfFieldsConstraintsJson, {
          meta: {
            default: {
              password: "Aa101010@",
            },
          },
          username: "john-doe",
          name: "john",
          family: "doe",
        });
      },
      { iterations: 10_000 },
    );
  });

  describe("special Conditions", () => {
    bench(
      "exists/NotExists operators",
      async () => {
        await RuleEngine.getEvaluateResult(Valid10Json, {
          name: "John",
          age: 20,
          family: "Doe",
          relationship: "Father",
        });
      },
      { iterations: 10_000 },
    );

    bench(
      "priority-based evaluation",
      async () => {
        await RuleEngine.evaluate(Valid11Json, {
          payload: {
            depositAmount: "3",
          },
          metadata: {
            tenantId: "1",
          },
        });
      },
      { iterations: 10_000 },
    );

    bench(
      "early termination optimization",
      async () => {
        await RuleEngine.getEvaluateResult(valid4Json, {
          Leverage: 500, // First condition match - should terminate early
          CountryIso: "GB",
          Monetization: "Real",
          Category: 22,
        });
      },
      { iterations: 10_000 },
    );
  });

  describe("error Handling", () => {
    bench(
      "unknown operator handling",
      async () => {
        await RuleEngine.getEvaluateResult(
          {
            conditions: [
              {
                and: [
                  {
                    field: "name",
                    operator: "foo" as OperatorsType,
                    value: "test",
                  },
                ],
              },
            ],
          },
          { name: "test" },
          true,
        );
      },
      { iterations: 10_000 },
    );

    bench(
      "invalid ruleset handling",
      async () => {
        try {
          await RuleEngine.getEvaluateResult({ conditions: [] }, {});
        } catch {}
      },
      { iterations: 10_000 },
    );
  });
});
