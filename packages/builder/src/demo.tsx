import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ModernRuleBuilder } from "./components/ModernRuleBuilder";
import "./styles/globals.css";

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

const sampleData = {
  user: {
    id: "123",
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    isActive: true,
    role: "admin",
    tags: ["premium", "verified"],
  },
  product: {
    id: "prod-456",
    name: "Premium Widget",
    price: 99.99,
    inStock: true,
    category: "electronics",
  },
  order: {
    total: 299.97,
    status: "processing",
    items: 3,
  },
};

function DemoApp() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Rule Engine Builder Demo</h1>
          <p className="text-muted-foreground mt-2">
            Build complex business rules with an intuitive interface
          </p>
        </div>

        <ModernRuleBuilder
          sampleData={sampleData}
          onChange={(rule) => console.log("Rule changed:", rule)}
        />
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
);
