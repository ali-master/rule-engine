import { useUnifiedRuleStore } from "./stores/unified-rule-store";
import { ConditionTypes } from "@usex/rule-engine";
import { JsonViewer } from "./components/JsonVisualizer";

function StoreDebugComponent() {
  const store = useUnifiedRuleStore();

  const testBasicFlow = () => {
    console.log("=== Starting Basic Flow Test ===");

    // Step 1: Reset to clean state
    store.resetRule();
    console.log("After reset:", JSON.stringify(store.rule, null, 2));

    // Step 2: Add root AND condition (this is what the Add Condition Button does)
    console.log("Calling addCondition('', ConditionTypes.AND)...");
    store.addCondition("", ConditionTypes.AND);
    console.log("After adding root AND:", JSON.stringify(store.rule, null, 2));

    // Check if hasConditions would be true now
    const conditions = store.rule.conditions;
    let hasConditions = false;
    if (conditions) {
      if (Array.isArray(conditions)) {
        hasConditions = conditions.length > 0;
      } else {
        const condition = conditions as any;
        hasConditions =
          Object.keys(condition).length > 0 &&
          (condition.and !== undefined ||
            condition.or !== undefined ||
            condition.none !== undefined);
      }
    }
    console.log("hasConditions after adding root condition:", hasConditions);

    // Step 3: Add constraint to root AND
    store.addConstraint("and", {
      field: "user.age",
      operator: "greater_than" as any,
      value: 18,
    });
    console.log(
      "After adding constraint:",
      JSON.stringify(store.rule, null, 2),
    );

    console.log("=== Basic Flow Test Complete ===");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        Store Debug Test
      </h2>

      <button
        type="button"
        onClick={testBasicFlow}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
      >
        Test Basic Flow
      </button>

      <div className="mt-8">
        <h3 className="font-bold text-gray-900 dark:text-white">
          Current Rule State:
        </h3>
        <div className="bg-gray-50 dark:bg-background p-4 mt-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <JsonViewer
            data={store.rule}
            rootName="rule"
            defaultExpanded={true}
            highlightLogicalOperators={true}
            className="text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-bold text-gray-900 dark:text-white">
          History Info:
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Current: {store.getHistoryInfo().current}, Total:{" "}
          {store.getHistoryInfo().total}
        </p>
      </div>
    </div>
  );
}

export function StoreDebugTest() {
  return <StoreDebugComponent />;
}

export default StoreDebugTest;
