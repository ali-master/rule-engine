import { useState, useRef, useMemo, useEffect, memo } from "react";
import {
  useUpdateNodeInternals,
  useReactFlow,
  ReactFlow,
  Position,
  MiniMap,
  Handle,
  Controls,
  Background,
} from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import {
  Sun,
  Moon,
  GitBranch,
  ChevronRight,
  ArrowUpLeft,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import type { RuleVisualizerProps } from "./RuleVisualizer";
import { preview, createRuleGraph } from "./graph";
import { createDecisionGraph } from "./decision-graph";
import type { DecisionNode } from "./decision-graph";
import { FlowingEdge } from "./FlowingEdge";

const DecisionCard = memo(({ id, data, selected }: NodeProps<DecisionNode>) => {
  const configuredValue = (data.configuredResult as { value?: unknown } | null)
    ?.value;
  const configuredText =
    configuredValue !== null &&
    typeof configuredValue === "object" &&
    !Array.isArray(configuredValue)
      ? Object.entries(configuredValue)
          .slice(0, 3)
          .map(([key, value]) => `${key}: ${preview(value)}`)
          .join(" · ")
      : preview(configuredValue);
  const vertical = data.direction === "TB";
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, data.direction, updateNodeInternals]);
  const forward = vertical ? Position.Bottom : Position.Right;
  const branch = vertical ? Position.Right : Position.Bottom;
  return (
    <article
      className={`rv-decision-card rv-decision-${data.kind} ${data.logic ? `rv-${data.logic}` : ""} ${data.outcome === undefined ? "" : data.outcome ? "rv-positive" : "rv-negative"} ${selected ? "rv-selected" : ""}`}
    >
      {data.kind !== "start" && (
        <Handle
          type="target"
          position={
            data.side
              ? vertical
                ? Position.Left
                : Position.Top
              : vertical
                ? Position.Top
                : Position.Left
          }
        />
      )}
      <div className="rv-decision-kicker">
        <span>
          {data.kind === "check"
            ? `IF · ${String(data.ordinal).padStart(2, "0")}`
            : data.kind === "start"
              ? "ENTRY"
              : "THEN"}
        </span>
        {data.logic && <span>{data.logic.toUpperCase()}</span>}
        {data.kind === "outcome" && (
          <span>{data.outcome ? "TRUE" : "FALSE"}</span>
        )}
      </div>
      <strong title={data.title}>{data.title}</strong>
      <p title={data.detail}>{data.detail}</p>
      {data.configuredResult !== undefined && (
        <code title={JSON.stringify(data.configuredResult)}>
          Configured: {configuredText}
        </code>
      )}
      {data.scope && (
        <button
          className="rv-open-logic nodrag"
          aria-label={`Open conditions for ${data.title}`}
        >
          Open conditions <ChevronRight size={13} />
        </button>
      )}
      {data.kind === "start" && (
        <Handle id="next" type="source" position={forward} />
      )}
      {data.kind === "check" && (
        <>
          <Handle
            id={String(data.continueOn)}
            type="source"
            position={forward}
          />
          <Handle
            id={String(!data.continueOn)}
            type="source"
            position={branch}
          />
          <span className={`rv-port-label rv-port-${forward}`}>
            {data.continueOn ? "TRUE" : "FALSE"}
          </span>
          <span className={`rv-port-label rv-port-${branch}`}>
            {data.continueOn ? "FALSE" : "TRUE"}
          </span>
        </>
      )}
    </article>
  );
});
const nodeTypes = { decision: DecisionCard };
const edgeTypes = { smoothstep: FlowingEdge };

