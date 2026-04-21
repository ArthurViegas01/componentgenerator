/**
 * Sanity checks for LLM-generated code. These run client-side before we
 * format/preview a component and catch the common failure modes where the
 * model hallucinates imports or drifts away from the Tailwind-only rule.
 *
 * Each check returns a list of warnings — we surface them in the UI but
 * never block the user from saving / editing. The human is still the final
 * arbiter.
 */

export interface ValidationResult {
  ok: boolean;
  warnings: string[];
  errors: string[];
}

const ALLOWED_IMPORT_SOURCES = [
  "react",
  "framer-motion",
  "lucide-react",
  "@/lib/utils/cn",
];

export function validateGeneratedCode(source: string): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!source.trim()) {
    errors.push("Empty source.");
    return { ok: false, warnings, errors };
  }

  if (!/export\s+default/.test(source)) {
    warnings.push("No default export found — preview may fail to render.");
  }

  // Flag imports outside the allow-list
  const importRegex = /import\s+[^"']+from\s+["']([^"']+)["']/g;
  for (const match of source.matchAll(importRegex)) {
    const specifier = match[1];
    if (!ALLOWED_IMPORT_SOURCES.some((allowed) => matchesAllowed(specifier, allowed))) {
      warnings.push(`Import "${specifier}" is outside the allow-list.`);
    }
  }

  // Discourage inline styles and raw CSS
  if (/style\s*=\s*\{\{/.test(source)) {
    warnings.push("Inline `style={{ ... }}` found — prefer Tailwind utilities.");
  }
  if (/<style[\s>]/.test(source)) {
    warnings.push("<style> tag found — prefer Tailwind utilities.");
  }

  // Very common hallucination: `className` typo as `class`
  if (/<[a-z][^>]*\sclass=/i.test(source)) {
    warnings.push("Raw `class=` found (JSX needs `className`).");
  }

  return { ok: errors.length === 0, warnings, errors };
}

function matchesAllowed(specifier: string, allowed: string): boolean {
  if (specifier === allowed) return true;
  if (allowed.endsWith("/*") && specifier.startsWith(allowed.slice(0, -1))) return true;
  return false;
}

/**
 * Extract the TSX body from a model response that may be wrapped in a
 * markdown fence. This used to require BOTH opening and closing fences
 * (regex with `[\s\S]*?` between them); that's brittle — if the model
 * truncates mid-response, or forgets the closing fence, the code keeps
 * its ` ```tsx ` prefix and breaks the sandbox compiler.
 *
 * The current strategy is to strip opening and closing fences
 * independently so partial responses still yield usable source.
 */
export function stripFence(raw: string): string {
  let s = raw.trim();

  // Opening fence: ` ``` ` optionally followed by a language tag then newline.
  s = s.replace(
    /^```(?:tsx|jsx|typescript|ts|javascript|js|react)?[ \t]*\n?/i,
    ""
  );
  // Closing fence at end of string.
  s = s.replace(/\n?```[ \t]*$/i, "");

  // Defensive: if the model emitted stray triple-backticks inside prose
  // prefixed to the code (e.g. "Here's the component: ```"), slice from
  // the first meaningful line.
  const importIdx = s.search(/^(import|export|const|function|interface)\s/m);
  if (importIdx > 0) s = s.slice(importIdx);

  return s.trim();
}
