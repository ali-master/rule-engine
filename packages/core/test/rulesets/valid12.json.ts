import { RuleType, Operators } from "../../src";

export const Valid12Json: RuleType = {
  conditions: [
    {
      or: [
        {
          and: [
            {
              field: "$.age",
              operator: Operators.Equals,
              value: 18,
            },
            {
              field: "$.age",
              operator: Operators.NotEquals,
              value: 21,
            },
          ],
        },
        {
          and: [
            {
              field: "$.name",
              operator: Operators.Like,
              value: "*Ali",
            },
            {
              field: "$.name",
              operator: Operators.NotLike,
              value: "*Farzad",
            },
          ],
        },
        {
          and: [
            {
              field: "$.age",
              operator: Operators.GreaterThan,
              value: 10,
            },
            {
              field: "$.age",
              operator: Operators.GreaterThanOrEquals,
              value: 18,
            },
          ],
        },
        {
          and: [
            {
              field: "$.age",
              operator: Operators.LessThan,
              value: 30,
            },
            {
              field: "$.age",
              operator: Operators.LessThanOrEquals,
              value: 28,
            },
          ],
        },
        {
          and: [
            {
              field: "$.name",
              operator: Operators.In,
              value: ["Ali", "Farzad"],
            },
            {
              field: "$.name",
              operator: Operators.NotIn,
              value: ["Reza", "Mehdi"],
            },
          ],
        },
        {
          and: [
            {
              field: "$.name",
              operator: Operators.Contains,
              value: "Ali",
            },
            {
              field: "$.name",
              operator: Operators.NotContains,
              value: "Farzad",
            },
          ],
        },
        {
          and: [
            {
              field: "$.name",
              operator: Operators.Matches,
              value: "Ali",
            },
            {
              field: "$.name",
              operator: Operators.NotMatches,
              value: "Farzad",
            },
          ],
        },
        {
          and: [
            {
              field: "$.name",
              operator: Operators.NullOrUndefined,
            },
            {
              field: "$.name",
              operator: Operators.NotNullOrUndefined,
            },
          ],
        },
        {
          and: [
            {
              field: "$.name",
              operator: Operators.Empty,
            },
            {
              field: "$.name",
              operator: Operators.NotEmpty,
            },
          ],
        },
        {
          and: [
            {
              field: "$.name",
              operator: Operators.SelfContainsAll,
              value: ["$.secondName"],
            },
            {
              field: "$.name",
              operator: Operators.SelfNotContainsAll,
              value: ["$.name"],
            },
          ],
        },
      ],
    },
  ],
};
