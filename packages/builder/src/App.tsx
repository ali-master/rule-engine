import React from "react";
import { Toaster } from "sonner";
import { TreeRuleBuilder } from "./components/TreeRuleBuilder";
import "./styles/globals.css";

const sampleData = {
  user: {
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    isActive: true,
    role: "admin",
    tags: ["premium", "verified", "beta"],
    profile: {
      bio: "Software developer",
      preferences: {
        theme: "dark",
        notifications: true,
      },
    },
  },
  product: {
    id: "prod-456",
    name: "Premium Widget",
    price: 99.99,
    inStock: true,
    category: "electronics",
    tags: ["featured", "bestseller"],
  },
  order: {
    id: "order-789",
    total: 299.97,
    status: "processing",
    itemCount: 3,
    createdAt: new Date().toISOString(),
  },
};

export function App() {
  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto py-4 px-4">
          <h1 className="text-3xl font-bold">Rule Engine Builder</h1>
          <p className="text-muted-foreground mt-1">
            Build and test complex business rules
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <TreeRuleBuilder
          sampleData={sampleData}
          onChange={React.useCallback(
            (rule: any) => console.log("Rule:", rule),
            [],
          )}
          showJsonViewer={true}
          showToolbar={true}
        />
      </main>
    </div>
  );
}

// Initialize theme
if (typeof window !== "undefined") {
  const root = document.documentElement;
  const theme = localStorage.getItem("rule-builder-theme") || "system";

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
}
