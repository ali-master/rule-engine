import { RuleType, Operators } from "../../src";

export const Valid11Json: RuleType = {
  conditions: [
    {
      and: [
        {
          field: "$.payload.depositAmount",
          operator: Operators.LengthBetween,
          value: [4, 20],
          message: "Deposit amount must be between $.self.value[0] and $.self.value[1] characters.",
        },
        {
          or: [
            {
              and: [
                {
                  field: "$.metadata.levelId",
                  operator: Operators.Equals,
                  value: 1,
                  message: "Invalid levelId. Please check the value. Must be $.self.value.",
                },
                {
                  and: [
                    // ...
                  ],
                },
              ],
              result: {
                value: 1,
              },
            },
            {
              and: [
                {
                  field: "$.metadata.levelId",
                  operator: Operators.Equals,
                  value: 2,
                  message: "Invalid levelId. Please check the value. Must be $.self.value.",
                },
                {
                  and: [
                    // ...
                  ],
                },
              ],
              result: {
                value: 2,
              },
            },
            {
              and: [
                {
                  field: "$.metadata.levelId",
                  operator: Operators.Equals,
                  value: 3,
                  message: "Invalid levelId. Please check the value. Must be $.self.value.",
                },
                {
                  and: [
                    // ...
                  ],
                },
              ],
              result: {
                value: 3,
              },
            },
          ],
        },
      ],
      result: {
        value: true,
        message:
          "Valid deposit amount. LevelId is $.metadata.levelId and deposit amount is $.payload.depositAmount.",
      },
    },
  ],
  default: {
    value: false,
    message:
      "Invalid deposit amount. LevelId is $.metadata.levelId and deposit amount is $.payload.depositAmount.",
  },
};
