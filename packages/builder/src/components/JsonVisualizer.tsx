"use client"

import * as React from "react"
import { ChevronRight, ChevronDown, Copy, Check, MoreHorizontal, ChevronUp } from "lucide-react"
import { cn } from "../lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

type JsonViewerProps = {
  data: any
  rootName?: string
  defaultExpanded?: boolean
  className?: string
  highlightLogicalOperators?: boolean
}

export function JsonViewer({ data, rootName = "root", defaultExpanded = true, className, highlightLogicalOperators = false }: JsonViewerProps) {
  return (
    <TooltipProvider>
      <div className={cn("font-mono text-sm", className)}>
        <JsonNode name={rootName} data={data} isRoot={true} defaultExpanded={defaultExpanded} highlightLogicalOperators={highlightLogicalOperators} />
      </div>
    </TooltipProvider>
  )
}

type JsonNodeProps = {
  name: string
  data: any
  isRoot?: boolean
  defaultExpanded?: boolean
  level?: number
  highlightLogicalOperators?: boolean
}

function JsonNode({ name, data, isRoot = false, defaultExpanded = true, level = 0, highlightLogicalOperators = false }: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)
  const [isCopied, setIsCopied] = React.useState(false)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const dataType = data === null ? "null" : Array.isArray(data) ? "array" : typeof data
  const isExpandable = data !== null && data !== undefined && !(data instanceof Date) && (dataType === "object" || dataType === "array")
  const itemCount = isExpandable && data !== null && data !== undefined ? Object.keys(data).length : 0
  
  // Check if this is a logical operator node (or, and, none)
  const isLogicalOperator = highlightLogicalOperators && (name === "or" || name === "and" || name === "none")
  const isRootOperator = highlightLogicalOperators && isRoot && data && typeof data === "object" && ("or" in data || "and" in data || "none" in data)

  return (
    <div className={cn("pl-4 group/object", level > 0 && "border-l border-border")}>
      <div
        className={cn(
          "flex items-center gap-1 py-1 rounded px-1 -ml-4 cursor-pointer group/property transition-colors",
          isRoot && !isRootOperator && "text-primary font-semibold",
          isLogicalOperator && name === "or" && "bg-blue-500/10 hover:bg-blue-500/20",
          isLogicalOperator && name === "and" && "bg-green-500/10 hover:bg-green-500/20",
          isLogicalOperator && name === "none" && "bg-red-500/10 hover:bg-red-500/20",
          isRootOperator && "bg-primary/5 hover:bg-primary/10",
          !isLogicalOperator && !isRootOperator && "hover:bg-muted/50",
        )}
        onClick={isExpandable ? handleToggle : undefined}
      >
        {isExpandable ? (
          <div className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
        ) : (
          <div className="w-4" />
        )}

        <span className={cn(
          "font-medium",
          isLogicalOperator && name === "or" && "text-blue-600 dark:text-blue-400",
          isLogicalOperator && name === "and" && "text-green-600 dark:text-green-400",
          isLogicalOperator && name === "none" && "text-red-600 dark:text-red-400",
          !isLogicalOperator && "text-primary"
        )}>
          {isLogicalOperator ? name.toUpperCase() : name}
        </span>

        <span className="text-muted-foreground">
          {isExpandable ? (
            <>
              {dataType === "array" ? "[" : "{"}
              {!isExpanded && (
                <span className="text-muted-foreground">
                  {" "}
                  {itemCount} {itemCount === 1 ? "item" : "items"} {dataType === "array" ? "]" : "}"}
                </span>
              )}
            </>
          ) : (
            ":"
          )}
        </span>

        {!isExpandable && <JsonValue data={data} />}

        {!isExpandable && <div className="w-3.5" />}

        <button
          onClick={copyToClipboard}
          className="ml-auto opacity-0 group-hover/property:opacity-100 hover:bg-muted p-1 rounded"
          title="Copy to clipboard"
        >
          {isCopied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
      </div>

      {isExpandable && isExpanded && data !== null && data !== undefined && (
        <div className="pl-4">
          {Object.keys(data).map((key) => (
            <JsonNode
              key={key}
              name={dataType === "array" ? `${key}` : key}
              data={data[key]}
              level={level + 1}
              defaultExpanded={level < 1}
              highlightLogicalOperators={highlightLogicalOperators}
            />
          ))}
          <div className="text-muted-foreground pl-4 py-1">{dataType === "array" ? "]" : "}"}</div>
        </div>
      )}
    </div>
  )
}

// Update the JsonValue function to make the entire row clickable with an expand icon
function JsonValue({ data }: { data: any }) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const dataType = typeof data
  const TEXT_LIMIT = 80 // Character limit before truncation

  if (data === null) {
    return <span className="text-rose-500">null</span>
  }

  if (data === undefined) {
    return <span className="text-muted-foreground">undefined</span>
  }

  if (data instanceof Date) {
    return <span className="text-purple-500">{data.toISOString()}</span>
  }

  switch (dataType) {
    case "string":
      if (data.length > TEXT_LIMIT) {
        return (
          <div
            className="text-emerald-500 flex-1 flex items-center relative group cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {`"`}
            {isExpanded ? (
              <span className="inline-block max-w-full">{data}</span>
            ) : (
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <span className="inline-block max-w-full">{data.substring(0, TEXT_LIMIT)}...</span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-md text-xs p-2 break-words">
                  {data}
                </TooltipContent>
              </Tooltip>
            )}
            {`"`}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+4px)] opacity-0 group-hover:opacity-100 transition-opacity">
              {isExpanded ? (
                <ChevronUp className="h-3 w-3 text-muted-foreground" />
              ) : (
                <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </div>
        )
      }
      return <span className="text-emerald-500">{`"${data}"`}</span>
    case "number":
      return <span className="text-amber-500">{data}</span>
    case "boolean":
      return <span className="text-blue-500">{data.toString()}</span>
    default:
      return <span>{String(data)}</span>
  }
}