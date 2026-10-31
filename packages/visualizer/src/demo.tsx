import { useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { RuleVisualizer, createRuleGraph } from "./index";
import type { RuleType } from "@usex/rule-engine";
import commercePolicy from "./examples/commerce-policy.json";
import "./demo.css";
const businessRule = commercePolicy as RuleType;
const policyGraph = createRuleGraph(businessRule);
const policyStats = {
  constraints: policyGraph.nodes.filter(
    (node) => node.data.kind === "constraint",
  ).length,
  groups: policyGraph.nodes.filter((node) =>
    ["and", "or", "none"].includes(node.data.kind),
  ).length,
  fields: new Set(
    policyGraph.nodes
      .filter((node) => node.data.kind === "constraint")
      .map((node) => node.data.title),
  ).size,
};
function App() {
  const [scope, setScope] = useState("all");
  const [customRule, setCustomRule] = useState<{ rule: RuleType } | null>(null);
  const [revision, setRevision] = useState(0);
  const [draft, setDraft] = useState(JSON.stringify(businessRule, null, 2));
  const rule = useMemo(
    () =>
      customRule
        ? customRule.rule
        : scope === "all"
          ? businessRule
          : ({
              conditions: [commercePolicy.conditions[Number(scope)]],
              default: commercePolicy.default,
            } as RuleType),
    [scope, customRule],
  );
  const title = customRule
    ? "Custom rule"
    : scope === "all"
      ? "Commerce order orchestration"
      : commercePolicy.conditions[Number(scope)].result.message;
  const [error, setError] = useState("");
  return (
    <main className="demo-workspace">
      <header className="demo-policy-header">
        <div>
          <span className="demo-kicker">
            BUSINESS POLICY / COMMERCE OPERATIONS
          </span>
          <h1>One order. Every operational decision.</h1>
          <p>
            11 ordered routes · {policyStats.constraints} checks ·{" "}
            {policyStats.groups} logical groups · {policyStats.fields} fields
          </p>
        </div>
        <label className="demo-route-picker">
          Explore a business route
          <select
            aria-label="Business route"
            value={customRule ? "custom" : scope}
            onChange={(event) => {
              setScope(event.target.value);
              setCustomRule(null);
              setError("");
            }}
          >
            {customRule && <option value="custom">Custom JSON</option>}
            <option value="all">Full policy — all 11 routes</option>
            {commercePolicy.conditions.map((condition, index) => (
              <option key={condition.result.value.route} value={String(index)}>
                {condition.result.message}
              </option>
            ))}
          </select>
          <small>
            {customRule
              ? "Custom JSON view"
              : scope === "all"
                ? "First matching route wins · open a decision or choose a route"
                : "Isolated branch + fallback · other routes hidden"}
          </small>
        </label>
      </header>
      <RuleVisualizer
        key={`${customRule ? "custom" : scope}-${revision}`}
        rule={rule}
        initialCollapsedPaths={
          !customRule && scope === "all"
            ? commercePolicy.conditions.map(
                (_, index) => `$.conditions[${index}]`,
              )
            : []
        }
        title={title}
        style={{ height: "calc(100vh - 150px)", minHeight: 560 }}
      />
      <details
        style={{
          marginTop: 10,
          border: "1px solid #e2e5e9",
          borderRadius: 12,
          padding: 10,
        }}
      >
        <summary style={{ cursor: "pointer" }}>
          Full policy JSON — edit or bring your own rule
        </summary>
        <textarea
          aria-label="Rule JSON"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          style={{
            width: "100%",
            height: 300,
            marginTop: 16,
            background: "#fff",
            color: "#283343",
            border: "1px solid #e2e5e9",
            padding: 16,
            fontFamily: "monospace",
          }}
        />
        <button
          style={{ padding: "10px 20px", marginTop: 10, cursor: "pointer" }}
          onClick={() => {
            try {
              setCustomRule({ rule: JSON.parse(draft) });
              setRevision((value) => value + 1);
              setError("");
            } catch {
              setError("Invalid JSON. Check commas and brackets.");
            }
          }}
        >
          Visualize rule
        </button>
        <p role="alert">{error}</p>
      </details>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
