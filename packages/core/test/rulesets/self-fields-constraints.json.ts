import { RuleType, Operators } from "../../src";

export const selfFieldsConstraintsJson: RuleType = {
  conditions: [
    {
      and: [
        {
          field: "$.meta.default.password",
          operator: Operators.SelfNotContainsAll,
          value: ["$.username", "$.name", "$.family"],
        },
        {
          field: "$.meta.default.password",
          operator: Operators.NotLike,
          value: "^A",
        },
        {
          field: "$.meta.default.password",
          operator: Operators.Like,
          value: "^@A%",
        },
      ],
      result: {
        value: true,
        message: `Password is valid and contains username($.username), name($.name) and family($.family)`,
      },
    },
  ],
  default: {
    value: false,
    message: `Password is invalid and contains username($.username), name($.name) and family($.family)`,
  },
};

export const selfFieldsConstraintsJsonWithNoResult: RuleType = {
  conditions: [
    {
      and: [
        {
          field: "$.meta.default.password",
          operator: Operators.SelfNotContainsAll,
          value: ["$.username", "$.name", "$.family"],
          message:
            "Password is invalid and contains username($.username), name($.name) and family($.family)",
        },
      ],
    },
  ],
};
