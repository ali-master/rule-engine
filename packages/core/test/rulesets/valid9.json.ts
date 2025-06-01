import type { RuleType } from "../../src";
import { Operators } from "../../src/enums";

export const valid9Json: RuleType = {
  conditions: [
    {
      or: [
        {
          and: [
            {
              field: "country",
              operator: Operators.In,
              value: ["GB", "FI"],
            },
            {
              field: "hasCoupon",
              operator: Operators.Equals,
              value: true,
            },
            {
              field: "totalCheckoutPrice",
              operator: Operators.GreaterThanOrEquals,
              value: 120.0,
            },
          ],
        },
        {
          field: "country",
          operator: Operators.Equals,
          value: "SE",
        },
      ],
      result: { value: 5 },
    },
    {
      and: [
        {
          field: "age",
          operator: Operators.GreaterThanOrEquals,
          value: 18,
        },
        {
          field: "hasStudentCard",
          operator: Operators.Equals,
          value: true,
        },
      ],
      result: { value: 10 },
    },
  ],
};
