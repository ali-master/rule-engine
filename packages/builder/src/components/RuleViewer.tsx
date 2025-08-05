import React from "react";
import { CardTitle, CardHeader, CardContent, Card } from "./ui/card";
import { Button } from "./ui/button";
import { Copy, ChevronRight, ChevronDown, Check } from "lucide-react";
import { JsonViewer } from "./JsonVisualizer";
import type { RuleViewerProps } from "../types";
import { cn } from "../lib/utils";

export const RuleViewer: React.FC<RuleViewerProps> = ({
  rule,
  className,
  collapsible = true,
  defaultCollapsed = false,
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      const jsonString = JSON.stringify(rule, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {collapsible && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="p-0 h-auto"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
            Rule JSON
          </CardTitle>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </>
          )}
        </Button>
      </CardHeader>
      {!collapsed && (
        <CardContent>
          <div className="rounded-lg bg-gray-50 dark:bg-background p-4 border border-gray-200 dark:border-gray-700">
            <JsonViewer
              data={rule}
              rootName="rule"
              defaultExpanded={true}
              highlightLogicalOperators={true}
              className="text-gray-900 dark:text-gray-100"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
};
