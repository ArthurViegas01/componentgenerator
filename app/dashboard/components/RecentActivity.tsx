"use client";

import { Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useComponentHistory } from "@/lib/hooks/useComponentHistory";

/** Chronological list of the last 10 edits/generations. */
export function RecentActivity() {
  const { components } = useComponentHistory();

  const recent = [...components]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 10);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm">Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {recent.length === 0 ? (
          <p className="p-4 text-center text-xs text-muted-foreground">
            No activity yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((c) => (
              <li key={c.id} className="flex items-start gap-2 px-4 py-2.5">
                <Clock className="h-3.5 w-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{c.name}</p>
                  <p className="line-clamp-1 text-[11px] text-muted-foreground">
                    {c.prompt}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {relative(c.updatedAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function relative(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}
