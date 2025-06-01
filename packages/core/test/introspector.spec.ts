import { it, expect, describe } from "vitest";
import { RuleTypeError, RuleEngine } from "../src";
// Assets
import { valid2Json } from "./rulesets/valid2.json";
import { valid3Json } from "./rulesets/valid3.json";
import { valid4Json } from "./rulesets/valid4.json";
import { valid6Json } from "./rulesets/valid6.json";
import { valid7Json } from "./rulesets/valid7.json";
import { valid8Json } from "./rulesets/valid8.json";
import { valid9Json } from "./rulesets/valid9.json";
import { selfFieldsConstraintsJson } from "./rulesets/self-fields-constraints.json";

describe("ruleEngine introspector correctly", () => {
  it("detects invalid rules", async () => {
    expect(() => RuleEngine.introspect(valid2Json)).toThrow(RuleTypeError);
  });

  it("introspects valid rules", async () => {
    expect(RuleEngine.introspect(selfFieldsConstraintsJson)).toEqual({
      results: [
        {
          result: {
            value: true,
            message:
              "Password is valid and contains username($.username), name($.name) and family($.family)",
          },
          options: [
            {
              "$.meta.default.password": [
                {
                  operator: "self-not-contains-all",
                  value: ["$.username", "$.name", "$.family"],
                },
                {
                  operator: "not-like",
                  value: "^A",
                },
                {
                  operator: "like",
                  value: "^@A%",
                },
              ],
            },
          ],
        },
      ],
      default: {
        value: false,
        message:
          "Password is invalid and contains username($.username), name($.name) and family($.family)",
      },
    });

    expect(RuleEngine.introspect(valid3Json)).toEqual({
      results: [
        {
          result: {
            value: 3,
          },
          options: [
            {
              Leverage: {
                operator: "greater-than-or-equals",
                value: 1000,
              },
            },
            {
              CountryIso: ["GB", "FI"],
              Leverage: { operator: "less-than", value: 200 },
              Monetization: "Real",
            },
          ],
        },
        { result: { value: 4 }, options: [{ Category: "Islamic" }] },
      ],
      default: { value: 2 },
    });

    expect(RuleEngine.introspect(valid4Json)).toEqual({
      results: [
        {
          result: { value: 3 },
          options: [
            { Leverage: [1000, 500] },
            {
              CountryIso: { operator: "contains", value: ["GB", "FI"] },
              Monetization: "Real",
              Category: [
                { operator: "greater-than-or-equals", value: 1000 },
                22,
                11,
                12,
              ],
            },
            {
              CountryIso: { operator: "contains", value: ["GB", "FI"] },
              Monetization: "Real",
              Category: [
                { operator: "greater-than-or-equals", value: 1000 },
                22,
              ],
              HasStudentCard: true,
              IsUnder18: true,
            },
          ],
        },
        { result: { value: 4 }, options: [{ Category: "Islamic" }] },
      ],
      default: { value: 2 },
    });

    expect(RuleEngine.introspect(valid6Json)).toEqual({
      results: [
        {
          result: { value: 3 },
          options: [
            { Leverage: [1000, 500] },
            {
              CountryIso: { operator: "contains", value: ["GB", "FI"] },
              Leverage: { operator: "less-than", value: 200 },
              Monetization: "Real",
              Category: [
                { operator: "greater-than-or-equals", value: 1000 },
                22,
                11,
                12,
              ],
            },
            {
              CountryIso: { operator: "contains", value: ["GB", "FI"] },
              Leverage: { operator: "less-than", value: 200 },
              Monetization: "Real",
              Category: [
                { operator: "greater-than-or-equals", value: 1000 },
                22,
                122,
              ],
              IsUnder18: true,
            },
          ],
        },
        { result: { value: 4 }, options: [{ Category: "Islamic" }] },
      ],
      default: { value: 2 },
    });

    expect(RuleEngine.introspect(valid7Json)).toEqual({
      results: [
        {
          result: { value: 3 },
          options: [
            {
              Leverage: [
                { operator: "less-than", value: 1000 },
                { operator: "greater-than-or-equals", value: 200 },
              ],
              CountryIso: { operator: "not-in", value: ["GB", "FI"] },
              Monetization: { operator: "not-equals", value: "Real" },
            },
          ],
        },
        {
          result: { value: 4 },
          options: [{ Category: { operator: "not-equals", value: "Islamic" } }],
        },
      ],
    });

    expect(RuleEngine.introspect(valid8Json)).toEqual({
      results: [
        {
          result: { value: 3 },
          options: [
            {
              Leverage: { operator: "less-than", value: 1000 },
              Type: "Demo",
              OtherType: ["Live", "Fun"],
            },
            {
              Leverage: [
                { operator: "less-than", value: 1000 },
                { operator: "greater-than-or-equals", value: 200 },
              ],
              CountryIso: { operator: "not-in", value: ["GB", "FI"] },
              Monetization: { operator: "not-equals", value: "Real" },
              OtherType: [],
            },
          ],
        },
        {
          result: { value: 4 },
          options: [{ Category: { operator: "not-equals", value: "Islamic" } }],
        },
      ],
    });

    expect(RuleEngine.introspect(valid9Json)).toEqual({
      results: [
        {
          result: { value: 5 },
          options: [
            { country: "SE" },
            {
              country: ["GB", "FI"],
              hasCoupon: true,
              totalCheckoutPrice: {
                operator: "greater-than-or-equals",
                value: 120,
              },
            },
          ],
        },
        {
          result: { value: 10 },
          options: [
            {
              age: { operator: "greater-than-or-equals", value: 18 },
              hasStudentCard: true,
            },
          ],
        },
      ],
    });
  });
});
