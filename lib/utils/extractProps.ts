/**
 * Lightweight heuristic parser that pulls the component name and a flat list
 * of props from a generated TSX source. This is intentionally regex-based —
 * the goal is "good enough to label a card in the gallery", not full AST
 * fidelity. Upgrade to `@babel/parser` once that extra cost is justified.
 */

export interface ExtractedMeta {
  componentName: string | null;
  props: Array<{ name: string; type: string; optional: boolean }>;
  hasDefaultExport: boolean;
}

const COMPONENT_NAME_REGEX =
  /(?:export\s+(?:default\s+)?function|const)\s+([A-Z][A-Za-z0-9_]*)/;

const PROPS_INTERFACE_START_REGEX =
  /(?:interface|type)\s+\w*Props\w*\s*=?\s*\{/;

const PROP_LINE_REGEX = /^\s*([a-zA-Z_$][\w$]*)(\?)?:\s*(.+?)[;,]?\s*$/gm;

function extractInterfaceBody(source: string): string | null {
  const match = PROPS_INTERFACE_START_REGEX.exec(source);
  if (!match) return null;
  let depth = 1;
  let i = match.index + match[0].length;
  const start = i;
  while (i < source.length && depth > 0) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") depth--;
    i++;
  }
  return depth === 0 ? source.slice(start, i - 1) : null;
}

export function extractProps(source: string): ExtractedMeta {
  const nameMatch = source.match(COMPONENT_NAME_REGEX);
  const interfaceBody = extractInterfaceBody(source);
  const hasDefaultExport = /export\s+default/.test(source);

  const props: ExtractedMeta["props"] = [];
  if (interfaceBody) {
    const body = interfaceBody;
    for (const match of body.matchAll(PROP_LINE_REGEX)) {
      props.push({
        name: match[1],
        optional: match[2] === "?",
        type: match[3].trim(),
      });
    }
  }

  return {
    componentName: nameMatch?.[1] ?? null,
    props,
    hasDefaultExport,
  };
}
