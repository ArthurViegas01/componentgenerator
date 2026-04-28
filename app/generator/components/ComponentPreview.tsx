"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Smartphone, Tablet, Monitor, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorStore, type Viewport } from "@/lib/store/editorStore";
import { useThemeStore } from "@/lib/store/themeStore";
import { extractProps } from "@/lib/utils/extractProps";
import { generateMockPropsSource } from "@/lib/utils/mockProps";
import { stripFence } from "@/lib/ai/validators";

/**
 * Sandbox preview using an <iframe srcDoc>. The iframe loads React + Babel
 * from a CDN, transforms the generated source at runtime, and mounts the
 * component. Errors in the component are caught by an error boundary inside
 * the iframe and posted back to the parent via `postMessage` so we can
 * surface them in the UI.
 *
 * This avoids any server-side build step and keeps the preview truly
 * isolated from our app shell — the sandbox can't access the parent DOM.
 */
export function ComponentPreview() {
  const code = useEditorStore((s) => s.code);
  const status = useEditorStore((s) => s.status);
  const viewport = useEditorStore((s) => s.viewport);
  const setViewport = useEditorStore((s) => s.setViewport);
  const palette = useThemeStore((s) => s.resolvePalette());
  const mode = useThemeStore((s) => s.mode);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Gate the preview source on `status`. During streaming the editor store
  // holds a partial TSX buffer — feeding that to Babel produces transient
  // "Unexpected token" errors (e.g. unclosed function bodies) that stick
  // around even after the stream finishes. `stableCode` only updates when
  // the stream is idle / ready / error, so the iframe always sees complete
  // source. Code clearing (reset on a new run) also propagates immediately.
  const [stableCode, setStableCode] = useState(code);
  useEffect(() => {
    if (status !== "streaming" || code === "") {
      setStableCode(code);
    }
  }, [code, status]);

  // Defensive cleanup: even though `useCodeEditor` strips fences after the
  // stream ends, edge cases (manual paste of ` ```tsx `, truncated responses)
  // could slip fences through. Strip here so the sandbox never sees markdown.
  const cleanCode = useMemo(() => stripFence(stableCode), [stableCode]);

  // Pre-compute mock props from the Props interface so that a component
  // declared as `{ features: string[] }` doesn't crash when rendered with
  // no props. Real values can be filled in later via a props playground.
  const mockPropsSrc = useMemo(
    () => generateMockPropsSource(extractProps(cleanCode)),
    [cleanCode]
  );
  const srcDoc = useMemo(
    () =>
      buildSandboxHtml({
        code: cleanCode,
        palette,
        dark: resolveDark(mode),
        mockPropsSrc,
      }),
    [cleanCode, palette, mode, mockPropsSrc]
  );

  // Listen for error messages from the sandbox.
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data;
      if (data?.type === "preview-error") {
        setRuntimeError(data.message ?? "Unknown error");
      } else if (data?.type === "preview-ok") {
        setRuntimeError(null);
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  // Wipe any stale error banner when a new generation starts. Otherwise a
  // failure from a previous run would linger over the fresh component until
  // the sandbox managed to post `preview-ok` — which looks like the new
  // component itself is broken.
  useEffect(() => {
    if (status === "streaming") setRuntimeError(null);
  }, [status]);

  const widths: Record<Viewport, string> = {
    mobile: "375px",
    tablet: "768px",
    desktop: "100%",
  };

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <div className="flex items-center justify-between border-b border-border bg-card px-3 py-2">
        <div className="flex items-center gap-1">
          <ViewportButton
            icon={<Smartphone className="h-3.5 w-3.5" />}
            label="Mobile"
            active={viewport === "mobile"}
            onClick={() => setViewport("mobile")}
          />
          <ViewportButton
            icon={<Tablet className="h-3.5 w-3.5" />}
            label="Tablet"
            active={viewport === "tablet"}
            onClick={() => setViewport("tablet")}
          />
          <ViewportButton
            icon={<Monitor className="h-3.5 w-3.5" />}
            label="Desktop"
            active={viewport === "desktop"}
            onClick={() => setViewport("desktop")}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRefreshKey((k) => k + 1)}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Refresh
        </Button>
      </div>

      {runtimeError && (
        <div className="flex items-start gap-2 border-b border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium">Runtime error in preview</p>
            <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[10px] opacity-80">
              {runtimeError}
            </pre>
          </div>
        </div>
      )}

      <div className="flex flex-1 items-start justify-center overflow-auto p-4">
        <div
          className="mx-auto h-full bg-background shadow-sm ring-1 ring-border rounded-md overflow-hidden transition-all duration-200"
          style={{ width: widths[viewport], maxWidth: "100%" }}
        >
          {status === "streaming" && !stableCode.trim() ? (
            <StreamingPreview />
          ) : stableCode.trim() ? (
            <iframe
              key={refreshKey}
              ref={iframeRef}
              title="Component preview"
              sandbox="allow-scripts"
              srcDoc={srcDoc}
              className="h-full w-full"
            />
          ) : (
            <EmptyPreview />
          )}
        </div>
      </div>
    </div>
  );
}

function ViewportButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs transition ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function EmptyPreview() {
  return (
    <div className="flex h-full min-h-[300px] items-center justify-center p-8 text-center">
      <div>
        <p className="text-sm font-medium">Preview will appear here</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Describe a component on the left and click Generate.
        </p>
      </div>
    </div>
  );
}

/**
 * Shown while the LLM stream is still arriving. We deliberately don't
 * render a partial iframe — compiling incomplete TSX produces confusing
 * "Unexpected token" errors. Keep the user anchored on the code editor,
 * and render the real preview once the stream completes.
 */
function StreamingPreview() {
  return (
    <div className="flex h-full min-h-[300px] items-center justify-center p-8 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
        </div>
        <p className="text-xs text-muted-foreground">
          Generating component… preview will render when the stream ends.
        </p>
      </div>
    </div>
  );
}

function resolveDark(mode: string): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// ---------------------------------------------------------------------------
// srcDoc builder
// ---------------------------------------------------------------------------

function buildSandboxHtml(args: {
  code: string;
  palette: { primary: string; secondary: string; accent: string };
  dark: boolean;
  mockPropsSrc: string;
}): string {
  const safeCode = args.code
    .replace(/<\/script>/g, "<\\/script>")
    .replace(/\$\{/g, "\\${");

  return `<!doctype html>
<html class="${args.dark ? "dark" : ""}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: '${args.palette.primary}',
          secondary: '${args.palette.secondary}',
          accent: '${args.palette.accent}',
        },
      },
    },
  };
</script>
<script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://unpkg.com/framer-motion@11/dist/framer-motion.js" crossorigin></script>
<script src="https://unpkg.com/lucide-react@0.453.0/dist/umd/lucide-react.js" crossorigin></script>
<style>
  html, body { margin: 0; padding: 0; background: transparent; }
  body { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; padding: 1rem; }
</style>
</head>
<body>
<div id="root"></div>

<script type="text/babel" data-presets="typescript,react" data-type="module">
try {
  // --- Shim imports that the generated component expects --------------
  const React = window.React;
  const { useState, useEffect, useRef, useMemo, useCallback, forwardRef, createContext, useContext } = React;
  const framerMotion = window.Motion || window.FramerMotion || {};
  const motion = framerMotion.motion || new Proxy({}, { get: (_t, tag) => {
    return React.forwardRef((props, ref) => React.createElement(String(tag), { ...props, ref }));
  }});
  const AnimatePresence = framerMotion.AnimatePresence || (({ children }) => children);

  // Icon stub used when lucide-react CDN hasn't loaded yet or fails.
  // Renders a proper SVG (circle with dot) so the layout looks clean even
  // in the fallback case — much better than a bordered square.
  const iconStub = (name) => React.forwardRef(({ size = 16, className, color, strokeWidth = 2, ...rest }, ref) =>
    React.createElement('svg', {
      ref,
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: color || 'currentColor',
      strokeWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      className: ['inline-block align-middle', className].filter(Boolean).join(' '),
      'aria-label': name,
      ...rest,
    },
      React.createElement('circle', { key: 'c', cx: 12, cy: 12, r: 9 }),
      React.createElement('line', { key: 'l', x1: 12, y1: 8, x2: 12, y2: 13 }),
      React.createElement('circle', { key: 'd', cx: 12, cy: 16.5, r: 0.75, fill: 'currentColor', stroke: 'none' }),
    )
  );

  // Use the CDN-loaded lucide-react if available, fall back to the stub.
  // This means real icons render in the preview once the script loads.
  const lucideLib = window.LucideReact || null;
  const lucide = new Proxy({}, {
    get(_t, name) {
      if (typeof name !== 'string') return undefined;
      if (lucideLib && name in lucideLib) return lucideLib[name];
      return iconStub(name);
    }
  });

  const cn = (...args) => args.flat(Infinity).filter(Boolean).join(' ');

  // Stub out the module system Babel generates so that generated imports
  // resolve to our globals instead of failing.
  const moduleRegistry = {
    'react': { ...React, default: React },
    'framer-motion': { motion, AnimatePresence, default: framerMotion },
    'lucide-react': lucide,
    '@/lib/utils/cn': { cn, default: cn },
  };

  // Transform & evaluate the user code
  const rawSource = ${JSON.stringify(safeCode)};

  // Rewrite ES imports to pull from our registry
  const rewritten = rawSource
    .replace(/import\\s+\\{([^}]+)\\}\\s+from\\s+["']([^"']+)["'];?/g, (_m, names, src) => {
      const decls = names.split(',').map(s => s.trim()).filter(Boolean).map(n => {
        const [orig, alias] = n.split(/\\s+as\\s+/).map(s => s.trim());
        return \`const \${alias || orig} = __mods["\${src}"]["\${orig}"];\`;
      }).join('\\n');
      return decls;
    })
    .replace(/import\\s+(\\w+)\\s*,\\s*\\{([^}]+)\\}\\s+from\\s+["']([^"']+)["'];?/g, (_m, def, names, src) => {
      const defDecl = \`const \${def} = __mods["\${src}"].default ?? __mods["\${src}"];\`;
      const decls = names.split(',').map(s => s.trim()).filter(Boolean).map(n => {
        const [orig, alias] = n.split(/\\s+as\\s+/).map(s => s.trim());
        return \`const \${alias || orig} = __mods["\${src}"]["\${orig}"];\`;
      }).join('\\n');
      return [defDecl, decls].join('\\n');
    })
    .replace(/import\\s+(\\w+)\\s+from\\s+["']([^"']+)["'];?/g, (_m, def, src) =>
      \`const \${def} = __mods["\${src}"].default ?? __mods["\${src}"];\`
    )
    .replace(/import\\s+\\*\\s+as\\s+(\\w+)\\s+from\\s+["']([^"']+)["'];?/g, (_m, ns, src) =>
      \`const \${ns} = __mods["\${src}"];\`
    )
    .replace(/export\\s+default\\s+/g, 'var __default = ')
    .replace(/export\\s+(function|const|class)\\s+/g, '$1 ');

  const wrapped = \`(function(__mods){\\n\${rewritten}\\n;return typeof __default !== 'undefined' ? __default : null;})\`;

  const transformed = Babel.transform(wrapped, {
    presets: [['react', { runtime: 'classic' }], 'typescript'],
    filename: 'component.tsx',
  }).code;

  // eslint-disable-next-line no-new-func
  const factory = eval(transformed);
  const Component = factory(moduleRegistry);

  class ErrorBoundary extends React.Component {
    constructor(p) { super(p); this.state = { err: null }; }
    static getDerivedStateFromError(err) { return { err }; }
    componentDidCatch(err) {
      parent.postMessage({ type: 'preview-error', message: err?.message || String(err) }, '*');
    }
    render() {
      if (this.state.err) {
        return React.createElement('pre', {
          style: { color: '#b91c1c', fontSize: 12, whiteSpace: 'pre-wrap' }
        }, String(this.state.err));
      }
      return this.props.children;
    }
  }

  // Auto-generated mock props based on the component's declared interface.
  // Safe-access proxy wraps them so that reading an undeclared prop returns
  // a sensible fallback instead of crashing (e.g. generated code may access
  // fields the parser didn't detect).
  const __mockProps = ${args.mockPropsSrc};
  const safeProps = new Proxy(__mockProps, {
    get(target, key) {
      if (key in target) return target[key];
      if (typeof key === 'symbol') return undefined;
      return undefined;
    },
  });

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    React.createElement(ErrorBoundary, null,
      Component ? React.createElement(Component, safeProps) : React.createElement('p', null, 'No default export found.')
    )
  );
  parent.postMessage({ type: 'preview-ok' }, '*');
} catch (err) {
  parent.postMessage({ type: 'preview-error', message: err?.message || String(err) }, '*');
  document.getElementById('root').innerHTML =
    '<pre style="color:#b91c1c;font-size:12px;white-space:pre-wrap">' +
    (err && err.message ? err.message : String(err)) + '</pre>';
}
</script>
</body>
</html>`;
}
