import { it, expect, describe } from "vitest";
import type { OperatorsType, Constraint, Condition } from "../src";
import { RuleEngine, Operators } from "../src";
// Assets
import { valid1Json } from "./rulesets/valid1.json";
import { valid3Json } from "./rulesets/valid3.json";
import { selfFieldsConstraintsJson } from "./rulesets/self-fields-constraints.json";
import { RegexRulesJson } from "./rulesets/regex-rules.json";

describe("ruleEngine validator correctly", () => {
  it("identifies a bad operator", () => {
    expect(
      RuleEngine.validate({
        conditions: [
          {
            and: [
              { field: "name", operator: "*" as OperatorsType, value: "test" },
            ],
          },
        ],
      }).isValid,
    ).toEqual(false);
  });

  it("identifies an invalid field", () => {
    expect(
      RuleEngine.validate({
        conditions: [
          {
            and: [
              {
                field: true as unknown as string,
                operator: Operators.Equals,
                value: "test",
              },
            ],
          },
        ],
      }).isValid,
    ).toEqual(false);
  });

  it("identifies an invalid condition", () => {
    expect(
      RuleEngine.validate({
        conditions: [
          {
            and: [
              {
                field: "foo",
                operator: Operators.Equals,
                value: "bar",
              },
            ],
            or: [],
          },
        ],
      }).isValid,
    ).toEqual(false);
  });

  it("identifies an invalid node", () => {
    expect(
      RuleEngine.validate({
        conditions: [
          {
            and: [
              {
                operator: Operators.Equals,
                value: "bar",
              } as Constraint,
            ],
          },
        ],
      }).isValid,
    ).toEqual(false);
  });

  it("identifies an badly constructed condition", () => {
    expect(
      RuleEngine.validate({
        conditions: [
          {
            foo: [
              {
                field: "foo",
                operator: Operators.Equals,
                value: "bar",
              },
            ],
          } as Condition,
        ],
      }).isValid,
    ).toEqual(false);
  });

  it("identifies an empty rule", () => {
    const validation = RuleEngine.validate({ conditions: [] });

    expect(validation.isValid).toEqual(false);
    expect(validation.error?.message).toEqual(
      "The conditions property must contain at least one condition.",
    );
  });

  it("identifies invalid values for In/NotIn/ContainsAny operators", () => {
    expect(
      RuleEngine.validate({
        conditions: [
          { and: [{ field: "name", operator: Operators.In, value: "test" }] },
        ],
      }).isValid,
    ).toEqual(false);

    expect(
      RuleEngine.validate({
        conditions: [
          {
            and: [{ field: "name", operator: Operators.NotIn, value: "test" }],
          },
        ],
      }).isValid,
    ).toEqual(false);

    expect(
      RuleEngine.validate({
        conditions: [
          {
            and: [
              { field: "name", operator: Operators.ContainsAny, value: "test" },
            ],
          },
        ],
      }).isValid,
    ).toEqual(false);
  });

  it("validates a correct rule", () => {
    expect(
      RuleEngine.validate({
        conditions: [
          {
            and: [{ field: "name", operator: Operators.Equals, value: "test" }],
          },
        ],
      }).isValid,
    ).toEqual(true);
  });

  it("should return false for an invalid condition type", () => {
    expect(
      RuleEngine.validate({
        conditions: [
          {
            // @ts-ignore
            and: [{ field: "name", operator: "test", value: "test" }],
          },
        ],
      }).isValid,
    ).toEqual(false);
  });

  it("validates a simple correct rule", () => {
    expect(RuleEngine.validate(valid1Json).isValid).toEqual(true);
  });

  it("validates a simple correct self rule", () => {
    expect(RuleEngine.validate(selfFieldsConstraintsJson).isValid).toEqual(
      true,
    );
  });

  it("validates a nested correct rule", () => {
    expect(RuleEngine.validate(valid3Json).isValid).toEqual(true);
  });

  it("validates a nested regex rules", () => {
    expect(RuleEngine.validate(RegexRulesJson).isValid).toEqual(true);
  });
});
