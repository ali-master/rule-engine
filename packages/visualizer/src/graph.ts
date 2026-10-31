import { MarkerType } from "@xyflow/react";
import type { Node, Edge } from "@xyflow/react";

export type RuleNodeData = Record<string, unknown> & {
  kind:
    | "root"
    | "condition"
    | "and"
    | "or"
    | "none"
    | "constraint"
    | "result"
    | "default";
  title: string;
  subtitle: string;
  path: string;
  source: unknown;
  children: string[];
};
export const logicGroups: Partial<
  Record<
    RuleNodeData["kind"],
    {
      symbol: string;
      label: string;
      quantifier: string;
      description: string;
    }
  >
> = {
  and: {
    symbol: "∧",
    label: "All conditions",
    quantifier: "ALL",
    description:
      "Every child condition must match. A single non-matching condition prevents this group from matching.",
  },
  or: {
    symbol: "∨",
    label: "At least one",
    quantifier: "1+",
    description:
      "One or more child conditions must match. Other children may remain unmatched.",
  },
  none: {
    symbol: "¬",
    label: "No conditions",
    quantifier: "ZERO",
    description:
      "No child condition may match. A single matching condition prevents this group from matching.",
  },
};
export type RuleNode = Node<RuleNodeData, "rule">;
export interface RuleGraph {
  nodes: RuleNode[];
  edges: Edge[];
}
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
export function preview(value: unknown): string {
  if (value === undefined) return "No comparison value";
  const text = JSON.stringify(value);
  return text.length > 90 ? `${text.slice(0, 87)}…` : text;
}
/** Iterative traversal keeps deeply nested rules off the JavaScript call stack. */
export function createRuleGraph(rule: unknown): RuleGraph {
  if (!object(rule) || !Object.hasOwn(rule, "conditions"))
    throw new Error("Expected a rule object with conditions.");
  try {
    JSON.stringify(rule);
  } catch {
    throw new Error("Expected serializable JSON without circular references.");
  }
  const nodes: RuleNode[] = [];
  const edges: Edge[] = [];
  const pending: {
    value: unknown;
    path: string;
    parent?: RuleNode;
    kind: RuleNodeData["kind"];
    title: string;
  }[] = [{ value: rule, path: "$", kind: "root", title: "Rule entry" }];
  const seen = new WeakSet<object>();
  while (pending.length) {
    const item = pending.pop()!;
    if (nodes.length >= 5000)
      throw new Error(
        "This rule exceeds the 5,000-node display limit. Split it into smaller rules.",
      );
    const { value, path, kind, title, parent } = item;
    if ((kind === "condition" || kind === "root") && !object(value))
      throw new Error(`${path}: expected a condition object.`);
    if (object(value) && (kind === "root" || kind === "condition")) {
      if (seen.has(value))
        throw new Error(
          `${path}: repeated or circular condition reference. Supply JSON data.`,
        );
      seen.add(value);
    }
    const isConstraint =
      kind === "condition" && object(value) && Object.hasOwn(value, "field");
    if (
      isConstraint &&
      (typeof value.field !== "string" || typeof value.operator !== "string")
    )
      throw new Error(`${path}: field and operator must be strings.`);
    const node: RuleNode = {
      id: path,
      type: "rule",
      width: 250,
      height: 126,
      position: { x: 0, y: 0 },
      data: {
        kind: isConstraint ? "constraint" : kind,
        title: isConstraint
          ? String(value.field)
          : kind === "condition" &&
              object(value) &&
              object(value.result) &&
              typeof value.result.message === "string"
            ? value.result.message
            : title,
        subtitle: isConstraint
          ? String(value.operator)
          : kind === "result" || kind === "default"
            ? preview(value)
            : "",
        path,
        source: value,
        children: [],
      },
    };
    nodes.push(node);
    if (parent) {
      parent.data.children.push(path);
      edges.push({
        id: `${parent.id}->${path}`,
        source: parent.id,
        target: path,
        type: "smoothstep",
        className: logicGroups[parent.data.kind]
          ? `rv-edge-${parent.data.kind}`
          : undefined,
        ariaLabel: `${parent.data.title} to ${node.data.title}`,
      });
    }
    const children: typeof pending = [];
    const add = (
      child: unknown,
      key: string,
      childKind: RuleNodeData["kind"],
      label: string,
    ) =>
      children.push({
        value: child,
        path: `${path}${key}`,
        parent: node,
        kind: childKind,
        title: label,
      });
    if (kind === "root" && object(value)) {
      const conditions = Array.isArray(value.conditions)
        ? value.conditions
        : [value.conditions];
      conditions.forEach((c, i) =>
        add(
          c,
          Array.isArray(value.conditions) ? `.conditions[${i}]` : ".conditions",
          "condition",
          `Condition ${i + 1}`,
        ),
      );
      if (Object.hasOwn(value, "default"))
        add(value.default, ".default", "default", "Fallback result");
      node.data.subtitle = `${conditions.length} condition${conditions.length === 1 ? "" : "s"}`;
    } else if (kind === "condition" && !isConstraint && object(value)) {
      const groups = ["and", "or", "none"] as const;
      for (const key of groups)
        if (Object.hasOwn(value, key)) {
          if (!Array.isArray(value[key]))
            throw new TypeError(`${path}.${key}: expected an array.`);
          add(value[key], `.${key}`, key, key.toUpperCase());
        }
      if (!children.length)
        throw new Error(`${path}: expected and, or, or none.`);
      if (Object.hasOwn(value, "result"))
        add(value.result, ".result", "result", "Matched result");
    } else if (
      (kind === "and" || kind === "or" || kind === "none") &&
      Array.isArray(value)
    ) {
      value.forEach((c, i) =>
        add(c, `[${i}]`, "condition", `Nested condition ${i + 1}`),
      );
      node.data.subtitle =
        value.length === 0
          ? "Empty group · 0 conditions"
          : kind === "and"
            ? `${value.length} of ${value.length} required`
            : kind === "or"
              ? `At least 1 of ${value.length} required`
              : `0 of ${value.length} may match`;
    }
    pending.push(...children.reverse());
  }
  return { nodes, edges };
}

