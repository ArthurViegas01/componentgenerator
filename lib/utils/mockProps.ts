import type { ExtractedMeta } from "./extractProps";

/**
 * Generate plausible mock values for each prop detected in a component's
 * interface, so the sandbox can render the component without the user
 * needing to wire up a props playground first.
 *
 * The output is JavaScript source code (not a JSON object) because some
 * prop types -- notably functions and React elements -- can't be JSON
 * serialised. The caller embeds this string directly into the iframe's
 * module source.
 *
 * Covered type shapes (best-effort, character-level parsing):
 *   - primitives: string, number, boolean
 *   - arrays: X[], Array<X>, ReadonlyArray<X>
 *   - inline object arrays: { label: string; href: string }[]
 *   - inline objects: { label: string; href: string }
 *   - unions: "a" | "b" | "c"  ->  first literal
 *   - string literals: "something"
 *   - function types: () => void, (x: X) => Y  ->  no-op
 *   - React nodes: ReactNode, ReactElement, JSX.Element  ->  a sample string
 *   - unknown / any fallback: best-guess string
 */
export function generateMockPropsSource(meta: ExtractedMeta): string {
  if (meta.props.length === 0) return "{}";
  const entries = meta.props.map((p) => {
    const value = mockValueSource(p.type, p.name);
    return `  ${JSON.stringify(p.name)}: ${value}`;
  });
  return `{\n${entries.join(",\n")}\n}`;
}

function mockValueSource(rawType: string, propName: string): string {
  const type = rawType.trim();

  // 1. Arrays (X[] / Array<X> / ReadonlyArray<X>) -- produce 3 varied items
  if (type.endsWith("[]")) {
    const inner = type.slice(0, -2).trim();
    return mockArraySource(inner, propName);
  }
  const arrayMatch = type.match(/^(?:Readonly)?Array<(.+)>$/s);
  if (arrayMatch) {
    return mockArraySource(arrayMatch[1].trim(), propName);
  }

  // 2. Inline object type: { field: type; ... }
  if (type.startsWith("{") && type.endsWith("}")) {
    return mockInlineObjectSource(type, propName);
  }

  // 3. Function types -- emit a no-op
  if (/=>/.test(type) || /^\([^)]*\)\s*=>/.test(type)) {
    return "() => {}";
  }

  // 4. Unions -- split at top-level `|` and pick the first non-null/undefined
  if (containsTopLevelPipe(type) && !/^["']/.test(type)) {
    const parts = splitTopLevelPipe(type).filter(
      (s) => s !== "undefined" && s !== "null"
    );
    if (parts.length > 0) return mockValueSource(parts[0], propName);
    return "undefined";
  }

  // 5. String literals
  const literalMatch = type.match(/^["'](.*)["']$/);
  if (literalMatch) return JSON.stringify(literalMatch[1]);

  // 6. Numeric literals
  if (/^-?\d+(\.\d+)?$/.test(type)) return type;

  // 7. Boolean literals
  if (type === "true" || type === "false") return type;

  // 8. Primitives
  switch (type) {
    case "string":
      return JSON.stringify(sampleStringFor(propName));
    case "number":
      return sampleNumberFor(propName).toString();
    case "boolean":
      return propName.startsWith("is") || propName.startsWith("has")
        ? "true"
        : "false";
    case "Date":
      return "new Date()";
    case "ReactNode":
    case "React.ReactNode":
    case "ReactElement":
    case "React.ReactElement":
    case "JSX.Element":
      return JSON.stringify(sampleStringFor(propName));
    case "any":
    case "unknown":
      return JSON.stringify(sampleStringFor(propName));
    default:
      // Unknown object-like type -- return an empty object so property reads
      // return undefined rather than crashing with "Cannot read properties of null".
      return "{}";
  }
}

// ---------------------------------------------------------------------------
// Array mock -- produces 3 varied items so the UI doesn't look repetitive
// ---------------------------------------------------------------------------

function mockArraySource(innerType: string, propName: string): string {
  if (innerType.startsWith("{") && innerType.endsWith("}")) {
    // Object array -- produce three varied instances
    const items = [0, 1, 2].map((idx) =>
      mockInlineObjectSource(innerType, propName, idx)
    );
    return `[${items.join(", ")}]`;
  }

  const one = mockValueSource(innerType, propName);
  return `[${one}, ${one}, ${one}]`;
}

// ---------------------------------------------------------------------------
// Inline object mock -- parses { field: type; ... } and fills in values
// ---------------------------------------------------------------------------

/**
 * Produce a JavaScript object literal from an inline TypeScript object type.
 *
 * Example input:  `{ label: string; href: string; active?: boolean }`
 * Example output: `{ "label": "Home", "href": "/", "active": false }`
 *
 * @param idx - When generating an array of objects, pass 0/1/2 to vary string
 *              values so the preview doesn't show three identical rows.
 */
function mockInlineObjectSource(
  type: string,
  _propName: string,
  idx = 0
): string {
  const inner = type.slice(1, -1).trim();
  if (!inner) return "{}";

  const segments = splitAtDepthZero(inner, [";", ","]);
  const entries: string[] = [];

  for (const seg of segments) {
    const colonIdx = findColonOutsideGenerics(seg);
    if (colonIdx === -1) continue;

    const rawName = seg.slice(0, colonIdx).replace(/\?$/, "").trim();
    const fieldType = seg.slice(colonIdx + 1).trim();
    if (!rawName || !fieldType) continue;

    let value = mockValueSource(fieldType, rawName);

    // Vary string values across array items so rows look different
    if (idx > 0 && fieldType.trim() === "string") {
      value = JSON.stringify(varyString(sampleStringFor(rawName), idx));
    }

    entries.push(`${JSON.stringify(rawName)}: ${value}`);
  }

  return entries.length ? `{ ${entries.join(", ")} }` : "{}";
}

// ---------------------------------------------------------------------------
// Helpers -- depth-aware string splitting
// ---------------------------------------------------------------------------

/** Split `str` at any of `delimiters` that appear at brace/paren/bracket depth 0. */
function splitAtDepthZero(str: string, delimiters: string[]): string[] {
  const segments: string[] = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "{" || ch === "[" || ch === "(") depth++;
    else if (ch === "}" || ch === "]" || ch === ")") depth--;
    else if (depth === 0 && delimiters.includes(ch)) {
      const seg = str.slice(start, i).trim();
      if (seg) segments.push(seg);
      start = i + 1;
    }
  }

  const last = str.slice(start).trim();
  if (last) segments.push(last);

  return segments;
}

