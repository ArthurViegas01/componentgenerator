/**
 * Centralised system prompts for the code-generation LLM.
 *
 * Keeping these in one place makes it easy to A/B test prompt variants and
 * measure quality regressions — see `lib/ai/validators.ts` for the checks
 * that complement these instructions.
 */

export const SYSTEM_PROMPT = `You are an expert React + TypeScript + Tailwind CSS component generator.

Your job: given a user description, emit **one** production-quality React
function component.

STRICT RULES:
1. Output **only** a fenced code block starting with \`\`\`tsx and ending with \`\`\`.
   No prose before, no prose after. No explanations.
2. Use TypeScript (.tsx). Export the component as \`export default\`.
3. Styling: Tailwind CSS utility classes ONLY. Never use inline \`style\`
   objects, never use CSS modules, never use styled-components.
4. Make the component reusable: all variable content must come from props.
   Define a \`Props\` interface with JSDoc comments on each field.
5. Respect accessibility:
   - semantic HTML (\`button\`, \`nav\`, \`article\`, \`section\`, \`label\` ...)
   - ARIA attributes where they add value
   - keyboard support for interactive elements
6. Support dark mode via Tailwind's \`dark:\` variant.
7. When animation/interaction is requested, use \`framer-motion\`'s \`motion.*\`
   components. Import from "framer-motion".
8. When icons are needed, import from "lucide-react".
9. Use Shadcn-style composition (compound components, \`className\` override
   via a \`cn\` helper) when it makes the API cleaner. Assume \`cn\` is
   imported from "@/lib/utils/cn".
10. Add a JSDoc block above the component describing what it does and one
    \`@example\` showing typical usage.
11. Keep variable names descriptive. No \`data\`, \`item\`, \`x\`.
12. The file must be self-contained: no external component imports beyond
    "react", "framer-motion", "lucide-react", and "@/lib/utils/cn".

If the user description is ambiguous, pick sensible defaults silently — do
NOT ask follow-up questions. Never include placeholder TODOs.

REMEMBER: output ONLY the fenced \`\`\`tsx ... \`\`\` block.`;

/**
 * Builds the user-facing turn for a generation request. We wrap the raw
 * prompt so the model always sees the same envelope shape — this helps with
 * reproducibility and makes it easier to tack on refinement context later.
 */
export function buildUserMessage(description: string, opts?: {
  themeHint?: string;
  extraGuidance?: string;
}): string {
  const parts: string[] = [
    `Component description:\n${description.trim()}`,
  ];
  if (opts?.themeHint) {
    parts.push(`Visual theme hint: ${opts.themeHint}`);
  }
  if (opts?.extraGuidance) {
    parts.push(`Additional constraints: ${opts.extraGuidance}`);
  }
  return parts.join("\n\n");
}

/** Suggested prompts shown as quick-start chips in the UI. */
export const EXAMPLE_PROMPTS: Array<{ label: string; prompt: string; tag: string }> = [
  {
    label: "Pricing card",
    tag: "card",
    prompt:
      "Pricing card com título, preço grande, lista de 4-5 features com ícones de check, e um botão de CTA. Variante 'popular' com badge e borda destacada.",
  },
  {
    label: "Login form",
    tag: "form",
    prompt:
      "Formulário de login com campos email e senha, label flutuante, validação inline, botão de submit com estado de loading e link 'esqueci minha senha'.",
  },
  {
    label: "Navbar",
    tag: "navigation",
    prompt:
      "Navbar responsivo com logo à esquerda, links centrais, botão de ação à direita. Menu hamburguer em mobile com transição suave.",
  },
  {
    label: "Toast notification",
    tag: "feedback",
    prompt:
      "Toast de notificação que desliza pela direita. 4 variantes: success, error, warning, info. Botão de fechar, auto-dismiss em 5s com barra de progresso.",
  },
  {
    label: "Stat card",
    tag: "card",
    prompt:
      "Card de estatística mostrando um número grande, rótulo, variação percentual (positiva/negativa com cor e ícone) e um mini sparkline.",
  },
  {
    label: "Hero section",
    tag: "section",
    prompt:
      "Hero section para landing page SaaS: headline grande, subheadline, dois botões de CTA, badge de 'new', e uma imagem de produto à direita com sombra suave.",
  },
];
