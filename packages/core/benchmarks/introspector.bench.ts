import { it, expect, describe } from "vitest";
import { RuleEngine } from "@root";
// Assets
import { valid2Json } from "../test/rulesets/valid2.json";
import { valid6Json } from "../test/rulesets/valid6.json";

describe("introspector correctly", () => {
  it("detects invalid rule", async ({ bench }) => {
    await bench("detects invalid rule", async () => {
      expect(() => RuleEngine.introspect(valid2Json)).toThrow(
        "The provided rule is not granular",
      );
    }).run({
      iterations: 10_000,
    });
  });

  it("introspects valid rule", async ({ bench }) => {
    await bench("introspects valid rule", async () => {
      RuleEngine.introspect(valid6Json);
    }).run({
      iterations: 10_000,
    });
  });
});
