import type { Constraint } from "@usex/rule-engine";
import type { FieldConfig } from "../types";
import { Operators } from "@usex/rule-engine";
import {
  Trash2,
  Regex,
  Layers,
  Info,
  HelpCircle,
  Copy,
  Code2,
  AlertCircle,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { operatorHelp } from "../constants/operator-help";
import { cn } from "../lib/utils";
import { getOperatorConfig } from "../utils/operators";
import { DynamicFieldSelector } from "./DynamicFieldSelector";
import { SmartValueInput } from "./inputs/SmartValueInput";
import { SmartOperatorSelector } from "./SmartOperatorSelector";
import { RegexValidator } from "./RegexValidator";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { CollapsibleContent, Collapsible } from "./ui/collapsible";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  SheetTrigger,
  SheetTitle,
  SheetHeader,
  SheetDescription,
  SheetContent,
  Sheet,
} from "./ui/sheet";
import { TabsTrigger, TabsList, Tabs } from "./ui/tabs";
import {
  TooltipTrigger,
  TooltipProvider,
  TooltipContent,
  Tooltip,
} from "./ui/tooltip";
import { VisualFieldSelector } from "./VisualFieldSelector";
import { AdvancedFieldInput } from "./AdvancedFieldInput";

interface TreeConstraintEditorProps {
  constraint: Constraint;
  path?: number[];
  fields?: FieldConfig[];
  sampleData?: Record<string, any>;
  customOperators?: Record<string, any>;
  onUpdate: (constraint: Constraint) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  readOnly?: boolean;
}

