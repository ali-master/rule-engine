import type { RuleType } from "../../src";
import { Operators } from "../../src";

export const valid2Json: RuleType = {
  conditions: {
    or: [
      {
        and: [
          {
            field: "Leverage",
            operator: Operators.LessThanOrEquals,
            value: 100,
          },
          {
            field: "WinRate",
            operator: Operators.GreaterThan,
            value: 60,
          },
          {
            field: "AverageTradeDuration",
            operator: Operators.LessThan,
            value: 60,
          },
          {
            field: "Duration",
            operator: Operators.GreaterThan,
            value: 259200,
          },
          {
            field: "TotalDaysTraded",
            operator: Operators.GreaterThanOrEquals,
            value: 3,
          },
        ],
      },
      {
        none: [
          {
            field: "AverageTradeDuration",
            operator: Operators.NotEquals,
            value: 10,
          },
          {
            field: "Foo",
            operator: Operators.NotIn,
            value: [10, 11, 12],
          },
        ],
      },
    ],
  },
} as RuleType;
