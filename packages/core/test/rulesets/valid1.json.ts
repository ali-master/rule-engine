import type { RuleType } from "../../src";
import { Operators } from "../../src";

export const valid1Json: RuleType = {
  conditions: {
    or: [
      {
        and: [
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
        and: [
          {
            field: "$.payload.ProfitPercentage",
            operator: Operators.GreaterThanOrEquals,
            value: 10,
          },
        ],
      },
    ],
  },
};
