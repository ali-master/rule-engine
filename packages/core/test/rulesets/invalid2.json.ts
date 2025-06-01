import type { RuleType, Condition } from "../../src";
import { Operators } from "../../src";

export const invalid2Json: RuleType = {
  conditions: [
    {
      or: [
        {
          and: [
            {
              field: "CountryIso",
              operator: Operators.In,
              value: ["GB", "FI"],
            },
            {
              field: "Leverage",
              operator: Operators.LessThan,
              value: 200,
            },
            {
              field: "Monetization",
              operator: Operators.Equals,
              value: "Real",
            },
          ],
        },
        {
          field: "Leverage",
          operator: Operators.GreaterThanOrEquals,
          value: 1000,
        },
      ],
      result: {
        value: 3,
      },
    },
    {
      and: [
        {
          field: "Category",
          operator: Operators.Equals,
          value: "Islamic",
        },
      ],
      result: {
        value: 4,
      },
    },
    {
      foo: "bar",
    } as Condition,
  ],
  default: {
    value: 2,
  },
};
