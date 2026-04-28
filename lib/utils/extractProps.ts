/**
 * Heuristic parser that extracts a component name and its props from a
 * generated TSX source string.
 *
 * Uses brace-balanced extraction instead of a simple `[^}]*` regex so it
 * correctly handles inline object types inside the Props interface:
 *
 *   links: { label: string; href: string }[];   // used to break the old parser
 *   items: Array<{ id: number; text: string }>; // now works correctly
 *
 * Intentionally regex/character-level -- no AST dependency.
 */

export interface ExtractedMeta {
  componentName: string | null;
  props: Array<{ name: string; type: string; optional: boolean }>;
  hasDefaultExport: boolean;
}

const COMPONENT_NAME_REGEX =
  /(?:export\s+(?:default\s+)?function|const)\s+([A-Z][A-Za-z0-9_]*)/;

export function extractProps(source: string): ExtractedMeta {
  const nameMatch = source.match(COMPONENT_NAME_REGEX);
  const hasDefaultExport = /export\s+default/.test(source);
  const propsBlock = extractPropsBlock(source);
  const props = propsBlock ? parsePropsBlock(propsBlock) : [];

  return {
    componentName: nameMatch?.[1] ?? null,
    props,
    hasDefaultExport,
  };
}

// ---------------------------------------------------------------------------
// Step 1: find the Props interface body with balanced-brace tracking
// ---------------------------------------------------------------------------

/**
 * Returns the text between the outer braces of the Props interface/type,
 * or null if none is found. Handles any nesting depth.
 */
function extractPropsBlock(source: string): string | null {
  const headerRe = /(?:interface|type)\s+\w*Props\w*\s*=?\s*\{/;
  const headerMatch = headerRe.exec(source);
  if (!headerMatch) return null;

  // The regex already consumed the opening brace (last char of the match).
  const openIdx = headerMatch.index + headerMatch[0].length - 1;

  let depth = 0;
  for (let i = openIdx; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") {
      depth--;
      if (depth === 0) return source.slice(openIdx + 1, i);
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Step 2: parse individual props from the extracted block
// ---------------------------------------------------------------------------

/**
 * Parses individual prop entries from the block string, correctly handling:
 *   - Simple types:      name: string;
 *   - Optional props:    title?: string;
 *   - Inline objects:    link: { label: string; href: string };
 *   - Object arrays:     links: { label: string; href: string }[];
 *   - Generics:          items: Array<{ id: number }>;
 *   - Union literals:    variant: "sm" | "md" | "lg";
 *   - Function types:    onClick: () => void;
 *   - JSDoc comments (stripped before parsing)
 */
function parsePropsBlock(
  block: string
): Array<{ name: string; type: string; optional: boolean }> {
  // Strip JSDoc block comments and single-line comments before parsing
  const clean = block
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\n]*/g, "");

  const props: Array<{ name: string; type: string; optional: boolean }> = [];
  let i = 0;
  const n = clean.length;

  while (i < n) {
    // Skip whitespace
    while (i < n && /\s/.test(clean[i])) i++;
    if (i >= n) break;

    // Must start with a valid identifier character
    if (!/[a-zA-Z_$]/.test(clean[i])) { i++; continue; }

    // Read prop name
    const nameStart = i;
    while (i < n && /[\w$]/.test(clean[i])) i++;
    const name = clean.slice(nameStart, i);

    // Skip horizontal whitespace
    while (i < n && (clean[i] === " " || clean[i] === "\t")) i++;

    // Optional marker
    let optional = false;
    if (i < n && clean[i] === "?") { optional = true; i++; }

    // Skip horizontal whitespace
    while (i < n && (clean[i] === " " || clean[i] === "\t")) i++;

    // Expect ':' -- if absent this token isn't a prop declaration
    if (i >= n || clean[i] !== ":") continue;
    i++; // consume ':'

    // Skip horizontal whitespace after the colon
    while (i < n && (clean[i] === " " || clean[i] === "\t")) i++;

    // Collect the type string, tracking depth of {}, [], () so that
    // semicolons inside nested types don't terminate the prop early.
    const typeStart = i;
    let depth = 0;

    while (i < n) {
      const ch = clean[i];
      if (ch === "{" || ch === "[" || ch === "(") { depth++; i++; continue; }
      if (ch === "}" || ch === "]" || ch === ")") {
        if (depth > 0) { depth--; i++; continue; }
        break; // depth 0 => outer block closing brace
      }
      if ((ch === ";" || ch === ",") && depth === 0) { i++; break; }
      if (ch === "\n" && depth === 0) { i++; break; }
      i++;
    }

    const type = clean.slice(typeStart, i).replace(/[;,\s]+$/, "").trim();
    if (name && type) {
      props.push({ name, optional, type });
    }
  }

  return props;
}
