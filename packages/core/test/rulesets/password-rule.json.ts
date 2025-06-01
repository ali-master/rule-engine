import type { RuleType } from "../../src";
import { Operators } from "../../src";

export const PasswordRuleJson: RuleType = {
  default: {
    value: false,
  },
  conditions: [
    {
      and: [
        {
          or: [
            {
              and: [
                {
                  field: "$.data.username",
                  operator: Operators.Exists,
                },
                {
                  field: "$.payload.password",
                  operator: Operators.SelfContainsNone,
                  value: ["$.data.username"],
                  message: "رمزعبور نمی‌تواند شامل نام کاربری باشد",
                },
              ],
            },
            {
              and: [
                {
                  field: "$.data.phone",
                  operator: Operators.Exists,
                },
                {
                  field: "$.payload.password",
                  operator: Operators.SelfContainsNone,
                  value: ["$.data.phone"],
                  message: "رمزعبور نمی‌تواند شامل شماره همراه باشد",
                },
              ],
            },
          ],
        },
        {
          field: "$.payload.password",
          operator: Operators.MinLength,
          value: 8,
          message: "رمزعبور باید حداقل ۸ کاراکتر باشد",
        },
        {
          field: "$.payload.password",
          operator: Operators.MaxLength,
          value: 32,
          message: "رمزعبور باید حداکثر ۳۲ کاراکتر باشد",
        },
        {
          field: "$.payload.password",
          operator: Operators.Matches,
          value: "^(?=.*?[A-Z]).*$",
          message: "رمزعبور باید حداقل شامل یک حرف بزرگ باشد",
        },
        {
          field: "$.payload.password",
          operator: Operators.Matches,
          value: "^(?=.*?[a-z]).*$",
          message: "رمزعبور باید حداقل شامل یک حرف کوچک باشد",
        },
        {
          field: "$.payload.password",
          operator: Operators.Matches,
          value: "^(?=.*?[0-9]).*$",
          message: "رمزعبور باید حداقل شامل یک عدد باشد",
        },
        {
          field: "$.payload.password",
          operator: Operators.Matches,
          value: "^(?=.*?[#?!@$%^&*-]).*$",
          message: "رمزعبور باید حداقل شامل یک کاراکتر خاص باشد",
        },
      ],
      result: {
        value: true,
      },
    },
  ],
};
