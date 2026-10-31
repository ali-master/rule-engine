import { it, expect, describe } from "vitest";
import { layoutRuleGraph, createRuleGraph } from "../src/graph";
import { sampleRule } from "../src/sample";
describe("rule graph", () => {
  it("preserves nested groups, custom operators, false values and output objects", () => {
    const rule = {
      conditions: {
        and: [{ field: "enabled", operator: "custom", value: false }],
        or: [],
        none: [],
        result: { value: { approved: false } },
      },
      default: { value: 0 },
    };
    const graph = createRuleGraph(rule);
    expect(
      graph.nodes.find((n) => n.id === "$.conditions.and[0]")?.data.source,
    ).toEqual(rule.conditions.and[0]);
    expect(
      graph.nodes.filter((n) => ["and", "or", "none"].includes(n.data.kind)),
    ).toHaveLength(3);
    expect(graph.nodes.find((n) => n.id === "$.default")?.data.source).toEqual({
      value: 0,
    });
    expect(new Set(graph.nodes.map((n) => n.id)).size).toBe(graph.nodes.length);
  });
  it("distinguishes group requirements and their outgoing connectors", () => {
    const child = { field: "active", operator: "equals", value: true };
    const graph = createRuleGraph({
      conditions: {
        and: [child, { ...child }],
        or: [{ ...child }],
        none: [{ ...child }],
      },
    });
    const requirements = {
      and: "2 of 2 required",
      or: "At least 1 of 1 required",
      none: "0 of 1 may match",
    };
    for (const [kind, text] of Object.entries(requirements)) {
      const id = `$.conditions.${kind}`;
      expect(graph.nodes.find((node) => node.id === id)?.data.subtitle).toBe(
        text,
      );
      expect(
        graph.edges
          .filter((edge) => edge.source === id)
          .every((edge) => edge.className === `rv-edge-${kind}`),
      ).toBe(true);
    }
    expect(
      graph.edges.find((edge) => edge.source === "$")?.className,
    ).toBeUndefined();
    const empty = createRuleGraph({
      conditions: { and: [], or: [], none: [] },
    });
    expect(
      empty.nodes
        .filter((node) => ["and", "or", "none"].includes(node.data.kind))
        .map((node) => node.data.subtitle),
    ).toEqual(Array.from({ length: 3 }).fill("Empty group · 0 conditions"));
  });
  it("lays out without overlaps and hides whole collapsed subtrees", () => {
    const graph = createRuleGraph(sampleRule);
    const before = JSON.stringify(sampleRule);
    for (const direction of ["LR", "TB"] as const) {
      const laid = layoutRuleGraph(graph, new Set(), direction);
      expect(
        new Set(
          laid.nodes.map(
            (n) => `${n.parentId ?? "root"}:${JSON.stringify(n.position)}`,
          ),
        ).size,
      ).toBe(laid.nodes.length);
    }
    const collapsed = layoutRuleGraph(graph, new Set(["$.conditions[0].and"]));
    expect(
      collapsed.nodes.some((n) => n.id.startsWith("$.conditions[0].and[")),
    ).toBe(false);
    expect(collapsed.nodes.some((n) => n.data.kind === "result")).toBe(true);
    expect(JSON.stringify(sampleRule)).toBe(before);
  });
  it("contains direct constraints in their frame and keeps sibling rectangles apart", () => {
    const graph = createRuleGraph(sampleRule);
    for (const direction of ["LR", "TB"] as const) {
      const laid = layoutRuleGraph(graph, new Set(), direction);
      const byId = new Map(laid.nodes.map((node) => [node.id, node]));
      for (const node of laid.nodes) {
        if (node.parentId) {
          const parent = byId.get(node.parentId)!;
          expect(node.position.x).toBeGreaterThanOrEqual(0);
          expect(node.position.y).toBeGreaterThanOrEqual(60);
          expect(node.position.x + node.width!).toBeLessThanOrEqual(
            parent.width!,
          );
          expect(node.position.y + node.height!).toBeLessThanOrEqual(
            parent.height! - 30,
          );
          expect(laid.edges.some((edge) => edge.target === node.id)).toBe(
            false,
          );
        }
        for (const sibling of laid.nodes) {
          if (node.id === sibling.id || node.parentId !== sibling.parentId)
            continue;
          const overlaps =
            node.position.x < sibling.position.x + sibling.width! &&
            node.position.x + node.width! > sibling.position.x &&
            node.position.y < sibling.position.y + sibling.height! &&
            node.position.y + node.height! > sibling.position.y;
          expect(overlaps).toBe(false);
        }
      }
    }
    const folded = layoutRuleGraph(graph, new Set(["$.conditions[0].and"]));
    expect(
      folded.nodes.find((node) => node.id === "$.conditions[0].and")?.height,
    ).toBe(110);
    expect(
      layoutRuleGraph(graph).nodes.filter((node) => node.parentId),
    ).toHaveLength(6);
  });
  it("folds only redundant wrappers and reconnects their edges without losing source data", () => {
    const rule = {
      conditions: {
        and: [{ or: [] }, { none: [], label: "Keep this metadata" }],
      },
    };
    const original = createRuleGraph(rule);
    const laid = layoutRuleGraph(original);
    expect(laid.nodes.some((node) => node.id === "$.conditions")).toBe(false);
    expect(laid.nodes.some((node) => node.id === "$.conditions.and[0]")).toBe(
      false,
    );
    expect(laid.nodes.some((node) => node.id === "$.conditions.and[1]")).toBe(
      true,
    );
    expect(
      original.nodes.find((node) => node.id === "$.conditions")?.data.source,
    ).toEqual(rule.conditions);
    const ids = new Set(laid.nodes.map((node) => node.id));
    expect(
      laid.edges.every(
        (edge) =>
          ids.has(edge.source) &&
          ids.has(edge.target) &&
          edge.source !== edge.target,
      ),
    ).toBe(true);
    expect(
      layoutRuleGraph(original, new Set(["$.conditions"])).nodes.some(
        (node) => node.id === "$.conditions",
      ),
    ).toBe(true);
  });
  it("supports deep nesting without recursive traversal", () => {
    let condition: unknown = { and: [] };
    for (let i = 0; i < 600; i++) condition = { and: [condition] };
    const graph = createRuleGraph({ conditions: condition });
    expect(graph.nodes.length).toBe(1203);
    expect(layoutRuleGraph(graph).nodes).toHaveLength(602);
  });
  it.each([
    null,
    {},
    { conditions: null },
    { conditions: { and: "invalid" } },
    { conditions: { and: [{ field: 2, operator: "equals" }] } },
  ])("rejects malformed input", (rule) =>
    expect(() => createRuleGraph(rule)).toThrow(),
  );
  it("rejects cycles and excessive graphs", () => {
    const c: { and: unknown[] } = { and: [] };
    c.and.push(c);
    expect(() => createRuleGraph({ conditions: c })).toThrow(/circular/);
    expect(() =>
      createRuleGraph({
        conditions: {
          and: Array.from({ length: 5000 }, () => ({
            field: "x",
            operator: "equals",
          })),
        },
      }),
    ).toThrow(/5,000/);
  });
  it("handles empty condition arrays", () =>
    expect(createRuleGraph({ conditions: [] }).nodes).toHaveLength(1));
});
