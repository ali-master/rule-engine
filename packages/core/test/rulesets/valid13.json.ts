import { RuleType } from "../../src";
import { Operators } from "../../src/enums";

export const valid13Json: RuleType = {
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
              operator: Operators.GreaterThan,
              value: 200,
            },
            {
              field: "Monetization",
              operator: Operators.Equals,
              value: "Real",
            },
          ],
          result: {
            value: null,
          },
        },
        {
          and: [
            {
              field: "Leverage",
              operator: Operators.GreaterThanOrEquals,
              value: 1000,
            },
          ],
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
  ],
  default: {
    value: 2,
  },
};
