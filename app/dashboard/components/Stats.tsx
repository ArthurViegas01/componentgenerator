"use client";

import { Library, Star, Tag, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useComponentHistory } from "@/lib/hooks/useComponentHistory";

/** Compact KPI row for the dashboard hero. */
export function Stats() {
  const { components, favorites, tagBuckets } = useComponentHistory();

  const thisWeek = components.filter(
    (c) => Date.now() - c.createdAt < 7 * 24 * 60 * 60 * 1000
  ).length;

  const items = [
    {
      label: "Total components",
      value: components.length,
      icon: <Library className="h-4 w-4" />,
    },
    {
      label: "Favorites",
      value: favorites.length,
      icon: <Star className="h-4 w-4" />,
    },
    {
      label: "Unique tags",
      value: tagBuckets.size,
      icon: <Tag className="h-4 w-4" />,
    },
    {
      label: "Generated this week",
      value: thisWeek,
      icon: <Sparkles className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <Card key={it.label}>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {it.label}
              </p>
              <p className="mt-1 text-2xl font-semibold">{it.value}</p>
            </div>
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              {it.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
