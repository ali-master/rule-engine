import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

interface ResizablePanelProps {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  direction?: "horizontal" | "vertical";
  onResize?: (size: number) => void;
  children: [React.ReactNode, React.ReactNode];
  className?: string;
  handleClassName?: string;
  persistId?: string;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  defaultSize = 40,
  minSize = 20,
  maxSize = 80,
  direction = "horizontal",
  onResize,
  children,
  className,
  handleClassName,
  persistId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(() => {
    if (persistId) {
      const saved = localStorage.getItem(`resizable-panel-${persistId}`);
      return saved ? parseFloat(saved) : defaultSize;
    }
    return defaultSize;
  });
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      let newSize: number;
      if (direction === "horizontal") {
        const position = ((e.clientX - rect.left) / rect.width) * 100;
        newSize = Math.max(minSize, Math.min(maxSize, position));
      } else {
        const position = ((e.clientY - rect.top) / rect.height) * 100;
        newSize = Math.max(minSize, Math.min(maxSize, position));
      }

      setSize(newSize);
      onResize?.(newSize);
      
      if (persistId) {
        localStorage.setItem(`resizable-panel-${persistId}`, newSize.toString());
      }
    },
    [isDragging, direction, minSize, maxSize, onResize, persistId]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, direction]);

  const isHorizontal = direction === "horizontal";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex h-full w-full",
        isHorizontal ? "flex-row" : "flex-col",
        className
      )}
    >
      {/* First Panel */}
      <div
        className={cn(
          "overflow-hidden",
          isHorizontal ? "h-full" : "w-full"
        )}
        style={{
          [isHorizontal ? "width" : "height"]: `${size}%`,
        }}
      >
        {children[0]}
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "relative group flex items-center justify-center",
          isHorizontal ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize",
          "hover:bg-primary/10 transition-colors",
          isDragging && "bg-primary/20",
          handleClassName
        )}
      >
        {/* Visual indicator */}
        <div
          className={cn(
            "absolute rounded-full bg-border transition-all",
            "group-hover:bg-primary/50",
            isDragging && "bg-primary",
            isHorizontal
              ? "h-8 w-1 group-hover:w-1.5"
              : "w-8 h-1 group-hover:h-1.5"
          )}
        />
        
        {/* Draggable area */}
        <div
          className={cn(
            "absolute",
            isHorizontal ? "inset-y-0 -inset-x-1" : "inset-x-0 -inset-y-1"
          )}
        />
      </div>

      {/* Second Panel */}
      <div
        className={cn(
          "flex-1 overflow-hidden",
          isHorizontal ? "h-full" : "w-full"
        )}
      >
        {children[1]}
      </div>
    </div>
  );
};