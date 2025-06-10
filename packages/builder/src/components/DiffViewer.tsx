import * as Diff from "diff";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  GitBranch,
  FileJson,
  Copy,
  ChevronRight,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CardTitle, CardHeader, CardContent, Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { TabsTrigger, TabsList, Tabs } from "./ui/tabs";
import {
  TooltipTrigger,
  TooltipProvider,
  TooltipContent,
  Tooltip,
} from "./ui/tooltip";

interface DiffViewerProps {
  oldValue: any;
  newValue: any;
  className?: string;
  title?: string;
  oldTitle?: string;
  newTitle?: string;
}

// DiffStats Component
const DiffStatsComponent: React.FC<{ stats: DiffStats }> = ({ stats }) => {
  const totalChanges =
    (stats.addedProperties?.length || 0) +
    (stats.removedProperties?.length || 0) +
    (stats.modifiedProperties?.length || 0);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Basic Stats */}
        <div className="flex items-center gap-1 text-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="gap-1 cursor-help">
                <Plus className="h-3 w-3" />
                {stats.additions}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{stats.additions} lines added</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="gap-1 cursor-help">
                <Minus className="h-3 w-3" />
                {stats.deletions}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{stats.deletions} lines removed</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-4" />

        {/* Property Changes */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1 cursor-help">
              <GitBranch className="h-3 w-3" />
              {totalChanges} properties
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <p className="font-semibold text-xs">Property Changes:</p>
              {stats.addedProperties && stats.addedProperties.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Added ({stats.addedProperties.length}):
                  </p>
                  <ul className="text-xs space-y-0.5 ml-2">
                    {stats.addedProperties.slice(0, 5).map((prop, i) => (
                      <li
                        key={i}
                        className="text-green-600 dark:text-green-400"
                      >
                        + {prop}
                      </li>
                    ))}
                    {stats.addedProperties.length > 5 && (
                      <li className="text-muted-foreground">
                        ...and {stats.addedProperties.length - 5} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
              {stats.removedProperties &&
                stats.removedProperties.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Removed ({stats.removedProperties.length}):
                    </p>
                    <ul className="text-xs space-y-0.5 ml-2">
                      {stats.removedProperties.slice(0, 5).map((prop, i) => (
                        <li key={i} className="text-red-600 dark:text-red-400">
                          - {prop}
                        </li>
                      ))}
                      {stats.removedProperties.length > 5 && (
                        <li className="text-muted-foreground">
                          ...and {stats.removedProperties.length - 5} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              {stats.modifiedProperties &&
                stats.modifiedProperties.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Modified ({stats.modifiedProperties.length}):
                    </p>
                    <ul className="text-xs space-y-0.5 ml-2">
                      {stats.modifiedProperties.slice(0, 5).map((prop, i) => (
                        <li
                          key={i}
                          className="text-blue-600 dark:text-blue-400"
                        >
                          ~ {prop}
                        </li>
                      ))}
                      {stats.modifiedProperties.length > 5 && (
                        <li className="text-muted-foreground">
                          ...and {stats.modifiedProperties.length - 5} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Summary */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1 cursor-help text-xs">
              <BarChart3 className="h-3 w-3" />
              {Math.round(
                (stats.changes / Math.max(stats.totalLines, 1)) * 100,
              )}
              % changed
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              {stats.changes} of {stats.totalLines} lines changed
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

interface DiffLine {
  type: "added" | "removed" | "unchanged" | "context";
  content: string;
  lineNumber: {
    old?: number;
    new?: number;
  };
  level?: number;
}

interface DiffStats {
  additions: number;
  deletions: number;
  changes: number;
  totalLines: number;
  addedProperties?: string[];
  removedProperties?: string[];
  modifiedProperties?: string[];
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  oldValue,
  newValue,
  className,
  title = "Diff Viewer",
  oldTitle = "Original",
  newTitle = "Modified",
}) => {
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );

  // Convert objects to formatted JSON strings
  const oldJson = useMemo(() => JSON.stringify(oldValue, null, 2), [oldValue]);
  const newJson = useMemo(() => JSON.stringify(newValue, null, 2), [newValue]);

  // Helper function to get indentation level
  const getIndentLevel = (line: string): number => {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length / 2 : 0;
  };

  // Calculate diff
  const { diffLines, stats } = useMemo(() => {
    const changes = Diff.diffLines(oldJson, newJson, {
      ignoreWhitespace: false,
    });

    const lines: DiffLine[] = [];
    let oldLineNum = 1;
    let newLineNum = 1;
    let additions = 0;
    let deletions = 0;

    changes.forEach((part) => {
      const partLines = part.value.split("\n").filter((line) => line !== "");

      if (part.added) {
        additions += partLines.length;
        partLines.forEach((line) => {
          lines.push({
            type: "added",
            content: line,
            lineNumber: { new: newLineNum++ },
            level: getIndentLevel(line),
          });
        });
      } else if (part.removed) {
        deletions += partLines.length;
        partLines.forEach((line) => {
          lines.push({
            type: "removed",
            content: line,
            lineNumber: { old: oldLineNum++ },
            level: getIndentLevel(line),
          });
        });
      } else {
        // Context lines
        partLines.forEach((line) => {
          lines.push({
            type: "unchanged",
            content: line,
            lineNumber: { old: oldLineNum++, new: newLineNum++ },
            level: getIndentLevel(line),
          });
        });
      }
    });

    // Calculate property-level changes
    const oldObj = JSON.parse(oldJson);
    const newObj = JSON.parse(newJson);

    const analyzeProperties = (obj1: any, obj2: any, path = "") => {
      const props = {
        added: [] as string[],
        removed: [] as string[],
        modified: [] as string[],
      };

      const allKeys = new Set([
        ...Object.keys(obj1 || {}),
        ...Object.keys(obj2 || {}),
      ]);

      allKeys.forEach((key) => {
        const fullPath = path ? `${path}.${key}` : key;

        if (!(key in obj1)) {
          props.added.push(fullPath);
        } else if (!(key in obj2)) {
          props.removed.push(fullPath);
        } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
          props.modified.push(fullPath);

          // Recursively analyze nested objects
          if (
            typeof obj1[key] === "object" &&
            typeof obj2[key] === "object" &&
            obj1[key] !== null &&
            obj2[key] !== null &&
            !Array.isArray(obj1[key]) &&
            !Array.isArray(obj2[key])
          ) {
            const nested = analyzeProperties(obj1[key], obj2[key], fullPath);
            props.added.push(...nested.added);
            props.removed.push(...nested.removed);
            props.modified = props.modified.filter((p) => p !== fullPath);
            props.modified.push(...nested.modified);
          }
        }
      });

      return props;
    };

    const propertyChanges = analyzeProperties(oldObj, newObj);

    return {
      diffLines: lines,
      stats: {
        additions,
        deletions,
        changes: Math.min(additions, deletions),
        totalLines: lines.length,
        addedProperties: propertyChanges.added,
        removedProperties: propertyChanges.removed,
        modifiedProperties: propertyChanges.modified,
      },
    };
  }, [oldJson, newJson]);

  // Group consecutive unchanged lines for collapsing
  const groupedLines = useMemo(() => {
    const groups: Array<{
      type: "diff" | "context";
      lines: DiffLine[];
      id: string;
    }> = [];

    let currentGroup: DiffLine[] = [];
    let currentType: "diff" | "context" = "context";

    diffLines.forEach((line) => {
      const isDiff = line.type === "added" || line.type === "removed";
      const groupType = isDiff ? "diff" : "context";

      if (
        groupType !== currentType ||
        (currentType === "context" && currentGroup.length >= 10)
      ) {
        if (currentGroup.length > 0) {
          groups.push({
            type: currentType,
            lines: currentGroup,
            id: `group-${groups.length}`,
          });
        }
        currentGroup = [line];
        currentType = groupType;
      } else {
        currentGroup.push(line);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({
        type: currentType,
        lines: currentGroup,
        id: `group-${groups.length}`,
      });
    }

    return groups;
  }, [diffLines]);

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const renderLineContent = (line: DiffLine) => {
    const content = line.content;

    // Syntax highlighting for JSON
    const highlightedContent = content
      .replace(
        /("[\w\s-]+")\s*:/g,
        '<span class="text-blue-600 dark:text-blue-400">$1</span>:',
      )
      .replace(
        /:\s*(".*?")/g,
        ': <span class="text-green-600 dark:text-green-400">$1</span>',
      )
      .replace(
        /:\s*(\d+)/g,
        ': <span class="text-purple-600 dark:text-purple-400">$1</span>',
      )
      .replace(
        /:\s*(true|false)/g,
        ': <span class="text-orange-600 dark:text-orange-400">$1</span>',
      )
      .replace(
        /:\s*(null)/g,
        ': <span class="text-gray-500 dark:text-gray-400">$1</span>',
      );

    return (
      <span
        dangerouslySetInnerHTML={{ __html: highlightedContent }}
        className="font-mono text-sm"
      />
    );
  };

  const renderUnifiedView = () => (
    <ScrollArea className="h-full">
      <div className="p-4">
        {groupedLines.map((group) => {
          const isCollapsed = collapsedSections.has(group.id);
          const canCollapse =
            group.type === "context" && group.lines.length > 3;

          return (
            <div key={group.id} className="mb-2">
              {canCollapse && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => toggleSection(group.id)}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ChevronDown className="h-3 w-3 mr-1" />
                  )}
                  {isCollapsed
                    ? `Show ${group.lines.length} unchanged lines`
                    : "Hide unchanged lines"}
                </Button>
              )}

              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {group.lines.map((line, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-start border-l-4 pr-2",
                          line.type === "added" &&
                            "bg-green-50 dark:bg-green-950/30 border-green-500",
                          line.type === "removed" &&
                            "bg-red-50 dark:bg-red-950/30 border-red-500",
                          line.type === "unchanged" &&
                            "bg-transparent border-transparent",
                        )}
                      >
                        <div className="flex shrink-0 w-16 text-xs text-muted-foreground font-mono">
                          <span className="w-8 text-right pr-2">
                            {line.lineNumber.old || ""}
                          </span>
                          <span className="w-8 text-right pr-2">
                            {line.lineNumber.new || ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 w-6">
                          {line.type === "added" && (
                            <Plus className="h-3 w-3 text-green-600" />
                          )}
                          {line.type === "removed" && (
                            <Minus className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                        <div
                          className="flex-1 overflow-x-auto"
                          style={{ paddingLeft: `${line.level || 0}ch` }}
                        >
                          {renderLineContent(line)}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );

  const renderSplitView = () => {
    // Separate lines for left and right panels
    const leftLines: Array<DiffLine | null> = [];
    const rightLines: Array<DiffLine | null> = [];

    diffLines.forEach((line) => {
      if (line.type === "removed") {
        leftLines.push(line);
        rightLines.push(null);
      } else if (line.type === "added") {
        leftLines.push(null);
        rightLines.push(line);
      } else {
        leftLines.push(line);
        rightLines.push(line);
      }
    });

    return (
      <div className="grid grid-cols-2 gap-2 h-full">
        {/* Left Panel */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="py-2 px-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{oldTitle}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(oldJson, oldTitle)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="text-sm font-mono">
                {leftLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-start pr-2 min-h-[24px]",
                      line?.type === "removed" &&
                        "bg-red-50 dark:bg-red-950/30",
                      !line && "bg-gray-50 dark:bg-gray-950/30",
                    )}
                  >
                    <div className="shrink-0 w-10 text-xs text-muted-foreground text-right pr-2 py-1">
                      {line?.lineNumber.old || ""}
                    </div>
                    <div className="flex-1 py-1 overflow-x-auto">
                      {line ? renderLineContent(line) : ""}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Panel */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="py-2 px-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{newTitle}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(newJson, newTitle)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="text-sm font-mono">
                {rightLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-start pr-2 min-h-[24px]",
                      line?.type === "added" &&
                        "bg-green-50 dark:bg-green-950/30",
                      !line && "bg-gray-50 dark:bg-gray-950/30",
                    )}
                  >
                    <div className="shrink-0 w-10 text-xs text-muted-foreground text-right pr-2 py-1">
                      {line?.lineNumber.new || ""}
                    </div>
                    <div className="flex-1 py-1 overflow-x-auto">
                      {line ? renderLineContent(line) : ""}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            <CardTitle>{title}</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            {/* Enhanced Stats */}
            <DiffStatsComponent stats={stats} />

            {/* View Mode Tabs */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList className="h-8">
                <TabsTrigger value="unified" className="text-xs">
                  Unified
                </TabsTrigger>
                <TabsTrigger value="split" className="text-xs">
                  Split
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        {viewMode === "unified" ? renderUnifiedView() : renderSplitView()}
      </CardContent>
    </Card>
  );
};
