import { RuleEngine } from "@usex/rule-engine";
import { AlertCircle, PlayCircle, TestTube } from "lucide-react";
import React, { useState } from "react";
import { toast, Toaster } from "sonner";
import { TreeRuleBuilder } from "./components/TreeRuleBuilder";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/ui/sheet";
import { Textarea } from "./components/ui/textarea";
import { useRuleStore } from "./stores/rule-store";
import "./styles/globals.css";

const sampleData = {
  user: {
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    isActive: true,
    role: "admin",
    tags: ["premium", "verified", "beta"],
    profile: {
      bio: "Software developer",
      preferences: {
        theme: "dark",
        notifications: true,
      },
    },
  },
  product: {
    id: "prod-456",
    name: "Premium Widget",
    price: 99.99,
    inStock: true,
    category: "electronics",
    tags: ["featured", "bestseller"],
  },
  order: {
    id: "order-789",
    total: 299.97,
    status: "processing",
    itemCount: 3,
    createdAt: new Date().toISOString(),
  },
};

export function App() {
  const { rule } = useRuleStore();
  const [testData, setTestData] = useState(JSON.stringify(sampleData, null, 2));
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleTestRule = async () => {
    setIsTestRunning(true);
    setTestResult(null);

    try {
      const data = JSON.parse(testData);
      const engine = new RuleEngine();
      const result = await engine.evaluate(rule, data);

      setTestResult({
        success: true,
        result,
        passed: result.isPassed,
      });

      toast.success(
        result.isPassed ? "Rule evaluation passed!" : "Rule evaluation failed!",
      );
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
      });
      toast.error("Error evaluating rule");
    } finally {
      setIsTestRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Rule Engine Builder</h1>
              <p className="text-muted-foreground mt-1">
                Build complex business rules with a tree structure
              </p>
            </div>

            {/* Evaluate Button */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button size="lg">
                  <TestTube className="h-5 w-5 mr-2" />
                  Evaluate Rule
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Evaluate Rule</SheetTitle>
                  <SheetDescription>
                    Test your rule against sample data
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Test Data (JSON)
                    </label>
                    <Textarea
                      value={testData}
                      onChange={(e) => setTestData(e.target.value)}
                      className="font-mono text-sm min-h-[300px]"
                      placeholder="Enter test data in JSON format"
                    />
                  </div>

                  <Button
                    onClick={handleTestRule}
                    disabled={isTestRunning}
                    className="w-full"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    {isTestRunning ? "Running..." : "Run Evaluation"}
                  </Button>

                  {testResult && (
                    <div className="space-y-3">
                      <Alert
                        variant={
                          testResult.success
                            ? testResult.passed
                              ? "default"
                              : "destructive"
                            : "destructive"
                        }
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {testResult.success
                            ? testResult.passed
                              ? "✅ Rule evaluation passed"
                              : "❌ Rule evaluation failed"
                            : "⚠️ Error during evaluation"}
                        </AlertDescription>
                      </Alert>

                      {testResult.success && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Result</label>
                          <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                            {JSON.stringify(testResult.result, null, 2)}
                          </pre>
                        </div>
                      )}

                      {testResult.error && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Error</label>
                          <pre className="text-xs bg-destructive/10 text-destructive p-3 rounded-md">
                            {testResult.error}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <TreeRuleBuilder
          sampleData={sampleData}
          onChange={React.useCallback(
            (rule: any) => console.log("Rule:", rule),
            [],
          )}
        />
      </main>
    </div>
  );
}

// Initialize theme
if (typeof window !== "undefined") {
  const root = document.documentElement;
  const theme = localStorage.getItem("rule-builder-theme") || "system";

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
}
