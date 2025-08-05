import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import {
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogContent,
  Dialog,
} from "./ui/dialog";
import {
  Upload,
  Import,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { RuleType } from "@usex/rule-engine";

interface RuleImportModalProps {
  onImport: (rule: RuleType) => void;
  className?: string;
}

export const RuleImportModal: React.FC<RuleImportModalProps> = ({
  onImport,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(textarea.scrollHeight, 120)}px`;
    }
  };

  const validateAndImportJson = (jsonString: string) => {
    setError(null);
    setSuccess(false);

    if (!jsonString.trim()) {
      setError("Please enter a JSON rule");
      return;
    }

    try {
      const rule: RuleType = JSON.parse(jsonString);

      // Basic validation
      if (!rule.conditions) {
        throw new Error("Rule must have a 'conditions' property");
      }

      // Additional validation for the conditions structure
      const condition = rule.conditions;
      if (typeof condition !== "object" || condition === null) {
        throw new Error("Conditions must be an object");
      }

      const hasValidStructure =
        ("and" in condition && Array.isArray(condition.and)) ||
        ("or" in condition && Array.isArray(condition.or)) ||
        ("none" in condition && Array.isArray(condition.none));

      if (!hasValidStructure) {
        throw new Error(
          "Conditions must have at least one of: 'and', 'or', or 'none' properties with array values",
        );
      }

      onImport(rule);
      setSuccess(true);

      // Clear after successful import and close modal
      setTimeout(() => {
        setJsonText("");
        setSuccess(false);
        setError(null);
        setOpen(false);
        adjustTextareaHeight();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format");
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
    setError(null);
    setSuccess(false);
    adjustTextareaHeight();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      setError("Please select a JSON file (.json)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      adjustTextareaHeight();
      validateAndImportJson(content);
    };

    reader.onerror = () => {
      setError("Failed to read file");
    };

    reader.readAsText(file);

    // Clear the input so the same file can be selected again
    e.target.value = "";
  };

  const handleImportFromTextarea = () => {
    validateAndImportJson(jsonText);
  };

  const handleClear = () => {
    setJsonText("");
    setError(null);
    setSuccess(false);
    adjustTextareaHeight();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when closing
      setJsonText("");
      setError(null);
      setSuccess(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      adjustTextareaHeight();
    }
  }, [open]);

  const sampleJson = `{
  "conditions": {
    "and": [
      {
        "field": "user.age",
        "operator": "greater_than",
        "value": 18
      },
      {
        "field": "user.status",
        "operator": "equals",
        "value": "active"
      }
    ]
  }
}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Import className="h-4 w-4 mr-2" />
          Import Rule JSON
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <FileText className="h-5 w-5" />
            Import Rule JSON
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Import a rule by uploading a JSON file or pasting JSON directly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Upload Section */}
          <div className="space-y-2">
            <Label
              htmlFor="file-upload"
              className="text-gray-700 dark:text-gray-300"
            >
              Upload JSON File
            </Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Choose JSON File
              </Button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Select a .json file from your computer
              </span>
            </div>
          </div>

          {/* Text Area Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="json-textarea"
                className="text-gray-700 dark:text-gray-300"
              >
                Or Paste JSON
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setJsonText(sampleJson)}
                className="text-xs"
              >
                Insert Sample
              </Button>
            </div>
            <Textarea
              ref={textareaRef}
              id="json-textarea"
              value={jsonText}
              onChange={handleTextareaChange}
              placeholder="Paste your rule JSON here..."
              className="min-h-[120px] font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              style={{ resize: "none" }}
            />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {error && (
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">Rule imported successfully!</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {jsonText && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                  >
                    Clear
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleImportFromTextarea}
                  disabled={!jsonText.trim()}
                  size="sm"
                >
                  Import JSON
                </Button>
              </div>
            </div>
          </div>

          {/* Sample JSON Display */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              Expected JSON Format
            </Label>
            <pre className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded text-xs overflow-x-auto border border-gray-200 dark:border-gray-600">
              {sampleJson}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
