"use client";

import { useState } from "react";
import { Save, Library, Code2, Eye, Columns2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PromptInput } from "./components/PromptInput";
import { CodeEditor } from "./components/CodeEditor";
import { ComponentPreview } from "./components/ComponentPreview";
import { ComponentGallery } from "./components/ComponentGallery";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/store/editorStore";
import { useComponentStore } from "@/lib/store/componentStore";
import { extractProps } from "@/lib/utils/extractProps";

/**
 * Main generator surface — three vertical panes:
 *
 *   [ Prompt ] | [ Code | Preview ]   + optional Gallery drawer
 *
 * Layout collapses gracefully on smaller screens (the prompt pane stacks
 * above the workspace).
 */
export default function GeneratorPage() {
  const code = useEditorStore((s) => s.code);
  const view = useEditorStore((s) => s.view);
  const setView = useEditorStore((s) => s.setView);
  const prompt = useEditorStore((s) => s.prompt);
  const addComponent = useComponentStore((s) => s.add);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const onSave = () => {
    if (!code.trim()) return;
    const meta = extractProps(code);
    addComponent({
      name: meta.componentName ?? "Untitled",
      prompt,
      code,
      tags: inferTags(prompt),
      favorite: false,
    });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Prompt pane */}
      <aside className="w-full lg:w-[320px] lg:flex-shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-card overflow-y-auto">
        <PromptInput />
      </aside>

      {/* Workspace */}
      <section className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between border-b border-border bg-card px-3 py-2">
          <ViewToggle view={view} setView={setView} />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGalleryOpen((o) => !o)}
              leftIcon={<Library className="h-3.5 w-3.5" />}
            >
              Library
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onSave}
              disabled={!code.trim()}
              leftIcon={<Save className="h-3.5 w-3.5" />}
            >
              {savedFlash ? "Saved!" : "Save"}
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-row">
          {(view === "code" || view === "split") && (
            <div className={view === "split" ? "w-1/2 border-r border-border" : "w-full"}>
              <CodeEditor />
            </div>
          )}
          {(view === "preview" || view === "split") && (
            <div className={view === "split" ? "w-1/2" : "w-full"}>
              <ComponentPreview />
            </div>
          )}
        </div>
      </section>

      {/* Gallery drawer */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.aside
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "tween", duration: 0.18 }}
            className="w-full sm:w-[320px] sm:flex-shrink-0 border-l border-border bg-card"
          >
            <ComponentGallery onClose={() => setGalleryOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function ViewToggle({
  view,
  setView,
}: {
  view: "preview" | "code" | "split";
  setView: (v: "preview" | "code" | "split") => void;
}) {
  return (
    <div className="flex items-center rounded-md border border-border bg-card p-0.5">
      <ToggleBtn
        active={view === "code"}
        onClick={() => setView("code")}
        icon={<Code2 className="h-3.5 w-3.5" />}
        label="Code"
      />
      <ToggleBtn
        active={view === "split"}
        onClick={() => setView("split")}
        icon={<Columns2 className="h-3.5 w-3.5" />}
        label="Split"
      />
      <ToggleBtn
        active={view === "preview"}
        onClick={() => setView("preview")}
        icon={<Eye className="h-3.5 w-3.5" />}
        label="Preview"
      />
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs transition ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/** Cheap tag inference from a prompt — good enough for filter chips. */
function inferTags(prompt: string): string[] {
  const lc = prompt.toLowerCase();
  const tags: string[] = [];
  const map: Record<string, string[]> = {
    button: ["button", "btn", "cta"],
    card: ["card", "tile"],
    form: ["form", "login", "signup", "input", "field"],
    navigation: ["nav", "navbar", "sidebar", "menu"],
    feedback: ["toast", "alert", "notification", "modal", "dialog"],
    section: ["hero", "section", "landing"],
  };
  for (const [tag, kws] of Object.entries(map)) {
    if (kws.some((k) => lc.includes(k))) tags.push(tag);
  }
  return tags.length ? tags : ["misc"];
}
