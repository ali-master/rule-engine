import React from "react";
import { CardTitle, CardHeader, CardContent, Card } from "./ui/card";
import { Button } from "./ui/button";
import { Copy, ChevronRight, ChevronDown, Check } from "lucide-react";
import type { RuleViewerProps } from "../types";
import { cn } from "../lib/utils";

export const RuleViewer: React.FC<RuleViewerProps> = ({
  rule,
  className,
  syntaxHighlight = true,
  collapsible = true,
  defaultCollapsed = false,
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [copied, setCopied] = React.useState(false);

  const jsonString = React.useMemo(() => {
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

  const highlightJson = (json: string) => {
    if (!syntaxHighlight) return json;

    return json
      .replace(/("[\w\s-]+":)/g, '<span class="text-blue-600">$1</span>')
      .replace(/(".*?")/g, '<span class="text-green-600">$1</span>')
      .replace(/(true|false)/g, '<span class="text-purple-600">$1</span>')
      .replace(/(\d+)/g, '<span class="text-orange-600">$1</span>')
      .replace(/(null|undefined)/g, '<span class="text-gray-500">$1</span>');
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
          <CardTitle className="text-sm font-medium">Rule JSON</CardTitle>
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
          <pre className="overflow-x-auto rounded-lg bg-muted p-4">
            {syntaxHighlight ? (
              <code
                dangerouslySetInnerHTML={{
                  __html: highlightJson(jsonString),
                }}
                className="text-sm font-mono"
              />
            ) : (
              <code className="text-sm font-mono">{jsonString}</code>
            )}
          </pre>
        </CardContent>
      )}
    </Card>
  );
};
