// Utilities
import { bench, describe } from "vitest";
import { RuleEngine, Operators } from "../src";
// Assets
import { valid1Json } from "./rulesets/valid1.json";

describe("RuleEngine mutator correctly", () => {
  bench(
    "Performs multiple mutations",
    async () => {
      const rp = new RuleEngine();

      rp.addMutation("WinRate", (value: number) => value * 2);
      rp.addMutation("AverageTradeDuration", (value: number) => value / 2);

      await rp.getEvaluateResult(valid1Json, {
        WinRate: 31,
        AverageTradeDuration: 60,
        Duration: 99999999,
        TotalDaysTraded: 3,
      });
    },
    {
      iterations: 10_000,
    },
  );

  bench(
    "Performs nested mutation",
    async () => {
      const rp = new RuleEngine();

      rp.addMutation("$.foo.bar", (value: number) => value * 2);

      await rp.getEvaluateResult(
        {
          conditions: [
            {
              and: [{ field: "$.foo.bar", operator: Operators.GreaterThan, value: 6 }],
            },
          ],
        },
        { foo: { bar: 5 } },
      );
    },
    {
      iterations: 10_000,
    },
  );
});
