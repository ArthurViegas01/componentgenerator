import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "UI Component Generator",
  description:
    "Generate production-ready React + Tailwind components from natural language.",
};

/**
 * Root layout. Note that we attach the Geist font CSS variables here so
 * Tailwind's `font-sans` / `font-mono` aliases resolve correctly. If you
 * don't want the `geist` package, swap these for `next/font/google`.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
