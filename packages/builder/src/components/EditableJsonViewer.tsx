import React, { useState, useMemo } from "react";
import type { RuleType } from "@usex/rule-engine";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Textarea } from "./ui/textarea";
import {
  Copy,
  Check,
  Download,
  Upload,
  Maximize2,
  Minimize2,
  Edit2,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import { JsonViewer } from "./JsonVisualizer";

interface EditableJsonViewerProps {
  rule: RuleType;
  className?: string;
  onUpdate?: (rule: RuleType) => void;
  onImport?: (rule: RuleType) => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  readOnly?: boolean;
}

export const EditableJsonViewer: React.FC<EditableJsonViewerProps> = ({
  rule,
  className,
  onUpdate,
  onImport,
  expanded = false,
  onExpandedChange,
  readOnly = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedJson, setEditedJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
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