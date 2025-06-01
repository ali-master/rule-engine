import React from "react";
import { DiffViewer } from "./DiffViewer";

// Example demonstrating the DiffViewer component
export const DiffViewerDemo = () => {
  const oldRule = {
    id: "rule-1",
    name: "Premium Customer Rule",
    conditions: {
      type: "and",
      conditions: [
        {
          field: "customer.type",
          operator: "eq",
          value: "premium",
        },
        {
          field: "order.total",
          operator: "gte",
          value: 1000,
        },
      ],
    },
    actions: [
      {
        type: "discount",
        value: 10,
      },
    ],
  };

  const newRule = {
    id: "rule-1",
    name: "Premium Customer Rule - Updated",
    conditions: {
      type: "and",
      conditions: [
        {
          field: "customer.type",
          operator: "eq",
          value: "premium",
        },
        {
          field: "order.total",
          operator: "gte",
          value: 1500, // Changed from 1000
        },
        {
          field: "customer.membership.duration",
          operator: "gte",
          value: 365, // New condition added
        },
      ],
    },
    actions: [
      {
        type: "discount",
        value: 15, // Changed from 10
      },
      {
        type: "freeShipping",
        value: true, // New action added
      },
    ],
  };

  return (
    <div className="h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto h-full">
        <h1 className="text-2xl font-bold mb-4">DiffViewer Component Demo</h1>
        <p className="text-muted-foreground mb-6">
          This component provides a GitHub-style diff viewer for comparing JSON rules.
          Toggle between unified and split view, collapse unchanged sections, and copy
          content from either side.
        </p>
        
        <div className="h-[calc(100%-120px)]">
          <DiffViewer
            oldValue={oldRule}
            newValue={newRule}
            title="Rule Changes"
            oldTitle="Previous Version"
            newTitle="Current Version"
          />
        </div>
      </div>
    </div>
  );
};