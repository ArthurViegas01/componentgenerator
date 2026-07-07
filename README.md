# UI Component Generator

AI-powered UI component generator with real-time streaming and in-browser compilation.

[Live demo](https://uicomponentgenerator.netlify.app)

## What it does

Type a prompt describing a React component and the code appears in the Monaco editor token by token as the model streams it. Once the stream closes, Babel compiles the TSX inside the preview iframe and the component renders immediately. You can edit the code directly in Monaco and the preview updates in real time — no page reload, no build step.

## How it works

A prompt is POSTed from the editor to a Next.js API route, which forwards it to Groq's OpenAI-compatible streaming endpoint. The route reads the SSE frames coming back, extracts the raw text delta from each `choices[0].delta.content`, and re-emits them as a plain `ReadableStream` of UTF-8 bytes. The browser reads chunks with `TextDecoder` as they arrive and accumulates them into the editor. When the stream closes, a client-side validation pass flags common hallucinations — disallowed imports, `class=` instead of `className`, inline style objects. The validated source is then injected into an iframe `srcDoc`, where Babel Standalone (fetched from a CDN, no server compile step) transforms the TSX at runtime and React mounts the result. The iframe runs with `sandbox="allow-scripts"`, so generated code is isolated from the parent app. Runtime errors are caught by an error boundary inside the iframe and posted back to the parent via `postMessage`.

## Stack

- Next.js 15 (App Router)
- Groq API — Llama 3.3 70B Versatile (default; Anthropic Claude, OpenAI, and Ollama also supported via `AI_PROVIDER`)
- Babel Standalone (browser-side TSX compilation, loaded from CDN inside the iframe)
- Monaco Editor
- Zustand
- Tailwind CSS
- Framer Motion

## Running locally

```bash
npm install
cp .env.example .env.local
# Fill in GROQ_API_KEY — free key at https://console.groq.com/keys
npm run dev
```

Required env vars (`.env.example` has the full list with all provider options):

```
AI_PROVIDER=groq
GROQ_API_KEY=your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

## Security

The product surface is a single public, unauthenticated endpoint with a cost (`POST /api/generate`), so the hardening targets abuse, cross-origin abuse, and defence in depth.

**Rate limiting and cost caps (F1).** When Upstash Redis is configured, three sliding windows run before any provider call: 10 req/min per IP, a global ceiling of 300 req/hour, and a daily ceiling of 2,000 req/24h. Exceeding any of them returns 429. The global and daily ceilings are what survive a distributed (many-IP) attack. Every provider path (Groq/OpenAI-compatible included) sends an explicit `max_tokens` so a single request cannot run away. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in production, otherwise rate limiting is skipped.

**Cross-origin abuse (M1).** CORS alone does not stop abuse: a `text/plain` request is CORS-safelisted and skips preflight, so the route enforces its own checks. Non-`application/json` requests get 415 (closing the `text/plain` bypass), and requests carrying an `Origin` outside the allowlist get 403. Requests with no `Origin` (curl/server-to-server) fall through to rate limiting.

**Input validation (F2/M2).** The body is parsed with a zod schema: `prompt` 1-4,000 chars, `themeHint`/`extraGuidance` at most 500 chars. Anything else (wrong type, oversized, missing) returns 400 before a single token reaches the model.

**Security headers (F3).** `netlify.toml` sends CSP, `X-Frame-Options: DENY`, HSTS, `X-Content-Type-Options: nosniff`, and `Referrer-Policy` on every route. The CSP `script-src` allowlists `unpkg.com` and `cdn.tailwindcss.com` because the preview `srcDoc` iframe inherits the parent CSP.

**Error sanitisation (F6).** Upstream provider errors and missing-env-var details are logged server-side and returned to the client as generic messages, so provider org IDs, model names, and quota details are not leaked.

**Preview isolation and supply chain (F4).** Generated code runs in an `sandbox="allow-scripts"` iframe with an opaque origin (no parent DOM, cookies, or storage). CDN scripts inside the preview are version-pinned (notably `@babel/standalone`, previously unversioned, is now bound to the 7.x line). SRI and self-hosting are a documented accepted residual: the opaque-origin sandbox contains the blast radius, and the Tailwind Play CDN does not support versioning or SRI by design.

**Secrets and dependencies.** LLM keys live only on the server (the route is a proxy; nothing sensitive is exposed to the client); `.gitignore` covers every `.env*` variant except `.env.example`; and `npm audit fix` cleared the known advisories (F7).

## Key decisions

- **Babel in the browser, not on the server.** Compiling TSX server-side would mean a build step that has to handle arbitrary, potentially malformed user-edited code, plus a round-trip per preview refresh. Running Babel Standalone inside the iframe means compilation is instant, isolated, and costs nothing on the server. The tradeoff is a ~300 KB CDN payload on first load inside the iframe, which is acceptable.

- **iframe sandbox for preview.** Generated code is untrusted — it comes from an LLM and gets eval'd. Rendering it inside an iframe with `sandbox="allow-scripts"` means it cannot access the parent DOM, cookies, or storage. This also means a runtime crash in generated code can't break the editor or the rest of the app.

- **Groq over OpenAI as the default.** Groq runs inference on LPUs. The token throughput is high enough that streaming feels qualitatively different — you can watch the component structure take shape in real time rather than waiting for a block of text to appear. For a tool where the whole point is watching code stream in, that latency difference matters.

- **Zustand over Redux.** The state here is small and localized: a code buffer, a streaming status flag, a viewport selection, a theme palette. Redux would add reducers, action creators, and a provider tree for state that amounts to a few fields. Zustand gives direct store access and selector-based subscriptions with almost no setup, which fits the scale of the problem.
