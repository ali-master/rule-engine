import type {
  EvaluationResult,
  Constraint,
  Condition,
} from "@usex/rule-engine";
import { RuleEngine } from "@usex/rule-engine";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  XCircle,
  Play,
  Info,
  FileJson,
  EyeOff,
  Eye,
  Cpu,
  Code,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Activity,
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { sampleEcommerceData } from "../data/sample-data";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts";
import { cn } from "../lib/utils";
import { useRuleBuilder } from "../stores/unified-rule-store";
import { EditableJsonViewer } from "./editable-json-viewer";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CardHeader, CardContent, Card } from "./ui/card";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Switch } from "./ui/switch";
import { TabsTrigger, TabsList, TabsContent, Tabs } from "./ui/tabs";
import {
  TooltipTrigger,
  TooltipProvider,
  TooltipContent,
  Tooltip,
} from "./ui/tooltip";

interface EvaluationDetails {
  condition: Condition;
  path: string;
  result: boolean;
  message?: string;
  constraints?: Array<{
    constraint: Constraint;
    passed: boolean;
    actualValue?: any;
    message?: string;
  }>;
  subConditions?: EvaluationDetails[];
}

interface RuleEvaluatorProps {
  className?: string;
  defaultSampleData?: any;
  onEvaluationChange?: (result: EvaluationResult | null) => void;
}

/**
 * Modern Rule Evaluator with enhanced UX and mobile-optimized design
 *
 * Features:
 * - Clean, modern interface with proper visual hierarchy
 * - Mobile-first responsive design
 * - Enhanced dark mode support
 * - Real-time evaluation with performance indicators
 * - Progressive disclosure of complex information
 * - Accessible design with proper ARIA labels
 */
