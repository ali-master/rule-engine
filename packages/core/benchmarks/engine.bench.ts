import { it, describe } from "vitest";
import type { OperatorsType } from "@root";
import { RuleEngine, Operators } from "@root";
// Assets
import { valid1Json } from "../test/rulesets/valid1.json";
import { valid3Json } from "../test/rulesets/valid3.json";
import { valid4Json } from "../test/rulesets/valid4.json";
import { valid5Json } from "../test/rulesets/valid5.json";
import { valid13Json } from "../test/rulesets/valid13.json";
import { Valid10Json } from "../test/rulesets/valid10.json";
import { Valid11Json } from "../test/rulesets/valid11.json";
import { selfFieldsConstraintsJson } from "../test/rulesets/self-fields-constraints.json";

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
    it("simple rule - basic evaluation", async ({ bench }) => {
      await bench("simple rule - basic evaluation", async () => {
        await RuleEngine.getEvaluateResult(valid1Json, simpleData);
      }).run({ iterations: 10_000 });
    });

    it("simple rule - single condition", async ({ bench }) => {
      await bench("simple rule - single condition", async () => {
        await RuleEngine.getEvaluateResult(valid13Json, {}, false);
      }).run({ iterations: 10_000 });
    });

    it("simple rule - different data", async ({ bench }) => {
      await bench("simple rule - different data", async () => {
        await RuleEngine.getEvaluateResult(valid1Json, {
          payload: { ProfitPercentage: 11 },
        });
      }).run({ iterations: 10_000 });
    });
  });

  describe("complex Rules (10+ conditions)", () => {
    it("complex rule - nested evaluation", async ({ bench }) => {
      await bench("complex rule - nested evaluation", async () => {
        await RuleEngine.getEvaluateResult(valid3Json, complexData);
      }).run({ iterations: 10_000 });
    });

    it("complex rule - priority conditions", async ({ bench }) => {
      await bench("complex rule - priority conditions", async () => {
        await RuleEngine.getEvaluateResult(valid4Json, {
          CountryIso: "GB",
          Monetization: "Real",
          Category: 13,
        });
      }).run({ iterations: 10_000 });
    });

    it("complex rule - array operations", async ({ bench }) => {
      await bench("complex rule - array operations", async () => {
        await RuleEngine.getEvaluateResult(valid5Json, {
          countries: ["US", "FR"],
        });
      }).run({ iterations: 10_000 });
    });
  });

  describe("jSONPath Resolution", () => {
    it("jSONPath - simple nested field", async ({ bench }) => {
      await bench("jSONPath - simple nested field", async () => {
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
      }).run({ iterations: 10_000 });
    });

    it("jSONPath - deep nested access", async ({ bench }) => {
      await bench("jSONPath - deep nested access", async () => {
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
      }).run({ iterations: 10_000 });
    });

    it("jSONPath - array processing", async ({ bench }) => {
      await bench("jSONPath - array processing", async () => {
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
      }).run({ iterations: 10_000 });
    });
  });

  describe("self-Referencing Rules", () => {
    it("self-referencing - complex validation", async ({ bench }) => {
      await bench("self-referencing - complex validation", async () => {
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
      }).run({ iterations: 10_000 });
    });

    it("self-referencing - field comparison", async ({ bench }) => {
      await bench("self-referencing - field comparison", async () => {
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
      }).run({ iterations: 10_000 });
    });
  });

  describe("special Conditions", () => {
    it("exists/NotExists operators", async ({ bench }) => {
      await bench("exists/NotExists operators", async () => {
        await RuleEngine.getEvaluateResult(Valid10Json, {
          name: "John",
          age: 20,
          family: "Doe",
          relationship: "Father",
        });
      }).run({ iterations: 10_000 });
    });

    it("priority-based evaluation", async ({ bench }) => {
      await bench("priority-based evaluation", async () => {
        await RuleEngine.evaluate(Valid11Json, {
          payload: {
            depositAmount: "3",
          },
          metadata: {
            tenantId: "1",
          },
        });
      }).run({ iterations: 10_000 });
    });

    it("early termination optimization", async ({ bench }) => {
      await bench("early termination optimization", async () => {
        await RuleEngine.getEvaluateResult(valid4Json, {
          Leverage: 500, // First condition match - should terminate early
          CountryIso: "GB",
          Monetization: "Real",
          Category: 22,
        });
      }).run({ iterations: 10_000 });
    });
  });

  describe("error Handling", () => {
    it("unknown operator handling", async ({ bench }) => {
      await bench("unknown operator handling", async () => {
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
      }).run({ iterations: 10_000 });
    });

    it("invalid ruleset handling", async ({ bench }) => {
      await bench("invalid ruleset handling", async () => {
        try {
          await RuleEngine.getEvaluateResult({ conditions: [] }, {});
        } catch {}
      }).run({ iterations: 10_000 });
    });
  });
});
