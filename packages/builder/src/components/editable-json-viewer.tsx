import type { RuleType, EvaluationResult } from "@usex/rule-engine";
import { RuleEngine } from "@usex/rule-engine";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  XCircle,
  X,
  Upload,
  Save,
  Play,
  Minimize2,
  Maximize2,
  Info,
  Edit2,
  Download,
  Copy,
  CheckCircle2,
  Check,
  AlertCircle,
  Activity,
} from "lucide-react";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { JsonViewer } from "./JsonVisualizer";
import { AlertDescription, Alert } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CardTitle, CardHeader, CardContent, Card } from "./ui/card";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import {
  TooltipTrigger,
  TooltipProvider,
  TooltipContent,
  Tooltip,
} from "./ui/tooltip";

interface EditableJsonViewerProps {
  rule: RuleType;
  className?: string;
  onUpdate?: (rule: RuleType) => void;
  onImport?: (rule: RuleType) => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  readOnly?: boolean;
  sampleData?: any;
  showEvaluator?: boolean;
}

export const EditableJsonViewer: React.FC<EditableJsonViewerProps> = ({
  rule,
  className,
  onUpdate,
  onImport,
  expanded = false,
  onExpandedChange,
  readOnly = false,
  sampleData,
  showEvaluator = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedJson, setEditedJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Evaluator state
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const jsonString = useMemo(() => {
    return JSON.stringify(rule, null, 2);
  }, [rule]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("JSON copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy JSON");
    }
  };

  const handleExport = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rule-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Rule exported successfully");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImport) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedRule: RuleType = JSON.parse(content);
        onImport(importedRule);
        toast.success("Rule imported successfully");
      } catch (error) {
        console.error("Failed to import rule:", error);
        toast.error("Failed to import rule: Invalid JSON");
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveEdit = () => {
    try {
      const parsedRule = JSON.parse(editedJson) as RuleType;

      // Basic validation
      if (!parsedRule.conditions) {
        throw new Error("Rule must have conditions");
      }

      if (onUpdate) {
        onUpdate(parsedRule);
        setIsEditing(false);
        setError(null);
        toast.success("Rule updated successfully");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid JSON";
      setError(errorMessage);
      toast.error(`Failed to update rule: ${errorMessage}`);
    }
  };

  const handleStartEdit = () => {
    setEditedJson(jsonString);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedJson("");
    setError(null);
  };

  const lineCount = jsonString.split("\n").length;

  // Evaluate rule function
  const evaluateRule = useCallback(async () => {
    if (!rule || !rule.conditions || !sampleData) {
      return;
    }

    setIsEvaluating(true);

    try {
      const result = await RuleEngine.evaluate(rule, sampleData);
      const evalResult = Array.isArray(result) ? result[0] : result;
      setEvaluationResult(evalResult);
    } catch {
      setEvaluationResult(null);
    } finally {
      setIsEvaluating(false);
    }
  }, [rule, sampleData]);

  // Live evaluation effect
  useEffect(() => {
    if (isLiveMode && showEvaluator) {
      evaluateRule();
    }
  }, [isLiveMode, rule, sampleData, evaluateRule, showEvaluator]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!showEvaluator || !sampleData) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.userAgent.toUpperCase().includes("MAC");
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // Toggle live mode: Ctrl/Cmd + E
      if (ctrlOrCmd && e.key === "e" && !e.shiftKey) {
        e.preventDefault();
        setIsLiveMode((prev) => !prev);
      }

      // Run evaluation once: Ctrl/Cmd + Shift + E
      if (ctrlOrCmd && e.shiftKey && e.key === "E") {
        e.preventDefault();
        if (!isLiveMode) {
          evaluateRule();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showEvaluator, sampleData, isLiveMode, evaluateRule]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="space-y-0">
        {/* Evaluator Row */}
        {showEvaluator && sampleData && (
          <>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Rule Evaluation</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <div className="space-y-2">
                        <p className="text-sm">
                          Evaluate your rule against sample data in real-time
                        </p>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                              Ctrl/Cmd + E
                            </kbd>
                            <span>Toggle live mode</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                              Ctrl/Cmd + Shift + E
                            </kbd>
                            <span>Run once</span>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {isEvaluating && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Zap className="h-3 w-3 text-yellow-500" />
                  </motion.div>
                )}
                {evaluationResult && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={evaluationResult.isPassed ? "pass" : "fail"}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
                        evaluationResult.isPassed
                          ? "bg-green-500/20 text-green-600"
                          : "bg-red-500/20 text-red-600",
                      )}
                    >
                      {evaluationResult.isPassed ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Pass</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          <span>Fail</span>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="live-eval"
                    className="text-xs cursor-pointer select-none"
                  >
                    Live
                  </Label>
                  <Switch
                    id="live-eval"
                    checked={isLiveMode}
                    onCheckedChange={setIsLiveMode}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                {!isLiveMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={evaluateRule}
                    disabled={isEvaluating}
                    className="h-7 px-2 text-xs"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Evaluate
                  </Button>
                )}
              </div>
            </div>
            <Separator className="mb-3" />
          </>
        )}

        {/* Original Header */}
        <div className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">Rule JSON</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {lineCount} lines
            </Badge>
            {isEditing && (
              <Badge variant="destructive" className="text-xs">
                Editing
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!isEditing && (
              <>
                {onImport && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImport}
                      className="hidden"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => fileInputRef.current?.click()}
                      title="Import JSON"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleExport}
                  title="Export JSON"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopy}
                  title="Copy JSON"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                {!readOnly && onUpdate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleStartEdit}
                    title="Edit JSON"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
            {isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-green-600 hover:text-green-700"
                  onClick={handleSaveEdit}
                  title="Save changes"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={handleCancelEdit}
                  title="Cancel editing"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            {onExpandedChange && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onExpandedChange(!expanded)}
                title={expanded ? "Minimize" : "Maximize"}
              >
                {expanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {error && (
          <Alert variant="destructive" className="mx-4 mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div
          className={cn(
            "overflow-auto",
            expanded ? "max-h-[80vh]" : "max-h-[400px]",
          )}
        >
          {isEditing ? (
            <Textarea
              value={editedJson}
              onChange={(e) => {
                setEditedJson(e.target.value);
                setError(null);
              }}
              className="min-h-[400px] font-mono text-sm border-0 focus-visible:ring-0 resize-none rounded-none"
              style={{ minHeight: expanded ? "70vh" : "400px" }}
              placeholder="Enter valid JSON..."
            />
          ) : (
            <div className="p-4">
              <JsonViewer
                data={rule}
                rootName="rule"
                defaultExpanded={true}
                className="max-w-full"
                highlightLogicalOperators={true}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
