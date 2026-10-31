import { it, expect, describe } from "vitest";
import { RuleEngine } from "@usex/rule-engine";
import type { RuleType } from "@usex/rule-engine";
import policyJson from "../src/examples/commerce-policy.json";
import orderJson from "../src/examples/commerce-order.json";
import { layoutRuleGraph, createRuleGraph } from "../src/graph";

const policy = policyJson as RuleType;
function orderWith(changes: Record<string, unknown>) {
  const order = structuredClone(orderJson);
  for (const [path, value] of Object.entries(changes)) {
    const keys = path.split(".");
    let target = order as Record<string, unknown>;
    for (const key of keys.slice(0, -1))
      target = target[key] as Record<string, unknown>;
    target[keys.at(-1)!] = value;
  }
  return order;
}

describe("commerce demo policy", () => {
  it("keeps the full vertical policy narrow, ordered and free of overlapping frames", () => {
    const graph = createRuleGraph(policy);
    const vertical = layoutRuleGraph(graph, new Set(), "TB");
    const horizontal = layoutRuleGraph(graph);
    expect(vertical.nodes.map((node) => node.id)).toEqual(
      horizontal.nodes.map((node) => node.id),
    );
    expect(vertical.edges.map((edge) => edge.id)).toEqual(
      horizontal.edges.map((edge) => edge.id),
    );
    const frames = vertical.nodes.filter((node) => !node.parentId);
    expect(
      Math.max(...frames.map((node) => node.position.x + node.width!)),
    ).toBeLessThan(900);
    for (let index = 1; index < frames.length; index++) {
      expect(frames[index].position.y).toBeGreaterThanOrEqual(
        frames[index - 1].position.y + frames[index - 1].height! + 72,
      );
    }
    const byId = new Map(frames.map((node) => [node.id, node]));
    for (const edge of vertical.edges) {
      const source = byId.get(edge.source)!;
      const target = byId.get(edge.target)!;
      expect(target.position.y).toBeGreaterThan(
        source.position.y + source.height!,
      );
      expect(edge.data?.laneX).toBeLessThan(target.position.x);
      // The incoming lane stays outside all intervening descendants.
      for (const frame of frames.filter(
        (node) =>
          node.position.y > source.position.y &&
          node.position.y < target.position.y,
      )) {
        expect(edge.data?.laneX).toBeLessThan(frame.position.x);
      }
    }
  });
  it("uses registered operators and renders a substantial, serializable business policy", () => {
    expect(RuleEngine.validate(policy).isValid).toBe(true);
    const graph = createRuleGraph(JSON.parse(JSON.stringify(policy)));
    expect(
      graph.nodes.filter((node) => node.data.kind === "constraint").length,
    ).toBeGreaterThan(250);
    expect(
      graph.nodes.filter((node) => node.data.kind === "result"),
    ).toHaveLength(11);
    expect(
      graph.nodes.find((node) => node.id === "$.conditions[7]")?.data.title,
    ).toContain("VIP");
    const overview = layoutRuleGraph(
      graph,
      new Set(
        policyJson.conditions.map((_, index) => `$.conditions[${index}]`),
      ),
    );
    expect(overview.nodes).toHaveLength(13);
    expect(
      overview.nodes.filter((node) => node.data.kind === "condition"),
    ).toHaveLength(11);
    for (const direction of ["LR", "TB"] as const) {
      const laid = layoutRuleGraph(graph, new Set(), direction);
      const ids = new Set(laid.nodes.map((node) => node.id));
      expect(
        laid.edges.every(
          (edge) => ids.has(edge.source) && ids.has(edge.target),
        ),
      ).toBe(true);
      expect(
        laid.nodes.every(
          (node) =>
            Number.isFinite(node.position.x) &&
            Number.isFinite(node.position.y),
        ),
      ).toBe(true);
    }
  });
  it.each<[string, Record<string, unknown>]>([
    ["invalid_order", { "context.dataAgeSeconds": 600 }],
    ["fraud_block", { "risk.confirmedFraud": true }],
    ["payment_challenge", { "payment.threeDS": "required" }],
    [
      "risk_review",
      { "order.total": 12000, "payment.authorizedAmount": 12000 },
    ],
    ["inventory_hold", { "inventory.reserved": false }],
    [
      "b2b_contract",
      {
        "order.channel": "b2b",
        "customer.managedAccount": true,
        "order.purchaseOrderVerified": true,
      },
    ],
    ["international", { "shipping.crossBorder": true }],
    [
      "vip_express",
      {
        "customer.tier": "gold",
        "customer.completedOrders": 25,
        "customer.lifetimeSpend": 5000,
      },
    ],
    [
      "marketplace_split",
      { "order.channel": "marketplace", "order.sellerCount": 3 },
    ],
    ["subscription", { "order.channel": "subscription" }],
    ["standard_domestic", {}],
    ["unmatched_review", { "order.channel": "unsupported" }],
  ])("routes an operational order to %s", async (route, changes) => {
    const result = await RuleEngine.evaluate(policy, orderWith(changes));
    expect(result.value).toMatchObject({ route });
    expect(result.isPassed).toBe(route !== "unmatched_review");
  });
  it("prioritizes confirmed fraud over payment recovery and VIP fulfillment", async () => {
    const result = await RuleEngine.evaluate(
      policy,
      orderWith({
        "risk.confirmedFraud": true,
        "payment.threeDS": "required",
        "customer.tier": "platinum",
      }),
    );
    expect(result.value).toMatchObject({
      route: "fraud_block",
      decision: "block",
    });
  });
  it("uses manual triage for stale policy versions and missing required approval signals", async () => {
    for (const changes of [
      { "context.policyVersion": "retired" },
      { "context.dataAgeSeconds": 180 },
      { "payment.authorizedAmount": 100 },
    ]) {
      const result = await RuleEngine.evaluate(policy, orderWith(changes));
      expect(result.value).toMatchObject({
        route: "unmatched_review",
        payment: { capture: "hold" },
      });
    }
  });
});
