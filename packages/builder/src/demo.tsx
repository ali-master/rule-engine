import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ModernRuleBuilder } from "./components/ModernRuleBuilder";
import { Star, Github, GitFork, ExternalLink } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      {/* Header with Logo and GitHub Links */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/icon.svg"
                alt="Rule Engine Builder Logo"
                className="w-12 h-12"
              />
              <div>
                <h1 className="text-2xl font-bold">Rule Engine Builder</h1>
                <p className="text-sm text-muted-foreground">
                  Visual rule construction toolkit for React
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/ali-master/rule-engine"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>

              <a
                href="https://github.com/ali-master/rule-engine"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Star className="w-4 h-4" />
                Star
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Interactive Demo</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Build complex business rules with an intuitive drag-and-drop
              interface. Transform IF-THEN decisions into visual flows with
              real-time evaluation.
            </p>

            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                TypeScript Support
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Real-time Evaluation
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Undo/Redo History
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                JSONPath Support
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Visual Programming
              </span>
            </div>
          </div>

          <ModernRuleBuilder
            sampleData={sampleData}
            onChange={(rule) => console.log("Rule changed:", rule)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Rule Engine Builder</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The ultimate JSON-based rule engine that turns complex business
                logic into declarative configurations. Built for developers who
                believe code should be expressive, not repetitive.
              </p>
              <div className="flex gap-2">
                <a
                  href="https://github.com/ali-master/rule-engine"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://github.com/ali-master/rule-engine#readme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    Documentation <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ali-master/rule-engine/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    Issues <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ali-master/rule-engine/blob/master/CHANGELOG.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    Changelog <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://github.com/ali-master/rule-engine/fork"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <GitFork className="w-3 h-3" /> Fork Project
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ali-master/rule-engine/stargazers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <Star className="w-3 h-3" /> Star on GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ali-master"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    Follow @ali-master <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025{" "}
              <a
                href="https://github.com/ali-master"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-foreground/80 transition-colors underline underline-offset-2"
              >
                Ali Torki
              </a>
              . Released under the MIT License.
            </p>
            <p className="text-sm text-muted-foreground">
              Built with React, TypeScript, and Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
);
