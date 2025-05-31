import { bench, describe, expect, it } from "vitest";
import { RuleEngine, RuleTypeError } from "../src";
// Assets
import { valid2Json } from "./rulesets/valid2.json";
import { valid6Json } from "./rulesets/valid6.json";

describe("RuleEngine introspector correctly", () => {
  bench(
    "Detects invalid rule",
    async () => {
      RuleEngine.introspect(valid2Json);
    },
    {
      iterations: 10_000,
    },
  );

  bench(
    "Introspects valid rule",
    async () => {
      RuleEngine.introspect(valid6Json);
    },
    {
      iterations: 10_000,
    },
  );
});
