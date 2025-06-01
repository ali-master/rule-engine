import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Info,
  Regex,
  TestTube,
  X,
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

interface RegexValidatorProps {
  value: string;
  onChange: (value: string) => void;
  testString?: string;
  onTestStringChange?: (value: string) => void;
  showVisualizer?: boolean;
  className?: string;
}

interface RegexMatch {
  index: number;
  value: string;
  groups?: Record<string, string>;
}

const commonPatterns = [
  { name: "Email", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
  { name: "URL", pattern: "^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&\\/\\/=]*)$" },
  { name: "Phone (US)", pattern: "^\\+?1?\\s?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$" },
  { name: "Date (YYYY-MM-DD)", pattern: "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$" },
  { name: "Time (HH:MM)", pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$" },
  { name: "IPv4", pattern: "^((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}$" },
  { name: "Hex Color", pattern: "^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$" },
  { name: "Username", pattern: "^[a-zA-Z0-9_]{3,16}$" },
  { name: "Password (Strong)", pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$" },
  { name: "Credit Card", pattern: "^\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}$" },
];

const regexFlags = [
  { flag: "i", name: "Case Insensitive", description: "Match regardless of case" },
  { flag: "g", name: "Global", description: "Find all matches" },
  { flag: "m", name: "Multiline", description: "^ and $ match line boundaries" },
  { flag: "s", name: "Dot All", description: ". matches newlines" },
  { flag: "u", name: "Unicode", description: "Enable unicode support" },
];

export const RegexValidator: React.FC<RegexValidatorProps> = ({
  value,
  onChange,
  testString = "",
  onTestStringChange,
  showVisualizer = true,
  className,
}) => {
  const [localTestString, setLocalTestString] = useState(testString);
  const [flags, setFlags] = useState("");
  const [regexError, setRegexError] = useState<string | null>(null);
  const [matches, setMatches] = useState<RegexMatch[]>([]);

  // Extract flags from the regex pattern if it's in /pattern/flags format
  useEffect(() => {
    const match = value.match(/^\/(.*)\/([gimsu]*)$/);
    if (match) {
      setFlags(match[2] || "");
    }
  }, [value]);

  // Create regex object and validate
  const regex = useMemo(() => {
    try {
      // Check if it's in /pattern/flags format
      const match = value.match(/^\/(.*)\/([gimsu]*)$/);
      if (match) {
        return new RegExp(match[1], match[2]);
      }
      // Otherwise treat as a plain pattern
      return new RegExp(value, flags);
    } catch (error) {
      setRegexError(error instanceof Error ? error.message : "Invalid regex");
      return null;
    }
  }, [value, flags]);

  // Test the regex against the test string
  useEffect(() => {
    if (!regex || !localTestString) {
      setMatches([]);
      return;
    }

    setRegexError(null);
    const foundMatches: RegexMatch[] = [];

    try {
      if (regex.global) {
        let match;
        while ((match = regex.exec(localTestString)) !== null) {
          foundMatches.push({
            index: match.index,
            value: match[0],
            groups: match.groups,
          });
        }
      } else {
        const match = regex.exec(localTestString);
        if (match) {
          foundMatches.push({
            index: match.index,
            value: match[0],
            groups: match.groups,
          });
        }
      }
      setMatches(foundMatches);
    } catch (error) {
      setRegexError(error instanceof Error ? error.message : "Error testing regex");
    }
  }, [regex, localTestString]);

  const handleFlagToggle = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ""));
    } else {
      setFlags(flags + flag);
    }
  };

  const handlePatternSelect = (pattern: string) => {
    onChange(pattern);
    toast.success("Pattern applied");
  };

  const handleCopyPattern = async (pattern: string) => {
    try {
      await navigator.clipboard.writeText(pattern);
      toast.success("Pattern copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy pattern");
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Regex className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Regex Validator</CardTitle>
          </div>
          {regex && !regexError && (
            <Badge variant="outline" className="text-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Valid
            </Badge>
          )}
          {regexError && (
            <Badge variant="outline" className="text-destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              Invalid
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Regex Input */}
        <div className="space-y-2">
          <Label>Regular Expression</Label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter regex pattern..."
            className={cn(
              "font-mono text-sm",
              regexError && "border-destructive"
            )}
          />
          {regexError && (
            <p className="text-xs text-destructive">{regexError}</p>
          )}
        </div>

        {/* Flags */}
        <div className="space-y-2">
          <Label>Flags</Label>
          <div className="flex flex-wrap gap-2">
            {regexFlags.map((flagInfo) => (
              <TooltipProvider key={flagInfo.flag}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={flags.includes(flagInfo.flag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFlagToggle(flagInfo.flag)}
                      className="h-7 px-2"
                    >
                      {flagInfo.flag}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{flagInfo.name}</p>
                    <p className="text-xs">{flagInfo.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        {/* Test String */}
        <div className="space-y-2">
          <Label>Test String</Label>
          <Input
            value={localTestString}
            onChange={(e) => {
              setLocalTestString(e.target.value);
              onTestStringChange?.(e.target.value);
            }}
            placeholder="Enter text to test against..."
            className="font-mono text-sm"
          />
        </div>

        {/* Matches */}
        {localTestString && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Matches</Label>
              <Badge variant="secondary">
                {matches.length} {matches.length === 1 ? "match" : "matches"}
              </Badge>
            </div>
            {matches.length > 0 ? (
              <ScrollArea className="h-[100px] w-full rounded-md border p-2">
                <div className="space-y-1">
                  {matches.map((match, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <code className="px-2 py-1 bg-muted rounded">
                        {match.value}
                      </code>
                      <span className="text-xs text-muted-foreground">
                        Index: {match.index}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No matches found in the test string
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Visual Representation */}
        {showVisualizer && localTestString && regex && !regexError && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label>Visual Representation</Label>
              <div className="p-3 bg-muted/50 rounded-md font-mono text-sm break-all">
                {localTestString.split("").map((char, index) => {
                  const isPartOfMatch = matches.some(
                    (match) =>
                      index >= match.index &&
                      index < match.index + match.value.length
                  );
                  return (
                    <span
                      key={index}
                      className={cn(
                        isPartOfMatch &&
                          "bg-primary/20 text-primary font-semibold"
                      )}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Common Patterns */}
        <Separator />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Common Patterns</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to use, or copy pattern</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ScrollArea className="h-[150px] w-full">
            <div className="space-y-1 pr-4">
              {commonPatterns.map((pattern) => (
                <div
                  key={pattern.name}
                  className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md group"
                >
                  <button
                    className="flex-1 text-left"
                    onClick={() => handlePatternSelect(pattern.pattern)}
                  >
                    <p className="text-sm font-medium">{pattern.name}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {pattern.pattern}
                    </p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100"
                    onClick={() => handleCopyPattern(pattern.pattern)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};