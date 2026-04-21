"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, Search, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useComponentHistory } from "@/lib/hooks/useComponentHistory";
import { useEditorStore } from "@/lib/store/editorStore";

/**
 * Sliding gallery of saved/generated components. Clicking a card loads it
 * back into the editor. Favorites pin to the top; tag filters narrow the
 * list.
 */
export function ComponentGallery({
  onClose,
}: {
  onClose?: () => void;
}) {
  const { components, toggleFavorite, remove } = useComponentHistory();
  const setCode = useEditorStore((s) => s.setCode);
  const setPrompt = useEditorStore((s) => s.setPrompt);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(
    new Set(components.flatMap((c) => c.tags))
  ).sort();

  const filtered = components
    .filter((c) => {
      const q = query.trim().toLowerCase();
      const matchesQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.prompt.toLowerCase().includes(q);
      const matchesTag = !activeTag || c.tags.includes(activeTag);
      return matchesQ && matchesTag;
    })
    .sort((a, b) => {
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      return b.createdAt - a.createdAt;
    });

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search components…"
              className="pl-8 h-9 text-xs"
            />
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTag(null)}
              className={`text-[10px] rounded-full px-2 py-0.5 transition ${
                activeTag === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              all
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`text-[10px] rounded-full px-2 py-0.5 transition ${
                  activeTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {components.length === 0
              ? "No components saved yet. Generate something and click Save!"
              : "No matches."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            <AnimatePresence>
              {filtered.map((c) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group rounded-md border border-border bg-card p-2.5 hover:border-primary transition"
                >
                  <button
                    onClick={() => {
                      setCode(c.code);
                      setPrompt(c.prompt);
                    }}
                    className="block w-full text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-xs truncate">
                        {c.name}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground flex-shrink-0">
                        <Clock className="h-3 w-3" />
                        {relative(c.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                      {c.prompt}
                    </p>
                    {c.tags.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
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
                  </button>
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
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
