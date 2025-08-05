import React from "react";
import { RuleEditor } from "./RuleEditor";
import { RuleViewer } from "./RuleViewer";
import { RuleEvaluator } from "./RuleEvaluator";
import { ResizablePanel } from "./ResizablePanel";
import { TabsTrigger, TabsList, TabsContent, Tabs } from "./ui/tabs";
import type { RuleBuilderProps } from "../types";
import { cn } from "../lib/utils";
import { ecommerceFields } from "../data/sample-data";
import { operatorConfigs } from "../utils/operators";
import { useUnifiedRuleStore } from "../stores/unified-rule-store";

export const RuleBuilder: React.FC<RuleBuilderProps> = ({
  className,
  showViewer = true,
  viewerPosition = "right",
  theme,
  fields = ecommerceFields,
  operators = operatorConfigs,
  onRuleChange,
  readOnly = false,
}) => {
  const rule = useUnifiedRuleStore((state) => state.rule);

  React.useEffect(() => {
    if (onRuleChange) {
      onRuleChange(rule);
    }
  }, [rule, onRuleChange]);

  if (viewerPosition === "bottom") {
    return (
      <div
        className={cn("flex flex-col gap-4", className)}
        style={
          theme
            ? ({
                "--primary": theme.colors?.primary,
                "--secondary": theme.colors?.secondary,
                "--destructive": theme.colors?.destructive,
                "--muted": theme.colors?.muted,
                "--accent": theme.colors?.accent,
                "--background": theme.colors?.background,
                "--foreground": theme.colors?.foreground,
                "--card": theme.colors?.card,
                "--border": theme.colors?.border,
                fontFamily: theme.fontFamily,
              } as React.CSSProperties)
            : undefined
        }
      >
        <RuleEditor fields={fields} operators={operators} readOnly={readOnly} />
        {showViewer && (
          <Tabs defaultValue="json" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="json" className="text-sm">
                Rule JSON
              </TabsTrigger>
              <TabsTrigger value="evaluator" className="text-sm">
                Live Evaluator
              </TabsTrigger>
            </TabsList>
            <TabsContent value="json" className="mt-4">
              <RuleViewer
                rule={rule}
                syntaxHighlight
                collapsible
                defaultCollapsed={false}
              />
            </TabsContent>
            <TabsContent value="evaluator" className="mt-4">
              <RuleEvaluator className="h-full" />
            </TabsContent>
          </Tabs>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn("h-full", className)}
      style={
        theme
          ? ({
              "--primary": theme.colors?.primary,
              "--secondary": theme.colors?.secondary,
              "--destructive": theme.colors?.destructive,
              "--muted": theme.colors?.muted,
              "--accent": theme.colors?.accent,
              "--background": theme.colors?.background,
              "--foreground": theme.colors?.foreground,
              "--card": theme.colors?.card,
              "--border": theme.colors?.border,
              fontFamily: theme.fontFamily,
            } as React.CSSProperties)
          : undefined
      }
    >
      <ResizablePanel
        defaultSize={showViewer ? 50 : 100}
        minSize={30}
        maxSize={showViewer ? 70 : 100}
        direction="horizontal"
        persistId="rule-builder-panel"
        className="h-full"
        handleClassName="mx-2"
      >
        <RuleEditor
          fields={fields}
          operators={operators}
          readOnly={readOnly}
          className="h-full"
        />

        {showViewer && (
          <Tabs defaultValue="json" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="json" className="text-sm">
                Rule JSON
              </TabsTrigger>
              <TabsTrigger value="evaluator" className="text-sm">
                Live Evaluator
              </TabsTrigger>
            </TabsList>
            <TabsContent value="json" className="flex-1 mt-4">
              <RuleViewer
                rule={rule}
                syntaxHighlight
                collapsible
                defaultCollapsed={false}
                className="h-full"
              />
            </TabsContent>
            <TabsContent value="evaluator" className="flex-1 mt-4">
              <RuleEvaluator className="h-full" />
            </TabsContent>
          </Tabs>
        )}
      </ResizablePanel>
    </div>
  );
};
