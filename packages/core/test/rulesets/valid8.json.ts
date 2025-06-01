import type { RuleType } from "../../src";
import { Operators } from "../../src/enums";

export const valid8Json: RuleType = {
  conditions: [
    {
      none: [
        {
          field: "Leverage",
          operator: Operators.GreaterThanOrEquals,
          value: 1000,
        },
        {
          or: [
            {
              field: "Type",
              operator: Operators.NotEquals,
              value: "Demo",
            },
            {
              field: "OtherType",
              operator: Operators.NotIn,
              value: ["Live", "Fun"],
            },
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
          ],
        },
      ],
      result: { value: 3 },
    },
    {
      none: [
        {
          field: "Category",
          operator: Operators.Equals,
          value: "Islamic",
        },
      ],
      result: { value: 4 },
    },
  ],
};
