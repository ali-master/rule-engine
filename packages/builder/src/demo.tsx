import { useState, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RuleBuilder } from "./components/RuleBuilder";
import { DebugTest } from "./debug-test";
import { StoreDebugTest } from "./test-store-debug";
import { Star, Github, GitFork, ExternalLink } from "lucide-react";
import { ecommerceFields } from "./data/sample-data";
import { operatorConfigs } from "./utils/operators";
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

function DemoApp() {
  const [mode, setMode] = useState<"builder" | "debug" | "store-debug">(
    "builder",
  );

  return (
    <div className="min-h-screen w-full relative bg-black">
      {/* Ocean Abyss Background with Top Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6, 182, 212, 0.25), transparent 70%), #000000",
        }}
      />
      {/* Mobile-First Responsive Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title - Mobile optimized */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <img
                src="/icon.svg"
                alt="Rule Engine Builder Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate text-white">
                  Rule Engine Builder
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">
                  Visual rule construction toolkit for React
                </p>
              </div>
            </div>

            {/* Action Buttons - Mobile responsive */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* Mobile: Show icons only, Desktop: Show text + icons */}
              <a
                href="https://github.com/ali-master/rule-engine"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                title="View on GitHub"
              >
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>

              <a
                href="https://github.com/ali-master/rule-engine"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-sm font-medium bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
                title="Star on GitHub"
              >
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">Star</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile-First */}
      <main className="relative z-10 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Hero Section - Mobile optimized */}
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Interactive Demo
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-none sm:max-w-2xl mx-auto px-2 sm:px-0">
              Build complex business rules with an intuitive drag-and-drop
              interface. Transform IF-THEN decisions into visual flows with
              real-time evaluation.
            </p>

            {/* Feature Highlights - Mobile responsive grid */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 mt-4 sm:mt-6 px-2 sm:px-0">
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                TypeScript Support
              </span>
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Real-time Evaluation
              </span>
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Undo/Redo History
              </span>
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                JSONPath Support
              </span>
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Visual Programming
              </span>
            </div>
          </div>

          {/* JSON Examples Section */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              Rule JSON Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-cyan-300">
                  Simple AND Rule
                </h4>
                <pre className="bg-black/40 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                  {`{
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
}`}
                </pre>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-cyan-300">
                  Nested OR Inside AND
                </h4>
                <pre className="bg-black/40 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                  {`{
  "conditions": {
    "and": [
      {
        "field": "user.role",
        "operator": "equals",
        "value": "admin"
      },
      {
        "or": [
          {
            "field": "user.department",
            "operator": "equals",
            "value": "IT"
          },
          {
            "field": "user.department",
            "operator": "equals",
            "value": "Security"
          }
        ]
      }
    ]
  }
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Builder Toggle */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-background rounded-lg p-1">
              <button
                type="button"
                onClick={() => setMode("builder")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "builder"
                    ? "bg-accent text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Rule Builder
              </button>
              <button
                type="button"
                onClick={() => setMode("debug")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "debug"
                    ? "bg-accent text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Debug Test
              </button>
              <button
                type="button"
                onClick={() => setMode("store-debug")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "store-debug"
                    ? "bg-accent text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Store Debug
              </button>
            </div>
          </div>

          {/* Rule Builder - Full responsive */}
          <div className="w-full">
            {mode === "debug" ? (
              <div className="bg-white dark:bg-background rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <DebugTest />
              </div>
            ) : mode === "store-debug" ? (
              <div className="bg-white dark:bg-background rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <StoreDebugTest />
              </div>
            ) : (
              <div className="bg-white dark:bg-background rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <RuleBuilder
                  fields={ecommerceFields}
                  operators={operatorConfigs}
                  onRuleChange={(rule) => console.log("Rule changed:", rule)}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile-First Responsive Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-12 sm:mt-16 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Brand Section */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-white">
                Rule Engine Builder
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 leading-relaxed">
                The ultimate JSON-based rule engine that turns complex business
                logic into declarative configurations. Built for developers who
                believe code should be expressive, not repetitive.
              </p>
              <div className="flex gap-2">
                <a
                  href="https://github.com/ali-master/rule-engine"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  title="GitHub Repository"
                >
                  <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-span-1">
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-white">
                Quick Links
              </h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li>
                  <a
                    href="https://github.com/ali-master/rule-engine#readme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    Documentation <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ali-master/rule-engine/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    Issues <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ali-master/rule-engine/blob/master/CHANGELOG.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    Changelog <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div className="col-span-1">
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-white">
                Community
              </h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li>
                  <a
                    href="https://github.com/ali-master/rule-engine/fork"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <GitFork className="w-3 h-3" /> Fork Project
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ali-master/rule-engine/stargazers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Star className="w-3 h-3" /> Star on GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ali-master"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    Follow @ali-master <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Section */}
          <div className="border-t border-white/10 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
              © 2025{" "}
              <a
                href="https://github.com/ali-master"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors underline underline-offset-2"
              >
                Ali Torki
              </a>
              . Released under the MIT License.
            </p>
            <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-right">
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
