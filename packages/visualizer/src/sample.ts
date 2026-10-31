import type { RuleType, OperatorsType } from "@usex/rule-engine";
export const sampleRule = {
  conditions: [
    {
      and: [
        {
          field: "customer.tier",
          operator: "in" as OperatorsType,
          value: ["gold", "platinum"],
        },
        {
          or: [
            {
              field: "order.total",
              operator: "greater-than" as OperatorsType,
              value: 250,
            },
            {
              and: [
                {
                  field: "customer.orders",
                  operator: "greater-than-or-equals" as OperatorsType,
                  value: 10,
                },
                {
                  field: "customer.country",
                  operator: "in" as OperatorsType,
                  value: ["US", "DE", "JP"],
                },
              ],
            },
          ],
        },
        {
          none: [
            {
              field: "account.flagged",
              operator: "equals" as OperatorsType,
              value: true,
            },
            { field: "order.items", operator: "empty" as OperatorsType },
          ],
        },
      ],
      result: {
        value: { decision: "approve", discount: 20, shipping: "express" },
      },
    },
  ],
  default: { value: { decision: "review", discount: 0 } },
} satisfies RuleType;
