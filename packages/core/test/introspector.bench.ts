import { describe, bench } from "vitest";
import { RuleEngine } from "@root";
// Assets
import { valid2Json } from "./rulesets/valid2.json";
import { valid6Json } from "./rulesets/valid6.json";

describe("introspector correctly", () => {
  bench(
    "detects invalid rule",
    async () => {
      RuleEngine.introspect(valid2Json);
    },
    {
      iterations: 10_000,
    },
  );

  bench(
    "introspects valid rule",
    async () => {
      RuleEngine.introspect(valid6Json);
    },
    {
      iterations: 10_000,
    },
  );
});
