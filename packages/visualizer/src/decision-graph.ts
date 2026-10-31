import { MarkerType } from "@xyflow/react";
import type { Node, Edge } from "@xyflow/react";
import { preview, logicGroups } from "./graph";
import type { RuleNode, RuleGraph } from "./graph";

interface DecisionFields {
  kind: "start" | "check" | "outcome";
  title: string;
  detail: string;
  path: string;
  source: unknown;
  direction: "LR" | "TB";
  scope?: string;
  logic?: "and" | "or" | "none";
  continueOn?: boolean;
  outcome?: boolean;
  side?: boolean;
  ordinal?: number;
  configuredResult?: unknown;
}
export type DecisionData = DecisionFields & Record<string, unknown>;
export type DecisionNode = Node<DecisionData, "decision">;

function activeGroup(node: RuleNode, byId: Map<string, RuleNode>) {
  return node.data.children
    .map((id) => byId.get(id)!)
    .find((child) => logicGroups[child.data.kind]);
}

/** Boolean decision paths, not an operator execution or short-circuit trace. */
export function createDecisionGraph(
  graph: RuleGraph,
  scope = "$",
  direction: "LR" | "TB" = "TB",
) {
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  for (const node of graph.nodes) {
    if (
      node.data.kind === "condition" &&
      node.data.children.filter((id) => logicGroups[byId.get(id)!.data.kind])
        .length !== 1
    )
      throw new Error(
        `${node.id}: a condition must have exactly one of AND, OR or NONE. The engine rejects multiple groups on one condition.`,
      );
    if (
      node.data.kind === "constraint" &&
      ["or", "and", "none"].some((key) => key in (node.data.source as object))
    )
      throw new Error(
        `${node.id}: use an unambiguous constraint or a nested logical group.`,
      );
  }
  const owner = byId.get(scope);
  if (!owner || (scope !== "$" && !logicGroups[owner.data.kind]))
    throw new Error(
      "Select a rule or a logical group to explore its decisions.",
    );
  const logic =
    scope === "$" ? undefined : (owner.data.kind as "and" | "or" | "none");
  const items = owner.data.children
    .map((id) => byId.get(id)!)
    .filter((node) => node.data.kind !== "default");
  if (scope === "$" && !items.length)
    throw new Error("The engine requires at least one top-level condition.");
  const nodes: DecisionNode[] = [];
  const edges: Edge[] = [];
  const step = direction === "TB" ? 240 : 480;
  const offset = direction === "TB" ? 160 : 440;
  const position = (axis: number, side = false) =>
    direction === "TB"
      ? { x: side ? 500 : 0, y: axis }
      : { x: axis, y: side ? 320 : 0 };
  const add = (
    id: string,
    axis: number,
    data: Omit<DecisionFields, "direction">,
  ) => {
    nodes.push({
      id,
      type: "decision",
      width: 320,
      height: data.kind === "start" ? 88 : 148,
      position: position(axis, data.side),
      data: { ...data, direction } as DecisionData,
    });
  };
  const connect = (
    source: string,
    target: string,
    outcome?: boolean,
    label?: string,
  ) => {
    const color =
      outcome === undefined ? "#748194" : outcome ? "#27866b" : "#bd7156";
    edges.push({
      id: `${source}:${outcome ?? "start"}->${target}`,
      source,
      target,
      sourceHandle: outcome === undefined ? "next" : String(outcome),
      type: "smoothstep",
      label: label ?? (outcome ? "TRUE" : "FALSE"),
      className:
        outcome === undefined
          ? undefined
          : outcome
            ? "rv-edge-true"
            : "rv-edge-false",
      data: { pulse: false, outcome },
      markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
      labelStyle: { fontSize: 11, fontWeight: 600 },
      labelBgPadding: [7, 4],
      labelBgBorderRadius: 5,
    });
  };
  const continueOn = logic === "and";
  const finish = `${scope}::finish`;
  add(`${scope}::start`, 0, {
    kind: "start",
    logic,
    title: logic
      ? `${logic.toUpperCase()} · ${logicGroups[logic]!.label}`
      : "Start · evaluate this rule",
    detail: logic
      ? logicGroups[logic]!.description
      : "In order. The first matching condition wins.",
    path: scope,
    source: owner.data.source,
  });
  items.forEach((item, index) => {
    const group = activeGroup(item, byId);
    if (item.data.kind !== "constraint" && !group)
      throw new Error(`${item.id}: no logical group to evaluate.`);
    if (
      item.data.kind === "constraint" &&
      (!logic ||
        ["or", "and", "none"].some(
          (key) => key in (item.data.source as object),
        ))
    )
      throw new Error(
        `${item.id}: a decision must be a logical group or an unambiguous child constraint.`,
      );
    const constraint = item.data.source as {
      operator?: string;
      value?: unknown;
      result?: unknown;
    };
    const groupKind = group?.data.kind as DecisionData["logic"];
    add(item.id, offset + index * step, {
      kind: "check",
      title:
        group &&
        !(
          constraint.result &&
          typeof constraint.result === "object" &&
          "message" in constraint.result
        )
          ? groupKind === "and"
            ? `Are all ${group.data.children.length} checks TRUE?`
            : groupKind === "or"
              ? `Is at least one of ${group.data.children.length} checks TRUE?`
              : `Are all ${group.data.children.length} checks FALSE?`
          : item.data.title,
      detail: group
        ? `${group.data.title} · ${group.data.subtitle}`
        : `${constraint.operator}\n${preview(constraint.value)}`,
      ordinal: index + 1,
      path: item.id,
      source: item.data.source,
      scope: group?.id,
      logic: groupKind,
      continueOn,
    });
    const branchId = `${item.id}::outcome`;
    const branchOutcome = logic ? logic === "or" : true;
    add(branchId, offset + index * step, {
      kind: "outcome",
      side: true,
      outcome: branchOutcome,
      title: logic
        ? `Group is ${branchOutcome ? "TRUE" : "FALSE"}`
        : "Match · stop here",
      detail: !logic
        ? "Return this condition's evaluated result. Later routes are not selected."
        : logic === "or"
          ? "One matching child is enough. Return TRUE to the parent."
          : logic === "none"
            ? "A child matched. NONE fails. Return FALSE to the parent."
            : "A child did not match. AND fails. Return FALSE to the parent.",
      path: item.id,
      source: item.data.source,
      configuredResult: !logic ? constraint.result : undefined,
    });
    connect(
      item.id,
      branchId,
      !continueOn,
      !logic
        ? "TRUE · return"
        : logic === "or"
          ? "TRUE · sufficient"
          : logic === "none"
            ? "TRUE · disqualifies"
            : "FALSE · rejects group",
    );
    connect(
      item.id,
      items[index + 1]?.id ?? finish,
      continueOn,
      `${continueOn ? "TRUE" : "FALSE"} · ${index < items.length - 1 ? (logic ? "check next" : "try next route") : logic ? "group complete" : "use fallback"}`,
    );
  });
  const fallback = owner.data.children
    .map((id) => byId.get(id)!)
    .find((node) => node.data.kind === "default");
  const finalOutcome = logic ? logic !== "or" : false;
  add(finish, offset + items.length * step, {
    kind: "outcome",
    outcome: finalOutcome,
    title: logic
      ? `Group is ${finalOutcome ? "TRUE" : "FALSE"}`
      : "No match · fallback",
    detail: !logic
      ? "No route matched. isPassed = false; use the default value, or false if absent."
      : !items.length
        ? `Empty ${logic.toUpperCase()} evaluates to ${String(finalOutcome).toUpperCase()}.`
        : logic === "and"
          ? "Every child matched. Return TRUE to the parent."
          : logic === "none"
            ? "No child matched. Return TRUE to the parent."
            : "No child matched. Return FALSE to the parent.",
    path: fallback?.id ?? scope,
    source: fallback?.data.source ?? owner.data.source,
    configuredResult: !logic ? fallback?.data.source : undefined,
  });
  connect(
    `${scope}::start`,
    items[0]?.id ?? finish,
    undefined,
    items.length ? "begin" : "empty group",
  );
  const titles = new Map(nodes.map((node) => [node.id, node.data.title]));
  return {
    nodes,
    edges: edges.map((edge) => ({
      ...edge,
      ariaLabel: `${titles.get(edge.source)}: ${edge.label} → ${titles.get(edge.target)}`,
    })),
    owner,
    logic,
  };
}
