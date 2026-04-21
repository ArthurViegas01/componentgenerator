"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Copy, Download, Wand2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEditorStore } from "@/lib/store/editorStore";
import { useThemeStore } from "@/lib/store/themeStore";
import { formatCode } from "@/lib/utils/formatCode";
import { extractProps } from "@/lib/utils/extractProps";
import { generateFileName } from "@/lib/utils/generateFileName";

// Monaco ships a bulky worker bundle — load it only on the client.
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

/**
 * Monaco-powered code editor with a thin action bar (copy / format / download).
 * Keeps state in `editorStore` so preview + gallery can read the same source
 * of truth.
 */
export function CodeEditor() {
  const code = useEditorStore((s) => s.code);
  const setCode = useEditorStore((s) => s.setCode);
  const warnings = useEditorStore((s) => s.warnings);
  const mode = useThemeStore((s) => s.mode);
  const [copied, setCopied] = useState(false);

  const meta = useMemo(() => extractProps(code), [code]);
  const filename = useMemo(
    () =>
      generateFileName({
        componentName: meta.componentName,
        prompt: useEditorStore.getState().prompt,
      }),
    [meta.componentName]
  );

  const onCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [code]);

  const onFormat = useCallback(async () => {
    const formatted = await formatCode(code);
    setCode(formatted);
  }, [code, setCode]);

  const onDownload = useCallback(() => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, filename]);

  /**
   * Configure Monaco for TSX:
   *   - enable JSX parsing (otherwise every `<div>` is a syntax error)
   *   - disable semantic validation (we don't load @types/react, @types/
   *     framer-motion, etc., and that produces a wall of false-positive
   *     "Cannot find name 'React'" / "Cannot find module …" noise)
   *   - keep syntactic validation ON so real syntax errors still surface
   */
  const handleBeforeMount = useCallback((monaco: unknown) => {
    // Typed as unknown because the monaco import chain is heavy; we assert
    // the shape we need inline to avoid pulling in monaco types.
    const m = monaco as {
      languages: {
        typescript: {
          typescriptDefaults: {
            setCompilerOptions: (opts: Record<string, unknown>) => void;
            setDiagnosticsOptions: (opts: Record<string, unknown>) => void;
          };
          JsxEmit: { React: number };
          ScriptTarget: { Latest: number };
          ModuleKind: { ESNext: number };
          ModuleResolutionKind: { NodeJs: number };
        };
      };
    };
    const ts = m.languages.typescript;
    ts.typescriptDefaults.setCompilerOptions({
      jsx: ts.JsxEmit.React,
      jsxFactory: "React.createElement",
      reactNamespace: "React",
      allowNonTsExtensions: true,
      esModuleInterop: true,
      allowJs: true,
      target: ts.ScriptTarget.Latest,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      module: ts.ModuleKind.ESNext,
      isolatedModules: true,
    });
    ts.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: true,
    });
  }, []);

  const resolveMonacoTheme = () => {
    if (mode === "dark") return "vs-dark";
    if (mode === "light") return "light";
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "vs-dark"
        : "light";
    }
    return "vs-dark";
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-card px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate font-mono text-xs text-muted-foreground">
            {filename}
          </span>
          {meta.props.length > 0 && (
            <Badge variant="outline" className="text-[10px]">
              {meta.props.length} props
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onFormat}
            leftIcon={<Wand2 className="h-3.5 w-3.5" />}
          >
            Format
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            leftIcon={
              copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )
            }
          >
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownload}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Download
          </Button>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-3 py-1.5">
          <ul className="list-disc pl-4 text-[11px] text-amber-700 dark:text-amber-300">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          path={filename}
          defaultLanguage="typescript"
          language="typescript"
          value={code}
          theme={resolveMonacoTheme()}
          beforeMount={handleBeforeMount}
          onChange={(value) => setCode(value ?? "")}
          options={{
            fontSize: 13,
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            smoothScrolling: true,
            cursorSmoothCaretAnimation: "on",
          }}
        />
      </div>
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="flex h-full items-center justify-center bg-muted/20">
      <span className="text-xs text-muted-foreground">Loading editor…</span>
    </div>
  );
}
