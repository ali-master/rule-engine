import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { TreeConditionGroup } from "./TreeConditionGroup";
import { ThemeToggle } from "./ThemeToggle";
import { JsonViewer } from "./JsonViewer";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Plus,
  Undo2,
  Redo2,
  Save,
  FileJson,
  HelpCircle,
  PlayCircle,
  AlertCircle,
  TestTube2,
} from "lucide-react";
import { useRuleStore } from "../stores/rule-store";
import { RuleEngine } from "@usex/rule-engine";
import type { Condition } from "@usex/rule-engine";
import type { FieldConfig } from "../types";
import { cn } from "../lib/utils";
import { Toaster, toast } from "sonner";

interface TreeRuleBuilderProps {
  fields?: FieldConfig[];
  sampleData?: Record<string, any>;
  onChange?: (rule: any) => void;
  onSave?: (rule: any) => void | Promise<void>;
  onExport?: (rule: any, format: "json" | "yaml") => void;
  onImport?: (data: string, format: "json" | "yaml") => void;
  readOnly?: boolean;
  className?: string;
  showJsonViewer?: boolean;
  showToolbar?: boolean;
  maxNestingDepth?: number;
  customOperators?: Record<string, any>;
  theme?: "light" | "dark" | "system";
  labels?: {
    addGroup?: string;
    addRule?: string;
    removeGroup?: string;
    duplicateGroup?: string;
    or?: string;
    and?: string;
    none?: string;
    noRules?: string;
    importSuccess?: string;
    exportSuccess?: string;
    saveSuccess?: string;
  };
  colors?: {
    or?: string;
    and?: string;
    none?: string;
  };
}

