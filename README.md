# UI Component Generator

AI-powered UI component generator with real-time streaming and in-browser compilation.

[Live demo](https://uicomponentgenerator.netlify.app)

## What it does

Type a prompt describing a React component and the code appears in the Monaco editor token by token as the model streams it. Once the stream closes, Babel compiles the TSX inside the preview iframe and the component renders immediately. You can edit the code directly in Monaco and the preview updates in real time — no page reload, no build step.

## How it works

A prompt is POSTed from the editor to a Next.js API route, which forwards it to Groq's OpenAI-compatible streaming endpoint. The route reads the SSE frames coming back, extracts the raw text delta from each `choices[0].delta.content`, and re-emits them as a plain `ReadableStream` of UTF-8 bytes. The browser reads chunks with `TextDecoder` as they arrive and accumulates them into the editor. When the stream closes, a client-side validation pass flags common hallucinations — disallowed imports, `class=` instead of `className`, inline style objects. The validated source is then injected into an iframe `srcDoc`, where Babel Standalone (fetched from a CDN, no server compile step) transforms the TSX at runtime and React mounts the result. The iframe runs with `sandbox="allow-scripts"`, so generated code is isolated from the parent app. Runtime errors are caught by an error boundary inside the iframe and posted back to the parent via `postMessage`.

## Stack

- Next.js 16 (App Router)
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

## Key decisions

- **Babel in the browser, not on the server.** Compiling TSX server-side would mean a build step that has to handle arbitrary, potentially malformed user-edited code, plus a round-trip per preview refresh. Running Babel Standalone inside the iframe means compilation is instant, isolated, and costs nothing on the server. The tradeoff is a ~300 KB CDN payload on first load inside the iframe, which is acceptable.

- **iframe sandbox for preview.** Generated code is untrusted — it comes from an LLM and gets eval'd. Rendering it inside an iframe with `sandbox="allow-scripts"` means it cannot access the parent DOM, cookies, or storage. This also means a runtime crash in generated code can't break the editor or the rest of the app.

- **Groq over OpenAI as the default.** Groq runs inference on LPUs. The token throughput is high enough that streaming feels qualitatively different — you can watch the component structure take shape in real time rather than waiting for a block of text to appear. For a tool where the whole point is watching code stream in, that latency difference matters.

- **Zustand over Redux.** The state here is small and localized: a code buffer, a streaming status flag, a viewport selection, a theme palette. Redux would add reducers, action creators, and a provider tree for state that amounts to a few fields. Zustand gives direct store access and selector-based subscriptions with almost no setup, which fits the scale of the problem.
