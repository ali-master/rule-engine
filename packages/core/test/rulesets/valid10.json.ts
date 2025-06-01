import type { RuleType } from "../../src";
import { Operators } from "../../src";

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
