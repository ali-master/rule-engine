import type { HistoryEntry } from "../stores/unified-rule-store";
import { formatDistanceToNow, format } from "date-fns";
import {
  XCircle,
  Search,
  RotateCcw,
  GitBranch,
  Eye,
  Clock,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { useUnifiedRuleStore } from "../stores/unified-rule-store";
import { DiffViewer } from "./DiffViewer";
import { JsonViewer } from "./JsonVisualizer";
import { ResizablePanel } from "./ResizablePanel";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CardTitle, CardHeader, CardContent, Card } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import {
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
  Select,
} from "./ui/select";
import { TabsTrigger, TabsList, TabsContent, Tabs } from "./ui/tabs";
import {
  ZoomDialogTitle,
  ZoomDialogHeader,
  ZoomDialogDescription,
  ZoomDialogContent,
  ZoomDialog,
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

  const store = useUnifiedRuleStore();
  const historyInfo = store.getHistoryInfo();
  const { entries: history, current: historyIndex } = historyInfo;
  const { setRule, canUndo, canRedo, undo, redo } = store;

  // Filter history entries
  const filteredHistory = useMemo(() => {
    return history.filter((entry: HistoryEntry) => {
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
    const actions = new Set(history.map((entry: HistoryEntry) => entry.action));
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
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className={cn("gap-2 rounded-md", className)}
      >
        <Clock className="h-4 w-4" />
        History
      </Button>

      <ZoomDialog open={open} onOpenChange={setOpen}>
        <ZoomDialogContent className="max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-lg rounded-lg">
          <ZoomDialogHeader className="shrink-0 border-b p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <ZoomDialogTitle className="text-xl font-semibold">
                  Version History
                </ZoomDialogTitle>
                <ZoomDialogDescription className="text-muted-foreground">
                  View and manage the history of changes to your rule
                </ZoomDialogDescription>
              </div>
            </div>
          </ZoomDialogHeader>

          <div className="flex-1 flex flex-col gap-6 overflow-hidden p-0 pt-4">
            {/* Controls */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 rounded-md"
                />
              </div>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-[180px] rounded-md">
                  <SelectValue placeholder="Filter actions" />
                </SelectTrigger>
                <SelectContent className="rounded-md">
                  {uniqueActions.map((action: string) => (
                    <SelectItem
                      key={action}
                      value={action}
                      className="rounded-md"
                    >
                      {action === "all" ? "All Actions" : action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={undo}
                  disabled={!canUndo()}
                  title="Undo"
                  className="rounded-md"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={redo}
                  disabled={!canRedo()}
                  title="Redo"
                  className="rounded-md"
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
                <Card className="h-full flex flex-col overflow-hidden rounded-lg shadow-sm border">
                  <CardHeader className="py-4 px-6 shrink-0 bg-muted/30 border-b">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-primary" />
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
                                "group p-4 cursor-pointer transition-all duration-200 rounded-md border",
                                "hover:shadow-md hover:scale-[1.01]",
                                isCurrent && "ring-2 ring-primary bg-primary/5",
                                selectedEntry === entry &&
                                  "bg-accent ring-1 ring-accent-foreground/20",
                                !isCurrent &&
                                  !selectedEntry &&
                                  "bg-card hover:bg-accent/50",
                                isPast && "opacity-70",
                              )}
                              onClick={() => setSelectedEntry(entry)}
                            >
                              <div className="flex items-start gap-3">
                                {getActionIcon(entry.action)}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-sm truncate">
                                      {entry.action}
                                    </h4>
                                    {isCurrent && (
                                      <Badge
                                        className="text-xs"
                                        variant="secondary"
                                      >
                                        Current
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate mt-1">
                                    {entry.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-muted-foreground font-medium">
                                      {formatDistanceToNow(entry.timestamp, {
                                        addSuffix: true,
                                      })}
                                    </span>
                                    <span className="text-xs text-muted-foreground/50">
                                      •
                                    </span>
                                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                                      v{actualIndex + 1}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCheckout(entry, actualIndex);
                                    }}
                                    disabled={isCurrent}
                                    title="Checkout this version"
                                    className="h-8 w-8 p-0 rounded-md hover:bg-accent"
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
                                    className="h-8 w-8 p-0 rounded-md hover:bg-accent"
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
                <Card className="h-full flex flex-col overflow-hidden rounded-lg shadow-sm border">
                  <CardHeader className="py-4 px-6 shrink-0 bg-muted/30 border-b">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      Version Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 overflow-hidden">
                    {selectedEntry ? (
                      <Tabs
                        defaultValue="details"
                        className="h-full flex flex-col overflow-hidden"
                      >
                        <TabsList className="m-4 mb-0 shrink-0 bg-muted/50 p-1 rounded-lg">
                          <TabsTrigger
                            value="details"
                            className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                          >
                            <Eye className="h-4 w-4" />
                            Details
                          </TabsTrigger>
                          <TabsTrigger
                            value="changes"
                            className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                          >
                            <GitBranch className="h-4 w-4" />
                            Changes
                          </TabsTrigger>
                          <TabsTrigger
                            value="json"
                            className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                          >
                            <ArrowRight className="h-4 w-4" />
                            JSON
                          </TabsTrigger>
                          {compareEntry && (
                            <TabsTrigger
                              value="compare"
                              className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                            >
                              <ArrowLeft className="h-4 w-4" />
                              Compare
                            </TabsTrigger>
                          )}
                        </TabsList>

                        <TabsContent
                          value="details"
                          className="flex-1 overflow-auto p-0"
                        >
                          <div className="space-y-6 p-6">
                            <div className="bg-accent/50 p-5 rounded-lg border">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-md bg-primary/10">
                                  <CheckCircle className="h-5 w-5 text-primary" />
                                </div>
                                <h4 className="font-semibold text-lg">
                                  Version Information
                                </h4>
                              </div>
                              <div className="grid grid-cols-1 gap-4">
                                <div className="flex justify-between items-center p-3 bg-background rounded-md border">
                                  <span className="text-sm font-medium text-muted-foreground">
                                    Version:
                                  </span>
                                  <span className="text-sm font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                                    v{history.indexOf(selectedEntry) + 1}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-background rounded-md border">
                                  <span className="text-sm font-medium text-muted-foreground">
                                    Action:
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {getActionIcon(selectedEntry.action)}
                                    <span className="text-sm font-medium">
                                      {selectedEntry.action}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-background rounded-md border">
                                  <span className="text-sm font-medium text-muted-foreground">
                                    Time:
                                  </span>
                                  <span className="text-sm font-mono">
                                    {format(selectedEntry.timestamp, "PPp")}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-muted/50 p-5 rounded-lg border">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-md bg-muted">
                                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <h4 className="font-semibold text-lg">
                                  Description
                                </h4>
                              </div>
                              <div className="p-4 bg-background rounded-md border">
                                <p className="text-sm leading-relaxed">
                                  {selectedEntry.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent
                          value="changes"
                          className="flex-1 overflow-hidden p-0"
                        >
                          <div className="h-full p-6">
                            {selectedEntry.changes ? (
                              <div className="h-full bg-card rounded-lg border overflow-hidden">
                                <DiffViewer
                                  oldValue={selectedEntry.changes.before}
                                  newValue={selectedEntry.changes.after}
                                  oldTitle="Before"
                                  newTitle="After"
                                  title="Changes"
                                  className="h-full rounded-lg"
                                />
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center">
                                <div className="text-center space-y-4">
                                  <div className="p-4 rounded-lg bg-muted/50 w-fit mx-auto">
                                    <GitBranch className="h-12 w-12 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-medium mb-2">
                                      No Change Details
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      Change tracking was not available for this
                                      version
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent
                          value="json"
                          className="flex-1 overflow-hidden p-0"
                        >
                          <ScrollArea className="h-full">
                            <div className="p-6">
                              <Card className="overflow-hidden rounded-lg shadow-sm border">
                                <CardContent className="p-6">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-md bg-primary/10">
                                      <ArrowRight className="h-5 w-5 text-primary" />
                                    </div>
                                    <h4 className="font-semibold text-lg">
                                      Rule JSON Structure
                                    </h4>
                                  </div>
                                  <div className="bg-background rounded-md border overflow-hidden">
                                    <JsonViewer
                                      data={selectedEntry.rule}
                                      rootName="rule"
                                      defaultExpanded={true}
                                      className="max-w-full"
                                      highlightLogicalOperators={true}
                                    />
                                  </div>
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
                            <div className="h-full p-6">
                              <div className="h-full bg-card rounded-lg border overflow-hidden">
                                <div className="p-4 bg-muted/30 border-b">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-primary/10">
                                      <ArrowLeft className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-lg">
                                        Version Comparison
                                      </h4>
                                      <p className="text-sm text-muted-foreground">
                                        Comparing v
                                        {history.indexOf(compareEntry) + 1} → v
                                        {history.indexOf(selectedEntry) + 1}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <DiffViewer
                                  oldValue={compareEntry.rule}
                                  newValue={selectedEntry.rule}
                                  oldTitle={`Version ${history.indexOf(compareEntry) + 1}`}
                                  newTitle={`Version ${history.indexOf(selectedEntry) + 1}`}
                                  title={`Comparing v${history.indexOf(compareEntry) + 1} → v${history.indexOf(selectedEntry) + 1}`}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          </TabsContent>
                        )}
                      </Tabs>
                    ) : (
                      <div className="h-full flex items-center justify-center p-8">
                        <div className="text-center space-y-4">
                          <div className="p-6 rounded-lg bg-muted/50 w-fit mx-auto">
                            <Eye className="h-16 w-16 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="text-xl font-medium mb-2">
                              Select a Version
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                              Choose a history entry from the list to view its
                              details, changes, and JSON structure
                            </p>
                          </div>
                        </div>
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
