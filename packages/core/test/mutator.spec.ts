// Utilities
import axios from "axios";
import { RuleEngine, Operators } from "../src";
import { beforeEach, describe, expect, it, vi } from "vitest";
// Assets
import { valid1Json } from "./rulesets/valid1.json";
import { valid3Json } from "./rulesets/valid3.json";

const mutation1 = async (value: unknown[]) => {
  const result = await axios.get<{ cca2: any }>(
    `https://restcountries.com/v3.1/name/${value}?fullText=true`,
  );
  // @ts-ignore
  return result.data?.[0].cca2;
};

const mutation2 = async (value: unknown[]) => {
  const result = await axios.get<{ cca2: any }>(
    `https://restcountries.com/v3.1/name/${value[0]}?fullText=true`,
  );
  // @ts-ignore
  return result.data[0].cca2;
};

const criteria = [
  {
    CountryIso: "United Kingdom",
    Leverage: 60,
    Monetization: "Real",
  },
  {
    CountryIso: "United Kingdom",
    Leverage: 200,
    Monetization: "Real",
  },
  {
    CountryIso: "United Kingdom",
    Leverage: 60,
    Monetization: "Real",
  },
];

describe("RuleEngine mutator correctly", () => {
  beforeEach(() => {
    console.debug = vi.fn();
    process.env.DEBUG = "true";
  });

  it("Performs desired mutation", async () => {
    const rp = new RuleEngine();

    rp.addMutation("$.payload.ProfitPercentage", (value: number) => value * 2);
    expect(await rp.getEvaluateResult(valid1Json, { payload: { ProfitPercentage: 5 } })).toEqual(
      true,
    );
  });

  it("Performs multiple mutations", async () => {
    const rp = new RuleEngine();

    rp.addMutation("WinRate", (value: number) => value * 2);
    rp.addMutation("AverageTradeDuration", (value: number) => value / 2);

    expect(
      await rp.getEvaluateResult(valid1Json, {
        WinRate: 31,
        AverageTradeDuration: 60,
        Duration: 99999999,
        TotalDaysTraded: 3,
      }),
    ).toEqual(true);
  });

  it("Performs async mutation", async () => {
    const rp = new RuleEngine();

    rp.addMutation("CountryIso", mutation1);

    expect(
      await rp.getEvaluateResult(valid3Json, {
        CountryIso: "United Kingdom",
        Leverage: 60,
        Monetization: "Real",
        foo: {
          CountryIso: "United Kingdom",
        },
      }),
    ).toEqual(3);
  });

  it("Performs nested mutation", async () => {
    const rp = new RuleEngine();

    rp.addMutation("$.foo.bar", (value: number) => value * 2);
    expect(
      await rp.getEvaluateResult(
        {
          conditions: [
            {
              and: [{ field: "$.foo.bar", operator: Operators.GreaterThan, value: 6 }],
            },
          ],
        },
        { foo: { bar: 5 } },
      ),
    ).toEqual(true);
  });

  it("Caches async mutation results", async () => {
    const rp = new RuleEngine();

    rp.addMutation("Leverage", (value: unknown) => value);
    rp.addMutation("CountryIso", mutation1);

    const result = await rp.getEvaluateResult(valid3Json, criteria);

    expect(console.debug).toBeCalledWith(
      'Waiting on mutation "CountryIso" with param "United Kingdom"',
    );
    expect(console.debug).toBeCalledTimes(9);
    expect(result).toEqual([3, 2, 3]);
  });

  it("Performs a migration with an array parameter", async () => {
    const rp = new RuleEngine();

    rp.addMutation("CountryIso", mutation2);

    const result = await rp.getEvaluateResult(
      {
        conditions: [
          {
            and: [{ field: "CountryIso", operator: Operators.Equals, value: "GB" }],
          },
        ],
      },
      { CountryIso: ["United Kingdom", "Finland"] },
    );

    expect(result).toEqual(true);
  });

  it("Performs a migration with a nested array parameter", async () => {
    const rp = new RuleEngine();

    rp.addMutation("$.foo.bar", mutation2);

    const result = await rp.getEvaluateResult(
      {
        conditions: [
          {
            and: [{ field: "$.foo.bar", operator: Operators.Equals, value: "GB" }],
          },
        ],
      },
      { foo: { bar: ["United Kingdom", "Finland"] } },
    );

    expect(result).toEqual(true);
  });

  it("Mutation cache works properly", async () => {
    const rp = new RuleEngine();

    rp.addMutation("Leverage", (value: unknown) => value);
    rp.addMutation("CountryIso", mutation1);

    await rp.getEvaluateResult(valid3Json, criteria);

    setTimeout(async () => {
      const result = await rp.getEvaluateResult(valid3Json, criteria);
      expect(console.debug).toBeCalledWith('Cache hit on "CountryIso" with param "United Kingdom"');
      expect(result).toEqual([3, 2, 3]);
    }, 1500);
  });

  it("Removes a mutation properly", async () => {
    const rp = new RuleEngine();

    rp.addMutation("CountryIso", mutation1);
    rp.removeMutation("CountryIso");

    const result = await rp.getEvaluateResult(valid3Json, {
      CountryIso: "United Kingdom",
      Leverage: 60,
      Monetization: "Real",
    });

    expect(console.debug).not.toHaveBeenCalled();
    expect(result).toEqual(2);
  });

  it("Clears mutation cache properly", async () => {
    const rp = new RuleEngine();

    rp.addMutation("CountryIso", mutation1);

    await rp.evaluate(valid3Json, {
      CountryIso: "United Kingdom",
      Leverage: 60,
      Monetization: "Real",
    });

    rp.clearMutationCache("CountryIso");

    const result = await rp.getEvaluateResult(valid3Json, {
      CountryIso: "United Kingdom",
      Leverage: 60,
      Monetization: "Real",
    });

    expect(console.debug).not.toHaveBeenCalledWith(
      'Waiting on mutation "CountryIso" with param "United Kingdom"',
    );
    expect(result).toEqual(3);
  });

  it("Clears all mutation cache properly", async () => {
    const rp = new RuleEngine();

    rp.addMutation("CountryIso", mutation1);

    await rp.evaluate(valid3Json, {
      CountryIso: "United Kingdom",
      Leverage: 60,
      Monetization: "Real",
    });

    rp.clearMutationCache();

    const result = await rp.getEvaluateResult(valid3Json, {
      CountryIso: "United Kingdom",
      Leverage: 60,
      Monetization: "Real",
    });

    expect(console.debug).not.toHaveBeenCalledWith(
      'Waiting on mutation "CountryIso" with param "United Kingdom"',
    );
    expect(result).toEqual(3);
  });

  it("Static methods behave as expected", async () => {
    const rp = new RuleEngine();

    RuleEngine.addMutation("CountryIso", mutation1);

    const result1 = await RuleEngine.getEvaluateResult(valid3Json, {
      CountryIso: "United Kingdom",
      Leverage: 60,
      Monetization: "Real",
    });

    expect(result1).toEqual(3);

    RuleEngine.removeMutation("CountryIso");
    const result2 = await rp.getEvaluateResult(valid3Json, {
      CountryIso: "United Kingdom",
      Leverage: 60,
      Monetization: "Real",
    });

    expect(result2).toEqual(2);

    RuleEngine.clearMutationCache();
    const result3 = await rp.getEvaluateResult(valid3Json, {
      CountryIso: "United Kingdom",
      Leverage: 60,
      Monetization: "Real",
    });

    expect(console.debug).not.toHaveBeenCalledWith(
      'Waiting on mutation "CountryIso" with param "United Kingdom"',
    );
    expect(result3).toEqual(2);
  });
});