export function DecisionFlow({
  rule,
  title = "Rule explorer",
  theme = "light",
  className = "",
  style,
  onNodeSelect,
  onShowStructure,
}: RuleVisualizerProps & { onShowStructure: () => void }) {
  const [mode, setMode] = useState(theme);
  const [direction, setDirection] = useState<"TB" | "LR">("TB");
  const [trail, setTrail] = useState(["$"]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DecisionNode | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const flow = useReactFlow<DecisionNode>();
  const parsed = useMemo(() => {
    try {
      return { graph: createRuleGraph(rule), error: null };
    } catch (error) {
      return {
        graph: null,
        error: error instanceof Error ? error.message : "Invalid rule",
      };
    }
  }, [rule]);
  const scope = trail.at(-1)!;
  const decision = useMemo(() => {
    try {
      return {
        graph: parsed.graph
          ? createDecisionGraph(parsed.graph, scope, direction)
          : null,
        error: parsed.error,
      };
    } catch (error) {
      return {
        graph: null,
        error: error instanceof Error ? error.message : "Invalid decision",
      };
    }
  }, [parsed, scope, direction]);
  const graph = decision.graph;
  const readStart = () => {
    if (!canvasRef.current) return;
    const width = canvasRef.current.clientWidth;
    const zoom = Math.min(
      1,
      Math.max(0.5, (width - 64) / (direction === "TB" ? 820 : 900)),
    );
    void flow.setViewport({ x: 32, y: 32, zoom }, { duration: 250 });
  };
  useEffect(() => {
    if (!canvasRef.current) return;
    const width = canvasRef.current.clientWidth;
    void flow.setViewport({
      x: 32,
      y: 32,
      zoom: Math.min(
        1,
        Math.max(0.5, (width - 64) / (direction === "TB" ? 820 : 900)),
      ),
    });
  }, [scope, direction, rule, flow]);
  const matches =
    query.trim() && !decision.error
      ? (parsed.graph?.nodes.filter(
          (node) =>
            ["condition", "constraint"].includes(node.data.kind) &&
            `${node.data.title} ${node.data.subtitle} ${node.id}`
              .toLowerCase()
              .includes(query.trim().toLowerCase()),
        ) ?? [])
      : [];
  const navigate = (path: string) => {
    setTrail((previous) => [...previous, path]);
    setSelected(null);
    setQuery("");
  };
  const choose = (node: DecisionNode) => {
    onNodeSelect?.(node.data.path, node.data.source);
    if (node.data.scope) navigate(node.data.scope);
    else setSelected(node);
  };
  const searchFocus = (id: string) => {
    if (!parsed.graph) return;
    const parent = parsed.graph.nodes.find((node) =>
      node.data.children.includes(id),
    );
    if (!parent) return;
    const parents = new Map(
      parsed.graph.edges.map((edge) => [edge.target, edge.source]),
    );
    const nextTrail: string[] = [];
    let path: string | undefined = parent.id;
    while (path) {
      if (path === "$" || /\.(and|or|none)$/.test(path))
        nextTrail.unshift(path);
      path = parents.get(path);
    }
    setTrail(nextTrail);
    setQuery("");
    const target = createDecisionGraph(
      parsed.graph,
      parent.id,
      direction,
    ).nodes.find((node) => node.id === id);
    if (target) {
      setSelected(target);
      requestAnimationFrame(
        () =>
          void flow.setCenter(target.position.x + 160, target.position.y + 74, {
            zoom: 0.9,
            duration: 300,
          }),
      );
    }
  };
  return (
    <section
      className={`rv-shell rv-decisions ${className}`}
      data-theme={mode}
      style={style}
      aria-label={title}
    >
      <header className="rv-header">
        <div className="rv-brand">
          <span className="rv-logo">
            <GitBranch size={23} />
          </span>
          <div>
            <span className="rv-eyebrow">RULE ATLAS / DECISION FLOW</span>
            <h2>{title}</h2>
          </div>
        </div>
        <div className="rv-header-actions">
          <button onClick={onShowStructure}>JSON structure</button>
          <button
            aria-label="Toggle color theme"
            onClick={() => setMode(mode === "light" ? "dark" : "light")}
          >
            {mode === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
        </div>
      </header>
      <div className="rv-toolbar">
        <div className="rv-search">
          <input
            aria-label="Search decisions"
            placeholder="Find a field or a business route…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <div className="rv-search-results">
              {matches.slice(0, 20).map((node) => (
                <button key={node.id} onClick={() => searchFocus(node.id)}>
                  <strong>{node.data.title}</strong>
                  <small>{node.id}</small>
                </button>
              ))}
              {!matches.length && <p>No matching decisions</p>}
            </div>
          )}
        </div>
        <div className="rv-tools">
          <button
            aria-label="Change layout"
            onClick={() => setDirection(direction === "TB" ? "LR" : "TB")}
          >
            {direction === "TB" ? (
              <ArrowDown size={16} />
            ) : (
              <ArrowRight size={16} />
            )}
            <span>{direction === "TB" ? "Vertical" : "Horizontal"}</span>
          </button>
          <button onClick={readStart}>Read from start</button>
          <button
            onClick={() => void flow.fitView({ padding: 0.15, duration: 300 })}
          >
            Fit view
          </button>
        </div>
      </div>
      <nav className="rv-decision-breadcrumbs" aria-label="Decision scope">
        {trail.map((path, index) => (
          <button
            key={`${index}:${path}`}
            aria-current={index === trail.length - 1 ? "location" : undefined}
            title={path}
            onClick={() => {
              setTrail(trail.slice(0, index + 1));
              setSelected(null);
            }}
          >
            {index > 0 && <ChevronRight size={12} />}
            {index === 0
              ? "All routes"
              : `${path.match(/\.(and|or|none)$/)?.[1].toUpperCase() ?? "Group"} · ${parsed.graph?.nodes.find((node) => node.data.children.includes(path))?.data.title ?? `level ${index}`}`}
          </button>
        ))}
        {trail.length > 1 && (
          <button
            onClick={() => {
              setTrail(trail.slice(0, -1));
              setSelected(null);
            }}
          >
            <ArrowUpLeft size={13} /> Back to parent
          </button>
        )}
      </nav>
      <div className="rv-decision-explanation">
        <strong>
          {graph?.logic
            ? `${graph.logic.toUpperCase()}: ${graph.logic === "and" ? "every check must be TRUE" : graph.logic === "or" ? "at least one check must be TRUE" : "every check must be FALSE"}`
            : "IF a route matches → return its result. ELSE → try the next route."}
        </strong>
        <span>
          {graph?.logic
            ? "The group's TRUE/FALSE answer returns to the parent decision. Open a nested group to see how it decides."
            : "Click a decision to open its AND / OR / NONE conditions. Fallback is reached only when no route matches."}
        </span>
      </div>
      <div className="rv-body">
        <div className="rv-canvas" ref={canvasRef}>
          {decision.error ? (
            <div className="rv-error" role="alert">
              <h3>Unable to map these decisions</h3>
              <p>{decision.error}</p>
              <button onClick={onShowStructure}>Inspect JSON structure</button>
            </div>
          ) : (
            graph && (
              <ReactFlow<DecisionNode>
                nodes={graph.nodes.map((node) => ({
                  ...node,
                  selected: node.id === selected?.id,
                }))}
                edges={graph.edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onInit={readStart}
                onNodeClick={(_, node) => choose(node)}
                nodesDraggable={false}
                nodesConnectable={false}
                edgesFocusable={false}
                deleteKeyCode={null}
                defaultViewport={{ x: 32, y: 32, zoom: 0.9 }}
                minZoom={0.005}
                maxZoom={1.8}
                panOnScroll
                zoomOnScroll={false}
                onlyRenderVisibleElements
                colorMode={mode}
              >
                <Background
                  gap={18}
                  size={0.65}
                  color={mode === "dark" ? "#344256" : "#d6d9df"}
                />
                <Controls showInteractive={false} />
                <MiniMap
                  pannable
                  zoomable
                  nodeColor={(node) =>
                    node.data.kind === "check"
                      ? "#709bab"
                      : node.data.outcome
                        ? "#27866b"
                        : "#bd7156"
                  }
                />
              </ReactFlow>
            )
          )}
        </div>
        {selected && (
          <aside className="rv-inspector">
            <div className="rv-inspector-title">
              DECISION DETAILS
              <button
                onClick={() => setSelected(null)}
                aria-label="Close decision details"
              >
                ×
              </button>
            </div>
            <h3>{selected.data.title}</h3>
            <p>{selected.data.detail}</p>
            <p className="rv-path">{selected.data.path}</p>
            <pre tabIndex={0}>
              {JSON.stringify(selected.data.source, null, 2)}
            </pre>
          </aside>
        )}
      </div>
      <footer className="rv-footer">
        <span>
          Decision logic · TRUE / FALSE are possible outcomes, not an execution
          trace.
        </span>
        <span>Scroll to explore · Hover a link to follow its direction</span>
      </footer>
    </section>
  );
}
