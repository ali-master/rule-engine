import React from "react";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Type,
  ToggleLeft,
  Link,
  Key,
  Info,
  Hash,
  CheckCircle2,
  Calendar,
  Box,
  AtSign,
} from "lucide-react";
import { AlertTitle, AlertDescription, Alert } from "../ui/alert";
import { CardContent, Card } from "../ui/card";
import { Input } from "../ui/input";
import {
  TooltipTrigger,
  TooltipProvider,
  TooltipContent,
  Tooltip,
} from "../ui/tooltip";
import type { OperatorHandlerProps } from "./index";

export const TypeValidationHandler: React.FC<OperatorHandlerProps> = ({
  operator,
  value,
  onChange,
  field,
  disabled,
}) => {
  const getTypeInfo = () => {
    const info: Record<
      string,
      {
        title: string;
        description: string;
        icon: any;
        color: string;
        examples: string[];
        config: boolean;
        configLabel?: string;
        configPlaceholder?: string;
      }
    > = {
      string: {
        title: "String Type",
        description: "Validates that the value is a string",
        icon: Type,
        color: "text-blue-600 dark:text-blue-400",
        examples: ['"hello" ✓', "123 ✗", "true ✗", "null ✗"],
        config: false,
      },
      number: {
        title: "Number Type",
        description: "Validates that the value is a number",
        icon: Hash,
        color: "text-green-600 dark:text-green-400",
        examples: ["123 ✓", "45.67 ✓", '"123" ✗', "NaN ✗"],
        config: false,
      },
      boolean: {
        title: "Boolean Type",
        description: "Validates that the value is a boolean",
        icon: ToggleLeft,
        color: "text-purple-600 dark:text-purple-400",
        examples: ["true ✓", "false ✓", '"true" ✗', "1 ✗"],
        config: false,
      },
      array: {
        title: "Array Type",
        description: "Validates that the value is an array",
        icon: Box,
        color: "text-orange-600 dark:text-orange-400",
        examples: ["[] ✓", "[1,2,3] ✓", '["a","b"] ✓', "{} ✗", '"array" ✗'],
        config: false,
      },
      object: {
        title: "Object Type",
        description:
          "Validates that the value is an object (not array or null)",
        icon: Box,
        color: "text-indigo-600 dark:text-indigo-400",
        examples: ["{} ✓", "{a: 1} ✓", "[] ✗", "null ✗"],
        config: false,
      },
      email: {
        title: "Email Format",
        description: "Validates that the value is a valid email address",
        icon: AtSign,
        color: "text-red-600 dark:text-red-400",
        examples: [
          "user@example.com ✓",
          "test@sub.domain.com ✓",
          "invalid@email ✗",
          "not-an-email ✗",
        ],
        config: true,
        configLabel: "Additional pattern (optional)",
        configPlaceholder: "e.g., @company.com$",
      },
      url: {
        title: "URL Format",
        description: "Validates that the value is a valid URL",
        icon: Link,
        color: "text-cyan-600 dark:text-cyan-400",
        examples: [
          "https://example.com ✓",
          "http://sub.domain.com:8080/path ✓",
          "ftp://files.com ✓",
          "not-a-url ✗",
        ],
        config: true,
        configLabel: "Required protocol (optional)",
        configPlaceholder: "e.g., https",
      },
      uuid: {
        title: "UUID Format",
        description: "Validates that the value is a valid UUID",
        icon: Key,
        color: "text-yellow-600 dark:text-yellow-400",
        examples: [
          "550e8400-e29b-41d4-a716-446655440000 ✓",
          "12345 ✗",
          "not-a-uuid ✗",
        ],
        config: true,
        configLabel: "UUID version (optional)",
        configPlaceholder: "e.g., 4",
      },
      date: {
        title: "Date Type",
        description: "Validates that the value is a valid date",
        icon: Calendar,
        color: "text-pink-600 dark:text-pink-400",
        examples: [
          "2024-01-01 ✓",
          "new Date() ✓",
          "2024-13-45 ✗",
          "invalid-date ✗",
        ],
        config: false,
      },
    };
    return (
      info[operator as keyof typeof info] || {
        title: operator,
        description: "Custom type validation",
        icon: Info,
        color: "text-gray-600",
        examples: [],
        config: false,
      }
    );
  };

  const typeInfo = getTypeInfo();
  const Icon = typeInfo.icon;

  // For most type validators, we don't need a value
  React.useEffect(() => {
    if (!typeInfo.config && value !== undefined) {
      onChange(undefined);
    }
  }, [value, onChange, typeInfo.config]);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label>Type Validation</Label>
          <Badge variant="outline" className="text-xs">
            {typeInfo.config ? "Optional config" : "No config needed"}
          </Badge>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Icon className={`h-5 w-5 mt-0.5 ${typeInfo.color}`} />
              <div className="flex-1 space-y-2">
                <h4 className="font-medium">{typeInfo.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {typeInfo.description}
                </p>

                {typeInfo.examples.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Examples:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {typeInfo.examples.map((example, index) => (
                        <code
                          key={index}
                          className="text-xs bg-muted px-2 py-1 rounded"
                        >
                          {example}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {typeInfo.config && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>{typeInfo.configLabel}</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    {operator === "email" &&
                      "Add a pattern to further restrict email format"}
                    {operator === "url" &&
                      "Specify required protocol (http, https, ftp, etc.)"}
                    {operator === "uuid" && "Specify UUID version (1, 3, 4, 5)"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value || undefined)}
            placeholder={typeInfo.configPlaceholder}
            disabled={disabled}
            className="font-mono"
          />
        </div>
      )}

      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle className="text-sm">Validating Field</AlertTitle>
        <AlertDescription className="text-xs">
          <strong>{field}</strong> must be a valid{" "}
          {typeInfo.title.toLowerCase()}
          {value && operator === "email" && (
            <span> matching pattern: {value}</span>
          )}
          {value && operator === "url" && <span> with protocol: {value}</span>}
          {value && operator === "uuid" && <span> (version {value})</span>}
        </AlertDescription>
      </Alert>

      <div className="p-3 bg-muted rounded-md">
        <p className="text-xs text-muted-foreground mb-2">Rule Preview:</p>
        <code className="text-xs font-mono">
          {field} {operator} {value && `"${value}"`}
        </code>
      </div>
    </div>
  );
};
