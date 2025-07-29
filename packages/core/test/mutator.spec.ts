// Utilities
import axios from "axios";
import { RuleEngine, Operators } from "@root";
import { vi, it, expect, describe, beforeEach, afterEach } from "vitest";
// Assets
import { valid1Json } from "./rulesets/valid1.json";
import { valid3Json } from "./rulesets/valid3.json";

// Mock axios to avoid external HTTP requests in unit tests
vi.mock("axios");
const mockedAxios = vi.mocked(axios);

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

describe("mutator correctly", () => {
  beforeEach(() => {
    console.debug = vi.fn();
    process.env.DEBUG = "true";
    
    // Setup axios mock responses
    (mockedAxios.get as any).mockImplementation((url: string) => {
      if (url.includes("United Kingdom")) {
        return Promise.resolve({
          data: [{ cca2: "GB" }]
        });
      }
      if (url.includes("Spain")) {
        return Promise.resolve({
          data: [{ cca2: "ES" }]
        });
      }
      // Default response for any other country
      return Promise.resolve({
        data: [{ cca2: "US" }]
      });
    });
  });

  afterEach(() => {
    // Clear mutations and cache after each test to ensure test isolation
    const rp = RuleEngine.getInstance();
    rp.clearMutations();
    rp.clearMutationCache();
    rp.clearCache();
    
    // Clear axios mocks
    vi.clearAllMocks();
  });

  it("performs desired mutation", async () => {
    const rp = RuleEngine.getInstance();

    rp.addMutation("$.payload.ProfitPercentage", (value: number) => value * 2);
    expect(
      await rp.getEvaluateResult(valid1Json, {
        payload: { ProfitPercentage: 5 },
      }),
    ).toEqual(true);
  });

  it("performs multiple mutations", async () => {
    const rp = RuleEngine.getInstance();

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

  it("performs async mutation", async () => {
    const rp = RuleEngine.getInstance();

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

  it("performs nested mutation", async () => {
    const rp = RuleEngine.getInstance();

    rp.addMutation("$.foo.bar", (value: number) => value * 2);
    expect(
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
      ),
    ).toEqual(true);
  });

  it("caches async mutation results", async () => {
    const rp = RuleEngine.getInstance();

    rp.addMutation("Leverage", (value: unknown) => value);
    rp.addMutation("CountryIso", mutation1);

    const result = await rp.getEvaluateResult(valid3Json, criteria);

    expect(console.debug).toBeCalledWith(
      'Waiting on mutation "CountryIso" with param "United Kingdom"',
    );
    expect(console.debug).toBeCalledTimes(9);
    expect(result).toEqual([3, 2, 3]);
  });

  it("performs a migration with an array parameter", async () => {
    const rp = RuleEngine.getInstance();

    rp.addMutation("CountryIso", mutation2);

    const result = await rp.getEvaluateResult(
      {
        conditions: [
          {
            and: [
              { field: "CountryIso", operator: Operators.Equals, value: "GB" },
            ],
          },
        ],
      },
      { CountryIso: ["United Kingdom", "Finland"] },
    );

    expect(result).toEqual(true);
  });

  it("performs a migration with a nested array parameter", async () => {
    const rp = RuleEngine.getInstance();

    rp.addMutation("$.foo.bar", mutation2);

    const result = await rp.getEvaluateResult(
      {
        conditions: [
          {
            and: [
              { field: "$.foo.bar", operator: Operators.Equals, value: "GB" },
            ],
          },
        ],
      },
      { foo: { bar: ["United Kingdom", "Finland"] } },
    );

    expect(result).toEqual(true);
  });

  it("mutation cache works properly", async () => {
    const rp = RuleEngine.getInstance();

    rp.addMutation("Leverage", (value: unknown) => value);
    rp.addMutation("CountryIso", mutation1);

    await rp.getEvaluateResult(valid3Json, criteria);

    setTimeout(async () => {
      const result = await rp.getEvaluateResult(valid3Json, criteria);
      expect(console.debug).toBeCalledWith(
        'Cache hit on "CountryIso" with param "United Kingdom"',
      );
      expect(result).toEqual([3, 2, 3]);
    }, 1500);
  });

  it("removes a mutation properly", async () => {
    const rp = RuleEngine.getInstance();

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

  it("clears mutation cache properly", async () => {
    const rp = RuleEngine.getInstance();

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

  it("clears all mutation cache properly", async () => {
    const rp = RuleEngine.getInstance();

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

  it("static methods behave as expected", async () => {
    const rp = RuleEngine.getInstance();

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