/** Find the index of `:` that's outside angle brackets (generics). */
function findColonOutsideGenerics(str: string): number {
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "<") depth++;
    else if (str[i] === ">") depth--;
    else if (str[i] === ":" && depth === 0) return i;
  }
  return -1;
}

/** Check whether `type` contains a `|` at top-level depth. */
function containsTopLevelPipe(type: string): boolean {
  let depth = 0;
  for (const ch of type) {
    if (ch === "{" || ch === "[" || ch === "(" || ch === "<") depth++;
    else if (ch === "}" || ch === "]" || ch === ")" || ch === ">") depth--;
    else if (ch === "|" && depth === 0) return true;
  }
  return false;
}

/** Split `type` on top-level `|` characters. */
function splitTopLevelPipe(type: string): string[] {
  return splitAtDepthZero(type, ["|"]).map((s) => s.trim());
}

// ---------------------------------------------------------------------------
// String / number sample value helpers
// ---------------------------------------------------------------------------

/** Humanise a prop name into a sample string. `ctaText` -> `"Cta Text"` etc. */
function sampleStringFor(name: string): string {
  const hints: Record<string, string> = {
    title: "Beautiful Plan",
    subtitle: "The essentials you need",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    label: "Home",
    text: "Sample text",
    name: "Ada Lovelace",
    email: "ada@example.com",
    price: "$19",
    amount: "$19",
    cta: "Get started",
    ctatext: "Get started",
    buttontext: "Continue",
    imageurl: "https://picsum.photos/640/360",
    image: "https://picsum.photos/640/360",
    avatar: "https://i.pravatar.cc/128",
    href: "/",
    url: "https://example.com",
    placeholder: "Type here…",
    content: "Example content goes here.",
    message: "This is a sample message.",
    feature: "Unlimited projects",
    features: "Unlimited projects",
    icon: "",
    logo: "Acme",
    brand: "Acme",
    variant: "default",
    badge: "New",
    tag: "Design",
  };
  const key = name.toLowerCase();
  if (hints[key]) return hints[key];

  // Fallback: turn camelCase / snake_case into Title Case.
  const words = name
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
  return words.join(" ") || "Sample";
}

/**
 * Vary string values across array items so a nav with 3 links doesn't show
 * "Home / Home / Home". Applies context-aware label variation.
 */
function varyString(base: string, idx: number): string {
  const navLabels = ["Home", "About", "Contact", "Blog", "Pricing"];
  const featureLabels = [
    "Unlimited projects",
    "Priority support",
    "Custom domains",
    "Analytics dashboard",
  ];

  if (base === "Home" && idx > 0) return navLabels[idx] ?? `Page ${idx + 1}`;
  if (base === "Unlimited projects" && idx > 0)
    return featureLabels[idx] ?? `Feature ${idx + 1}`;

  return idx === 0 ? base : `${base} ${idx + 1}`;
}

function sampleNumberFor(name: string): number {
  const lc = name.toLowerCase();
  if (lc.includes("percent") || lc.includes("progress")) return 72;
  if (lc.includes("count") || lc.includes("total")) return 128;
  if (lc.includes("price") || lc.includes("amount")) return 19;
  if (lc.includes("rating") || lc.includes("score")) return 4.5;
  if (lc.includes("index") || lc.includes("idx")) return 0;
  return 42;
}