export const RuleEvaluator: React.FC<RuleEvaluatorProps> = ({
  className,
  defaultSampleData = sampleEcommerceData,
  onEvaluationChange,
}) => {
  const { state } = useRuleBuilder();
  const rule = state.rule;
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [sampleData, setSampleData] = useState(defaultSampleData);
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResult | null>(null);
  const [evaluationDetails, setEvaluationDetails] = useState<
    EvaluationDetails[]
  >([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    () => new Set(),
  );
  const [activeTab, setActiveTab] = useState<"result" | "details" | "data">(
    "result",
  );

  // Helper to get value by path
  const getValueByPath = (obj: any, path: string): any => {
    try {
      return path.split(".").reduce((curr, key) => {
        if (key.includes("[") && key.includes("]")) {
          const [arrayKey, indexStr] = key.split("[");
          const index = Number.parseInt(indexStr.replace("]", ""));
          return curr?.[arrayKey]?.[index];
        }
        return curr?.[key];
      }, obj);
    } catch {
      return undefined;
    }
  };

  // Evaluate individual constraint (defined first to avoid use-before-define)
  const evaluateConstraint = useCallback(
    (
      constraint: Constraint,
      data: any,
    ): {
      constraint: Constraint;
      passed: boolean;
      actualValue?: any;
      message?: string;
    } => {
      try {
        // Extract the actual value from data using the field path
        const actualValue = getValueByPath(data, constraint.field);

        // Simple evaluation logic - in real implementation, this would use the rule engine
        let passed = false;

        // This is a simplified version - the actual evaluation would be done by the rule engine
        switch (constraint.operator) {
          case "equals":
            passed = actualValue === constraint.value;
            break;
          case "not-equals":
            passed = actualValue !== constraint.value;
            break;
          case "greater-than":
            passed = actualValue > (constraint.value ?? 0);
            break;
          case "less-than":
            passed = actualValue < (constraint.value ?? 0);
            break;
          case "contains":
            passed = actualValue?.includes?.(constraint.value) || false;
            break;
          case "exists":
            passed = actualValue !== undefined && actualValue !== null;
            break;
          case "not-exists":
            passed = actualValue === undefined || actualValue === null;
            break;
          default:
            // For other operators, we'd need the actual rule engine evaluation
            passed = false;
        }

        return {
          constraint,
          passed,
          actualValue,
          message: constraint.message,
        };
      } catch {
        return {
          constraint,
          passed: false,
          message: "Error evaluating constraint",
        };
      }
    },
    [],
  );

  // Evaluate condition details for visualization
  const evaluateConditionDetails = useCallback(
    (
      conditions: Condition | Condition[],
      data: any,
      parentPath: string,
    ): EvaluationDetails | EvaluationDetails[] => {
      if (Array.isArray(conditions)) {
        return conditions.map((cond, index) =>
          evaluateConditionDetails(cond, data, `${parentPath}[${index}]`),
        ) as EvaluationDetails[];
      }

      const condition = conditions;
      const path = parentPath || "root";
      const details: EvaluationDetails = {
        condition,
        path,
        result: false,
        constraints: [],
        subConditions: [],
      };

      // Evaluate AND conditions
      if (condition.and) {
        const andResults: EvaluationDetails[] = [];
        let allPassed = true;

        for (let i = 0; i < condition.and.length; i++) {
          const item = condition.and[i];
          const itemPath = `${path}.and[${i}]`;

          if ("field" in item) {
            // It's a constraint
            const constraintResult = evaluateConstraint(
              item as Constraint,
              data,
            );
            details.constraints?.push(constraintResult);
            if (!constraintResult.passed) allPassed = false;
          } else {
            // It's a sub-condition
            const subResult = evaluateConditionDetails(
              item as Condition,
              data,
              itemPath,
            );
            andResults.push(subResult as EvaluationDetails);
            if (!(subResult as EvaluationDetails).result) allPassed = false;
          }
        }

        details.result = allPassed;
        details.subConditions = andResults;
      }

      // Evaluate OR conditions
      else if (condition.or) {
        const orResults: EvaluationDetails[] = [];
        let anyPassed = false;

        for (let i = 0; i < condition.or.length; i++) {
          const item = condition.or[i];
          const itemPath = `${path}.or[${i}]`;

          if ("field" in item) {
            // It's a constraint
            const constraintResult = evaluateConstraint(
              item as Constraint,
              data,
            );
            details.constraints?.push(constraintResult);
            if (constraintResult.passed) anyPassed = true;
          } else {
            // It's a sub-condition
            const subResult = evaluateConditionDetails(
              item as Condition,
              data,
              itemPath,
            );
            orResults.push(subResult as EvaluationDetails);
            if ((subResult as EvaluationDetails).result) anyPassed = true;
          }
        }

        details.result = anyPassed;
        details.subConditions = orResults;
      }

      // Evaluate NONE conditions
      else if (condition.none) {
        const noneResults: EvaluationDetails[] = [];
        let nonePassed = true;

        for (let i = 0; i < condition.none.length; i++) {
          const item = condition.none[i];
          const itemPath = `${path}.none[${i}]`;

          if ("field" in item) {
            // It's a constraint
            const constraintResult = evaluateConstraint(
              item as Constraint,
              data,
            );
            details.constraints?.push({
              ...constraintResult,
              passed: !constraintResult.passed, // Invert for NONE
            });
            if (constraintResult.passed) nonePassed = false;
          } else {
            // It's a sub-condition
            const subResult = evaluateConditionDetails(
              item as Condition,
              data,
              itemPath,
            );
            noneResults.push(subResult as EvaluationDetails);
            if ((subResult as EvaluationDetails).result) nonePassed = false;
          }
        }

        details.result = nonePassed;
        details.subConditions = noneResults;
      }

      return details;
    },
    [evaluateConstraint],
  );

  // Evaluate rule function
  const evaluateRule = useCallback(async () => {
    if (!rule || !rule.conditions) {
      setError("No rule to evaluate");
      return;
    }

    setIsEvaluating(true);
    setError(null);

    try {
      // Evaluate the rule
      const result = await RuleEngine.evaluate(rule, sampleData);
      const evalResult = Array.isArray(result) ? result[0] : result;

      setEvaluationResult(evalResult);

      // Generate detailed evaluation info
      const details = evaluateConditionDetails(rule.conditions, sampleData, "");
      setEvaluationDetails(Array.isArray(details) ? details : [details]);

      if (onEvaluationChange) {
        onEvaluationChange(evalResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
      setEvaluationResult(null);
      setEvaluationDetails([]);

      if (onEvaluationChange) {
        onEvaluationChange(null);
      }
    } finally {
      setIsEvaluating(false);
    }
  }, [rule, sampleData, onEvaluationChange, evaluateConditionDetails]);

  // Toggle live evaluation mode
  const toggleLiveMode = useCallback(() => {
    setIsLiveMode(!isLiveMode);
  }, [isLiveMode]);

  // Run evaluation once
  const runEvaluationOnce = useCallback(() => {
    evaluateRule();
  }, [evaluateRule]);

  // Setup keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "e",
      ctrl: true,
      handler: toggleLiveMode,
      description: "Toggle live evaluation",
    },
    {
      key: "e",
      ctrl: true,
      shift: true,
      handler: runEvaluationOnce,
      description: "Run evaluation once",
    },
  ]);

  // Live evaluation effect
  useEffect(() => {
    if (isLiveMode) {
      evaluateRule();
    }
  }, [isLiveMode, rule, sampleData, evaluateRule]);

  // Toggle expanded state for a path
  const toggleExpanded = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  }, []);

  // Get condition type label
  const getConditionType = (condition: Condition): string => {
    if (condition.and) return `AND (${condition.and.length} conditions)`;
    if (condition.or) return `OR (${condition.or.length} conditions)`;
    if (condition.none) return `NONE (${condition.none.length} conditions)`;
    return "Condition";
  };

  // Render evaluation details recursively
  const renderEvaluationDetails = (
    details: EvaluationDetails,
    depth = 0,
  ): React.ReactNode => {
    const isExpanded = expandedPaths.has(details.path);
    const hasChildren =
      (details.subConditions?.length || 0) > 0 ||
      (details.constraints?.length || 0) > 0;

    return (
      <div key={details.path} className="relative">
        <div
          className={cn(
            "flex items-center gap-2 py-2 px-3 rounded-md transition-colors cursor-pointer hover:bg-accent",
            depth > 0 && "ml-6",
            details.result
              ? "bg-green-50 dark:bg-green-950/20"
              : "bg-red-50 dark:bg-red-950/20",
          )}
          onClick={() => hasChildren && toggleExpanded(details.path)}
        >
          {hasChildren && (
            <button type="button" className="p-0.5">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}

          <div className="flex items-center gap-2 flex-1">
            {details.result ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}

            <span className="text-sm font-medium">
              {getConditionType(details.condition)}
            </span>

            {details.condition.result && (
              <Badge variant="outline" className="ml-2 text-xs">
                Result: {JSON.stringify(details.condition.result.value)}
              </Badge>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Render constraints */}
              {details.constraints?.map((constraint, index) => (
                <div
                  key={`${details.path}-constraint-${index}`}
                  className={cn(
                    "flex items-center gap-2 py-1.5 px-3 ml-8 text-sm",
                    constraint.passed ? "text-green-600" : "text-red-600",
                  )}
                >
                  {constraint.passed ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  <span className="font-mono text-xs">
                    {constraint.constraint.field}{" "}
                    {constraint.constraint.operator}{" "}
                    {JSON.stringify(constraint.constraint.value)}
                  </span>
                  {constraint.actualValue !== undefined && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (actual: {JSON.stringify(constraint.actualValue)})
                    </span>
                  )}
                </div>
              ))}

              {/* Render sub-conditions */}
              {details.subConditions?.map((subDetail) => (
                <div key={subDetail.path} className="ml-4">
                  {renderEvaluationDetails(subDetail, depth + 1)}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Result indicator component
  const ResultIndicator = () => {
    if (!evaluationResult && !error) return null;

    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm backdrop-blur-sm border",
          evaluationResult?.isPassed
            ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
        )}
      >
        {evaluationResult?.isPassed ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            <span>Pass</span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4" />
            <span>Fail</span>
          </>
        )}
      </motion.div>
    );
  };

  return (
    <TooltipProvider>
      <Card className={cn("h-full flex flex-col shadow-sm", className)}>
        {/* Modern Header */}
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50">
                <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Rule Evaluator
                </h3>
                <p className="text-sm text-muted-foreground">
                  Test rules with live data evaluation
                </p>
              </div>
            </div>
            <ResultIndicator />
          </div>
        </CardHeader>

        {/* Content Area */}
        <CardContent className="flex-1 min-h-0 space-y-4 overflow-hidden">
          {/* Control Panel */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg border">
            {/* Live Mode Toggle */}
            <div className="flex items-center gap-3">
              <Switch
                id="live-mode"
                checked={isLiveMode}
                onCheckedChange={setIsLiveMode}
              />
              <Label
                htmlFor="live-mode"
                className="text-sm font-medium cursor-pointer"
              >
                Live Mode
              </Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">Ctrl/Cmd + E to toggle</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant={showDetails ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="h-8"
              >
                {showDetails ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Details</span>
                  </>
                )}
              </Button>

              {/* Run Once Button */}
              {!isLiveMode && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      onClick={runEvaluationOnce}
                      disabled={isEvaluating}
                      className="h-8"
                    >
                      {isEvaluating ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="mr-1"
                        >
                          <Zap className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <Play className="h-4 w-4 mr-1" />
                      )}
                      <span className="hidden sm:inline">
                        {isEvaluating ? "Running..." : "Evaluate"}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="font-medium">Ctrl/Cmd + Shift + E</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  Evaluation Error
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            </motion.div>
          )}

          {/* Detailed View */}
          <AnimatePresence mode="wait">
            {showDetails ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-h-0"
              >
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as any)}
                  className="h-full flex flex-col"
                >
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="result" className="text-sm">
                      <Activity className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Result</span>
                    </TabsTrigger>
                    <TabsTrigger value="details" className="text-sm">
                      <Code className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Details</span>
                    </TabsTrigger>
                    <TabsTrigger value="data" className="text-sm">
                      <FileJson className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Data</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex-1 min-h-0">
                    {/* Result Tab */}
                    <TabsContent value="result" className="h-full m-0">
                      {evaluationResult ? (
                        <div className="space-y-4">
                          <div
                            className={cn(
                              "p-6 rounded-xl border shadow-sm",
                              evaluationResult.isPassed
                                ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                                : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
                            )}
                          >
                            <div className="flex items-center gap-3 mb-4">
                              {evaluationResult.isPassed ? (
                                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                              )}
                              <div>
                                <h3 className="text-xl font-semibold">
                                  Rule{" "}
                                  {evaluationResult.isPassed
                                    ? "Passed"
                                    : "Failed"}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {evaluationResult.isPassed
                                    ? "All conditions were satisfied"
                                    : "One or more conditions failed"}
                                </p>
                              </div>
                            </div>

                            {evaluationResult.value && (
                              <div>
                                <Label className="text-sm font-medium mb-2 block">
                                  Result Value:
                                </Label>
                                <div className="p-3 bg-background rounded-lg border">
                                  <pre className="text-sm font-mono overflow-x-auto">
                                    {JSON.stringify(
                                      evaluationResult.value,
                                      null,
                                      2,
                                    )}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center space-y-3">
                            <Activity className="h-12 w-12 text-muted-foreground mx-auto" />
                            <div>
                              <h3 className="font-medium">No Results Yet</h3>
                              <p className="text-sm text-muted-foreground">
                                {isLiveMode
                                  ? "Waiting for rule changes..."
                                  : 'Click "Evaluate" to test your rule'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details" className="h-full m-0">
                      <ScrollArea className="h-full">
                        <div className="space-y-2">
                          {evaluationDetails.length > 0 ? (
                            evaluationDetails.map((detail) =>
                              renderEvaluationDetails(detail),
                            )
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center space-y-3">
                                <Code className="h-12 w-12 text-muted-foreground mx-auto" />
                                <div>
                                  <h3 className="font-medium">
                                    No Details Available
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    Run an evaluation to see detailed breakdown
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Test Data Tab */}
                    <TabsContent value="data" className="h-full m-0">
                      <div className="space-y-4 h-full flex flex-col">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base font-medium">
                              Test Data
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Edit the data used for evaluation
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSampleData(defaultSampleData)}
                          >
                            Reset
                          </Button>
                        </div>
                        <div className="flex-1 min-h-0">
                          <EditableJsonViewer
                            rule={sampleData}
                            onUpdate={setSampleData}
                            className="h-full"
                            readOnly={false}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </motion.div>
            ) : (
              /* Compact Result View */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted/30 flex items-center justify-center">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Ready to Evaluate</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isLiveMode
                        ? "Live mode is active - changes will evaluate automatically"
                        : "Click evaluate to test your rule, or enable live mode"}
                    </p>
                    {!isLiveMode && (
                      <Button
                        onClick={runEvaluationOnce}
                        disabled={isEvaluating}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Run Evaluation
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
