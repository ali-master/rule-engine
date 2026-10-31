import {
  useState,
  useRef,
  useMemo,
  useEffect,
  use,
  memo,
  createContext,
} from "react";
import type { CSSProperties } from "react";
import {
  useUpdateNodeInternals,
  useReactFlow,
  ReactFlowProvider,
  ReactFlow,
  Position,
  MiniMap,
  Handle,
  getNodesBounds,
  Controls,
  Background,
} from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import {
  X,
  Sun,
  Split,
  ShieldBan,
  Search,
  Scan,
  PanelRight,
  Moon,
  Layers,
  GitBranch,
  CornerUpLeft,
  ChevronRight,
  ChevronDown,
  Braces,
  Box,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import type { RuleType } from "@usex/rule-engine";
import {
  preview,
  logicGroups,
  layoutRuleGraph,
  createRuleGraph,
} from "./graph";
import type { RuleNode } from "./graph";
import { FlowingEdge } from "./FlowingEdge";
import { DecisionFlow } from "./DecisionFlow";

const InteractionContext = createContext({
  toggle: (_id: string) => {},
  collapsed: new Set<string>(),
  direction: "LR" as "LR" | "TB",
});
const RuleCard = memo(
  ({ id, data, selected, width, height }: NodeProps<RuleNode>) => {
    const { toggle, collapsed, direction } = use(InteractionContext);
    const updateNodeInternals = useUpdateNodeInternals();
    useEffect(() => {
      updateNodeInternals(id);
    }, [id, direction, updateNodeInternals]);
    const hasChildren = data.children.length > 0;
    const logic = logicGroups[data.kind];
    const Icon =
      data.kind === "and"
        ? Layers
        : data.kind === "or"
          ? Split
          : data.kind === "none"
            ? ShieldBan
            : data.kind === "constraint"
              ? Braces
              : data.kind === "result" || data.kind === "default"
                ? Box
                : GitBranch;
    const source = data.source as { value?: unknown; operator?: string };
    const value = data.kind === "constraint" ? source.value : data.source;
    const valueType =
      value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
    const fold = hasChildren && (
      <button
        className="rv-fold nodrag nopan"
        aria-label={`${collapsed.has(id) ? "Expand" : "Collapse"} ${data.title}`}
        aria-expanded={!collapsed.has(id)}
        onClick={(event) => {
          event.stopPropagation();
          toggle(id);
        }}
      >
        {collapsed.has(id) ? (
          <ChevronRight size={13} />
        ) : (
          <ChevronDown size={13} />
        )}
      </button>
    );
    return (
      <article
        style={{ width, height }}
        className={`${logic ? "rv-frame" : "rv-node"} rv-${data.kind} ${selected ? "rv-selected" : ""}`}
      >
        {data.kind !== "root" && (
          <Handle
            type="target"
            position={direction === "LR" ? Position.Left : Position.Top}
          />
        )}
        {logic ? (
          <>
            <div className="rv-frame-heading">
              <Icon size={14} />
              <strong>{data.title}</strong>
              <span className="rv-count">{data.children.length}</span>
              {fold}
            </div>
            <div className="rv-frame-caption">{logic.label}</div>
            <div className="rv-frame-requirement">{data.subtitle}</div>
          </>
        ) : (
          <>
            <div className="rv-card-heading">
              <span className="rv-card-icon">
                <Icon size={14} />
              </span>
              <strong title={data.title}>{data.title}</strong>
              <span className="rv-card-badge">
                {data.kind === "constraint"
                  ? "FIELD"
                  : data.kind === "condition"
                    ? "BRANCH"
                    : data.kind.toUpperCase()}
              </span>
              {fold}
            </div>
            {data.kind === "constraint" ? (
              <div className="rv-card-rows">
                <div>
                  <span>operator</span>
                  <code title={source.operator}>{source.operator}</code>
                </div>
                <div>
                  <code className="rv-value" title={preview(value)}>
                    {preview(value)}
                  </code>
                  <span className={`rv-value-type rv-type-${valueType}`}>
                    {value === undefined ? "UNSET" : valueType.toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rv-card-summary" title={data.subtitle}>
                {data.subtitle || "Nested rule definition"}
              </div>
            )}
          </>
        )}
        {hasChildren && (
          <Handle
            type="source"
            position={direction === "LR" ? Position.Right : Position.Bottom}
          />
        )}
      </article>
    );
  },
);
const nodeTypes = { rule: RuleCard };
const edgeTypes = { smoothstep: FlowingEdge };
export interface RuleVisualizerProps {
  rule: RuleType;
  title?: string;
  theme?: "light" | "dark";
  className?: string;
  style?: CSSProperties;
  onNodeSelect?: (path: string, value: unknown) => void;
  initialCollapsedPaths?: readonly string[];
}
function Canvas({
  rule,
  title = "Rule explorer",
  theme = "light",
  className = "",
  style,
  onNodeSelect,
  initialCollapsedPaths = [],
  onShowDecisions,
}: RuleVisualizerProps & { onShowDecisions: () => void }) {
  const [mode, setMode] = useState(theme);
  const [direction, setDirection] = useState<"LR" | "TB">("LR");
  const [collapsed, setCollapsed] = useState(
    () => new Set(initialCollapsedPaths),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const flow = useReactFlow<RuleNode>();
  const canvasRef = useRef<HTMLDivElement>(null);
  const parsed = useMemo(() => {
    try {
      return { graph: createRuleGraph(rule), error: null };
    } catch (error) {
      return {
        graph: { nodes: [], edges: [] },
        error: error instanceof Error ? error.message : "Invalid rule",
      };
    }
  }, [rule]);
  const graph = useMemo(
    () => layoutRuleGraph(parsed.graph, collapsed, direction),
    [parsed, collapsed, direction],
  );
  const current = parsed.graph.nodes.find((n) => n.id === selected);
  const readFromStart = (nodes = graph.nodes) => {
    const root = nodes.find((node) => node.id === "$");
    if (!root || !canvasRef.current) return;
    const width = canvasRef.current.clientWidth;
    const contentWidth = Math.min(
      getNodesBounds(nodes.filter((node) => !node.parentId)).width,
      900,
    );
    const zoom = Math.max(0.55, Math.min(1, (width - 64) / contentWidth));
    void flow.setViewport(
      {
        x:
          Math.max(24, (width - contentWidth * zoom) / 2) -
          root.position.x * zoom,
        y: 36 - root.position.y * zoom,
        zoom,
      },
      { duration: 400 },
    );
  };
  const changeDirection = () => {
    const next = direction === "LR" ? "TB" : "LR";
    const nextGraph = layoutRuleGraph(parsed.graph, collapsed, next);
    setDirection(next);
    if (next === "TB") readFromStart(nextGraph.nodes);
    else if (nextGraph.nodes.length)
      void flow.fitBounds(
        getNodesBounds(nextGraph.nodes.filter((node) => !node.parentId)),
        { padding: 0.12, duration: 400 },
      );
  };
  const currentLogic = current && logicGroups[current.data.kind];
  const matches = query.trim()
    ? parsed.graph.nodes.filter((n) =>
        `${n.data.title} ${n.data.subtitle} ${n.id}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : [];
  const choose = (node: RuleNode) => {
    setSelected(node.id);
    setInspectorOpen(true);
    onNodeSelect?.(node.id, node.data.source);
  };
  const focus = (node: RuleNode) => {
    setCollapsed(new Set());
    choose(node);
    setQuery("");
    const expanded = layoutRuleGraph(parsed.graph, new Set(), direction);
    const laid =
      expanded.nodes.find((n) => n.id === node.id) ??
      expanded.nodes.find((n) => node.data.children.includes(n.id));
    if (!laid) return;
    const parent = expanded.nodes.find((n) => n.id === laid.parentId);
    void flow.setCenter(
      laid.position.x + (parent?.position.x ?? 0) + (laid.width ?? 248) / 2,
      laid.position.y + (parent?.position.y ?? 0) + (laid.height ?? 100) / 2,
      {
        zoom: 1,
        duration: 400,
      },
    );
  };
  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  return (
    <InteractionContext value={{ toggle, collapsed, direction }}>
      <section
        className={`rv-shell ${className}`}
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
              <span className="rv-eyebrow">RULE ATLAS / VISUALIZER</span>
              <h2>{title}</h2>
            </div>
          </div>
          <div className="rv-header-actions">
            <button onClick={onShowDecisions}>Decision flow</button>
            <button
              aria-label="Toggle inspector"
              aria-pressed={inspectorOpen}
              onClick={() => setInspectorOpen(!inspectorOpen)}
            >
              <PanelRight size={17} />
            </button>
            <span className="rv-live">Structure view</span>
            <button
              title="Toggle color theme"
              aria-label="Toggle color theme"
              onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            >
              {mode === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>
        <div className="rv-toolbar">
          <div className="rv-search">
            <Search size={16} />
            <input
              aria-label="Search nodes"
              placeholder="Find a field, operator or path…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <div className="rv-search-results">
                {matches.length === 0 ? (
                  <p>No matching nodes</p>
                ) : (
                  matches.slice(0, 30).map((n) => (
                    <button key={n.id} onClick={() => focus(n)}>
                      <strong>{n.data.title}</strong>
                      <small>{n.id}</small>
                    </button>
                  ))
                )}
                {matches.length > 30 && (
                  <p>
                    Showing 30 of {matches.length} matches. Refine your search.
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="rv-tools">
            <button
              onClick={changeDirection}
              title="Change layout"
              aria-label="Change layout"
            >
              {direction === "LR" ? (
                <ArrowRight size={16} />
              ) : (
                <ArrowDown size={16} />
              )}
              <span>{direction === "LR" ? "Horizontal" : "Vertical"}</span>
            </button>
            {direction === "TB" && (
              <button
                aria-label="Read from start"
                onClick={() => readFromStart()}
              >
                <CornerUpLeft size={16} />
                <span>Read from start</span>
              </button>
            )}
            <button
              aria-label="Expand all"
              onClick={() => {
                setCollapsed(new Set());
                if (direction === "TB")
                  readFromStart(
                    layoutRuleGraph(parsed.graph, new Set(), direction).nodes,
                  );
              }}
            >
              <Layers size={16} />
              <span>Expand all</span>
            </button>
            <button
              aria-label="Fit view"
              onClick={() =>
                void flow.fitView({ padding: 0.18, duration: 400 })
              }
            >
              <Scan size={16} />
              <span>Fit view</span>
            </button>
          </div>
        </div>
        <div className="rv-body">
          <div className="rv-canvas" ref={canvasRef}>
            {parsed.error ? (
              <div role="alert" className="rv-error">
                <Braces size={30} />
                <h3>Unable to map this rule</h3>
                <p>{parsed.error}</p>
              </div>
            ) : (
              <ReactFlow<RuleNode>
                nodes={graph.nodes.map((n) => ({
                  ...n,
                  selected: n.id === selected,
                }))}
                edges={graph.edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                nodesDraggable={false}
                nodesConnectable={false}
                edgesFocusable={false}
                deleteKeyCode={null}
                onNodeClick={(_, node) => choose(node)}
                onPaneClick={() => setSelected(null)}
                fitView
                minZoom={0.005}
                maxZoom={1.8}
                panOnScroll={direction === "TB"}
                zoomOnScroll={direction !== "TB"}
                colorMode={mode}
                onlyRenderVisibleElements
                fitViewOptions={{ padding: 0.12 }}
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
                  nodeColor={(n) =>
                    n.data.kind === "none"
                      ? "#f08caa"
                      : n.data.kind === "or"
                        ? "#e0ad6d"
                        : n.data.kind === "constraint"
                          ? "#4bcab6"
                          : n.data.kind === "result"
                            ? "#f5b75c"
                            : "#8999f1"
                  }
                />
              </ReactFlow>
            )}
          </div>
          {inspectorOpen && (
            <aside className="rv-inspector">
              <div className="rv-inspector-title">
                <span>INSPECTOR</span>
                {current && (
                  <button
                    aria-label="Clear selection"
                    onClick={() => {
                      setSelected(null);
                      setInspectorOpen(false);
                    }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              {current ? (
                <>
                  <span className={`rv-pill rv-${current.data.kind}`}>
                    {current.data.kind}
                  </span>
                  <h3>{current.data.title}</h3>
                  <p className="rv-path">{current.id}</p>
                  {currentLogic && (
                    <div className={`rv-logic-detail rv-${current.data.kind}`}>
                      <div className="rv-gate-heading">
                        <span className="rv-logic-symbol" aria-hidden="true">
                          {currentLogic.symbol}
                        </span>
                        <strong>{currentLogic.label}</strong>
                      </div>
                      <p>{currentLogic.description}</p>
                      <span className="rv-requirement">
                        {current.data.subtitle}
                      </span>
                    </div>
                  )}
                  <h4>Source definition</h4>
                  <pre tabIndex={0}>
                    {JSON.stringify(current.data.source, null, 2)}
                  </pre>
                  <p className="rv-note">
                    Original JSON, preserved exactly. This view does not execute
                    operators.
                  </p>
                </>
              ) : (
                <>
                  <div className="rv-inspector-art">
                    <GitBranch size={42} />
                  </div>
                  <h3>
                    Every decision,
                    <br />
                    connected.
                  </h3>
                  <p>
                    Select any node to inspect its full definition, comparison
                    value and JSON path.
                  </p>
                  <div className="rv-stat">
                    <span>Total nodes</span>
                    <strong>{parsed.graph.nodes.length}</strong>
                  </div>
                  <div className="rv-stat">
                    <span>Visible nodes</span>
                    <strong>{graph.nodes.length}</strong>
                  </div>
                  <div className="rv-legend">
                    {(["and", "or", "none"] as const).map((kind) => (
                      <div key={kind} className={`rv-legend-row rv-${kind}`}>
                        <span className="rv-logic-symbol" aria-hidden="true">
                          {logicGroups[kind]!.symbol}
                        </span>
                        <div>
                          <strong>{kind.toUpperCase()}</strong>
                          <span>{logicGroups[kind]!.label}</span>
                        </div>
                        <span
                          className={`rv-line-sample rv-line-${kind}`}
                          aria-hidden="true"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="rv-note">
                    Links show nesting and result ownership, not execution order
                    or pass/fail status.
                  </p>
                </>
              )}
            </aside>
          )}
        </div>
        <footer className="rv-footer">
          <span>
            <span className="rv-status-dot" />{" "}
            {parsed.error
              ? "Invalid input"
              : `${graph.nodes.length} of ${parsed.graph.nodes.length} nodes on canvas`}
          </span>
          <span className="rv-footer-legend">
            <span className="rv-and">AND · all</span>
            <span className="rv-or">OR · at least one</span>
            <span className="rv-none">NONE · zero</span>
          </span>
          <span>
            {direction === "TB"
              ? "Scroll to read · Pinch to zoom"
              : "Scroll to zoom"}{" "}
            · Drag to explore · Select to inspect
          </span>
        </footer>
      </section>
    </InteractionContext>
  );
}
export function RuleVisualizer(props: RuleVisualizerProps) {
  const [view, setView] = useState<"decisions" | "structure">("decisions");
  return (
    <ReactFlowProvider key={view}>
      {view === "decisions" ? (
        <DecisionFlow {...props} onShowStructure={() => setView("structure")} />
      ) : (
        <Canvas {...props} onShowDecisions={() => setView("decisions")} />
      )}
    </ReactFlowProvider>
  );
}
