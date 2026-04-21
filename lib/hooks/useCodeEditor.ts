"use client";

import { useCallback, useEffect, useState } from "react";
import { formatCode } from "@/lib/utils/formatCode";
import { validateGeneratedCode, stripFence } from "@/lib/ai/validators";
import { useEditorStore } from "@/lib/store/editorStore";

/**
 * Coordinates the streaming generation pipeline:
 *
 *   POST /api/generate → SSE-style text chunks → editor store → validator
 *
 * Consumers call `run(prompt)` and then subscribe to the editor store for
 * code updates. The hook itself only exposes imperative controls + a loading
 * flag.
 */
export function useCodeEditor() {
  const appendCode = useEditorStore((s) => s.appendCode);
  const setCode = useEditorStore((s) => s.setCode);
  const setStatus = useEditorStore((s) => s.setStatus);
  const setWarnings = useEditorStore((s) => s.setWarnings);
  const reset = useEditorStore((s) => s.reset);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const run = useCallback(
    async (prompt: string, opts?: { themeHint?: string }) => {
      if (!prompt.trim()) return;
      reset();
      setStatus("streaming");

      const controller = new AbortController();
      setAbortController(controller);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, themeHint: opts?.themeHint }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const msg = await res.text().catch(() => "Unknown error");
          throw new Error(msg || `HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        // Stream chunks into the editor as they arrive. The server route
        // emits plain text — we strip the fence once the stream closes.
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          appendCode(chunk);
        }

        const cleaned = stripFence(buffer);
        const formatted = await formatCode(cleaned);
        setCode(formatted);

        const validation = validateGeneratedCode(formatted);
        setWarnings(validation.warnings);
        setStatus(validation.ok ? "ready" : "error", validation.errors[0] ?? null);
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setStatus("idle");
          return;
        }
        setStatus("error", (err as Error).message);
      } finally {
        setAbortController(null);
      }
    },
    [appendCode, setCode, setStatus, setWarnings, reset]
  );

  const cancel = useCallback(() => {
    abortController?.abort();
  }, [abortController]);

  // Clean up any in-flight request on unmount
  useEffect(() => () => abortController?.abort(), [abortController]);

  return { run, cancel, isStreaming: abortController !== null };
}
