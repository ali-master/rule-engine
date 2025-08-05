import React, { useState, useEffect, useCallback } from "react";
import { RuleEditor } from "./rule-editor";
import { RuleViewer } from "./rule-viewer";
import { RuleEvaluator } from "./rule-evaluator";
import { TabsTrigger, TabsList, TabsContent, Tabs } from "./ui/tabs";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { X, Settings, Play, Menu, Code } from "lucide-react";
import type { RuleBuilderProps } from "../types";
import { cn } from "../lib/utils";
import { ecommerceFields } from "../data/sample-data";
import { operatorConfigs } from "../utils/operators";
import { useUnifiedRuleStore } from "../stores/unified-rule-store";

// Extract default props to prevent infinite re-renders
const defaultFields = ecommerceFields;
const defaultOperators = operatorConfigs;

/**
 * Modern, responsive Rule Builder with mobile-first design
 *
 * Design Philosophy:
 * - Mobile-first responsive design
 * - Progressive disclosure of complexity
 * - Clear visual hierarchy
 * - Consistent dark mode support
 * - Optimized for different screen sizes
 */
export const RuleBuilder: React.FC<RuleBuilderProps> = ({
  className,
  showViewer = true,
  viewerPosition = "right",
  theme,
  fields = defaultFields,
  operators = defaultOperators,
  onRuleChange,
  readOnly = false,
}) => {
  const rule = useUnifiedRuleStore((state) => state.rule);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"json" | "evaluator">("json");

  // Handle rule changes
  useEffect(() => {
    if (onRuleChange) {
      onRuleChange(rule);
    }
  }, [rule, onRuleChange]);

  // Handle responsive behavior
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Toggle sidebar for mobile
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

  // Close sidebar on mobile when clicking outside or on action
  const closeSidebar = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Custom CSS properties for theming
  const themeStyles = theme
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
    : undefined;

  // Mobile-first layout (bottom tabs)
  if (isMobile && viewerPosition === "bottom") {
    return (
      <div
        className={cn("flex flex-col h-full min-h-0", className)}
        style={themeStyles}
      >
        {/* Main Content Area */}
        <div className="flex-1 min-h-0 p-4 pb-2">
          <RuleEditor
            fields={fields}
            operators={operators}
            readOnly={readOnly}
            className="h-full"
          />
        </div>

        {/* Bottom Tabs for Mobile */}
        {showViewer && (
          <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab as any}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full h-12 bg-transparent p-1">
                <TabsTrigger
                  value="json"
                  className="flex items-center gap-2 text-sm data-[state=active]:bg-accent"
                >
                  <Code className="h-4 w-4" />
                  <span className="hidden xs:inline">JSON</span>
                </TabsTrigger>
                <TabsTrigger
                  value="evaluator"
                  className="flex items-center gap-2 text-sm data-[state=active]:bg-accent"
                >
                  <Play className="h-4 w-4" />
                  <span className="hidden xs:inline">Evaluator</span>
                </TabsTrigger>
              </TabsList>
              <div className="max-h-80 min-h-[200px]">
                <TabsContent value="json" className="m-0 p-4">
                  <RuleViewer
                    rule={rule}
                    syntaxHighlight
                    collapsible
                    defaultCollapsed={false}
                  />
                </TabsContent>
                <TabsContent value="evaluator" className="m-0 p-4">
                  <RuleEvaluator />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>
    );
  }

  // Mobile layout with overlay sidebar
  if (isMobile) {
    return (
      <div
        className={cn("relative h-full flex flex-col", className)}
        style={themeStyles}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h1 className="font-semibold text-lg">Rule Builder</h1>
          {showViewer && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 p-4">
          <RuleEditor
            fields={fields}
            operators={operators}
            readOnly={readOnly}
            className="h-full"
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {showViewer && (
          <>
            {/* Backdrop */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                onClick={closeSidebar}
              />
            )}

            {/* Sidebar */}
            <div
              className={cn(
                "fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background border-l shadow-2xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden",
                sidebarOpen ? "translate-x-0" : "translate-x-full",
              )}
            >
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="font-medium">Tools</h2>
                  <Button variant="ghost" size="sm" onClick={closeSidebar}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 min-h-0">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab as any}
                    className="h-full flex flex-col"
                  >
                    <TabsList className="grid grid-cols-2 m-4 mb-2">
                      <TabsTrigger
                        value="json"
                        className="flex items-center gap-2 text-sm"
                      >
                        <Code className="h-4 w-4" />
                        JSON
                      </TabsTrigger>
                      <TabsTrigger
                        value="evaluator"
                        className="flex items-center gap-2 text-sm"
                      >
                        <Play className="h-4 w-4" />
                        Evaluator
                      </TabsTrigger>
                    </TabsList>
                    <div className="flex-1 min-h-0 px-4 pb-4">
                      <TabsContent value="json" className="h-full m-0">
                        <RuleViewer
                          rule={rule}
                          syntaxHighlight
                          collapsible
                          defaultCollapsed={false}
                          className="h-full"
                        />
                      </TabsContent>
                      <TabsContent value="evaluator" className="h-full m-0">
                        <RuleEvaluator className="h-full" />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Desktop layout with resizable panels
  return (
    <div className={cn("h-full flex", className)} style={themeStyles}>
      {/* Main Panel */}
      <div className={cn("flex-1 min-w-0", showViewer ? "pr-1" : "")}>
        <RuleEditor
          fields={fields}
          operators={operators}
          readOnly={readOnly}
          className="h-full"
        />
      </div>

      {/* Desktop Right Panel */}
      {showViewer && (
        <div className="w-96 min-w-0 pl-1">
          <Card className="h-full flex flex-col shadow-lg border-l-2 border-border/50">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Rule Tools</h3>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant={activeTab === "json" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("json")}
                  className="h-8 px-2"
                >
                  <Code className="h-3 w-3" />
                </Button>
                <Button
                  variant={activeTab === "evaluator" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("evaluator")}
                  className="h-8 px-2"
                >
                  <Play className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 min-h-0 p-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab as any}
                className="h-full"
              >
                <TabsContent value="json" className="h-full m-0">
                  <RuleViewer
                    rule={rule}
                    syntaxHighlight
                    collapsible
                    defaultCollapsed={false}
                    className="h-full"
                  />
                </TabsContent>
                <TabsContent value="evaluator" className="h-full m-0">
                  <RuleEvaluator className="h-full" />
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
