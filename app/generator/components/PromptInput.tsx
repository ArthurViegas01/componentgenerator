"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, StopCircle, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EXAMPLE_PROMPTS } from "@/lib/ai/prompts";
import { useEditorStore } from "@/lib/store/editorStore";
import { useCodeEditor } from "@/lib/hooks/useCodeEditor";

/**
 * Left rail of the generator. Owns the prompt textarea, example chips, and
 * the primary "generate" action. Delegates the streaming pipeline to
 * `useCodeEditor`.
 */
export function PromptInput() {
  const prompt = useEditorStore((s) => s.prompt);
  const setPrompt = useEditorStore((s) => s.setPrompt);
  const status = useEditorStore((s) => s.status);
  const { run, cancel, isStreaming } = useCodeEditor();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? EXAMPLE_PROMPTS.filter((p) => p.tag === activeTag)
    : EXAMPLE_PROMPTS;
  const tags = Array.from(new Set(EXAMPLE_PROMPTS.map((p) => p.tag)));

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Describe your component
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Be specific about structure, interactions, and states. The more
          detail, the better the output.
        </p>
      </div>

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            if (!isStreaming && prompt.trim()) run(prompt);
          }
        }}
        placeholder='e.g. "Card with image, title, description, and button. Hover raises the card and deepens the shadow."'
        rows={6}
        className="min-h-[140px] flex-shrink-0"
      />

      <div className="flex items-center gap-2">
        {isStreaming ? (
          <Button
            variant="destructive"
            onClick={cancel}
            leftIcon={<StopCircle className="h-4 w-4" />}
            className="flex-1"
          >
            Stop
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => run(prompt)}
            disabled={!prompt.trim() || status === "streaming"}
            leftIcon={
              status === "streaming" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )
            }
            className="flex-1"
          >
            {status === "streaming" ? "Generating…" : "Generate"}
            {status !== "streaming" && (
              <span className="ml-1 hidden text-[10px] opacity-50 lg:inline">⌘↵</span>
            )}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTag(null)}
          className={`text-xs rounded-full px-2 py-0.5 transition ${
            activeTag === null
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          all
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`text-xs rounded-full px-2 py-0.5 transition ${
              activeTag === tag
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Example prompts
        </p>
        <div className="space-y-2">
          {filtered.map((ex, i) => (
            <motion.button
              key={ex.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setPrompt(ex.prompt)}
              className="block w-full rounded-md border border-border bg-card p-2.5 text-left text-xs hover:border-primary hover:bg-muted/40 transition"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{ex.label}</span>
                <Badge variant="outline" className="text-[10px]">
                  {ex.tag}
                </Badge>
              </div>
              <span className="line-clamp-2 text-muted-foreground">
                {ex.prompt}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
