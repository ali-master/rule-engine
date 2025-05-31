import { bench, describe } from "vitest";
import { RuleEngine, Operators } from "../src";
// Assets
import { valid1Json } from "./rulesets/valid1.json";
import { valid3Json } from "./rulesets/valid3.json";
import { selfFieldsConstraintsJson } from "./rulesets/self-fields-constraints.json";

describe("RuleEngine validator correctly", () => {
  bench(
    "Validates a correct rule",
    () => {
      RuleEngine.validate({
        conditions: [
          {
            and: [{ field: "name", operator: Operators.Equals, value: "test" }],
          },
        ],
      });
    },
    {
      iterations: 10_000,
    },
  );

  bench(
    "Validates a simple correct rule",
    () => {
      RuleEngine.validate(valid1Json);
    },
    {
      iterations: 10_000,
    },
  );

  bench(
    "Validates a simple correct self rule",
    () => {
      RuleEngine.validate(selfFieldsConstraintsJson);
    },
    {
      iterations: 10_000,
    },
  );

  bench(
    "Validates a nested correct rule",
    () => {
      RuleEngine.validate(valid3Json);
    },
    {
      iterations: 10_000,
    },
  );
});
