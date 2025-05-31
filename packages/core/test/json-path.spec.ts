import { RuleEngine, ObjectDiscovery } from "../src";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { selfFieldsConstraintsJson } from "./rulesets/self-fields-constraints.json";

describe("RuleEngine JSON Path correctly", () => {
  beforeEach(() => {
    console.debug = vi.fn();
    process.env.DEBUG = "true";
  });

  const discovery = new ObjectDiscovery();
  it("Resolves simple field definitions in a Text", async () => {
    expect(
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
      ),
    ).toEqual("Password is invalid and contains username(john-doe), name(john) and family(doe)");
  });

  it("Resolves complex nested field definitions in a Text", async () => {
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
    expect(discovery.resolveTextPathExpressions(`Hi all ${expression}`, data)).toEqual(
      `Hi all ${discovery.resolveProperty(expression, data)}`,
    );

    const expressionB = "$..author";
    expect(discovery.resolveTextPathExpressions(`Hi all ${expressionB}`, data)).toEqual(
      `Hi all ${discovery.resolveProperty(expressionB, data)}`,
    );
  });

  it("RuleEngine evaluate and return the resolved message correctly", async () => {
    expect(
      await RuleEngine.evaluate(selfFieldsConstraintsJson, {
        meta: {
          default: {
            password: "@Aa101010@",
          },
        },
        username: "john-doe",
        name: "john",
        family: "doe",
      }),
    ).toEqual({
      message: "Password is valid and contains username(john-doe), name(john) and family(doe)",
      value: true,
      isPassed: true,
    });
  });
});
