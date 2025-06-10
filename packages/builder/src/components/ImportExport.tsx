import React from "react";
import { Button } from "./ui/button";
import { Upload, Download } from "lucide-react";
import { Input } from "./ui/input";
import type { ImportExportProps } from "../types";
import type { RuleType } from "@usex/rule-engine";
import { cn } from "../lib/utils";

export const ImportExport: React.FC<ImportExportProps> = ({
  onImport,
  onExport,
  className,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const rule = onExport();
    const json = JSON.stringify(rule, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rule-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const rule: RuleType = JSON.parse(content);
        onImport(rule);
      } catch (error) {
        console.error("Failed to import rule:", error);
        console.error("Invalid rule JSON file");
      }
    };
    reader.readAsText(file);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImport}
        className="hidden"
        id="rule-import"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        Import
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={handleExport}>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  );
};
