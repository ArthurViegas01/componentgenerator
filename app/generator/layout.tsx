import Link from "next/link";
import { LayoutDashboard, Library } from "lucide-react";
import { ThemeSelector } from "./components/ThemeSelector";

/**
 * Generator-only chrome: a slim top bar with the brand, theme controls and
 * a link back to the dashboard. The actual three-pane layout lives in
 * `page.tsx` so child routes can opt out of it later if needed.
 */
export default function GeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-gradient-to-br from-primary to-secondary" />
          <span className="text-sm font-semibold">UI Component Generator</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeSelector />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
