import type { Condition } from "@usex/rule-engine";
import type { FieldConfig } from "../types";
import { RuleEngine } from "@usex/rule-engine";
import {
  AlertCircle,
  FileJson,
  GitBranch,
  Keyboard,
  Maximize2,
  Minimize2,
  PlayCircle,
  Plus,
  Save,
  TestTube2,
} from "lucide-react";
import React, { useState } from "react";
import { toast, Toaster } from "sonner";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts";
import { cn } from "../lib/utils";
import { useEnhancedRuleStore } from "../stores/enhanced-rule-store";
import { AnimatedNumber } from "./AnimatedNumber";
import { EditableJsonViewer } from "./EditableJsonViewer";
import { HistoryViewer } from "./HistoryViewer";
import { ThemeToggle } from "./ThemeToggle";
import { TreeConditionGroup } from "./TreeConditionGroup";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Textarea } from "./ui/textarea";
import { UndoRedoInfo } from "./UndoRedoInfo";

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
  const {
    rule,
    updateConditions,
    undo,
    redo,
    canUndo,
    canRedo,
    getUndoInfo,
    getRedoInfo,
    getHistoryInfo,
    expandAll,
    collapseAll,
  } = useEnhancedRuleStore();

  const [expandedJson, setExpandedJson] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testData, setTestData] = useState(JSON.stringify(sampleData, null, 2));
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [isTestSheetOpen, setIsTestSheetOpen] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "z",
      ctrl: true,
      handler: () => canUndo() && undo(),
      description: "Undo last action",
    },
    {
      key: "y",
      ctrl: true,
      handler: () => canRedo() && redo(),
      description: "Redo last action",
    },
    {
      key: "z",
      ctrl: true,
      shift: true,
      handler: () => canRedo() && redo(),
      description: "Redo last action",
    },
    {
      key: "s",
      ctrl: true,
      handler: () => onSave && !readOnly && handleSave(),
      description: "Save rule",
    },
    {
      key: "e",
      ctrl: true,
      shift: true,
      handler: () => expandAll(),
      description: "Expand all groups",
    },
    {
      key: "c",
      ctrl: true,
      shift: true,
      handler: () => collapseAll(),
      description: "Collapse all groups",
    },
    {
      key: "r",
      ctrl: true,
      handler: () => !readOnly && addRootConditionGroup(),
      description: "Add new rule group",
    },
    {
      key: "t",
      ctrl: true,
      handler: () => setIsTestSheetOpen(true),
      description: "Test rule",
    },
    {
      key: "?",
      shift: true,
      handler: () => setShowKeyboardShortcuts(true),
      description: "Show keyboard shortcuts",
    },
  ]);

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

      const isPassed = Array.isArray(result)
        ? result.some((r) => r.isPassed)
        : result.isPassed;

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

  async function handleSave() {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave(rule);
      toast.success(mergedLabels.saveSuccess);
    } catch {
      toast.error("Failed to save rule");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Toaster position="top-center" />

      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Rule Builder</CardTitle>
              <Badge variant="outline">
                <AnimatedNumber value={conditions.length} />
                <span className="ml-1">groups</span>
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {showToolbar && (
                <>
                  <Sheet
                    open={isTestSheetOpen}
                    onOpenChange={setIsTestSheetOpen}
                  >
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
                  <UndoRedoInfo
                    canUndo={canUndo()}
                    canRedo={canRedo()}
                    onUndo={undo}
                    onRedo={redo}
                    undoInfo={getUndoInfo()}
                    redoInfo={getRedoInfo()}
                    historyInfo={getHistoryInfo()}
                  />
                  
                  <Separator orientation="vertical" className="h-6" />
                  
                  {/* History Viewer */}
                  <HistoryViewer />

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

                  {/* Expand/Collapse buttons */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={expandAll}
                    title="Expand all groups (Ctrl+Shift+E)"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={collapseAll}
                    title="Collapse all groups (Ctrl+Shift+C)"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Keyboard shortcuts */}
                  <Sheet
                    open={showKeyboardShortcuts}
                    onOpenChange={setShowKeyboardShortcuts}
                  >
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Keyboard shortcuts (?)"
                      >
                        <Keyboard className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Keyboard Shortcuts</SheetTitle>
                        <SheetDescription>
                          Use these shortcuts to work faster with the rule
                          builder
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">General</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Undo</span>
                              <kbd className="px-2 py-1 bg-muted rounded text-xs">
                                Ctrl+Z
                              </kbd>
                            </div>
                            <div className="flex justify-between">
                              <span>Redo</span>
                              <kbd className="px-2 py-1 bg-muted rounded text-xs">
                                Ctrl+Y
                              </kbd>
                            </div>
                            <div className="flex justify-between">
                              <span>Save</span>
                              <kbd className="px-2 py-1 bg-muted rounded text-xs">
                                Ctrl+S
                              </kbd>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Navigation</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Expand all</span>
                              <kbd className="px-2 py-1 bg-muted rounded text-xs">
                                Ctrl+Shift+E
                              </kbd>
                            </div>
                            <div className="flex justify-between">
                              <span>Collapse all</span>
                              <kbd className="px-2 py-1 bg-muted rounded text-xs">
                                Ctrl+Shift+C
                              </kbd>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Actions</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Add rule group</span>
                              <kbd className="px-2 py-1 bg-muted rounded text-xs">
                                Ctrl+R
                              </kbd>
                            </div>
                            <div className="flex justify-between">
                              <span>Test rule</span>
                              <kbd className="px-2 py-1 bg-muted rounded text-xs">
                                Ctrl+T
                              </kbd>
                            </div>
                            <div className="flex justify-between">
                              <span>Show shortcuts</span>
                              <kbd className="px-2 py-1 bg-muted rounded text-xs">
                                ?
                              </kbd>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
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
            <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/10">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <GitBranch className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No rules defined</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    {mergedLabels.noRules}
                  </p>
                  {!readOnly && (
                    <div className="flex justify-center gap-3">
                      <Button
                        onClick={() => addRootConditionGroup("or")}
                        size="default"
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add {mergedLabels.or} Group
                      </Button>
                      <Button
                        onClick={() => addRootConditionGroup("and")}
                        variant="secondary"
                        size="default"
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add {mergedLabels.and} Group
                      </Button>
                    </div>
                  )}
                </div>
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
              <EditableJsonViewer
                rule={rule}
                onUpdate={(updatedRule) => {
                  updateConditions(updatedRule.conditions);
                }}
                onImport={(imported) => {
                  if (onImport) {
                    onImport(JSON.stringify(imported), "json");
                  }
                  updateConditions(imported.conditions);
                  toast.success(mergedLabels.importSuccess);
                }}
                expanded={expandedJson}
                onExpandedChange={setExpandedJson}
                readOnly={readOnly}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
