import { RuleType } from "../../src";
import { Operators } from "../../src/enums";

export const valid6Json: RuleType = {
  conditions: [
    {
      or: [
        {
          field: "Leverage",
          operator: Operators.Equals,
          value: 1000,
        },
        {
          field: "Leverage",
          operator: Operators.Equals,
          value: 500,
        },
        {
          and: [
            {
              field: "CountryIso",
              operator: Operators.Contains,
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
            {
              or: [
                {
                  field: "Category",
                  operator: Operators.GreaterThanOrEquals,
                  value: 1000,
                },
                {
                  field: "Category",
                  operator: Operators.Equals,
                  value: 22,
                },
                {
                  or: [
                    {
                      field: "Category",
                      operator: Operators.Equals,
                      value: 11,
                    },
                    {
                      field: "Category",
                      operator: Operators.Equals,
                      value: 12,
                    },
                    {
                      and: [
                        {
                          field: "Category",
                          operator: Operators.Equals,
                          value: 122,
                        },
                        {
                          field: "IsUnder18",
                          operator: Operators.Equals,
                          value: true,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      result: { value: 3 },
    },
    {
      and: [
        {
          field: "Category",
          operator: Operators.Equals,
          value: "Islamic",
        },
      ],
      result: { value: 4 },
    },
  ],
  default: { value: 2 },
};
