import * as Diff from "diff";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  FileJson,
  Minus,
  Plus,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface DiffViewerProps {
  oldValue: any;
  newValue: any;
  className?: string;
  title?: string;
  oldTitle?: string;
  newTitle?: string;
}

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
  const oldJson = useMemo(
    () => JSON.stringify(oldValue, null, 2),
    [oldValue],
  );
  const newJson = useMemo(
    () => JSON.stringify(newValue, null, 2),
    [newValue],
  );

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
      const partLines = part.value.split("\n").filter(line => line !== "");

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

    return {
      diffLines: lines,
      stats: {
        additions,
        deletions,
        changes: Math.min(additions, deletions),
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

    diffLines.forEach((line, index) => {
      const isDiff = line.type === "added" || line.type === "removed";
      const groupType = isDiff ? "diff" : "context";

      if (groupType !== currentType || (currentType === "context" && currentGroup.length >= 10)) {
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

  const getIndentLevel = (line: string): number => {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length / 2 : 0;
  };

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
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const renderLineContent = (line: DiffLine) => {
    const content = line.content;
    
    // Syntax highlighting for JSON
    const highlightedContent = content
      .replace(/("[\w\s-]+")\s*:/g, '<span class="text-blue-600 dark:text-blue-400">$1</span>:')
      .replace(/:\s*(".*?")/g, ': <span class="text-green-600 dark:text-green-400">$1</span>')
      .replace(/:\s*(\d+)/g, ': <span class="text-purple-600 dark:text-purple-400">$1</span>')
      .replace(/:\s*(true|false)/g, ': <span class="text-orange-600 dark:text-orange-400">$1</span>')
      .replace(/:\s*(null)/g, ': <span class="text-gray-500 dark:text-gray-400">$1</span>');

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
          const canCollapse = group.type === "context" && group.lines.length > 3;

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
            {/* Stats */}
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="gap-1">
                <Plus className="h-3 w-3" />
                {stats.additions}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Minus className="h-3 w-3" />
                {stats.deletions}
              </Badge>
            </div>
            
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