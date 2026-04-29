import type { ExtractedMeta } from "./extractProps";

/**
 * Generate plausible mock values for each prop detected in a component's
 * interface, so the sandbox can render the component without the user
 * needing to wire up a props playground first.
 *
 * The output is JavaScript source code (not a JSON object) because some
 * prop types — notably functions and React elements — can't be JSON
 * serialised. The caller embeds this string directly into the iframe's
 * module source.
 *
 * Covered type shapes (best-effort, regex-based):
 *   - primitives: string, number, boolean
 *   - arrays: X[], Array<X>, ReadonlyArray<X>
 *   - unions: "a" | "b" | "c"  →  first literal
 *   - string literals: "something"
 *   - function types: () => void, (x: X) => Y  →  no-op
 *   - React nodes: ReactNode, ReactElement, JSX.Element  →  a sample string
 *   - unknown / any fallback: undefined (rendered as empty)
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

  // 1. Arrays (X[] / Array<X> / ReadonlyArray<X>) — produce 3 items
  if (type.endsWith("[]")) {
    const inner = type.slice(0, -2).trim();
    const one = mockValueSource(inner, propName);
    return `[${one}, ${one}, ${one}]`;
  }
  const arrayMatch = type.match(/^(?:Readonly)?Array<(.+)>$/);
  if (arrayMatch) {
    const one = mockValueSource(arrayMatch[1], propName);
    return `[${one}, ${one}, ${one}]`;
  }

  // 2. Function types — emit a no-op
  if (/=>/.test(type) || /^\([^)]*\)\s*=>/.test(type)) {
    return "() => {}";
  }

  // 3. Unions — pick the first non-null/undefined option
  if (type.includes("|") && !/^["']/.test(type)) {
    const parts = type
      .split("|")
      .map((s) => s.trim())
      .filter((s) => s && s !== "undefined" && s !== "null");
    if (parts.length > 0) return mockValueSource(parts[0], propName);
    return "undefined";
  }

  // 4. String literals
  const literalMatch = type.match(/^["'](.*)["']$/);
  if (literalMatch) return JSON.stringify(literalMatch[1]);

  // 5. Numeric literals
  if (/^-?\d+(\.\d+)?$/.test(type)) return type;

  // 6. Boolean literals
  if (type === "true" || type === "false") return type;

  // 7. Primitives — use the prop name to produce a human-readable string
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
    default: {
      // Inline object type like `{ label: string; href: string }` — parse
      // its fields recursively so consumers don't see empty objects.
      const inlineMatch = type.match(/^\{([^}]+)\}$/);
      if (inlineMatch) {
        const fieldSrc = inlineMatch[1]
          .split(/[;,]/)
          .map((f) => f.trim())
          .filter(Boolean)
          .map((f) => {
            const m = f.match(/^([a-zA-Z_$][\w$]*)(?:\?)?:\s*(.+)$/);
            if (!m) return null;
            return `${JSON.stringify(m[1])}: ${mockValueSource(m[2].trim(), m[1])}`;
          })
          .filter(Boolean)
          .join(", ");
        return `{ ${fieldSrc} }`;
      }
      return "{}";
    }
  }
}

/** Humanise a prop name into a sample string. `ctaText` → `"Cta Text"` etc. */
function sampleStringFor(name: string): string {
  const hints: Record<string, string> = {
    title: "Beautiful Plan",
    subtitle: "The essentials you need",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    label: "Label",
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
    href: "#",
    url: "https://example.com",
    placeholder: "Type here…",
    content: "Example content goes here.",
    message: "This is a sample message.",
    features: "Feature",
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

function sampleNumberFor(name: string): number {
  const lc = name.toLowerCase();
  if (lc.includes("percent") || lc.includes("progress")) return 72;
  if (lc.includes("count") || lc.includes("total")) return 128;
  if (lc.includes("price") || lc.includes("amount")) return 19;
  if (lc.includes("rating") || lc.includes("score")) return 4.5;
  return 42;
}
