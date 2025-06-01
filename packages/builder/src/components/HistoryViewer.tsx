import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Clock,
  GitBranch,
  Search,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Eye,
  Code2,
  Filter,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "../lib/utils";
import { useEnhancedRuleStore } from "../stores/enhanced-rule-store";
import type { HistoryEntry } from "../stores/enhanced-rule-store";
import { toast } from "sonner";

interface HistoryViewerProps {
  className?: string;
}

export const HistoryViewer: React.FC<HistoryViewerProps> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [compareEntry, setCompareEntry] = useState<HistoryEntry | null>(null);
  
  const {
    history,
    historyIndex,
    setRule,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useEnhancedRuleStore();

  // Filter history entries
  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      const matchesSearch = searchTerm
        ? entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.action.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      
      const matchesFilter = filterAction === "all" || entry.action === filterAction;
      
      return matchesSearch && matchesFilter;
    });
  }, [history, searchTerm, filterAction]);

  // Get unique actions for filter
  const uniqueActions = useMemo(() => {
    const actions = new Set(history.map(entry => entry.action));
    return ["all", ...Array.from(actions)];
  }, [history]);

  const handleCheckout = (entry: HistoryEntry, index: number) => {
    setRule(entry.rule, "Checkout", `Checked out to version from ${format(entry.timestamp, 'PPp')}`);
    toast.success(`Checked out to version ${index + 1}`);
    setOpen(false);
  };

  const getDiff = (before: any, after: any): string => {
    // Simple JSON diff visualization
    const beforeStr = JSON.stringify(before, null, 2);
    const afterStr = JSON.stringify(after, null, 2);
    
    if (beforeStr === afterStr) {
      return "No changes";
    }
    
    // For a more sophisticated diff, you could use a library like diff
    return `Before:\n${beforeStr}\n\nAfter:\n${afterStr}`;
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              View and manage the history of changes to your rule
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col gap-4">
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
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {uniqueActions.map(action => (
                  <option key={action} value={action}>
                    {action === "all" ? "All Actions" : action}
                  </option>
                ))}
              </select>
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
            <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
              {/* History List */}
              <Card className="flex flex-col">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">
                    History ({filteredHistory.length} entries)
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-2">
                      {filteredHistory.map((entry, index) => {
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
                              isPast && "opacity-60"
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
                                    <Badge variant="secondary" className="text-xs">
                                      Current
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {entry.description}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
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
                                    setCompareEntry(entry === compareEntry ? null : entry);
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
              <Card className="flex flex-col">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Details</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  {selectedEntry ? (
                    <Tabs defaultValue="details" className="h-full flex flex-col">
                      <TabsList className="m-4 mb-0">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="changes">Changes</TabsTrigger>
                        <TabsTrigger value="json">JSON</TabsTrigger>
                        {compareEntry && <TabsTrigger value="compare">Compare</TabsTrigger>}
                      </TabsList>
                      
                      <TabsContent value="details" className="flex-1 p-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2">Version Information</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Version:</span>
                                <span>v{history.indexOf(selectedEntry) + 1}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Action:</span>
                                <span>{selectedEntry.action}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Time:</span>
                                <span>{format(selectedEntry.timestamp, 'PPp')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground">
                              {selectedEntry.description}
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="changes" className="flex-1 p-0">
                        <ScrollArea className="h-full">
                          <div className="p-4">
                            {selectedEntry.changes ? (
                              <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                                <code>
                                  {getDiff(selectedEntry.changes.before, selectedEntry.changes.after)}
                                </code>
                              </pre>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No change details available
                              </p>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                      
                      <TabsContent value="json" className="flex-1 p-0">
                        <ScrollArea className="h-full">
                          <div className="p-4">
                            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                              <code>
                                {JSON.stringify(selectedEntry.rule, null, 2)}
                              </code>
                            </pre>
                          </div>
                        </ScrollArea>
                      </TabsContent>
                      
                      {compareEntry && (
                        <TabsContent value="compare" className="flex-1 p-0">
                          <ScrollArea className="h-full">
                            <div className="p-4">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium text-sm mb-2">
                                    Comparing v{history.indexOf(selectedEntry) + 1} with v{history.indexOf(compareEntry) + 1}
                                  </h4>
                                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                                    <code>
                                      {getDiff(compareEntry.rule, selectedEntry.rule)}
                                    </code>
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      )}
                    </Tabs>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Select a history entry to view details
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};