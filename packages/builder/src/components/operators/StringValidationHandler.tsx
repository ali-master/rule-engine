import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Type, Regex, Info, Hash, ArrowUpAZ, ArrowDownAZ } from "lucide-react";
import {
  TooltipTrigger,
  TooltipProvider,
  TooltipContent,
  Tooltip,
} from "../ui/tooltip";
import { AlertTitle, AlertDescription, Alert } from "../ui/alert";
import { CardContent, Card } from "../ui/card";
import type { OperatorHandlerProps } from "./index";

// Test regex pattern component
const TestRegexPattern: React.FC<{ pattern: string }> = ({ pattern }) => {
  const [testValue, setTestValue] = React.useState("");
  const [isValid, setIsValid] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (!testValue) {
      setIsValid(null);
      return;
    }
    try {
      const regex = new RegExp(pattern);
      setIsValid(regex.test(testValue));
    } catch {
      setIsValid(false);
    }
  }, [pattern, testValue]);

  return (
    <Card className="border-muted bg-muted/20">
      <CardContent className="p-3">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Test Input</Label>
          <Input
            value={testValue}
            onChange={(e) => setTestValue(e.target.value)}
            placeholder="Enter text to test against pattern"
            className="text-sm"
          />
          {testValue && (
            <div className="flex items-center gap-2">
              <Badge
                variant={isValid ? "default" : "destructive"}
                className="text-xs"
              >
                {isValid ? "Match" : "No Match"}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const StringValidationHandler: React.FC<OperatorHandlerProps> = ({
  operator,
  value,
  onChange,
  field,
  disabled,
}) => {
  const needsPattern = ["matches", "not-matches"].includes(operator);

  const getValidationInfo = () => {
    const info = {
      alpha: {
        title: "Alphabetic Only",
        description: "String contains only alphabetic characters (a-z, A-Z)",
        icon: Type,
        color: "text-blue-600 dark:text-blue-400",
        examples: [
          '"Hello" ✓',
          '"Test" ✓',
          '"Hello123" ✗',
          '"Hello World" ✗ (space)',
        ],
        needsValue: false,
      },
      "alpha-numeric": {
        title: "Alphanumeric Only",
        description:
          "String contains only letters and numbers (no spaces or special chars)",
        icon: Hash,
        color: "text-green-600 dark:text-green-400",
        examples: [
          '"Hello123" ✓',
          '"Test456" ✓',
          '"Hello World" ✗',
          '"Hello-123" ✗',
        ],
        needsValue: false,
      },
      "lower-case": {
        title: "Lowercase Only",
        description: "String contains only lowercase characters",
        icon: ArrowDownAZ,
        color: "text-purple-600 dark:text-purple-400",
        examples: ['"hello" ✓', '"hello world" ✓', '"Hello" ✗', '"HELLO" ✗'],
        needsValue: false,
      },
      "upper-case": {
        title: "Uppercase Only",
        description: "String contains only uppercase characters",
        icon: ArrowUpAZ,
        color: "text-orange-600 dark:text-orange-400",
        examples: ['"HELLO" ✓', '"HELLO WORLD" ✓', '"Hello" ✗', '"hello" ✗'],
        needsValue: false,
      },
      matches: {
        title: "Matches Pattern",
        description: "String matches the provided regular expression",
        icon: Regex,
        color: "text-red-600 dark:text-red-400",
        examples: [
          'Pattern: ^[A-Z] → "Hello" ✓',
          'Pattern: \\d{3}-\\d{3} → "123-456" ✓',
        ],
        needsValue: true,
      },
      "not-matches": {
        title: "Does Not Match Pattern",
        description: "String does NOT match the provided regular expression",
        icon: Regex,
        color: "text-cyan-600 dark:text-cyan-400",
        examples: ['Pattern: ^[A-Z] → "hello" ✓', 'Pattern: \\d{3} → "abc" ✓'],
        needsValue: true,
      },
    };
    return (
      info[operator as keyof typeof info] || {
        title: operator,
        description: "Custom string validation",
        icon: Info,
        color: "text-gray-600",
        examples: [],
        needsValue: false,
      }
    );
  };

  const validationInfo = getValidationInfo();
  const Icon = validationInfo.icon;

  // For non-pattern validators, we don't need a value
  React.useEffect(() => {
    if (!validationInfo.needsValue && value !== undefined) {
      onChange(undefined);
    }
  }, [value, onChange, validationInfo.needsValue]);

  const commonPatterns = [
    { label: "Phone (US)", pattern: "^\\(\\d{3}\\) \\d{3}-\\d{4}$" },
    { label: "Postal Code (US)", pattern: "^\\d{5}(-\\d{4})?$" },
    { label: "Hexadecimal", pattern: "^#?[0-9A-Fa-f]{6}$" },
    { label: "Username", pattern: "^[a-zA-Z0-9_]{3,16}$" },
    {
      label: "Strong Password",
      pattern:
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
    },
    {
      label: "IP Address",
      pattern:
        "^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label>String Validation</Label>
          <Badge variant="outline" className="text-xs">
            {validationInfo.needsValue
              ? "Pattern required"
              : "No config needed"}
          </Badge>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Icon className={`h-5 w-5 mt-0.5 ${validationInfo.color}`} />
              <div className="flex-1 space-y-2">
                <h4 className="font-medium">{validationInfo.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {validationInfo.description}
                </p>

                {validationInfo.examples.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Examples:
                    </p>
                    <div className="space-y-1">
                      {validationInfo.examples.map((example, index) => (
                        <code
                          key={index}
                          className="block text-xs bg-muted px-2 py-1 rounded"
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

      {needsPattern && (
        <>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Regular Expression Pattern</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">RegEx Tips:</p>
                    <ul className="text-xs space-y-1">
                      <li>• ^ - Start of string</li>
                      <li>• $ - End of string</li>
                      <li>• \\d - Any digit</li>
                      <li>• \\w - Any word character</li>
                      <li>• + - One or more</li>
                      <li>• * - Zero or more</li>
                      <li>• ? - Optional</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Textarea
              value={value || ""}
              onChange={(e) => onChange(e.target.value || undefined)}
              placeholder="Enter regular expression pattern"
              disabled={disabled}
              className="font-mono min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Common Patterns
            </Label>
            <div className="flex flex-wrap gap-2">
              {commonPatterns.map((pattern) => (
                <Button
                  key={pattern.label}
                  variant="outline"
                  size="sm"
                  onClick={() => onChange(pattern.pattern)}
                  disabled={disabled}
                >
                  {pattern.label}
                </Button>
              ))}
            </div>
          </div>

          {value && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Test Pattern
              </Label>
              <TestRegexPattern pattern={value} />
            </div>
          )}
        </>
      )}

      <Alert>
        <Icon className="h-4 w-4" />
        <AlertTitle className="text-sm">Validating Field</AlertTitle>
        <AlertDescription className="text-xs">
          <strong>{field}</strong> must {validationInfo.title.toLowerCase()}
          {value && (
            <span className="block mt-1 font-mono">Pattern: {value}</span>
          )}
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
