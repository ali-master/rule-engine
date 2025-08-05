import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RuleBuilder } from "./components/rule-builder";
import { ecommerceFields } from "./data/sample-data";
import { operatorConfigs } from "./utils/operators";
import "./styles/globals.css";

function TestDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Rule Builder Test Demo
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <RuleBuilder
            fields={ecommerceFields}
            operators={operatorConfigs}
            onRuleChange={(rule: any) => {
              console.log("Rule changed:", JSON.stringify(rule, null, 2));
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Only render if this is the main demo file being loaded
if (typeof window !== "undefined" && document.getElementById("root")) {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <TestDemo />
    </StrictMode>,
  );
}

export default TestDemo;
