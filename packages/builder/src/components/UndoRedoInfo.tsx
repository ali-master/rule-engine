import React from "react";
import { RotateCw, RotateCcw, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { PopoverTrigger, PopoverContent, Popover } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";
import type { HistoryEntry } from "../stores/enhanced-rule-store";
import { formatDistanceToNow } from "date-fns";

interface UndoRedoInfoProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  undoInfo: HistoryEntry | null;
  redoInfo: HistoryEntry | null;
  historyInfo: { current: number; total: number; entries: HistoryEntry[] };
  className?: string;
}

export const UndoRedoInfo: React.FC<UndoRedoInfoProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  undoInfo,
  redoInfo,
  historyInfo,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo}
            title={
              undoInfo
                ? `Undo: ${undoInfo.description} (Ctrl+Z)`
                : "Undo (Ctrl+Z)"
            }
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">History</h4>
              <Badge variant="outline">
                {historyInfo.current + 1} / {historyInfo.total}
              </Badge>
            </div>
            <Separator />
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {historyInfo.entries.map((entry, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-2 rounded-md border text-sm",
                      index === historyInfo.current &&
                        "bg-primary/10 border-primary",
                      index < historyInfo.current && "opacity-60",
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{entry.action}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(entry.timestamp, {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {entry.description}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Press Ctrl+Z to undo</p>
              <p>• Press Ctrl+Y or Ctrl+Shift+Z to redo</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRedo}
        disabled={!canRedo}
        title={
          redoInfo ? `Redo: ${redoInfo.description} (Ctrl+Y)` : "Redo (Ctrl+Y)"
        }
      >
        <RotateCw className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <div className="flex items-center gap-1 px-2">
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          {historyInfo.entries[historyInfo.current]?.timestamp &&
            formatDistanceToNow(
              historyInfo.entries[historyInfo.current].timestamp,
              { addSuffix: true },
            )}
        </span>
      </div>
    </div>
  );
};