export const TreeConstraintEditor: React.FC<TreeConstraintEditorProps> = ({
  constraint,
  path: _path,
  fields,
  sampleData,
  customOperators,
  onUpdate,
  onRemove,
  onDuplicate,
  readOnly = false,
}) => {
  const [localConstraint, setLocalConstraint] = useState(constraint);
  const [isFieldValid, setIsFieldValid] = useState(true);
  const [isValueValid, setIsValueValid] = useState(true);
  const [fieldSelectorMode, setFieldSelectorMode] = useState<
    "dynamic" | "visual" | "advanced"
  >("advanced");
  const [showHelp, setShowHelp] = useState(false);

  // Update local state when constraint prop changes
  useEffect(() => {
    setLocalConstraint(constraint);
  }, [constraint]);

  const operatorConfig = getOperatorConfig(localConstraint.operator);
  const selectedField = fields?.find((f) => f.name === localConstraint.field);

  const handleFieldChange = (field: string) => {
    const updated = { ...localConstraint, field };
    setLocalConstraint(updated);
    onUpdate(updated);
    setIsFieldValid(!!field);
  };

  const handleOperatorChange = (operator: any) => {
    const updated = { ...localConstraint, operator };

    // Reset value if operator changes to one that doesn't need a value
    const newOperatorConfig = getOperatorConfig(operator);
    if (newOperatorConfig?.valueType === "none") {
      updated.value = undefined;
    }

    setLocalConstraint(updated);
    onUpdate(updated);
  };

  const handleValueChange = (value: any) => {
    const updated = { ...localConstraint, value };
    setLocalConstraint(updated);
    onUpdate(updated);
    setIsValueValid(value !== undefined && value !== "");
  };

  const handleMessageChange = (message: string) => {
    const updated = {
      ...localConstraint,
      message: message || undefined,
    };
    setLocalConstraint(updated);
    onUpdate(updated);
  };

  // Validate constraint
  const needsValue = operatorConfig?.valueType !== "none";
  const isValid = isFieldValid && (!needsValue || isValueValid);

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all",
        "hover:shadow-sm",
        !isValid && "border-destructive",
      )}
    >
      <div className="p-4 space-y-4">
        {/* Field and Operator Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Field</Label>
                {selectedField?.description && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{selectedField.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {sampleData && (
                <Tabs
                  value={fieldSelectorMode}
                  onValueChange={(v) =>
                    setFieldSelectorMode(v as "dynamic" | "visual" | "advanced")
                  }
                >
                  <TabsList className="h-7">
                    <TabsTrigger value="advanced" className="h-6 px-2 text-xs">
                      <Regex className="h-3 w-3 mr-1" />
                      Smart
                    </TabsTrigger>
                    <TabsTrigger value="dynamic" className="h-6 px-2 text-xs">
                      <Code2 className="h-3 w-3 mr-1" />
                      List
                    </TabsTrigger>
                    <TabsTrigger value="visual" className="h-6 px-2 text-xs">
                      <Layers className="h-3 w-3 mr-1" />
                      Visual
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>
            {fieldSelectorMode === "advanced" ? (
              <AdvancedFieldInput
                value={localConstraint.field}
                onChange={handleFieldChange}
                fields={fields}
                sampleData={sampleData}
                disabled={readOnly}
                allowJsonPath={true}
                showPreview={true}
                placeholder="Type to search or enter field path..."
              />
            ) : fieldSelectorMode === "dynamic" ? (
              <DynamicFieldSelector
                value={localConstraint.field}
                onChange={handleFieldChange}
                fields={fields}
                sampleData={sampleData}
                disabled={readOnly}
                allowCustom={true}
                showJsonPath={true}
              />
            ) : (
              <VisualFieldSelector
                value={localConstraint.field}
                onChange={handleFieldChange}
                fields={fields}
                sampleData={sampleData}
                disabled={readOnly}
                allowJsonPath={true}
                showPreview={true}
              />
            )}
            {!isFieldValid && (
              <p className="text-xs text-destructive">Field is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Operator</Label>
            <div className="flex items-center gap-2">
              <SmartOperatorSelector
                value={localConstraint.operator}
                onChange={handleOperatorChange}
                fieldName={localConstraint.field}
                fieldType={selectedField?.type}
                disabled={readOnly}
                customOperators={customOperators}
                className="flex-1"
              />
              {localConstraint.operator &&
                operatorHelp[localConstraint.operator] && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setShowHelp(!showHelp)}
                        >
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-medium">
                          {operatorHelp[localConstraint.operator].name}
                        </p>
                        <p className="text-xs">
                          {operatorHelp[localConstraint.operator].description}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
            </div>
          </div>
        </div>

        {/* Operator Help Section */}
        {showHelp &&
          localConstraint.operator &&
          operatorHelp[localConstraint.operator] && (
            <Collapsible open={showHelp}>
              <CollapsibleContent>
                <Card className="bg-muted/50 border-muted">
                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm">
                        {operatorHelp[localConstraint.operator].name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {operatorHelp[localConstraint.operator].description}
                      </p>
                    </div>

                    {operatorHelp[localConstraint.operator].examples.length >
                      0 && (
                      <div>
                        <h5 className="text-xs font-medium text-muted-foreground mb-2">
                          Examples:
                        </h5>
                        <div className="space-y-2">
                          {operatorHelp[localConstraint.operator].examples.map(
                            (example, index) => (
                              <div
                                key={index}
                                className="bg-background rounded-md p-2 text-xs"
                              >
                                <code className="text-primary">
                                  {example.field} {localConstraint.operator}{" "}
                                  {JSON.stringify(example.value)}
                                </code>
                                <p className="text-muted-foreground mt-1">
                                  {example.explanation}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {operatorHelp[localConstraint.operator].tips &&
                      operatorHelp[localConstraint.operator].tips!.length >
                        0 && (
                        <div>
                          <h5 className="text-xs font-medium text-muted-foreground mb-2">
                            Tips:
                          </h5>
                          <ul className="space-y-1">
                            {operatorHelp[localConstraint.operator].tips!.map(
                              (tip, index) => (
                                <li
                                  key={index}
                                  className="text-xs text-muted-foreground flex items-start"
                                >
                                  <span className="mr-2">•</span>
                                  <span>{tip}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          )}

        {/* Value Input */}
        {operatorConfig?.valueType !== "none" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Value</Label>
              {operatorConfig?.valueType && (
                <Badge variant="outline" className="text-xs">
                  {operatorConfig.valueType}
                </Badge>
              )}
              {/* Regex Helper for matches/not matches operators */}
              {(localConstraint.operator === Operators.Matches ||
                localConstraint.operator === Operators.NotMatches) && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <Regex className="h-3 w-3 mr-1" />
                      Regex Helper
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[500px] sm:max-w-[500px]">
                    <SheetHeader>
                      <SheetTitle>Regular Expression Helper</SheetTitle>
                      <SheetDescription>
                        Test and validate your regular expression pattern
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <RegexValidator
                        value={
                          typeof localConstraint.value === "string"
                            ? localConstraint.value
                            : ""
                        }
                        onChange={handleValueChange}
                        testString={
                          selectedField && sampleData
                            ? String(sampleData[selectedField.name] || "")
                            : ""
                        }
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
            <SmartValueInput
              value={localConstraint.value}
              onChange={handleValueChange}
              operator={localConstraint.operator}
              field={selectedField}
              sampleData={sampleData}
              disabled={readOnly}
            />
            {!isValueValid && needsValue && (
              <p className="text-xs text-destructive">Value is required</p>
            )}
          </div>
        )}

        {/* Error Message */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Error Message</Label>
            <Badge variant="outline" className="text-xs">
              Optional
            </Badge>
          </div>
          <div className="relative">
            <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={localConstraint.message || ""}
              onChange={(e) => handleMessageChange(e.target.value)}
              placeholder="Custom error message when this rule fails"
              disabled={readOnly}
              className="pl-10"
            />
          </div>
        </div>

        {/* Actions and Preview */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground font-mono">
              {localConstraint.field}{" "}
              {operatorConfig?.label || localConstraint.operator}
              {localConstraint.value !== undefined && (
                <> {JSON.stringify(localConstraint.value)}</>
              )}
            </div>
            {localConstraint.operator &&
              operatorHelp[localConstraint.operator] && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p className="font-medium">
                          {operatorHelp[localConstraint.operator].name}
                        </p>
                        <p className="text-xs">
                          {operatorHelp[localConstraint.operator].description}
                        </p>
                        {operatorHelp[localConstraint.operator].tips &&
                          operatorHelp[localConstraint.operator].tips!.length >
                            0 && (
                            <div className="text-xs space-y-1 pt-1 border-t">
                              {operatorHelp[localConstraint.operator]
                                .tips!.slice(0, 1)
                                .map((tip, i) => (
                                  <p key={i} className="text-muted-foreground">
                                    💡 {tip}
                                  </p>
                                ))}
                            </div>
                          )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
          </div>

          {!readOnly && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDuplicate}
                title="Duplicate"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-destructive hover:text-destructive"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
