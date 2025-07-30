// Utilities
import { describe, bench } from "vitest";
import { RuleEngine, Operators } from "@root";
// Assets
import { valid1Json } from "../test/rulesets/valid1.json";

describe("mutation Performance Benchmarks", () => {
  describe("data Mutations", () => {
    bench(
      "simple field mutation",
      async () => {
        const rp = RuleEngine.getInstance();
        rp.addMutation("WinRate", (value: number) => value * 2);

        await rp.getEvaluateResult(valid1Json, {
          WinRate: 31,
          AverageTradeDuration: 60,
          Duration: 99999999,
          TotalDaysTraded: 3,
        });

        rp.clearMutations();
      },
      { iterations: 10_000 },
    );

    bench(
      "multiple field mutations",
      async () => {
        const rp = RuleEngine.getInstance();
        rp.addMutation("WinRate", (value: number) => value * 2);
        rp.addMutation("AverageTradeDuration", (value: number) => value / 2);

        await rp.getEvaluateResult(valid1Json, {
          WinRate: 31,
          AverageTradeDuration: 60,
          Duration: 99999999,
          TotalDaysTraded: 3,
        });

        rp.clearMutations();
      },
      { iterations: 10_000 },
    );

    bench(
      "jSONPath nested mutation",
      async () => {
        const rp = RuleEngine.getInstance();
        rp.addMutation("$.foo.bar", (value: number) => value * 2);

        await rp.getEvaluateResult(
          {
            conditions: [
              {
                and: [
                  {
                    field: "$.foo.bar",
                    operator: Operators.GreaterThan,
                    value: 6,
                  },
                ],
              },
            ],
          },
          { foo: { bar: 5 } },
        );

        rp.clearMutations();
      },
      { iterations: 10_000 },
    );

    bench(
      "complex data transformation",
      async () => {
        const rp = RuleEngine.getInstance();
        rp.addMutation("$.user.score", (value: number) =>
          Math.round(value * 1.15),
        );
        rp.addMutation("$.user.level", (value: string) => value.toUpperCase());

        await rp.getEvaluateResult(
          {
            conditions: [
              {
                and: [
                  {
                    field: "$.user.score",
                    operator: Operators.GreaterThan,
                    value: 100,
                  },
                ],
              },
            ],
          },
          { user: { score: 85, level: "premium" } },
        );

        rp.clearMutations();
      },
      { iterations: 10_000 },
    );
  });
});
