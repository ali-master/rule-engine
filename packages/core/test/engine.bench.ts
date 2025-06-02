import { describe, bench } from "vitest";
import type { OperatorsType } from "@root";
import { RuleEngine, Operators } from "@root";
// Assets
import { valid1Json } from "./rulesets/valid1.json";
import { valid2Json } from "./rulesets/valid2.json";
import { valid3Json } from "./rulesets/valid3.json";
import { valid4Json } from "./rulesets/valid4.json";
import { valid5Json } from "./rulesets/valid5.json";
import { valid13Json } from "./rulesets/valid13.json";
import { Valid10Json } from "./rulesets/valid10.json";
import { Valid11Json } from "./rulesets/valid11.json";
import { selfFieldsConstraintsJson } from "./rulesets/self-fields-constraints.json";

describe("engine works correctly", () => {
  bench(
    "evaluates a simple ruleset A",
    async () => {
      await RuleEngine.getEvaluateResult(valid1Json, {
        payload: { ProfitPercentage: 9 },
      });
    },
    {
      iterations: 10_000,
    },
  );
  bench(
    "evaluates a simple ruleset B",
    async () => {
      await RuleEngine.getEvaluateResult(valid1Json, {
        payload: { ProfitPercentage: 11 },
      });
    },
    {
      iterations: 10_000,
    },
  );
  bench(
    "evaluates a simple ruleset C",
    async () => {
      await RuleEngine.getEvaluateResult(valid1Json, {
        WinRate: 80,
        AverageTradeDuration: 5,
        Duration: 9000000,
      });
    },
    {
      iterations: 10_000,
    },
  );
  bench(
    "evaluates a simple ruleset D",
    async () => {
      await RuleEngine.getEvaluateResult(valid1Json, {
        WinRate: 80,
        AverageTradeDuration: 5,
        Duration: 9000000,
        TotalDaysTraded: 5,
      });
    },
    {
      iterations: 10_000,
    },
  );

  bench(
    "evaluates to false if operator is unknown",
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
    {
      iterations: 10_000,
    },
  );

  bench(
    "resolves nested field definitions",
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
    {
      iterations: 10_000,
    },
  );

  bench(
    "handles missing nested field definitions",
    async () => {
      await RuleEngine.getEvaluateResult(
        {
          conditions: [
            {
              and: [
                { field: "foo.foo", operator: Operators.Equals, value: "test" },
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
    {
      iterations: 10_000,
    },
  );

  bench(
    "handles array of criteria properly",
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
        [
          {
            foo: {
              bar: "test",
            },
          },
          {
            foo: {
              bar: "bar",
            },
          },
          {},
        ],
      );
    },
    {
      iterations: 10_000,
    },
  );

  bench(
    "throws an error on invalid not runnable ruleset",
    async () => {
      try {
        await RuleEngine.getEvaluateResult({ conditions: [] }, {});
      } catch {}
    },
    {
      iterations: 10_000,
    },
  );

  bench(
    "evaluates a simple ruleset with a single condition",
    async () => {
      await RuleEngine.getEvaluateResult(valid13Json, {}, false);
    },
    {
      iterations: 10_000,
    },
  );

  bench(
    "evaluates a nested ruleset A",
    async () => {
      await RuleEngine.getEvaluateResult(valid3Json, {
        Monetization: "Real",
        Leverage: 150,
        CountryIso: "FI",
      });
    },
    {
      iterations: 10_000,
    },
  );

  bench(
    "evaluates a nested ruleset B",
    async () => {
      await RuleEngine.getEvaluateResult(valid3Json, {
        Monetization: "Real",
        Leverage: 150,
        CountryIso: "FI",
        foo: "bar",
        another: false,
      });
    },
    {
      iterations: 10_000,
    },
  );

  bench(
    "evaluates a simple ruleset with none type condition",
    async () => {
      await RuleEngine.getEvaluateResult(valid2Json, {
        Leverage: 100,
        WinRate: 80,
        AverageTradeDuration: 5,
        Duration: 9000000,
        TotalDaysTraded: 5,
      });
    },
    {
      iterations: 10_000,
    },
  );

  bench(
    "evaluates a simple ruleset with a Contains and ContainsAny any condition",
    async () => {
      await RuleEngine.getEvaluateResult(valid5Json, {
        countries: ["US", "FR"],
      });
    },
    {
      iterations: 10_000,
    },
  );

  bench(
    "evaluates a self ruleset with a SelfContainsAll and SelfContainsAny A",
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
    {
      iterations: 10_000,
    },
  );

  bench(
    "evaluates a self ruleset with a SelfContainsAll and SelfContainsAny B",
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
    {
      iterations: 10_000,
    },
  );

  bench(
    "evaluates a simple ruleset with Exists and NotExists conditions",
    async () => {
      await RuleEngine.getEvaluateResult(Valid10Json, {
        name: "John",
        age: 20,
        family: "Doe",
        relationship: "Father",
      });
    },
    {
      iterations: 10_000,
    },
  );

  bench(
    "evaluates a simple ruleset with Priority based conditions",
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
    {
      iterations: 10_000,
    },
  );

  bench(
    "evaluates a nested ruleset with Priority based conditions A",
    async () => {
      await RuleEngine.getEvaluateResult(valid4Json, {
        CountryIso: "GB",
        Monetization: "Real",
        Category: 13,
      });
    },
    {
      iterations: 10_000,
    },
  );

  bench(
    "evaluates a nested ruleset with Priority based conditions B",
    async () => {
      await RuleEngine.getEvaluateResult(valid4Json, {
        Leverage: 500, // This is the first condition in the ruleset.
        // It should be evaluated first
        // and return the result immediately without evaluating the rest of the conditions
        //
        // the rest of the conditions are not evaluated
        // because the first condition is already satisfied
        CountryIso: "GB",
        Monetization: "Real",
        Category: 22,
      });
    },
    {
      iterations: 10_000,
    },
  );
});