export const TreeRuleBuilder: React.FC<TreeRuleBuilderProps> = ({
  fields = [],
  sampleData = {},
  onChange,
  onSave,
  onExport,
  onImport,
  readOnly = false,
  className,
  showJsonViewer = true,
  showToolbar = true,
  maxNestingDepth = 10,
  customOperators,
  theme: _propTheme = "system",
  labels = {},
  colors = {},
}) => {
  const { rule, updateConditions, undo, redo, canUndo, canRedo } =
    useRuleStore();

  const [expandedJson, setExpandedJson] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testData, setTestData] = useState(JSON.stringify(sampleData, null, 2));
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [isTestSheetOpen, setIsTestSheetOpen] = useState(false);

  // Merge default labels
  const mergedLabels = {
    addGroup: "Add Condition Group",
    addRule: "Add Rule",
    removeGroup: "Remove Group",
    duplicateGroup: "Duplicate Group",
    or: "OR",
    and: "AND",
    none: "NONE",
    noRules: "No rules defined yet. Start by adding a condition group.",
    importSuccess: "Rule imported successfully",
    exportSuccess: "Rule exported successfully",
    saveSuccess: "Rule saved successfully",
    ...labels,
  };

  // Debounce onChange
  const onChangeTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (onChange) {
      if (onChangeTimerRef.current) {
        clearTimeout(onChangeTimerRef.current);
      }

      onChangeTimerRef.current = setTimeout(() => {
        onChange(rule);
      }, 100);
    }

    return () => {
      if (onChangeTimerRef.current) {
        clearTimeout(onChangeTimerRef.current);
      }
    };
  }, [rule]);

  const conditions = React.useMemo(() => {
    if (!rule.conditions) return [];
    return Array.isArray(rule.conditions) ? rule.conditions : [rule.conditions];
  }, [rule.conditions]);

  const handleTestRule = async () => {
    setIsTestRunning(true);
    setTestResult(null);

    try {
      const data = JSON.parse(testData);
      const engine = new RuleEngine();
      const result = await engine.evaluate(rule, data);

      const isPassed = Array.isArray(result) ? result.some(r => r.isPassed) : result.isPassed;
      
      setTestResult({
        success: true,
        result,
        passed: isPassed,
      });

      toast.success(isPassed ? "Rule passed!" : "Rule failed!");
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

  const addRootConditionGroup = (type: "or" | "and" | "none" = "or") => {
    const newCondition: Condition = { [type]: [] };
    updateConditions([...conditions, newCondition]);
    toast.success("Added new condition group");
  };

  const updateCondition = (index: number, condition: Condition) => {
    const updatedConditions = [...conditions];
    updatedConditions[index] = condition;
    updateConditions(updatedConditions);
  };

  const removeCondition = (index: number) => {
    updateConditions(conditions.filter((_, i) => i !== index));
    toast.success("Removed condition group");
  };

  const duplicateCondition = (index: number) => {
    const conditionToDuplicate = conditions[index];
    const duplicated = JSON.parse(JSON.stringify(conditionToDuplicate));
    updateConditions([...conditions, duplicated]);
    toast.success("Duplicated condition group");
  };

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave(rule);
      toast.success(mergedLabels.saveSuccess);
    } catch (error) {
      toast.error("Failed to save rule");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Toaster position="top-center" />

      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Rule Builder</CardTitle>
              <Badge variant="outline">{conditions.length} groups</Badge>
            </div>
            <div className="flex items-center gap-2">
              {showToolbar && (
                <>
                  <Sheet open={isTestSheetOpen} onOpenChange={setIsTestSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <TestTube2 className="h-4 w-4 mr-2" />
                        Test Rule
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[500px] sm:max-w-[500px]">
                      <SheetHeader>
                        <SheetTitle>Test Rule</SheetTitle>
                        <SheetDescription>
                          Test your rule with sample data to see how it behaves
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
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
                          {isTestRunning ? "Running..." : "Run Test"}
                        </Button>

                        {testResult && (
                          <div className="space-y-4">
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
                                    ? "Rule evaluation passed"
                                    : "Rule evaluation failed"
                                  : "Error during evaluation"}
                              </AlertDescription>
                            </Alert>

                            {testResult.success && (
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Result
                                </label>
                                <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                                  {JSON.stringify(testResult.result, null, 2)}
                                </pre>
                              </div>
                            )}

                            {testResult.error && (
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Error
                                </label>
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

                  <Separator orientation="vertical" className="h-6" />

                  {/* History controls */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => undo()}
                    disabled={!canUndo() || readOnly}
                    title="Undo"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => redo()}
                    disabled={!canRedo() || readOnly}
                    title="Redo"
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>

                  {onSave && (
                    <>
                      <Separator orientation="vertical" className="h-6" />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSave}
                        disabled={readOnly || isSaving}
                        title="Save"
                      >
                        <Save
                          className={cn("h-4 w-4", isSaving && "animate-pulse")}
                        />
                      </Button>
                    </>
                  )}

                  {onExport && (
                    <>
                      <Separator orientation="vertical" className="h-6" />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          onExport(rule, "json");
                          toast.success(mergedLabels.exportSuccess);
                        }}
                        title="Export JSON"
                      >
                        <FileJson className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  <Separator orientation="vertical" className="h-6" />
                  <Button variant="ghost" size="icon" title="Help">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Builder Area */}
        <div className="lg:col-span-2 space-y-4">
          {conditions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {mergedLabels.noRules}
                </p>
                {!readOnly && (
                  <div className="flex justify-center gap-2">
                    <Button onClick={() => addRootConditionGroup("or")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add {mergedLabels.or} Group
                    </Button>
                    <Button
                      onClick={() => addRootConditionGroup("and")}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add {mergedLabels.and} Group
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {conditions.map((condition, index) => (
                  <TreeConditionGroup
                    key={`condition-${index}`}
                    condition={condition}
                    path={[index]}
                    depth={0}
                    fields={fields}
                    sampleData={sampleData}
                    customOperators={customOperators}
                    maxNestingDepth={maxNestingDepth}
                    onUpdate={(updated) => updateCondition(index, updated)}
                    onRemove={() => removeCondition(index)}
                    onDuplicate={() => duplicateCondition(index)}
                    readOnly={readOnly}
                    labels={mergedLabels}
                    colors={colors}
                  />
                ))}
              </div>
              {!readOnly && (
                <Button
                  onClick={() => addRootConditionGroup()}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {mergedLabels.addGroup}
                </Button>
              )}
            </>
          )}
        </div>

        {/* JSON Viewer */}
        {showJsonViewer && (
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <JsonViewer
                rule={rule}
                onImport={(imported) => {
                  if (onImport) {
                    onImport(JSON.stringify(imported), "json");
                  }
                  updateConditions(imported.conditions);
                  toast.success(mergedLabels.importSuccess);
                }}
                expanded={expandedJson}
                onExpandedChange={setExpandedJson}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};