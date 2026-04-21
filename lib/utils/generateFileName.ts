/**
 * Derive a filesystem-safe filename for a generated component. Prefers the
 * component's declared name (`ButtonPrimary` → `ButtonPrimary.tsx`); falls
 * back to slugifying the user prompt.
 */
export function generateFileName(opts: {
  componentName?: string | null;
  prompt?: string;
  extension?: "tsx" | "jsx";
}): string {
  const ext = opts.extension ?? "tsx";
  if (opts.componentName && /^[A-Z][A-Za-z0-9_]*$/.test(opts.componentName)) {
    return `${opts.componentName}.${ext}`;
  }
  const slug = (opts.prompt ?? "component")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "component";
  // PascalCase-ify the slug
  const pascal = slug
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
  return `${pascal || "Component"}.${ext}`;
}
