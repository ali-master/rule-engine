import { it, expect, describe } from "vitest";
import type { OperatorsType } from "@root";
import { RuleError, RuleEngine, Operators } from "@root";
// Assets
import { valid1Json } from "./rulesets/valid1.json";
import { valid2Json } from "./rulesets/valid2.json";
import { valid3Json } from "./rulesets/valid3.json";
import { valid5Json } from "./rulesets/valid5.json";
import { valid13Json } from "./rulesets/valid13.json";
import { invalid2Json } from "./rulesets/invalid2.json";
import { Valid10Json } from "./rulesets/valid10.json";
import {
  selfFieldsConstraintsJsonWithNoResult,
  selfFieldsConstraintsJson,
} from "./rulesets/self-fields-constraints.json";
import { Valid11Json } from "./rulesets/valid11.json";
import { valid4Json } from "./rulesets/valid4.json";
import { RegexRulesJson } from "./rulesets/regex-rules.json";
import { PasswordRuleJson } from "./rulesets/password-rule.json";

describe("engine works correctly", () => {
  it("evaluates a simple ruleset", async () => {
    expect(
      await RuleEngine.getEvaluateResult(valid1Json, {
        payload: { ProfitPercentage: 9 },
      }),
    ).toEqual(false);

    expect(
      await RuleEngine.getEvaluateResult(valid1Json, {
        payload: { ProfitPercentage: 11 },
      }),
    ).toEqual(true);

    expect(
      await RuleEngine.getEvaluateResult(valid1Json, {
        WinRate: 80,
        AverageTradeDuration: 5,
        Duration: 9000000,
      }),
    ).toEqual(false);

    expect(
      await RuleEngine.getEvaluateResult(valid1Json, {
        WinRate: 80,
        AverageTradeDuration: 5,
        Duration: 9000000,
        TotalDaysTraded: 5,
      }),
    ).toEqual(true);
  });

  it("evaluates to false if operator is unknown", async () => {
    expect(
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
      ),
    ).toEqual(false);
  });

  it("evaluates to false if condition type is unknown", async () => {
    expect(
      await RuleEngine.getEvaluateResult(
        {
          conditions: [
            {
              // @ts-ignore
              any: [
                { field: "name", operator: Operators.Equals, value: "test" },
              ],
            },
          ],
        },
        { name: "test" },
        true,
      ),
    ).toEqual(false);
  });

  it("resolves nested field definitions", async () => {
    expect(
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
      ),
    ).toEqual(true);
  });

  it("handles missing nested field definitions", async () => {
    expect(
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
      ),
    ).toEqual(false);
  });

  it("handles array of criteria properly", async () => {
    expect(
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
      ),
    ).toEqual([false, true, false]);
  });

  it("throws an error on invalid not runnable ruleset", () => {
    expect(
      async () => await RuleEngine.getEvaluateResult({ conditions: [] }, {}),
    ).rejects.toThrow(RuleError);
  });

  it("evaluates a simple ruleset with a single condition", async () => {
    expect(await RuleEngine.getEvaluateResult(valid13Json, {}, false)).toEqual(
      2,
    );
  });

  it("evaluates a nested ruleset", async () => {
    expect(await RuleEngine.getEvaluateResult(valid3Json, {})).toEqual(2);
    expect(
      await RuleEngine.getEvaluateResult(valid3Json, { Leverage: 1000 }),
    ).toEqual(3);
    expect(
      await RuleEngine.getEvaluateResult(valid3Json, { Leverage: 999 }),
    ).toEqual(2);

    expect(
      await RuleEngine.getEvaluateResult(valid3Json, { Category: "Islamic" }),
    ).toEqual(4);

    expect(
      await RuleEngine.getEvaluateResult(valid3Json, { Monetization: "Real" }),
    ).toEqual(2);

    expect(
      await RuleEngine.getEvaluateResult(valid3Json, {
        Monetization: "Real",
        Leverage: 150,
        CountryIso: "FI",
      }),
    ).toEqual(3);

    expect(
      await RuleEngine.getEvaluateResult(valid3Json, {
        Monetization: "Real",
        Leverage: 150,
        CountryIso: "FI",
        foo: "bar",
        another: false,
      }),
    ).toEqual(3);
  });

  it("evaluates invalid rulesets", async () => {
    expect(
      async () =>
        await RuleEngine.getEvaluateResult(invalid2Json, { foo: true }, false),
    ).rejects.toThrow(RuleError);

    expect(
      async () =>
        await RuleEngine.getEvaluateResult(
          invalid2Json,
          { Category: "Islamic" },
          false,
        ),
    ).rejects.toThrow(RuleError);
  });

  it("evaluates a simple ruleset with none type condition", async () => {
    expect(
      await RuleEngine.getEvaluateResult(valid2Json, {
        Leverage: 100,
        WinRate: 80,
        AverageTradeDuration: 5,
        Duration: 9000000,
        TotalDaysTraded: 5,
      }),
    ).toEqual(true);

    expect(
      await RuleEngine.getEvaluateResult(valid2Json, {
        AverageTradeDuration: 10,
        Foo: 10,
      }),
    ).toEqual(true);
  });

  it("evaluates a simple ruleset with a Contains and ContainsAny any condition", async () => {
    expect(
      await RuleEngine.getEvaluateResult(valid5Json, {
        countries: ["US", "FR"],
      }),
    ).toEqual(true);

    expect(
      await RuleEngine.getEvaluateResult(valid5Json, {
        countries: ["GB", "DE"],
      }),
    ).toEqual(false);

    expect(
      await RuleEngine.getEvaluateResult(valid5Json, { states: ["CA", "TN"] }),
    ).toEqual(true);

    expect(
      await RuleEngine.getEvaluateResult(valid5Json, { states: ["NY", "WI"] }),
    ).toEqual(false);

    expect(
      await RuleEngine.getEvaluateResult(valid5Json, {
        states: "invalid criterion type",
      }),
    ).toEqual(false);
  });

  it("evaluates a self ruleset with a SelfContainsAll and SelfContainsAny", async () => {
    expect(
      await RuleEngine.evaluate(selfFieldsConstraintsJson, {
        meta: {
          default: {
            password: "@john-doe-@john-doe",
          },
        },
        username: "john-doe",
        name: "john",
        family: "doe",
      }),
    ).toEqual({
      isPassed: false,
      value: false,
      message:
        "Password is invalid and contains username(john-doe), name(john) and family(doe)",
    });
    expect(
      await RuleEngine.evaluate(selfFieldsConstraintsJsonWithNoResult, {
        meta: {
          default: {
            password: "@john-doe-@john-doe",
          },
        },
        username: "john-doe",
        name: "john",
        family: "doe",
      }),
    ).toEqual({
      isPassed: false,
      value: false,
      message:
        "Password is invalid and contains username(john-doe), name(john) and family(doe)",
    });

    expect(
      await RuleEngine.evaluate(selfFieldsConstraintsJson, {
        meta: {
          default: {
            password: "@Aa101010@",
          },
        },
        username: "john-doe",
        name: "john",
        family: "doe",
      }),
    ).toEqual({
      isPassed: true,
      value: true,
      message:
        "Password is valid and contains username(john-doe), name(john) and family(doe)",
    });

    expect(
      await RuleEngine.evaluate(selfFieldsConstraintsJsonWithNoResult, {
        meta: {
          default: {
            password: "Aa101010@",
          },
        },
        username: "john-doe",
        name: "john",
        family: "doe",
      }),
    ).toEqual({
      isPassed: true,
      value: true,
    });
  });

  it("evaluates a simple ruleset with Exists and NotExists conditions", async () => {
    expect(
      await RuleEngine.getEvaluateResult(Valid10Json, {
        name: "John",
        age: 20,
        family: "Doe",
        relationship: "Father",
      }),
    ).toEqual(false);
  });

  it("evaluates a simple ruleset with Priority based conditions", async () => {
    expect(
      await RuleEngine.evaluate(Valid11Json, {
        payload: {
          depositAmount: "3",
        },
        metadata: {
          levelId: 1,
        },
      }),
    ).toEqual({
      isPassed: false,
      message: "Deposit amount must be between 4 and 20 characters.",
      value: false,
    });
  });

  it("evaluates a nested ruleset with Priority based conditions", async () => {
    expect(
      await RuleEngine.getEvaluateResult(valid4Json, {
        CountryIso: "GB",
        Monetization: "Real",
        Category: 13,
      }),
    ).toEqual(2);

    expect(
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
      }),
    ).toEqual(3);
  });

  it("evaluates a nested regex ruleset", async () => {
    expect(
      await RuleEngine.evaluate(RegexRulesJson, {
        payload: {
          password: "@a101010",
        },
        data: {
          username: "51c351351",
        },
      }),
    ).toEqual({
      isPassed: false,
      value: false,
      message: "رمزعبور باید حداقل شامل یک حرف بزرگ باشد",
    });

    expect(
      await RuleEngine.evaluate(RegexRulesJson, {
        payload: {
          password: "@A101010",
        },
        data: {
          username: "51c351351",
        },
      }),
    ).toEqual({
      isPassed: false,
      value: false,
      message: "رمزعبور باید حداقل شامل یک حرف کوچک باشد",
    });

    expect(
      await RuleEngine.evaluate(RegexRulesJson, {
        payload: {
          password: "Aa101010",
        },
        data: {
          username: "51c351351",
        },
      }),
    ).toEqual({
      isPassed: false,
      value: false,
      message: "رمزعبور باید حداقل شامل یک کاراکتر خاص باشد",
    });

    expect(
      await RuleEngine.evaluate(RegexRulesJson, {
        payload: {
          password: "@Aaaaaaaaaa",
        },
        data: {
          username: "51c351351",
        },
      }),
    ).toEqual({
      isPassed: false,
      value: false,
      message: "رمزعبور باید حداقل شامل یک عدد باشد",
    });
  });

  it("evaluates a simple password ruleset", async () => {
    expect(
      await RuleEngine.evaluate(PasswordRuleJson, {
        payload: {
          password: "@Aa101010",
        },
        data: {
          phone: "09022002580",
        },
      }),
    ).toEqual({
      isPassed: true,
      value: true,
    });
  });

  it("resolve constraints message in and condition", async () => {
    expect(
      await RuleEngine.getEvaluateResult(
        {
          conditions: [
            {
              // @ts-ignore
              and: [
                {
                  field: "name",
                  operator: Operators.Equals,
                  value: "test",
                  message: "name should be test",
                },
              ],
            },
          ],
        },
        { name: "test2" },
        true,
      ),
    ).toEqual(false);
  });

  it("evaluate a none condition", async () => {
    expect(
      await RuleEngine.getEvaluateResult(
        {
          conditions: [
            {
              none: [
                {
                  field: "name",
                  operator: Operators.Equals,
                  value: "test",
                  message: "name should be test",
                },
                {
                  field: "family",
                  operator: Operators.Equals,
                  value: "test",
                  message: "family should be test",
                },
                {
                  none: [
                    {
                      field: "age",
                      operator: Operators.Equals,
                      value: 19,
                      message: "age should be 19",
                    },
                  ],
                },
              ],
            },
          ],
        },
        { name: "test2", family: "test2", age: 18 },
        true,
      ),
    ).toEqual(false);
  });

  it("should return false if field is undefined", async () => {
    expect(
      await RuleEngine.getEvaluateResult(
        {
          conditions: [
            {
              and: [
                {
                  field: "$.name",
                  operator: Operators.Equals,
                  value: "test",
                  message: "name should be test",
                },
              ],
            },
          ],
        },
        { family: "test2" },
      ),
    ).toEqual(false);
  });

  it("should return true for checkIsPassed method", async () => {
    const engine = RuleEngine.getInstance();
    expect(
      await engine.checkIsPassed(
        {
          conditions: [
            {
              and: [
                {
                  field: "$.name",
                  operator: Operators.Equals,
                  value: "test",
                  message: "name should be test",
                },
              ],
            },
          ],
        },
        { name: "test" },
      ),
    ).toEqual(true);

    expect(
      await engine.checkIsPassed(
        {
          conditions: [
            {
              and: [
                {
                  field: "$.name",
                  operator: Operators.Equals,
                  value: "test",
                  message: "name should be test",
                },
              ],
            },
          ],
        },
        [{ name: "test" }],
      ),
    ).toEqual(true);
  });

  it("should return true for evaluate multiple rules", async () => {
    const engine = RuleEngine.getInstance();
    expect(
      await engine.evaluateMany(
        [
          {
            conditions: [
              {
                and: [
                  {
                    field: "$.name",
                    operator: Operators.Equals,
                    value: "test",
                    message: "name should be test",
                  },
                ],
              },
            ],
          },
        ],
        { name: "test" },
      ),
    ).toEqual([
      {
        isPassed: true,
        value: true,
      },
    ]);
  });
});
