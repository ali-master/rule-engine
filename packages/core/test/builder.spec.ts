import { it, expect, describe } from "vitest";
import { RuleEngine, Operators, ConditionTypes } from "../src";

describe("ruleEngine builder correctly", () => {
  it("creates a valid ruleset", () => {
    const builder = RuleEngine.builder();
    expect(
      RuleEngine.validate(
        builder
          .add(
            builder.condition(ConditionTypes.AND, [
              builder.constraint("field", Operators.Equals, "value"),
            ]),
          )
          .build(),
      ).isValid,
    ).toEqual(true);
  });

  it("creates a complex ruleset properly", () => {
    const builder = RuleEngine.builder<number>();

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
  });
});
