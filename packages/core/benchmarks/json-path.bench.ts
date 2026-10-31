import { it, describe } from "vitest";
import { RuleEngine, ObjectDiscovery } from "@root";
// Rules
import { selfFieldsConstraintsJson } from "../test/rulesets/self-fields-constraints.json";

describe("json path correctly", () => {
  const discovery = new ObjectDiscovery();
  it("resolves simple field definitions in a Text", async ({ bench }) => {
    await bench("resolves simple field definitions in a Text", async () => {
      discovery.resolveTextPathExpressions(
        "Password is invalid and contains username($.username), name($.name) and family($.family)",
        {
          meta: {
            default: {
              password: "@john-doe-@johndoe",
            },
          },
          username: "john-doe",
          name: "john",
          family: "doe",
        },
      );
    }).run({
      iterations: 10_000,
    });
  });

  it("resolves complex nested field definitions in a Text", async ({
    bench,
  }) => {
    await bench(
      "resolves complex nested field definitions in a Text",
      async () => {
        const data = {
          store: {
            book: [
              {
                category: "reference",
                author: "Nigel Rees",
                title: "Sayings of the Century",
                price: 8.95,
              },
              {
                category: "fiction",
                author: "Evelyn Waugh",
                title: "Sword of Honour",
                price: 12.99,
              },
              {
                category: "fiction",
                author: "Herman Melville",
                title: "Moby Dick",
                isbn: "0-553-21311-3",
                price: 8.99,
              },
              {
                category: "fiction",
                author: "J. R. R. Tolkien",
                title: "The Lord of the Rings",
                isbn: "0-395-19395-8",
                price: 22.99,
              },
            ],
            bicycle: {
              color: "red",
              price: 19.95,
            },
          },
        };

        const expression = "$.store.book[*].author";
        discovery.resolveTextPathExpressions(`Hi all ${expression}`, data);
      },
    ).run({
      iterations: 10_000,
    });
  });

  it("ruleEngine evaluate and return the resolved message correctly", async ({
    bench,
  }) => {
    await bench(
      "ruleEngine evaluate and return the resolved message correctly",
      async () => {
        await RuleEngine.evaluate(selfFieldsConstraintsJson, {
          meta: {
            default: {
              password: "Aa101010@",
            },
          },
          username: "john-doe",
          name: "john",
          family: "doe",
        });
      },
    ).run({
      iterations: 10_000,
    });
  });
});
