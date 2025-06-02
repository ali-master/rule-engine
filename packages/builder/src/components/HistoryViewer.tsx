import type { HistoryEntry } from "../stores/enhanced-rule-store";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Eye,
  GitBranch,
  RotateCcw,
  Search,
  XCircle,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { useEnhancedRuleStore } from "../stores/enhanced-rule-store";
import { DiffViewer } from "./DiffViewer";
import { JsonViewer } from "./JsonVisualizer";
import { ResizablePanel } from "./ResizablePanel";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ZoomDialog,
  ZoomDialogContent,
  ZoomDialogDescription,
  ZoomDialogHeader,
  ZoomDialogTitle,
} from "./ui/zoom-dialog";

interface HistoryViewerProps {
  className?: string;
}

export const HistoryViewer: React.FC<HistoryViewerProps> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [compareEntry, setCompareEntry] = useState<HistoryEntry | null>(null);

  const { history, historyIndex, setRule, canUndo, canRedo, undo, redo } =
    useEnhancedRuleStore();

  // Filter history entries
  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      const matchesSearch = searchTerm
        ? entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.action.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesFilter =
        filterAction === "all" || entry.action === filterAction;

      return matchesSearch && matchesFilter;
    });
  }, [history, searchTerm, filterAction]);

  // Get unique actions for filter
  const uniqueActions = useMemo(() => {
    const actions = new Set(history.map((entry) => entry.action));
    return ["all", ...Array.from(actions)];
  }, [history]);

  const handleCheckout = (entry: HistoryEntry, index: number) => {
    setRule(
      entry.rule,
      "Checkout",
      `Checked out to version from ${format(entry.timestamp, "PPp")}`,
    );
    toast.success(`Checked out to version ${index + 1}`);
    setOpen(false);
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "add":
      case "create":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "remove":
      case "delete":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "update":
      case "edit":
        return <GitBranch className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={cn("gap-2", className)}
      >
        <Clock className="h-4 w-4" />
        History
      </Button>

      <ZoomDialog open={open} onOpenChange={setOpen}>
        <ZoomDialogContent className="max-w-6xl h-[90vh] flex flex-col overflow-hidden">
          <ZoomDialogHeader className="shrink-0">
            <ZoomDialogTitle>Version History</ZoomDialogTitle>
            <ZoomDialogDescription>
              View and manage the history of changes to your rule
            </ZoomDialogDescription>
          </ZoomDialogHeader>

          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Controls */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter actions" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action === "all" ? "All Actions" : action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={undo}
                  disabled={!canUndo()}
                  title="Undo"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={redo}
                  disabled={!canRedo()}
                  title="Redo"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* History List and Details */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ResizablePanel
                defaultSize={35}
                minSize={25}
                maxSize={50}
                direction="horizontal"
                persistId="history-panel"
                className="h-full"
                handleClassName="mx-2"
              >
                {/* History List */}
                <Card className="h-full flex flex-col overflow-hidden">
                  <CardHeader className="py-3 shrink-0">
                    <CardTitle className="text-sm">
                      History ({filteredHistory.length} entries)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-2">
                        {filteredHistory.map((entry) => {
                          const actualIndex = history.indexOf(entry);
                          const isCurrent = actualIndex === historyIndex;
                          const isPast = actualIndex < historyIndex;

                          return (
                            <Card
                              key={entry.timestamp}
                              className={cn(
                                "p-3 cursor-pointer transition-colors",
                                "hover:bg-accent",
                                isCurrent && "ring-2 ring-primary",
                                selectedEntry === entry && "bg-accent",
                                isPast && "opacity-60",
                              )}
                              onClick={() => setSelectedEntry(entry)}
                            >
                              <div className="flex items-start gap-3">
                                {getActionIcon(entry.action)}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-sm truncate">
                                      {entry.action}
                                    </h4>
                                    {isCurrent && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Current
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {entry.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(entry.timestamp, {
                                        addSuffix: true,
                                      })}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      •
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      v{actualIndex + 1}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCheckout(entry, actualIndex);
                                    }}
                                    disabled={isCurrent}
                                    title="Checkout this version"
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCompareEntry(
                                        entry === compareEntry ? null : entry,
                                      );
                                    }}
                                    title="Compare with selected"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Details/Diff View */}
                <Card className="h-full flex flex-col overflow-hidden">
                  <CardHeader className="py-3 shrink-0">
                    <CardTitle className="text-sm">Details</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 overflow-hidden">
                    {selectedEntry ? (
                      <Tabs
                        defaultValue="details"
                        className="h-full flex flex-col overflow-hidden"
                      >
                        <TabsList className="m-4 mb-0 shrink-0">
                          <TabsTrigger value="details">Details</TabsTrigger>
                          <TabsTrigger value="changes">Changes</TabsTrigger>
                          <TabsTrigger value="json">JSON</TabsTrigger>
                          {compareEntry && (
                            <TabsTrigger value="compare">Compare</TabsTrigger>
                          )}
                        </TabsList>

                        <TabsContent
                          value="details"
                          className="flex-1 overflow-auto p-0"
                        >
                          <div className="space-y-4 p-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">
                                Version Information
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Version:
                                  </span>
                                  <span>
                                    v{history.indexOf(selectedEntry) + 1}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Action:
                                  </span>
                                  <span>{selectedEntry.action}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Time:
                                  </span>
                                  <span>
                                    {format(selectedEntry.timestamp, "PPp")}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-sm mb-2">
                                Description
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {selectedEntry.description}
                              </p>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent
                          value="changes"
                          className="flex-1 overflow-hidden p-0"
                        >
                          <div className="h-full p-4">
                            {selectedEntry.changes ? (
                              <DiffViewer
                                oldValue={selectedEntry.changes.before}
                                newValue={selectedEntry.changes.after}
                                oldTitle="Before"
                                newTitle="After"
                                title="Changes"
                                className="h-full"
                              />
                            ) : (
                              <div className="h-full flex items-center justify-center">
                                <p className="text-sm text-muted-foreground">
                                  No change details available
                                </p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent
                          value="json"
                          className="flex-1 overflow-hidden p-0"
                        >
                          <ScrollArea className="h-full">
                            <div className="p-4">
                              <Card className="overflow-hidden">
                                <CardContent className="p-4">
                                  <JsonViewer
                                    data={selectedEntry.rule}
                                    rootName="rule"
                                    defaultExpanded={true}
                                    className="max-w-full"
                                    highlightLogicalOperators={true}
                                  />
                                </CardContent>
                              </Card>
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        {compareEntry && (
                          <TabsContent
                            value="compare"
                            className="flex-1 overflow-hidden p-0"
                          >
                            <div className="h-full p-4">
                              <DiffViewer
                                oldValue={compareEntry.rule}
                                newValue={selectedEntry.rule}
                                oldTitle={`Version ${history.indexOf(compareEntry) + 1}`}
                                newTitle={`Version ${history.indexOf(selectedEntry) + 1}`}
                                title={`Comparing v${history.indexOf(compareEntry) + 1} → v${history.indexOf(selectedEntry) + 1}`}
                                className="h-full"
                              />
                            </div>
                          </TabsContent>
                        )}
                      </Tabs>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground p-4">
                        Select a history entry to view details
                      </div>
                    )}
                  </CardContent>
                </Card>
              </ResizablePanel>
            </div>
          </div>
        </ZoomDialogContent>
      </ZoomDialog>
    </>
  );
};
