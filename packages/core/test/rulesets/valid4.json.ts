import type { RuleType } from "../../src";
import { Operators } from "../../src/enums";

export const valid4Json: RuleType = {
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
                          field: "HasStudentCard",
                          operator: Operators.Equals,
                          value: true,
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
