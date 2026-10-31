# @usex/rule-engine-visualizer

A read-only React Flow explorer for Rule Engine JSON. Follow nested AND, OR and
NONE groups, inspect original values, and follow explicit TRUE/FALSE decisions.
The default decision view shows first-match route selection and each group's Boolean
paths. The separate **JSON structure** view shows ownership. Neither view runs
operators or claims to show a live execution trace.

## Use

```tsx
import { RuleVisualizer } from "@usex/rule-engine-visualizer";
import "@usex/rule-engine-visualizer/styles";
import type { RuleType } from "@usex/rule-engine";

export function RuleMap({ rule }: { rule: RuleType }) {
  return <RuleVisualizer rule={rule} title="Eligibility policy" theme="dark" />;
}
```

Requires React and React DOM 19.3+. Install this package and its peer dependencies
in the consuming application. The stylesheet includes React Flow's base styles;
custom styles are scoped to `.rv-shell`.

## Explore

- Decision flow starts with the ordered routes: TRUE returns the matched condition's
  evaluated result; FALSE tries the next route. Only exhausting all routes reaches fallback.
- Open a decision to inspect its group. AND continues on TRUE and rejects on FALSE;
  OR continues on FALSE and accepts on TRUE; NONE continues on FALSE and rejects on TRUE.
  Breadcrumbs return to the containing decision. Empty AND/NONE are TRUE; empty OR is FALSE.
- TRUE links are solid green; FALSE links are dashed terracotta. Hover a connection
  to animate its direction. Reduced motion disables particles. These are possible
  outcomes, not evidence that an input passed or that an operator executed.
- Configured result payloads are labeled as configuration. The engine computes the
  actual returned value; the diagram does not simulate value propagation or messages.
- Search by field, operator or JSON path; selecting a result expands and focuses it.
- Select nodes (mouse or keyboard) to inspect the complete JSON definition.
- Switch horizontal/vertical layouts. In JSON structure, collapse individual branches
  or expand all; vertical mode uses an indented, depth-first outline.
  Scroll to read, pinch or use the controls to zoom, and use **Read from start**
  to return from the full-policy overview. **Fit view** shows the entire graph.
- Subtle SVG particles follow connector paths while preserving AND/OR/NONE line
  styles. Motion is decorative, not execution status, and respects reduced motion.
- Pan, zoom, fit the graph, or navigate with the interactive minimap.
- Read direct constraints as typed field cards inside AND/OR/NONE frames. Labeled arrows connect nested groups and results.
- Toggle light/dark mode (light by default). Open the inspector from the toolbar or by selecting a node; it stacks below the canvas on small screens.

`RuleVisualizer` accepts `rule`, `title`, initial `theme`, `className`, `style`, and
`onNodeSelect(path, value)` and `initialCollapsedPaths`. The latter sets collapsed
JSON paths on mount in the JSON structure view. Its default height is 740px;
override using `style`.
Treat rule props as immutable. No rule values are edited and no telemetry is sent.

`createRuleGraph(unknown)` validates the structural input and returns typed nodes
and edges. `layoutRuleGraph(graph, collapsedIds?, "LR" | "TB")` returns a new layout.
Both utilities are independent of React rendering. Paths are stable node IDs.
The layout embeds direct constraints using React Flow parent IDs and relative positions.
Single-key condition wrappers are folded into their logical group in the canvas;
the original graph, search results and inspector retain their complete source data.
Wrappers with extra metadata or multiple logical keys remain visible.
Empty groups and condition arrays are preserved. Unknown extra properties remain
available in the source inspector. A condition with multiple logical keys displays
each key separately in JSON structure. Decision flow rejects multiple logical keys,
empty top-level condition arrays and ambiguous predicate/group mixtures rather than
drawing a misleading Boolean decision. Operator names and values still require the
engine's own validation when evaluating.

## Limits

Accepts JSON-serializable data; cycles and malformed groups produce an inline error.
At most 5,000 generated nodes are accepted; excess input is rejected rather than
silently truncated. Extremely large values and graphs still use main-thread memory;
open individual groups or split policies for practical navigation. This is a static
logic viewer, not an evaluator, rule editor or generic JSON graph tool. Boolean paths
do not promise the engine's precise operator invocation/short-circuit order.

## Development

From the repository root:

```sh
bun install --frozen-lockfile
bun run --filter @usex/rule-engine-visualizer dev
bun run --filter @usex/rule-engine-visualizer build
bun run --filter @usex/rule-engine-visualizer test:unit
bun run --filter @usex/rule-engine-visualizer test:package
bun run --filter @usex/rule-engine-visualizer build:demo
```

The playground runs on port 5174 and defaults to a commerce order policy with
11 ordered business routes, 349 constraints, 138 logical groups and 124 unique
fields (638 source nodes). Its overview starts with the top-level business decisions
and their TRUE/FALSE outcomes; open a group, search, or select an isolated route.
The full JSON remains editable in the input panel.

The policy is in `src/examples/commerce-policy.json`; a complete synthetic order
is in `src/examples/commerce-order.json`. The routes cover invalid input, confirmed
fraud, payment recovery, manual review, inventory holds, B2B, customs, VIP delivery,
marketplace splitting, subscription renewal and domestic shipping. Conditions run
in order: the first match wins; the fallback holds capture and routes to triage.
Thresholds are illustrative business assumptions, not a production-approved policy.
Nested fields use `$.` JSONPath; monetary comparisons use a consistent order currency.
Each route and the fallback are exercised against the actual engine in the tests.

Library builds export ESM, declarations and `dist/style.css`.
Demo builds go to `dist-demo`. Root release scripts publish core, builder, then
visualizer, with an independent `rule-engine-visualizer@` tag prefix.
