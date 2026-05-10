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
3. Language: write ALL code in English — variable names, prop names, comments,
   JSDoc, and \`@example\` blocks. The user's prompt may be in any language;
   always respond with English-language code.
4. Styling: Tailwind CSS utility classes ONLY. Never use inline \`style\`
   objects, never use CSS modules, never use styled-components.
   Exception: SVG data-visualisation attributes (e.g. sparkline \`points\`,
   \`d\`, computed \`x\`/\`y\`/\`width\` derived from array data) may use JSX
   expressions since Tailwind has no equivalent — keep them inside the SVG only.
5. Make the component reusable: all variable content must come from props.
   Define a \`Props\` interface with JSDoc comments on each field.
   Type array-of-object props as inline object shapes:
   \`links: { label: string; href: string }[]\` (never a named external type,
   since the file must be self-contained).
6. Respect accessibility:
   - semantic HTML (\`button\`, \`nav\`, \`article\`, \`section\`, \`label\` ...)
   - ARIA attributes where they add value
   - keyboard support for interactive elements
7. Support dark mode via Tailwind's \`dark:\` variant.
8. When animation/interaction is requested, use \`framer-motion\`'s \`motion.*\`
   components. Import from "framer-motion".
9. When icons are needed, import from "lucide-react".
10. Use Shadcn-style composition (compound components, \`className\` override
    via a \`cn\` helper) when it makes the API cleaner. Assume \`cn\` is
    imported from "@/lib/utils/cn".
11. Add a JSDoc block above the component describing what it does and one
    \`@example\` showing typical usage (in English).
12. Keep variable names descriptive. No \`data\`, \`item\`, \`x\`.
13. The file must be self-contained: no external component imports beyond
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
      "Pricing card with a title, large price, a list of 4–5 features with check icons, and a CTA button. Include a 'Popular' variant with a badge and a highlighted border.",
  },
  {
    label: "Login form",
    tag: "form",
    prompt:
      "Login form with email and password fields, floating labels, inline validation, a submit button with a loading state, and a 'Forgot password?' link.",
  },
  {
    label: "Navbar",
    tag: "navigation",
    prompt:
      "Responsive navbar with a logo on the left, centered navigation links, and an action button on the right. Mobile hamburger menu with a smooth open/close transition.",
  },
  {
    label: "Toast notification",
    tag: "feedback",
    prompt:
      "Toast notification that slides in from the right. 4 variants: success, error, warning, info. Close button, auto-dismiss in 5s with a progress bar.",
  },
  {
    label: "Stat card",
    tag: "card",
    prompt:
      "Statistics card showing a large number, label, percentage variation (positive/negative with color and icon) and a mini sparkline.",
  },
  {
    label: "Hero section",
    tag: "section",
    prompt:
      "SaaS landing page hero: large headline, subheadline, two CTA buttons, a 'New' badge, and a product screenshot on the right with a soft glow shadow.",
  },
];
