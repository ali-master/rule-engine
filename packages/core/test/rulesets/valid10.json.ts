import { RuleType, Operators } from "../../src";

export const Valid10Json: RuleType = {
  conditions: [
    {
      and: [
        {
          field: "age",
          operator: Operators.Exists,
        },
        {
          field: "relationship",
          operator: Operators.NotExists,
        },
      ],
    },
  ],
};
