import type { RuleType } from "../../src";
import { Operators } from "../../src";

export const valid5Json: RuleType = {
  conditions: {
    or: [
      {
        field: "countries",
        operator: Operators.Contains,
        value: "US",
      },
      {
        field: "states",
        operator: Operators.ContainsAny,
        value: ["KY", "TN"],
      },
    ],
  },
};
