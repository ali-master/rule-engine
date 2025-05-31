import "./globals.css";

import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";
import { META_THEME_COLORS, SITE_INFO } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_INFO.url),
  title: {
    template: `%s | ${SITE_INFO.name}`,
    default: SITE_INFO.name,
  },
  description: "Rule Engine",
  keywords: ["rule engine", "rule"],
  authors: [
    {
      name: "Ali Torki",
      url: "https://usestrict.dev",
    },
  ],
  creator: "Ali Torki",
  openGraph: {
    siteName: SITE_INFO.name,
    url: "/",
    images: [
      {
        url: SITE_INFO.metaImage,
        width: 1200,
        height: 630,
        alt: "Rule Engine",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Thanks @shadcn-ui */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            try {
              if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
              }
            } catch (_) {}
          `,
          }}
        />
      </head>

      <body
        className={`${GeistSans.variable} ${GeistMono.variable} container mx-auto`}
      >
        <div className="min-h-screen sm:border-x">
          <Providers>
            <Header />
            {children}
            <Footer />
          </Providers>
        </div>
      </body>
    </html>
  );
}
