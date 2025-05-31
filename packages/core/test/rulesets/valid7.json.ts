import { RuleType } from "../../src";
import { Operators } from "../../src/enums";

export const valid7Json: RuleType = {
  conditions: [
    {
      none: [
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
