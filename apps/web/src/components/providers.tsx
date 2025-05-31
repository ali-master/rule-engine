"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { Analytics } from "@vercel/analytics/next";
import { Provider as JotaiProvider } from "jotai";
import { ThemeProvider } from "next-themes";

import { Toaster } from "./ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <ThemeProvider
        enableSystem
        disableTransitionOnChange
        enableColorScheme
        storageKey="theme"
        defaultTheme="system"
        attribute="class"
      >
        <ProgressProvider
          color="#2563eb"
          height="2px"
          delay={500}
          options={{ showSpinner: false }}
        >
          {children}
        </ProgressProvider>

        <Toaster />
        <Analytics />
      </ThemeProvider>
    </JotaiProvider>
  );
}
