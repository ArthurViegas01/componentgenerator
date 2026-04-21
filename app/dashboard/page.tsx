import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stats } from "./components/Stats";
import { RecentActivity } from "./components/RecentActivity";
import { SavedComponents } from "./components/SavedComponents";

/**
 * User dashboard: overview of saved components, recent activity and usage
 * stats. All data is sourced from the client-side Zustand store today —
 * once the backend lands, these widgets should hit `/api/history` instead.
 */
export default function DashboardPage() {
  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Your component library at a glance.
          </p>
        </div>
        <Link href="/generator">
          <Button leftIcon={<Sparkles className="h-3.5 w-3.5" />} size="sm">
            New component
          </Button>
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-6 space-y-6">
        <Stats />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SavedComponents />
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>
      </section>
    </main>
  );
}
