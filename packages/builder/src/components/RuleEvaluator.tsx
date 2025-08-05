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
import { EditableJsonViewer } from "./EditableJsonViewer";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
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
          "flex items-center gap-2 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm font-medium",
          evaluationResult?.isPassed
            ? "bg-gradient-to-r from-green-500/15 to-emerald-500/15 text-green-600 dark:text-green-400 ring-1 ring-green-500/20"
            : "bg-gradient-to-r from-red-500/15 to-rose-500/15 text-red-600 dark:text-red-400 ring-1 ring-red-500/20",
        )}
      >
        {evaluationResult?.isPassed ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">Pass</span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Fail</span>
          </>
        )}
      </motion.div>
    );
  };

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "rounded-xl shadow-xl border-0 bg-gradient-to-br from-background to-muted/50 overflow-hidden backdrop-blur-sm",
          className,
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-b border-border/50 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20 shadow-inner">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Rule Evaluator
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Test your rules with live data evaluation
                </p>
              </div>
            </div>
            {/* Result Indicator (Silent Mode) - Keep this on the right for quick visibility */}
            {!showDetails && <ResultIndicator />}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 bg-gradient-to-b from-background/50 to-background">
          {/* Control Panel */}
          <div className="mb-6 p-4 bg-gradient-to-r from-muted/30 to-muted/20 border border-border/50 rounded-xl backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Live Mode Toggle */}
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-background/80 backdrop-blur-md border border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
                <Switch
                  id="live-mode"
                  checked={isLiveMode}
                  onCheckedChange={setIsLiveMode}
                />
                <Label htmlFor="live-mode" className="text-sm font-semibold">
                  Live Mode
                </Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="bg-popover/95 backdrop-blur-sm"
                  >
                    <p className="font-medium">Ctrl/Cmd + E to toggle</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant={showDetails ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="rounded-full shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                >
                  {showDetails ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Details
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
                        className="rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                      >
                        {isEvaluating ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="mr-2"
                          >
                            <Zap className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {isEvaluating ? "Evaluating..." : "Evaluate"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="bg-popover/95 backdrop-blur-sm"
                    >
                      <p className="font-medium">Ctrl/Cmd + Shift + E</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 rounded-xl flex items-center gap-3 shadow-sm"
            >
              <div className="p-2.5 rounded-lg bg-destructive/15 ring-1 ring-destructive/20">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-semibold text-destructive">
                  Evaluation Error
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  {error}
                </p>
              </div>
            </motion.div>
          )}

          {/* Detailed View */}
          <AnimatePresence mode="wait">
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-6" />

                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as any)}
                  className="space-y-6"
                >
                  <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-muted/40 to-muted/60 p-1.5 rounded-xl shadow-inner backdrop-blur-sm">
                    <TabsTrigger
                      value="result"
                      className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-200 font-medium"
                    >
                      <Activity className="h-4 w-4" />
                      Result
                    </TabsTrigger>
                    <TabsTrigger
                      value="details"
                      className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-200 font-medium"
                    >
                      <Code className="h-4 w-4" />
                      Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="data"
                      className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-200 font-medium"
                    >
                      <FileJson className="h-4 w-4" />
                      Test Data
                    </TabsTrigger>
                  </TabsList>

                  {/* Result Tab */}
                  <TabsContent value="result" className="mt-0 space-y-0">
                    {evaluationResult ? (
                      <div className="space-y-6">
                        <div
                          className={cn(
                            "p-8 rounded-2xl border-0 shadow-lg backdrop-blur-sm",
                            evaluationResult.isPassed
                              ? "bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 ring-1 ring-green-200/50 dark:ring-green-800/50"
                              : "bg-gradient-to-br from-red-50/80 to-rose-50/80 dark:from-red-950/30 dark:to-rose-950/30 ring-1 ring-red-200/50 dark:ring-red-800/50",
                          )}
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div
                              className={cn(
                                "p-4 rounded-xl shadow-inner ring-1",
                                evaluationResult.isPassed
                                  ? "bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-900/20 ring-green-200/50 dark:ring-green-800/50"
                                  : "bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-900/20 ring-red-200/50 dark:ring-red-800/50",
                              )}
                            >
                              {evaluationResult.isPassed ? (
                                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                Rule{" "}
                                {evaluationResult.isPassed
                                  ? "Passed"
                                  : "Failed"}
                              </h3>
                              <p className="text-sm font-medium text-muted-foreground mt-1">
                                {evaluationResult.isPassed
                                  ? "All conditions were satisfied successfully"
                                  : "One or more conditions failed validation"}
                              </p>
                            </div>
                          </div>

                          {evaluationResult.value && (
                            <div className="mt-4">
                              <Label className="text-sm font-semibold mb-3 block text-foreground/90">
                                Result Value:
                              </Label>
                              <div className="p-5 bg-gradient-to-br from-background to-muted/30 rounded-xl border border-border/50 shadow-inner">
                                <pre className="text-sm font-mono overflow-x-auto text-foreground/90">
                                  {JSON.stringify(
                                    evaluationResult.value,
                                    null,
                                    2,
                                  )}
                                </pre>
                              </div>
                            </div>
                          )}

                          {evaluationResult.message && (
                            <div className="mt-4">
                              <Label className="text-sm font-semibold mb-3 block text-foreground/90">
                                Message:
                              </Label>
                              <div className="p-5 bg-gradient-to-br from-background to-muted/30 rounded-xl border border-border/50 shadow-inner">
                                <p className="text-sm font-medium text-foreground/90">
                                  {evaluationResult.message}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/50 w-fit mx-auto mb-6 shadow-inner ring-1 ring-border/30">
                          <Activity className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                          No evaluation results yet
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium mb-6">
                          {isLiveMode
                            ? "Waiting for rule changes..."
                            : 'Click "Evaluate" to test your rule'}
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
                    )}
                  </TabsContent>

                  {/* Details Tab */}
                  <TabsContent value="details" className="mt-0">
                    <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-0 shadow-xl ring-1 ring-border/30 overflow-hidden">
                      <ScrollArea className="h-[400px]">
                        <div className="p-6">
                          {evaluationDetails.length > 0 ? (
                            <div className="space-y-4">
                              {evaluationDetails.map((detail) =>
                                renderEvaluationDetails(detail),
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-16">
                              <div className="p-6 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/50 w-fit mx-auto mb-6 shadow-inner">
                                <Code className="h-16 w-16 text-muted-foreground" />
                              </div>
                              <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                No evaluation details
                              </h3>
                              <p className="text-sm text-muted-foreground font-medium">
                                Run an evaluation to see detailed breakdown
                              </p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  {/* Test Data Tab */}
                  <TabsContent value="data" className="mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                            Test Data
                          </Label>
                          <p className="text-sm text-muted-foreground font-medium">
                            Edit the data used for evaluation
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSampleData(defaultSampleData)}
                          className="rounded-full shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                        >
                          Reset to Default
                        </Button>
                      </div>
                      <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-0 shadow-xl ring-1 ring-border/30 overflow-hidden">
                        <EditableJsonViewer
                          rule={sampleData}
                          onUpdate={setSampleData}
                          className="max-h-[400px]"
                          readOnly={false}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </TooltipProvider>
  );
};
