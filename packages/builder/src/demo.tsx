import { useState, useEffect, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RuleBuilder } from "./components/rule-builder";
import { DebugTest } from "./debug-test";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { StoreDebugTest } from "./test-store-debug";
import {
  Zap,
  Star,
  Sparkles,
  Smartphone,
  Shield,
  Moon,
  Layers,
  Github,
  GitFork,
  ExternalLink,
  Code2,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { ecommerceFields } from "./data/sample-data";
import { operatorConfigs } from "./utils/operators";
import "./styles/globals.css";
import "./styles/animations.css";

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

interface StatsData {
  downloads: string;
  contributors: string;
  stars: string;
  loading: boolean;
}

function DemoApp() {
  const [mode, setMode] = useState<"builder" | "debug" | "store-debug">(
    "builder",
  );
  const [scrolled, setScrolled] = useState(false);
  const [stats, setStats] = useState<StatsData>({
    downloads: "50k+",
    contributors: "100+",
    stars: "4.9★",
    loading: true,
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch npm downloads - try both package names
        const npmResponse = await fetch(
          "https://api.npmjs.org/downloads/range/last-year/@usex/rule-engine-builder",
        ).catch(() =>
          fetch(
            "https://api.npmjs.org/downloads/range/last-year/@usex/rule-engine",
          ),
        );

        // Fetch GitHub data
        const githubResponse = await fetch(
          "https://api.github.com/repos/ali-master/rule-engine",
        );

        // Fetch contributors
        const contributorsResponse = await fetch(
          "https://api.github.com/repos/ali-master/rule-engine/contributors",
        );

        if (npmResponse.ok && githubResponse.ok && contributorsResponse.ok) {
          const npmData = await npmResponse.json();
          const githubData = await githubResponse.json();
          const contributorsData = await contributorsResponse.json();

          // Calculate total downloads
          const totalDownloads =
            npmData.downloads?.reduce(
              (total: number, day: { downloads: number }) =>
                total + day.downloads,
              0,
            ) || 0;

          // Format numbers
          const formatNumber = (num: number) => {
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
            if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
            return num.toString();
          };

          const formatStars = (stars: number) => {
            // Use actual star count, format it nicely
            if (stars >= 1000) {
              return `${(stars / 1000).toFixed(1)}k★`;
            }
            return `${stars}★`;
          };

          setStats({
            downloads: `${formatNumber(totalDownloads)}+`,
            contributors: `${contributorsData.length}+`,
            stars: formatStars(githubData.stargazers_count),
            loading: false,
          });
        }
      } catch (error) {
        console.warn("Failed to fetch stats:", error);
        // Keep default values if API fails
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    void fetchStats();
  }, []);

  return (
    <div className="min-h-screen w-full relative bg-black overflow-x-hidden">
      {/* Animated Background with Multiple Layers */}
      <div className="fixed inset-0 z-0">
        {/* Primary gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(6, 182, 212, 0.25), transparent 70%), #000000",
          }}
        />

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
          <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse animation-delay-4000" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
      {/* Enhanced Modern Header */}
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/90 backdrop-blur-xl border-b border-white/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-75" />
                <div className="relative bg-gradient-to-r from-cyan-500 to-blue-500 p-2.5 rounded-xl">
                  <Layers className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Rule Engine
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">
                  Visual Logic Designer
                </p>
              </div>
            </div>

            {/* Navigation and Actions */}
            <nav className="flex items-center gap-6">
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-6">
                <a
                  href="#features"
                  className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                >
                  Features
                </a>
                <a
                  href="#demo"
                  className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                >
                  Demo
                </a>
                <a
                  href="https://github.com/ali-master/rule-engine"
                  className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                >
                  Documentation
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/ali-master/rule-engine"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 hover:bg-white/5 rounded-lg"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>

                <a
                  href="https://github.com/ali-master/rule-engine"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur group-hover:blur-md transition-all duration-300" />
                  <div className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-200">
                    <Star className="w-4 h-4" />
                    <span>Star</span>
                  </div>
                </a>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section - Enhanced */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-7xl mx-auto text-center">
            {/* Floating elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-10 w-72 h-72 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-float" />
              <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float animation-delay-2000" />
            </div>

            {/* Hero Content */}
            <div className="relative space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-300">
                  Visual Business Logic Designer
                </span>
              </div>

              {/* Main Title */}
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                  <span className="text-white">Build Complex</span>
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Business Rules
                  </span>
                  <br />
                  <span className="text-white">Visually</span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                  Transform your IF-THEN logic into powerful, maintainable rule
                  configurations. Design, test, and deploy business rules with
                  our intuitive visual interface.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <a
                  href="#demo"
                  className="group relative inline-flex items-center gap-2 px-8 py-4 overflow-hidden rounded-xl font-semibold transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 group-hover:scale-105" />
                  <span className="relative flex items-center gap-2 text-white">
                    Try Live Demo
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>

                <a
                  href="https://github.com/ali-master/rule-engine"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-8 py-4 border border-gray-700 rounded-xl font-semibold text-gray-300 hover:text-white hover:border-gray-600 transition-all duration-300"
                >
                  <Github className="w-5 h-5" />
                  View on GitHub
                  <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center gap-8 sm:gap-12 pt-12">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white">
                    {stats.loading ? (
                      <div className="animate-pulse bg-gray-700 h-10 w-16 rounded mx-auto"></div>
                    ) : (
                      stats.downloads
                    )}
                  </div>
                  <div className="text-sm text-gray-400">Downloads</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white">
                    {stats.loading ? (
                      <div className="animate-pulse bg-gray-700 h-10 w-16 rounded mx-auto"></div>
                    ) : (
                      stats.contributors
                    )}
                  </div>
                  <div className="text-sm text-gray-400">Contributors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white">
                    {stats.loading ? (
                      <div className="animate-pulse bg-gray-700 h-10 w-16 rounded mx-auto"></div>
                    ) : (
                      stats.stars
                    )}
                  </div>
                  <div className="text-sm text-gray-400">GitHub Rating</div>
                </div>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
              <ChevronRight className="w-6 h-6 text-gray-400 rotate-90" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Powerful Features
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Everything you need to build, test, and deploy business rules at
                scale
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Feature 1 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Visual Rule Builder
                  </h3>
                  <p className="text-gray-400">
                    Drag-and-drop interface to create complex rules without
                    writing code. Perfect for business users and developers
                    alike.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Real-time Evaluation
                  </h3>
                  <p className="text-gray-400">
                    Test your rules instantly with live data. See results update
                    in real-time as you modify conditions.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Type-Safe
                  </h3>
                  <p className="text-gray-400">
                    Built with TypeScript for maximum type safety. Get
                    autocomplete and catch errors before runtime.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6">
                    <Code2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    JSON Export
                  </h3>
                  <p className="text-gray-400">
                    Export rules as clean JSON for easy storage and version
                    control. Import existing rules with one click.
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Mobile Responsive
                  </h3>
                  <p className="text-gray-400">
                    Fully responsive design that works seamlessly on all
                    devices. Build rules on the go.
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                    <Moon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Dark Mode
                  </h3>
                  <p className="text-gray-400">
                    Beautiful dark mode design that's easy on the eyes. Perfect
                    for long coding sessions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Code Examples Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                See It In Action
              </h2>
              <p className="text-lg text-gray-400">
                JSON-based rules that are both powerful and readable
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Example 1 */}
              <div className="group">
                <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
                  <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-6 py-4 border-b border-gray-800">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-cyan-400" />
                      Simple AND Rule
                    </h3>
                  </div>
                  <pre className="p-6 text-sm overflow-x-auto">
                    <code className="text-gray-300">
                      {JSON.stringify(
                        {
                          conditions: {
                            and: [
                              {
                                field: "user.age",
                                operator: "greater_than",
                                value: 18,
                              },
                              {
                                field: "user.status",
                                operator: "equals",
                                value: "active",
                              },
                            ],
                          },
                        },
                        null,
                        2,
                      )}
                    </code>
                  </pre>
                  <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-800">
                    <p className="text-sm text-gray-400">
                      Check if user is over 18 AND has active status
                    </p>
                  </div>
                </div>
              </div>

              {/* Example 2 */}
              <div className="group">
                <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-6 py-4 border-b border-gray-800">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-purple-400" />
                      Nested Conditions
                    </h3>
                  </div>
                  <pre className="p-6 text-sm overflow-x-auto">
                    <code className="text-gray-300">
                      {JSON.stringify(
                        {
                          conditions: {
                            and: [
                              {
                                field: "user.role",
                                operator: "equals",
                                value: "admin",
                              },
                              {
                                or: [
                                  {
                                    field: "user.department",
                                    operator: "equals",
                                    value: "IT",
                                  },
                                  {
                                    field: "user.department",
                                    operator: "equals",
                                    value: "Security",
                                  },
                                ],
                              },
                            ],
                          },
                        },
                        null,
                        2,
                      )}
                    </code>
                  </pre>
                  <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-800">
                    <p className="text-sm text-gray-400">
                      Admin users from IT OR Security departments
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Interactive Demo
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Try the Rule Builder yourself. Create, test, and export rules in
                real-time.
              </p>
            </div>

            {/* Demo Mode Selector */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-gray-900/50 border border-gray-800 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setMode("builder")}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    mode === "builder"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  Rule Builder
                </button>
                <button
                  type="button"
                  onClick={() => setMode("debug")}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    mode === "debug"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  Debug Test
                </button>
                <button
                  type="button"
                  onClick={() => setMode("store-debug")}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    mode === "store-debug"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  Store Debug
                </button>
              </div>
            </div>

            {/* Demo Container */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>

              {/* Demo Content */}
              <div className="relative bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 px-6 py-4 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-sm text-gray-400">
                        {mode === "builder"
                          ? "Rule Builder"
                          : mode === "debug"
                            ? "Debug Test"
                            : "Store Debug"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 lg:p-10">
                  {mode === "debug" ? (
                    <DebugTest />
                  ) : mode === "store-debug" ? (
                    <StoreDebugTest />
                  ) : (
                    <RuleBuilder
                      fields={ecommerceFields}
                      operators={operatorConfigs}
                      onRuleChange={(rule) =>
                        console.log("Rule changed:", rule)
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="relative z-10 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          {/* Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-lg opacity-75" />
                  <div className="relative bg-gradient-to-r from-cyan-500 to-blue-500 p-2.5 rounded-xl">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Rule Engine</h3>
                  <p className="text-sm text-gray-400">Visual Logic Designer</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The ultimate JSON-based rule engine that transforms complex
                business logic into maintainable, declarative configurations.
                Built for modern applications.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://github.com/ali-master/rule-engine"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Github className="w-5 h-5 text-gray-300" />
                </a>
                <a
                  href="#"
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Star className="w-5 h-5 text-gray-300" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://github.com/ali-master/rule-engine#readme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    Documentation
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ali-master/rule-engine/blob/master/CHANGELOG.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    Changelog
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    API Reference
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Examples
                  </a>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="font-semibold text-white mb-4">Community</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://github.com/ali-master/rule-engine/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    GitHub Issues
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ali-master/rule-engine/discussions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    Discussions
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ali-master/rule-engine/fork"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    Fork Project
                    <GitFork className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ali-master"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    Follow @ali-master
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center sm:text-left">
              © 2025{" "}
              <a
                href="https://github.com/ali-master"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors"
              >
                Ali Torki
              </a>
              . MIT License.
            </p>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Analytics />
    <SpeedInsights />
    <DemoApp />
  </StrictMode>,
);
