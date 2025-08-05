import React from "react";
import { useRuleBuilder } from "./stores/unified-rule-store";
import { ConditionTypes } from "@usex/rule-engine";
import { Button } from "./components/ui/button";
import {
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent,
  Card,
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { JsonViewer } from "./components/JsonVisualizer";
import {
  Zap,
  Trash2,
  Settings,
  RefreshCw,
  Plus,
  Play,
  GitBranch,
  Code2,
  CheckCircle2,
} from "lucide-react";

function TestComponent() {
  const { state, addCondition, addConstraint, resetRule } = useRuleBuilder();

  const [testStatus, setTestStatus] = React.useState<{
    running: boolean;
    currentStep: string;
    success: boolean;
  }>({ running: false, currentStep: "", success: false });

  const executeWithStatus = async (
    steps: Array<{ action: () => void; description: string }>,
  ) => {
    setTestStatus({ running: true, currentStep: "", success: false });

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setTestStatus((prev) => ({ ...prev, currentStep: step.description }));
      console.log(`Step ${i + 1}: ${step.description}`);
      step.action();
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    setTestStatus({ running: false, currentStep: "Complete!", success: true });
    setTimeout(() => {
      setTestStatus({ running: false, currentStep: "", success: false });
    }, 3000);
  };

  const handleAddRootCondition = () => {
    console.log("Adding root condition");
    addCondition("", ConditionTypes.AND);
  };

  const handleAddNestedCondition = () => {
    console.log("Adding nested condition");
    addCondition("and", ConditionTypes.OR);
  };

  const handleAddConstraint = () => {
    console.log("Adding constraint to root");
    addConstraint("and", {
      field: "user.age",
      operator: "equals" as any,
      value: 25,
    });
  };

  const handleReset = () => {
    console.log("Resetting rule");
    resetRule();
    setTestStatus({ running: false, currentStep: "", success: false });
  };

  const handleTestComplexStructure = async () => {
    await executeWithStatus([
      { action: () => resetRule(), description: "Resetting to clean state" },
      {
        action: () => addCondition("", ConditionTypes.AND),
        description: "Creating root AND condition",
      },
      {
        action: () =>
          addConstraint("and", {
            field: "user.age",
            operator: "greater_than" as any,
            value: 18,
          }),
        description: "Adding age constraint",
      },
      {
        action: () => addCondition("and", ConditionTypes.OR),
        description: "Adding nested OR condition",
      },
      {
        action: () =>
          addConstraint("and.0.or", {
            field: "user.name",
            operator: "equals" as any,
            value: "Alice",
          }),
        description: "Adding Alice constraint",
      },
      {
        action: () =>
          addConstraint("and.0.or", {
            field: "user.name",
            operator: "equals" as any,
            value: "Bob",
          }),
        description: "Adding Bob constraint",
      },
    ]);
  };

  const handleTestComprehensive = async () => {
    await executeWithStatus([
      { action: () => resetRule(), description: "Resetting to clean state" },
      {
        action: () => addCondition("", ConditionTypes.AND),
        description: "Creating root AND condition",
      },
      {
        action: () =>
          addConstraint("and", {
            field: "user.age",
            operator: "greater_than" as any,
            value: 18,
          }),
        description: "Adding age > 18 constraint",
      },
      {
        action: () =>
          addConstraint("and", {
            field: "user.role",
            operator: "equals" as any,
            value: "admin",
          }),
        description: "Adding admin role constraint",
      },
      {
        action: () => addCondition("and", ConditionTypes.OR),
        description: "Adding nested OR condition",
      },
      {
        action: () =>
          addConstraint("and.1.or", {
            field: "user.department",
            operator: "equals" as any,
            value: "IT",
          }),
        description: "Adding IT department constraint",
      },
      {
        action: () =>
          addConstraint("and.1.or", {
            field: "user.department",
            operator: "equals" as any,
            value: "Security",
          }),
        description: "Adding Security department constraint",
      },
    ]);
  };

  const hasConditions = React.useMemo(() => {
    if (!state.rule.conditions) return false;
    const condition = state.rule.conditions as any;

    // Check if the conditions object is empty (no keys)
    if (Object.keys(condition).length === 0) return false;

    return (
      (condition.and && condition.and.length > 0) ||
      (condition.or && condition.or.length > 0) ||
      (condition.none && condition.none.length > 0)
    );
  }, [state.rule.conditions]);

  const getConditionCount = () => {
    if (!hasConditions) return 0;
    const condition = state.rule.conditions as any;
    const andCount = condition.and?.length || 0;
    const orCount = condition.or?.length || 0;
    const noneCount = condition.none?.length || 0;
    return andCount + orCount + noneCount;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Code2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            Debug Testing Suite
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Interactive testing environment for rule engine operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={hasConditions ? "default" : "secondary"}>
            {getConditionCount()} Items
          </Badge>
          <Badge variant={state.isDirty ? "destructive" : "outline"}>
            {state.isDirty ? "Modified" : "Clean"}
          </Badge>
        </div>
      </div>

      {/* Test Status */}
      {testStatus.running && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin">
                <RefreshCw className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {testStatus.currentStep}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {testStatus.success && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                Test sequence completed successfully!
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Basic Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              Basic Operations
            </CardTitle>
            <CardDescription>
              Test individual rule engine operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleAddRootCondition}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Root Condition
              </Button>
              <Button
                onClick={handleAddNestedCondition}
                variant="outline"
                className="flex items-center gap-2"
                disabled={!hasConditions}
              >
                <GitBranch className="h-4 w-4" />
                Nested Condition
              </Button>
              <Button
                onClick={handleAddConstraint}
                variant="outline"
                className="flex items-center gap-2"
                disabled={!hasConditions}
              >
                <Plus className="h-4 w-4" />
                Add Constraint
              </Button>
              <Button
                onClick={handleReset}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Reset All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              Advanced Tests
            </CardTitle>
            <CardDescription>
              Automated test sequences for complex structures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleTestComplexStructure}
              className="w-full flex items-center gap-2"
              disabled={testStatus.running}
            >
              <Play className="h-4 w-4" />
              Complex Structure Test
            </Button>
            <Button
              onClick={handleTestComprehensive}
              variant="secondary"
              className="w-full flex items-center gap-2"
              disabled={testStatus.running}
            >
              <Play className="h-4 w-4" />
              Comprehensive Test Suite
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Rule Output */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Code2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Current Rule State
          </CardTitle>
          <CardDescription>
            JSON representation of the current rule structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-background p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <JsonViewer
              data={state.rule}
              rootName="rule"
              defaultExpanded={true}
              highlightLogicalOperators={true}
              className="text-gray-900 dark:text-gray-100"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DebugTest() {
  return <TestComponent />;
}

export default DebugTest;
