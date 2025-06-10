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
import { useEnhancedRuleStore } from "../stores/enhanced-rule-store";
import { EditableJsonViewer } from "./EditableJsonViewer";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
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
  const { rule } = useEnhancedRuleStore();
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
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
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
      // eslint-disable-next-line ts/no-use-before-define
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
  }, [rule, sampleData, onEvaluationChange]);

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
            // eslint-disable-next-line ts/no-use-before-define
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
            // eslint-disable-next-line ts/no-use-before-define
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
            // eslint-disable-next-line ts/no-use-before-define
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Evaluate individual constraint
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
            "flex items-center gap-2 py-2 px-3 rounded-lg transition-colors cursor-pointer hover:bg-accent/50",
            depth > 0 && "ml-6",
            details.result ? "bg-green-500/10" : "bg-red-500/10",
          )}
          onClick={() => hasChildren && toggleExpanded(details.path)}
        >
          {hasChildren && (
            <button className="p-0.5">
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
          "flex items-center gap-2 px-3 py-1.5 rounded-full",
          evaluationResult?.isPassed
            ? "bg-green-500/20 text-green-600"
            : "bg-red-500/20 text-red-600",
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
      <Card className={cn("p-4", className)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Rule Evaluator</h3>
            {isEvaluating && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="h-4 w-4 text-yellow-500" />
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Result Indicator (Silent Mode) */}
            {!showDetails && <ResultIndicator />}

            {/* Live Mode Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="live-mode"
                checked={isLiveMode}
                onCheckedChange={setIsLiveMode}
              />
              <Label htmlFor="live-mode" className="text-sm">
                Live Mode
              </Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ctrl/Cmd + E to toggle</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Details Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
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
                    variant="default"
                    size="sm"
                    onClick={runEvaluationOnce}
                    disabled={isEvaluating}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Evaluate
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ctrl/Cmd + Shift + E</p>
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
            className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-600">{error}</span>
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
              <Separator className="mb-4" />

              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="result"
                    className="flex items-center gap-2"
                  >
                    <Activity className="h-4 w-4" />
                    Result
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    className="flex items-center gap-2"
                  >
                    <Code className="h-4 w-4" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="data" className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    Test Data
                  </TabsTrigger>
                </TabsList>

                {/* Result Tab */}
                <TabsContent value="result" className="mt-4">
                  {evaluationResult ? (
                    <div className="space-y-4">
                      <div
                        className={cn(
                          "p-4 rounded-lg border-2",
                          evaluationResult.isPassed
                            ? "bg-green-500/10 border-green-500/20"
                            : "bg-red-500/10 border-red-500/20",
                        )}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {evaluationResult.isPassed ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-500" />
                          )}
                          <span className="text-lg font-semibold">
                            Rule{" "}
                            {evaluationResult.isPassed ? "Passed" : "Failed"}
                          </span>
                        </div>

                        {evaluationResult.value && (
                          <div className="mt-3">
                            <Label className="text-sm text-muted-foreground">
                              Result Value:
                            </Label>
                            <pre className="mt-1 p-2 bg-background rounded text-sm font-mono">
                              {JSON.stringify(evaluationResult.value, null, 2)}
                            </pre>
                          </div>
                        )}

                        {evaluationResult.message && (
                          <div className="mt-3">
                            <Label className="text-sm text-muted-foreground">
                              Message:
                            </Label>
                            <p className="mt-1 text-sm">
                              {evaluationResult.message}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No evaluation results yet</p>
                      <p className="text-sm mt-1">
                        {isLiveMode
                          ? "Waiting for rule changes..."
                          : 'Click "Evaluate" to test your rule'}
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="mt-4">
                  <ScrollArea className="h-[400px] pr-4">
                    {evaluationDetails.length > 0 ? (
                      <div className="space-y-2">
                        {evaluationDetails.map((detail) =>
                          renderEvaluationDetails(detail),
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Code className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No evaluation details available</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                {/* Test Data Tab */}
                <TabsContent value="data" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Test Data</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSampleData(defaultSampleData)}
                      >
                        Reset to Default
                      </Button>
                    </div>
                    <EditableJsonViewer
                      rule={sampleData}
                      onUpdate={setSampleData}
                      className="max-h-[400px]"
                      readOnly={false}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </TooltipProvider>
  );
};
