import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const APP_URL = "https://uicomponentgenerator.netlify.app";

export const metadata: Metadata = {
  title: {
    default: "UI Component Generator",
    template: "%s · UI Component Generator",
  },
  description:
    "Generate production-ready React + Tailwind components from a single sentence. Live streaming, Monaco editor, in-browser preview — free with Groq.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: "UI Component Generator",
    description:
      "Describe a component in plain English, watch the code stream in token by token, and see the live preview render instantly — no build step.",
    url: APP_URL,
    siteName: "UI Component Generator",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "UI Component Generator",
    description:
      "Describe a component in plain English, watch the code stream in token by token, and see the live preview render instantly — no build step.",
  },
  robots: { index: true, follow: true },
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
