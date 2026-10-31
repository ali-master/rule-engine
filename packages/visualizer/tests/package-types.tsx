import { RuleVisualizer, createRuleGraph } from "@usex/rule-engine-visualizer";
<RuleVisualizer
  rule={{ conditions: { and: [] } }}
  theme="dark"
  onNodeSelect={(path, value) => {
    console.log(path, value);
  }}
/>;
createRuleGraph({ conditions: [] });
// @ts-expect-error Themes are restricted to supported color modes.
<RuleVisualizer rule={{ conditions: [] }} theme="purple" />;
