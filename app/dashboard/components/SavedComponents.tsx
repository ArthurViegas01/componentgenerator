"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useComponentHistory } from "@/lib/hooks/useComponentHistory";
import { useEditorStore } from "@/lib/store/editorStore";

/**
 * Saved components grid. Clicking a card loads it into the generator; the
 * star/trash actions are surfaced on hover to keep the default UI calm.
 */
export function SavedComponents() {
  const { components, toggleFavorite, remove } = useComponentHistory();
  const setCode = useEditorStore((s) => s.setCode);
  const setPrompt = useEditorStore((s) => s.setPrompt);
  const [q, setQ] = useState("");

  const filtered = components
    .filter((c) => {
      const needle = q.trim().toLowerCase();
      if (!needle) return true;
      return (
        c.name.toLowerCase().includes(needle) ||
        c.prompt.toLowerCase().includes(needle) ||
        c.tags.some((t) => t.toLowerCase().includes(needle))
      );
    })
    .sort((a, b) => {
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm">Your components</CardTitle>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="h-8 max-w-[180px] text-xs"
        />
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            {components.length === 0 ? (
              <>
                Nothing saved yet —{" "}
                <Link href="/generator" className="text-primary hover:underline">
                  generate your first component
                </Link>
                .
              </>
            ) : (
              "No matches."
            )}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="group rounded-md border border-border p-3 hover:border-primary transition"
              >
                <Link
                  href="/generator"
                  onClick={() => {
                    setCode(c.code);
                    setPrompt(c.prompt);
                  }}
                  className="block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium truncate">
                      {c.name}
                    </span>
                    {c.favorite && (
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                    {c.prompt}
                  </p>
                  {c.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.tags.map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="text-[9px] py-0"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Link>
                <div className="mt-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => toggleFavorite(c.id)}
                    aria-label="Toggle favorite"
                    className="text-muted-foreground hover:text-amber-500"
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${
                        c.favorite ? "fill-amber-400 text-amber-500" : ""
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    aria-label="Delete"
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
