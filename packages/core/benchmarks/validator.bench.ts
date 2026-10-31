import { it, describe } from "vitest";
import { RuleEngine, Operators } from "@root";
// Assets
import { valid1Json } from "../test/rulesets/valid1.json";
import { valid3Json } from "../test/rulesets/valid3.json";
import { selfFieldsConstraintsJson } from "../test/rulesets/self-fields-constraints.json";

describe("validator correctly", () => {
  it("validates a correct rule", async ({ bench }) => {
    await bench("validates a correct rule", () => {
      RuleEngine.validate({
        conditions: [
          {
            and: [{ field: "name", operator: Operators.Equals, value: "test" }],
          },
        ],
      });
    }).run({
      iterations: 10_000,
    });
  });

  it("validates a simple correct rule", async ({ bench }) => {
    await bench("validates a simple correct rule", () => {
      RuleEngine.validate(valid1Json);
    }).run({
      iterations: 10_000,
    });
  });

  it("validates a simple correct self rule", async ({ bench }) => {
    await bench("validates a simple correct self rule", () => {
      RuleEngine.validate(selfFieldsConstraintsJson);
    }).run({
      iterations: 10_000,
    });
  });

  it("validates a nested correct rule", async ({ bench }) => {
    await bench("validates a nested correct rule", () => {
      RuleEngine.validate(valid3Json);
    }).run({
      iterations: 10_000,
    });
  });
});
