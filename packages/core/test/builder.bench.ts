import { expect, describe, bench } from "vitest";
import { RuleEngine, Operators, ConditionTypes } from "@root";

describe("builder correctly", () => {
  bench(
    "creates a valid ruleset",
    () => {
      const builder = RuleEngine.builder();

      builder
        .add(
          builder.condition(ConditionTypes.AND, [
            builder.constraint("field", Operators.Equals, "value"),
          ]),
        )
        .build();
    },
    {
      iterations: 10_000,
    },
  );

  bench(
    "creates a complex ruleset properly",
    () => {
      const builder = RuleEngine.builder();

      const rule = builder
        .add(
          builder.condition(
            ConditionTypes.AND,
            [
              builder.condition(ConditionTypes.OR, [
                builder.constraint("fieldA", Operators.Equals, "bar"),
                builder.constraint("fieldB", Operators.GreaterThanOrEquals, 2),
              ]),
              builder.constraint("fieldC", Operators.NotIn, [1, 2, 3]),
            ],
            {
              value: 3,
            },
          ),
        )
        .add(builder.condition(ConditionTypes.NONE, [], { value: 5 }))
        .add(
          builder.condition(ConditionTypes.OR, [
            builder.constraint("fieldA", Operators.Equals, "value"),
          ]),
        )
        .default({ value: 2 })
        .build(false);

      expect(rule).toEqual({
        conditions: [
          {
            and: [
              {
                or: [
                  { field: "fieldA", operator: "equals", value: "bar" },
                  {
                    field: "fieldB",
                    operator: "greater-than-or-equals",
                    value: 2,
                  },
                ],
              },
              { field: "fieldC", operator: "not-in", value: [1, 2, 3] },
            ],
            result: { value: 3 },
          },
          { none: [], result: { value: 5 } },
          {
            or: [{ field: "fieldA", operator: "equals", value: "value" }],
          },
        ],
        default: { value: 2 },
      });
    },
    {
      iterations: 10_000,
    },
  );
});
