# AI Component Generator — Project Summary

Real-time React component generator. Describe a component in plain text; watch the code stream into a Monaco editor token by token; see the compiled preview appear in an isolated iframe — no build step, no server compile.

**Live demo:** https://uicomponentgenerator.netlify.app  
**Repository:** https://github.com/ArthurViegas01/componentgenerator

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Node.js runtime) |
| LLM | Groq / Llama 3.3 70B (default, free) · Ollama · Anthropic Claude · OpenAI |
| Editor | Monaco Editor (dynamically imported, SSR disabled) |
| In-browser compiler | Babel Standalone (CDN, loaded inside the iframe) |
| State | Zustand — 3 stores: `editorStore` (ephemeral), `componentStore` (localStorage), `themeStore` (localStorage) |
| Styling | Tailwind CSS + CSS custom properties for dynamic palette |
| Animation | Framer Motion |
| Formatting | Prettier standalone (lazy-loaded, browser-side) |

---

## Architecture

The system has three layers:

```
User layer          Server (Next.js)        Client runtime
─────────────       ────────────────        ──────────────────────────
Monaco Editor  →    POST /api/generate  →   ReadableStream (chunk by chunk)
Zustand store       Groq SDK / fetch        TextDecoder → Monaco append
                    streaming               Validation layer
                                            Babel Standalone (TSX → JS)
                                            iframe sandbox → live preview
```

### Streaming pipeline

1. The editor POSTs the prompt to `/api/generate`.
2. The route opens a streaming connection to the upstream LLM (Groq by default).
3. Each SSE frame is parsed server-side (`choices[0].delta.content`) and re-emitted as a plain `ReadableStream` of UTF-8 bytes — no SSE framing on the client side.
4. The browser reads chunks via `TextDecoder` and appends them to the editor store in real time.
5. When the stream closes, the client runs a validation pass (`lib/ai/validators.ts`), then Prettier formats the result.
6. The validated TSX is injected into the iframe `srcDoc` where Babel Standalone compiles it at runtime.

### Multi-provider support

Provider is selected via the `AI_PROVIDER` env var. Groq and Ollama share the OpenAI chat-completions wire format; Anthropic uses the official SDK. Switching providers requires only an env change — no code change.

| Provider | Cost | Latency | Notes |
|---|---|---|---|
| Groq (default) | Free tier | < 200 ms first token | Recommended for demos |
| Ollama | Free (local) | Varies | Offline capable |
| Anthropic Claude | Paid | Low | Higher quality on complex components |
| OpenAI | Paid | Low | GPT-4o-mini default |

---

## Key Design Decisions

### Babel in the browser, not on the server

Compiling TSX server-side would require handling arbitrary, potentially malformed user-edited code plus a round-trip per preview refresh. Running Babel Standalone inside the iframe means compilation is instant, isolated, and costs nothing on the server. Trade-off: ~300 KB CDN payload on first load inside the iframe.

### iframe sandbox for preview isolation

Generated code is untrusted — it comes from an LLM and is eval'd. Rendering it inside `sandbox="allow-scripts"` (without `allow-same-origin`) means it cannot access the parent DOM, cookies, or storage. A runtime crash in generated code cannot break the editor. XSS is contained. Communication from the iframe back to the parent goes only via `postMessage`.

### Stateless API route

`/api/generate` holds no state. Each request is independent. The route scales horizontally on Vercel/Railway with no additional configuration. Component history lives in the client's `localStorage` via Zustand.

### Zustand over Redux

State is small and localized: a code buffer, a streaming status flag, viewport selection, theme palette. Zustand gives direct store access and selector subscriptions with minimal setup. Three stores keep concerns separated without coupling.

---

## Security

| Surface | Mitigation |
|---|---|
| LLM-generated code | Pre-compile validation (`validators.ts`): rejects disallowed imports, detects `eval`, `document.cookie`, `window.location` patterns |
| Arbitrary code execution | `iframe sandbox="allow-scripts"` without `allow-same-origin` — no DOM/cookie/storage access |
| API key exposure | Key never leaves the server; `/api/generate` acts as a proxy |
| Stream cancellation | `AbortController` lets the user cancel at any time; platform timeouts apply automatically |

---

## Scalability

The server is stateless by design — all compilation logic runs on the client.

- **Zero backend storage** — component history is in `localStorage` (Zustand). Adding multi-device sync requires wiring `/api/save` and `/api/history` to a database (Prisma + auth); the routes already exist as stubs.
- **Rate limiting** — currently gated by the Groq API key. Adding per-IP rate limiting requires Redis + a middleware wrapper; no changes to streaming logic.
- **Known bottleneck** — shared Groq API rate limits under concurrent load. Mitigation: response cache for identical prompts + local Ollama for offline demos.

---

## Project Structure

```
app/
  api/
    generate/route.ts   # Streaming LLM proxy (multi-provider)
    history/route.ts    # Stub — will back component history
    save/route.ts       # Stub — will persist to database
    themes/route.ts     # Exposes palette catalogue (e.g. for Figma plugin)
  auth/                 # Sign-in / sign-up UI (auth not yet wired)
  dashboard/            # Saved components overview
  generator/            # Main editor — prompt input, Monaco, preview
  page.tsx              # Landing page

lib/
  ai/
    prompts.ts          # System prompt + buildUserMessage()
    validators.ts       # Post-generation code sanity checks
  hooks/
    useCodeEditor.ts    # Streaming pipeline coordinator
    useComponentHistory.ts
    useTheme.ts         # DOM ↔ theme store sync
  store/
    componentStore.ts   # Persisted (localStorage) — saved components
    editorStore.ts      # Ephemeral — current session state
    themeStore.ts       # Persisted — palette + color mode
  utils/
    cn.ts               # clsx + twMerge
    extractProps.ts     # Heuristic TSX prop parser (brace-balanced)
    formatCode.ts       # Prettier standalone (lazy-loaded)
    generateFileName.ts # Filesystem-safe name from component or prompt
    mockProps.ts        # Auto-generates mock prop values for preview

components/ui/          # Primitive UI components (Button, Card, Input, etc.)
```

---

## Running Locally

```bash
npm install
cp .env.example .env.local
# Add GROQ_API_KEY — free key at https://console.groq.com/keys
npm run dev
```

Minimum required env vars:

```
AI_PROVIDER=groq
GROQ_API_KEY=your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

See `.env.example` for the full list including Ollama, Anthropic, and OpenAI options.
