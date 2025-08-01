import React, { useMemo } from "react";
import { CardTitle, CardHeader, CardContent, Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Upload,
  Minimize2,
  Maximize2,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "../lib/utils";
import type { RuleType } from "@usex/rule-engine";

interface JsonViewerProps {
  rule: RuleType;
  className?: string;
  onImport?: (rule: RuleType) => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  rule,
  className,
  onImport,
  expanded = false,
  onExpandedChange,
}) => {
  const [copied, setCopied] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const jsonString = useMemo(() => {
    return JSON.stringify(rule, null, 2);
  }, [rule]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
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
      } catch (error) {
        console.error("Failed to import rule:", error);
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const lineCount = jsonString.split("\n").length;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm sm:text-base font-medium">
            Rule JSON
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {lineCount} lines
          </Badge>
        </div>
        <div className="flex items-center gap-1 justify-end sm:justify-start">
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
                size="sm"
                className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                onClick={() => fileInputRef.current?.click()}
                title="Import JSON"
              >
                <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 sm:h-8 sm:w-8"
            onClick={handleExport}
            title="Export JSON"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 sm:h-8 sm:w-8"
            onClick={handleCopy}
            title="Copy JSON"
          >
            {copied ? (
              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            ) : (
              <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </Button>
          {onExpandedChange && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 sm:h-8 sm:w-8"
              onClick={() => onExpandedChange(!expanded)}
              title={expanded ? "Minimize" : "Maximize"}
            >
              {expanded ? (
                <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          className={cn(
            "overflow-auto bg-muted/50 dark:bg-muted/20",
            expanded ? "max-h-[80vh]" : "max-h-[300px] sm:max-h-[400px]",
          )}
        >
          <pre className="p-3 sm:p-4 text-xs sm:text-sm">
            <code className="font-mono leading-relaxed">{jsonString}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};
