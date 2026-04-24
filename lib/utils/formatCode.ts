/**
 * Prettier-based code formatter for generated JSX/TSX.
 *
 * Prettier's "standalone" build runs in the browser, so we load it lazily to
 * keep the initial bundle small. If formatting fails (e.g. invalid syntax
 * during streaming), the raw source is returned unchanged — the caller should
 * treat format failures as non-fatal.
 */

type PrettierModule = typeof import("prettier/standalone");
type ParserBabel = typeof import("prettier/plugins/babel");
type ParserEstree = typeof import("prettier/plugins/estree");

let cached:
  | { prettier: PrettierModule; babel: ParserBabel; estree: ParserEstree }
  | null = null;

async function loadPrettier() {
  if (cached) return cached;
  const [prettier, babel, estree] = await Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/babel"),
    import("prettier/plugins/estree"),
  ]);
  cached = { prettier, babel, estree };
  return cached;
}

export async function formatCode(
  source: string,
  parser: "babel-ts" | "babel" = "babel-ts"
): Promise<string> {
  if (!source.trim()) return source;
  try {
    const { prettier, babel, estree } = await loadPrettier();
    return await prettier.format(source, {
      parser,
      plugins: [babel, estree],
      semi: true,
      singleQuote: false,
      trailingComma: "all",
      printWidth: 80,
      tabWidth: 2,
    });
  } catch (err) {
    // Prettier falhou (ex: código com erro de sintaxe ou problema de bundle).
    // Retorna a fonte inalterada para não perder o conteúdo do editor.
    console.warn(
      "[formatCode] Prettier failed — returning unmodified source.",
      err instanceof Error ? err.message : err
    );
    return source;
  }
}
