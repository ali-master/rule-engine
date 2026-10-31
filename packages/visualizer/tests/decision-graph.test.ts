import { it, expect, describe } from "vitest";
import { RuleEngine } from "@usex/rule-engine";
import type { RuleType, Condition } from "@usex/rule-engine";
import { createRuleGraph } from "../src/graph";
import type { RuleGraph } from "../src/graph";
import { createDecisionGraph } from "../src/decision-graph";
import policy from "../src/examples/commerce-policy.json";
import order from "../src/examples/commerce-order.json";

// Follow only the drawn edges; use the actual engine solely for leaf predicates.
async function follow(
  graph: RuleGraph,
  criteria: Record<string, unknown>,
  scope = "$",
): Promise<{ outcome: boolean; path: string }> {
  const decision = createDecisionGraph(graph, scope);
  let node = decision.nodes[0];
  for (let step = 0; step <= decision.nodes.length; step++) {
    if (node.data.kind === "outcome")
      return { outcome: node.data.outcome!, path: node.data.path };
    const answer =
      node.data.kind === "start"
        ? undefined
        : node.data.scope
          ? (await follow(graph, criteria, node.data.scope)).outcome
          : (
              await RuleEngine.evaluate(
                { conditions: { and: [node.data.source] } } as RuleType,
                criteria,
              )
            ).isPassed;
    const edge = decision.edges.find(
      (candidate) =>
        candidate.source === node.id && candidate.data?.outcome === answer,
    );
    expect(edge).toBeDefined();
    node = decision.nodes.find((candidate) => candidate.id === edge!.target)!;
  }
  throw new Error("Decision paths must terminate");
}
const check = (field: string) => ({
  field: `$.${field}`,
  operator: "equals" as const,
  value: true,
});
const inputs = Array.from({ length: 8 }, (_, bits) => ({
  a: Boolean(bits & 1),
  b: Boolean(bits & 2),
  c: Boolean(bits & 4),
}));

describe("decision paths", () => {
  it.each(["and", "or", "none"] as const)(
    "matches engine truth tables for %s, including empty groups",
    async (kind) => {
      for (const children of [[], [check("a"), check("b"), check("c")]]) {
        const condition = { [kind]: children } as Condition;
        const rule = { conditions: condition } as RuleType;
        const graph = createRuleGraph(rule);
        for (const criteria of inputs) {
          expect(
            (await follow(graph, criteria, `$.conditions.${kind}`)).outcome,
          ).toBe((await RuleEngine.evaluate(rule, criteria)).isPassed);
        }
      }
    },
  );
  it("returns nested answers to the parent's correct branch", async () => {
    const rule = {
      conditions: {
        and: [{ or: [check("a"), check("b")] }, { none: [check("c")] }],
      },
    } as RuleType;
    const graph = createRuleGraph(rule);
    for (const criteria of inputs)
      expect((await follow(graph, criteria)).outcome).toBe(
        (await RuleEngine.evaluate(rule, criteria)).isPassed,
      );
  });
  it("selects only the first matching route, and reaches fallback only after every false branch", async () => {
    const rule = {
      conditions: [
        { and: [check("a")], result: { value: "first" } },
        { or: [check("b"), check("c")], result: { value: "second" } },
      ],
      default: { value: "fallback" },
    } as RuleType;
    const graph = createRuleGraph(rule);
    for (const criteria of inputs) {
      const actual = await RuleEngine.evaluate(
        rule,
        criteria as Record<string, unknown>,
      );
      const drawn = await follow(graph, criteria);
      expect(drawn.outcome).toBe(actual.isPassed);
      expect(drawn.path).toBe(
        actual.value === "first"
          ? "$.conditions[0]"
          : actual.value === "second"
            ? "$.conditions[1]"
            : "$.default",
      );
    }
  });
  it("rejects multiple logical keys just like the public engine validator", () => {
    const rule = {
      conditions: { and: [check("a")], or: [check("b")] },
    } as RuleType;
    const graph = createRuleGraph(rule);
    expect(RuleEngine.validate(rule).isValid).toBe(false);
    expect(() => createDecisionGraph(graph)).toThrow(/exactly one/);
  });
  it.each(["LR", "TB"] as const)(
    "keeps all decision ports and endpoints valid in %s",
    (direction) => {
      const graph = createRuleGraph(policy);
      for (const scope of [
        "$",
        ...graph.nodes
          .filter((node) => ["and", "or", "none"].includes(node.data.kind))
          .map((node) => node.id),
      ]) {
        const decision = createDecisionGraph(graph, scope, direction);
        const ids = new Set(decision.nodes.map((node) => node.id));
        for (const node of decision.nodes) {
          const outgoing = decision.edges.filter(
            (edge) => edge.source === node.id,
          );
          expect(outgoing.length).toBe(
            node.data.kind === "check" ? 2 : node.data.kind === "start" ? 1 : 0,
          );
          if (node.data.kind === "check")
            expect(new Set(outgoing.map((edge) => edge.sourceHandle))).toEqual(
              new Set(["true", "false"]),
            );
        }
        expect(
          decision.edges.every(
            (edge) => ids.has(edge.source) && ids.has(edge.target),
          ),
        ).toBe(true);
      }
    },
  );
  it("preserves commerce route selection for VIP, fraud, payment recovery and fallback", async () => {
    const graph = createRuleGraph(policy);
    const scenarios = [
      structuredClone(order),
      structuredClone(order),
      structuredClone(order),
      structuredClone(order),
    ];
    scenarios[1].risk.confirmedFraud = true;
    scenarios[2].payment.threeDS = "required";
    scenarios[3].context.policyVersion = "outdated";
    for (const criteria of scenarios) {
      const result = await RuleEngine.evaluate(policy as RuleType, criteria);
      const drawn = await follow(graph, criteria);
      const match = policy.conditions.findIndex(
        (condition) =>
          condition.result.value.route ===
          (result.value as unknown as { route: string }).route,
      );
      expect(drawn.path).toBe(
        result.isPassed ? `$.conditions[${match}]` : "$.default",
      );
      expect(drawn.outcome).toBe(result.isPassed);
    }
  });
  it("handles no routes or missing default, and rejects mixed predicate/group nodes", async () => {
    expect(() =>
      createDecisionGraph(createRuleGraph({ conditions: [] })),
    ).toThrow(/at least one/);
    expect(
      await follow(createRuleGraph({ conditions: { or: [] } }), {}),
    ).toEqual({
      outcome: false,
      path: "$",
    });
    const ambiguous = createRuleGraph({
      conditions: { and: [{ ...check("a"), or: [] }] },
    });
    expect(() => createDecisionGraph(ambiguous, "$.conditions.and")).toThrow(
      /unambiguous/,
    );
  });
});