/** Pack frames into horizontal columns or a vertical outline, retaining child cards. */
export function layoutRuleGraph(
  graph: RuleGraph,
  collapsed: ReadonlySet<string> = new Set(),
  direction: "LR" | "TB" = "LR",
): RuleGraph {
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const visible: RuleNode[] = [];
  const pending = ["$"];
  while (pending.length) {
    const node = byId.get(pending.pop()!);
    if (!node) continue;
    visible.push(node);
    if (!collapsed.has(node.id))
      pending.push(...[...node.data.children].reverse());
  }
  const ids = new Set(visible.map((node) => node.id));
  const owners = new Map<string, string>();
  const sizes = new Map<string, { width: number; height: number }>();
  for (const node of visible) {
    const direct = node.data.children.filter((id) => ids.has(id));
    const embedded = logicGroups[node.data.kind]
      ? direct.filter((id) => byId.get(id)!.data.kind === "constraint")
      : [];
    for (const id of embedded) owners.set(id, node.id);
    sizes.set(
      node.id,
      logicGroups[node.data.kind]
        ? { width: 288, height: 110 + embedded.length * 118 }
        : node.data.kind === "constraint" ||
            node.data.kind === "result" ||
            node.data.kind === "default"
          ? { width: 248, height: 100 }
          : {
              width:
                node.data.kind === "condition" && node.data.title.length > 24
                  ? 280
                  : 190,
              height: 76,
            },
    );
  }
  // Single-key condition wrappers add no information beyond their logical group.
  const aliases = new Map<string, string>();
  for (const node of visible) {
    const child = node.data.children[0];
    if (
      node.data.kind === "condition" &&
      node.data.children.length === 1 &&
      ids.has(child) &&
      logicGroups[byId.get(child)!.data.kind] &&
      Object.keys(node.data.source as object).length === 1 &&
      !collapsed.has(node.id)
    )
      aliases.set(node.id, child);
  }
  const externalEdges = graph.edges
    .filter(
      (edge) =>
        ids.has(edge.source) &&
        ids.has(edge.target) &&
        !owners.has(edge.target),
    )
    .map((edge) => ({
      ...edge,
      source: aliases.get(edge.source) ?? edge.source,
      target: aliases.get(edge.target) ?? edge.target,
    }))
    .filter((edge) => edge.source !== edge.target);
  const depths = new Map([["$", 0]]);
  for (const node of visible) {
    const id = aliases.get(node.id) ?? node.id;
    for (const edge of externalEdges.filter((edge) => edge.source === id))
      depths.set(edge.target, (depths.get(id) ?? 0) + 1);
  }
  const columns = new Map<number, RuleNode[]>();
  for (const node of visible) {
    if (owners.has(node.id) || aliases.has(node.id)) continue;
    const column = depths.get(node.id) ?? 0;
    columns.set(column, [...(columns.get(column) ?? []), node]);
  }
  const horizontal = direction === "LR";
  const laid = new Map<string, RuleNode>();
  let axis = 0;
  if (!horizontal) {
    // Depth-first rows keep each subtree together; breadth never widens the canvas.
    for (const node of visible) {
      if (owners.has(node.id) || aliases.has(node.id)) continue;
      const size = sizes.get(node.id)!;
      laid.set(node.id, {
        ...node,
        ...size,
        position: { x: (depths.get(node.id) ?? 0) * 80, y: axis },
      });
      axis += size.height + 72;
    }
  }
  for (const [, column] of horizontal
    ? [...columns].sort(([a], [b]) => a - b)
    : []) {
    const crossSize =
      column.reduce(
        (sum, node) =>
          sum +
          (horizontal ? sizes.get(node.id)!.height : sizes.get(node.id)!.width),
        0,
      ) +
      Math.max(0, column.length - 1) * 42;
    let cross = -crossSize / 2;
    for (const node of column) {
      const size = sizes.get(node.id)!;
      laid.set(node.id, {
        ...node,
        ...size,
        position: horizontal ? { x: axis, y: cross } : { x: cross, y: axis },
      });
      cross += (horizontal ? size.height : size.width) + 42;
    }
    axis +=
      Math.max(
        ...column.map((node) =>
          horizontal ? sizes.get(node.id)!.width : sizes.get(node.id)!.height,
        ),
      ) + 112;
  }
  for (const node of visible) {
    const owner = owners.get(node.id);
    if (!owner) continue;
    const siblings = byId
      .get(owner)!
      .data.children.filter((id) => owners.get(id) === owner);
    laid.set(node.id, {
      ...node,
      ...sizes.get(node.id)!,
      parentId: owner,
      extent: "parent",
      position: { x: 20, y: 64 + siblings.indexOf(node.id) * 118 },
    });
  }
  return {
    nodes: visible
      .filter((node) => laid.has(node.id))
      .map((node) => laid.get(node.id)!),
    edges: externalEdges.map((edge) => {
      const target = byId.get(edge.target)!;
      const source = byId.get(edge.source)!;
      return {
        ...edge,
        data: {
          ...edge.data,
          laneX: horizontal
            ? undefined
            : laid.get(edge.target)!.position.x - 24,
        },
        ariaLabel: `${source.data.title} to ${target.data.title}`,
        label:
          target.data.kind === "default"
            ? "fallback"
            : target.data.kind === "result"
              ? "result ownership"
              : logicGroups[source.data.kind]
                ? "nested condition"
                : (logicGroups[target.data.kind]?.label ?? "condition"),
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#748194",
          width: 16,
          height: 16,
        },
        labelStyle: { fontSize: 10 },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 4,
      };
    }),
  };
}
