import type { FieldConfig } from "../types";
import {
  Braces,
  Calendar,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Eye,
  EyeOff,
  FileJson,
  GripVertical,
  Hash,
  Layers,
  List,
  Search,
  ToggleRight,
  Type,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { cn } from "../lib/utils";
import { JsonViewer } from "./JsonVisualizer";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface VisualFieldSelectorProps {
  value: string;
  onChange: (value: string) => void;
  fields?: FieldConfig[];
  sampleData?: Record<string, any>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowJsonPath?: boolean;
  showPreview?: boolean;
}

interface FieldNode {
  path: string;
  name: string;
  type: string;
  value?: any;
  children?: FieldNode[];
  isArray?: boolean;
  arrayIndex?: number;
  depth: number;
}

const typeIcons = {
  string: Type,
  number: Hash,
  boolean: ToggleRight,
  date: Calendar,
  array: List,
  object: Braces,
  null: FileJson,
  undefined: FileJson,
};

function getTypeColor(type: string) {
  const colors = {
    string: "text-green-600 dark:text-green-400",
    number: "text-blue-600 dark:text-blue-400",
    boolean: "text-purple-600 dark:text-purple-400",
    date: "text-orange-600 dark:text-orange-400",
    array: "text-yellow-600 dark:text-yellow-400",
    object: "text-pink-600 dark:text-pink-400",
    null: "text-gray-600 dark:text-gray-400",
    undefined: "text-gray-600 dark:text-gray-400",
  };
  return (
    colors[type as keyof typeof colors] || "text-gray-600 dark:text-gray-400"
  );
}

const DraggableField: React.FC<{
  node: FieldNode;
  onSelect: (path: string) => void;
  selectedPath?: string;
  searchTerm: string;
}> = ({ node, onSelect, selectedPath, searchTerm }) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "field",
      item: { path: node.path, type: node.type },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [node.path, node.type],
  );

  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedPath === node.path;

  const matchesSearch = searchTerm
    ? node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.path.toLowerCase().includes(searchTerm.toLowerCase())
    : true;

  if (
    !matchesSearch &&
    !node.children?.some(
      (child) =>
        child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.path.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  ) {
    return null;
  }

  const TypeIcon = typeIcons[node.type as keyof typeof typeIcons] || FileJson;

  return (
    <div className={cn("select-none", isDragging && "opacity-50")}>
      <div
        ref={drag as any}
        onClick={() => onSelect(node.path)}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          isSelected && "bg-primary text-primary-foreground",
          !matchesSearch && "opacity-50",
        )}
        style={{ paddingLeft: `${node.depth * 16 + 8}px` }}
      >
        <div className="flex items-center gap-1">
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>

        <TypeIcon className={cn("h-4 w-4", getTypeColor(node.type))} />

        <span className="flex-1 text-sm font-medium truncate">
          {node.name}
          {node.arrayIndex !== undefined && (
            <span className="text-muted-foreground ml-1">
              [{node.arrayIndex}]
            </span>
          )}
        </span>

        <Badge variant="outline" className="text-xs">
          {node.type}
        </Badge>
      </div>

      {expanded && hasChildren && (
        <div className="ml-2">
          {node.children?.map((child) => (
            <DraggableField
              key={child.path}
              node={child}
              onSelect={onSelect}
              selectedPath={selectedPath}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function buildFieldTree(
  data: any,
  path: string = "$",
  name: string = "root",
  depth: number = 0,
): FieldNode {
  const type = Array.isArray(data) ? "array" : typeof data;
  const node: FieldNode = {
    path,
    name,
    type,
    value: type === "object" || type === "array" ? undefined : data,
    depth,
  };

  if (type === "object" && data !== null) {
    node.children = Object.entries(data).map(([key, value]) => {
      return buildFieldTree(value, `${path}.${key}`, key, depth + 1);
    });
  } else if (type === "array") {
    node.children = data.slice(0, 10).map((item: any, index: number) => {
      const childNode = buildFieldTree(
        item,
        `${path}[${index}]`,
        `[${index}]`,
        depth + 1,
      );
      childNode.arrayIndex = index;
      childNode.isArray = true;
      return childNode;
    });
    if (data.length > 10) {
      if (!node.children) {
        node.children = [];
      }
      // Add a summary node for additional items
      node.children.push({
        path: `${path}[*]`,
        name: `... ${data.length - 10} more items`,
        type: "info",
        depth: depth + 1,
      });
    }
  }

  return node;
}

const VisualFieldSelectorInner: React.FC<VisualFieldSelectorProps> = ({
  value,
  onChange,
  fields = [],
  sampleData,
  placeholder = "Select a field",
  disabled = false,
  className,
  allowJsonPath = true,
  showPreview = true,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState(value);
  const [searchTerm, setSearchTerm] = useState("");
  const [manualPath, setManualPath] = useState("");
  const [showValuePreview, setShowValuePreview] = useState(true);

  const fieldTree = useMemo(() => {
    if (!sampleData) {
      return null;
    }
    return buildFieldTree(sampleData);
  }, [sampleData]);

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: "field",
      drop: (item: { path: string; type: string }) => {
        onChange(item.path);
        setSelectedPath(item.path);
        setOpen(false);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [onChange],
  );

  const handleSelect = useCallback((path: string) => {
    setSelectedPath(path);
  }, []);

  const handleConfirm = () => {
    onChange(selectedPath);
    setOpen(false);
  };

  const handleManualSubmit = () => {
    onChange(manualPath);
    setSelectedPath(manualPath);
    setOpen(false);
  };

  const getValuePreview = useCallback(
    (path: string) => {
      if (!sampleData || !path) {
        return null;
      }

      try {
        const pathParts = path
          .replace("$", "")
          .split(/[.[\]]/)
          .filter(Boolean);
        let current = sampleData;

        for (const part of pathParts) {
          if (current === null || current === undefined) {
            return null;
          }

          if (part === "*") {
            return Array.isArray(current) ? "[Array items]" : null;
          }

          current = current[part];
        }

        return current;
      } catch {
        return null;
      }
    },
    [sampleData],
  );

  const previewValue = getValuePreview(selectedPath);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          ref={drop as any}
          className={cn(
            "relative",
            canDrop && "ring-2 ring-primary",
            isOver && "ring-4",
            className,
          )}
        >
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              value && "font-mono text-xs",
            )}
          >
            {value ? (
              <div className="flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                <span className="truncate">{value}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <Layers className="h-4 w-4 ml-2" />
          </Button>
          {canDrop && (
            <div className="absolute inset-0 bg-primary/10 pointer-events-none rounded-md" />
          )}
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Field</DialogTitle>
          <DialogDescription>
            Choose a field from the data structure or enter a custom JSON path
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="visual" className="flex-1 flex flex-col">
          <TabsList
            className={cn(
              "grid w-full",
              allowJsonPath ? "grid-cols-3" : "grid-cols-2",
            )}
          >
            <TabsTrigger value="visual">Visual Explorer</TabsTrigger>
            <TabsTrigger value="fields">Defined Fields</TabsTrigger>
            {allowJsonPath && (
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="visual" className="flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              {showPreview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowValuePreview(!showValuePreview)}
                  title="Toggle value preview"
                >
                  {showValuePreview ? (
                    <>
                      <Eye className="h-4 w-4 mr-1" /> Hide Preview
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" /> Show Preview
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="flex-1 flex gap-4 min-h-0">
              <Card className="flex-1 p-4">
                <ScrollArea className="h-full">
                  {fieldTree ? (
                    <DraggableField
                      node={fieldTree}
                      onSelect={handleSelect}
                      selectedPath={selectedPath}
                      searchTerm={searchTerm}
                    />
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No sample data available
                    </div>
                  )}
                </ScrollArea>
              </Card>

              {showValuePreview && showPreview && (
                <Card className="w-80 p-4">
                  <h4 className="font-medium mb-2">Preview</h4>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Path
                      </Label>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded flex-1">
                          {selectedPath || "No selection"}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (selectedPath) {
                              navigator.clipboard.writeText(selectedPath);
                            }
                          }}
                          disabled={!selectedPath}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {previewValue !== null && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Value
                        </Label>
                        <Card className="overflow-hidden">
                          <div className="p-2 max-h-32 overflow-auto">
                            <JsonViewer
                              data={previewValue}
                              rootName="value"
                              defaultExpanded={true}
                              className="text-xs"
                            />
                          </div>
                        </Card>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={!selectedPath}>
                Select Field
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="fields" className="flex-1 flex flex-col gap-4">
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {fields.map((field) => (
                  <Card
                    key={field.name}
                    className={cn(
                      "p-3 cursor-pointer transition-colors",
                      "hover:bg-accent",
                      selectedPath === field.name &&
                        "bg-primary text-primary-foreground",
                    )}
                    onClick={() => {
                      setSelectedPath(field.name);
                      onChange(field.name);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {React.createElement(
                        typeIcons[field.type as keyof typeof typeIcons] ||
                          FileJson,
                        {
                          className: cn(
                            "h-4 w-4",
                            getTypeColor(field.type || "undefined"),
                          ),
                        },
                      )}
                      <div className="flex-1">
                        <div className="font-medium">
                          {field.label || field.name}
                        </div>
                        {field.description && (
                          <div className="text-xs text-muted-foreground">
                            {field.description}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline">{field.type}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {allowJsonPath && (
            <TabsContent value="manual" className="flex-1 flex flex-col gap-4">
              <div className="space-y-4">
                <div>
                  <Label>JSON Path Expression</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={manualPath}
                      onChange={(e) => setManualPath(e.target.value)}
                      placeholder="$.user.profile.name"
                      className="font-mono"
                    />
                    <Button onClick={handleManualSubmit} disabled={!manualPath}>
                      Apply
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Common Patterns</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { path: "$.field", desc: "Root field" },
                      { path: "$.parent.child", desc: "Nested field" },
                      { path: "$.array[0]", desc: "Array index" },
                      { path: "$.array[*]", desc: "All array items" },
                      { path: "$..field", desc: "Recursive search" },
                      {
                        path: "$.array[?(@.active)]",
                        desc: "Filter expression",
                      },
                    ].map((example) => (
                      <Button
                        key={example.path}
                        variant="outline"
                        size="sm"
                        className="justify-start"
                        onClick={() => setManualPath(example.path)}
                      >
                        <Code2 className="h-3 w-3 mr-2" />
                        <div className="text-left">
                          <div className="font-mono text-xs">
                            {example.path}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {example.desc}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export const VisualFieldSelector: React.FC<VisualFieldSelectorProps> = (
  props,
) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <VisualFieldSelectorInner {...props} />
    </DndProvider>
  );
};
