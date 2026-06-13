import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GenerateBodySchema = z.object({
  prompt: z.string().trim().min(1).max(4000),
  themeHint: z.string().max(500).optional(),
  extraGuidance: z.string().max(500).optional(),
});

// M1: Only accept requests from the app's own origin.
// Requests without Origin (curl/server-to-server) are allowed and covered by rate limiting.
const ALLOWED_ORIGINS = new Set<string>([
  "https://uicomponentgenerator.netlify.app",
  ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
]);

// Rate limiting: active only when Upstash env vars are configured (fail-open otherwise).
// Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local / Netlify env.
let _rlPerIp: Ratelimit | null = null;
let _rlGlobal: Ratelimit | null = null;
let _rlDaily: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const _redis = Redis.fromEnv();
  _rlPerIp = new Ratelimit({
    redis: _redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    prefix: "gen:ip",
  });
  _rlGlobal = new Ratelimit({
    redis: _redis,
    limiter: Ratelimit.slidingWindow(300, "1 h"),
    prefix: "gen:global",
  });
  _rlDaily = new Ratelimit({
    redis: _redis,
    limiter: Ratelimit.slidingWindow(2000, "24 h"),
    prefix: "gen:daily",
  });
}

/**
 * POST /api/generate
 *
 * Streams the model output back as plain text. The client reads it as a
 * `ReadableStream` (no SSE framing — keeps things simple).
 *
 * Supported providers (via AI_PROVIDER env var):
 *   - "groq"       (default, FREE)    → api.groq.com, needs GROQ_API_KEY
 *   - "ollama"     (FREE, 100% local) → localhost:11434, no key needed
 *   - "anthropic"  (paid)              → Claude, needs ANTHROPIC_API_KEY
 *   - "openai"     (paid)              → GPT, needs OPENAI_API_KEY
 *
 * Groq and Ollama speak the OpenAI chat-completions wire format, so we
 * share a single streaming path for them with different base URLs.
 */
export async function POST(req: NextRequest) {
  // M1: Reject Content-Type != application/json (closes the text/plain CORS bypass)
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return new Response("Unsupported Media Type", { status: 415 });
  }

  // M1: Reject cross-origin requests from unlisted origins
  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return new Response("Forbidden", { status: 403 });
  }

  // F1: Rate limiting (skipped when Upstash is not configured)
  if (_rlPerIp && _rlGlobal && _rlDaily) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const [a, b, c] = await Promise.all([
      _rlPerIp.limit(ip),
      _rlGlobal.limit("all"),
      _rlDaily.limit("all"),
    ]);
    if (!a.success || !b.success || !c.success) {
      return new Response("Rate limit exceeded", { status: 429 });
    }
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  // F2/M2: Validate field types and enforce size caps before touching any value
  const parsed = GenerateBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return new Response("Invalid request body", { status: 400 });
  }
  const { prompt, themeHint, extraGuidance } = parsed.data;

  const provider = (process.env.AI_PROVIDER ?? "groq").toLowerCase();
  const userMessage = buildUserMessage(prompt, {
    themeHint,
    extraGuidance,
  });

  switch (provider) {
    case "anthropic":
      return streamFromAnthropic(userMessage);
    case "openai":
      return streamFromOpenAICompatible({
        baseUrl: "https://api.openai.com/v1/chat/completions",
        apiKey: process.env.OPENAI_API_KEY,
        apiKeyEnvName: "OPENAI_API_KEY",
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        userMessage,
      });
    case "ollama":
      return streamFromOpenAICompatible({
        baseUrl:
          (process.env.OLLAMA_BASE_URL ?? "http://localhost:11434") +
          "/v1/chat/completions",
        apiKey: "ollama", // Ollama ignores the key but OpenAI format needs one
        apiKeyEnvName: "OLLAMA_BASE_URL (no key required)",
        model: process.env.OLLAMA_MODEL ?? "qwen2.5-coder:7b",
        userMessage,
      });
    case "groq":
    default:
      return streamFromOpenAICompatible({
        baseUrl: "https://api.groq.com/openai/v1/chat/completions",
        apiKey: process.env.GROQ_API_KEY,
        apiKeyEnvName: "GROQ_API_KEY",
        model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
        userMessage,
      });
  }
}

// ---------------------------------------------------------------------------
// OpenAI-compatible streaming (used by Groq, Ollama, and OpenAI itself)
// ---------------------------------------------------------------------------

async function streamFromOpenAICompatible(args: {
  baseUrl: string;
  apiKey: string | undefined;
  apiKeyEnvName: string;
  model: string;
  userMessage: string;
}): Promise<Response> {
  if (!args.apiKey) {
    console.error(`Missing env var: ${args.apiKeyEnvName}`);
    return new Response("Service temporarily unavailable", { status: 500 });
  }

  const upstream = await fetch(args.baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${args.apiKey}`,
    },
    body: JSON.stringify({
      model: args.model,
      stream: true,
      temperature: 0.4,
      max_tokens: 4096,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: args.userMessage },
      ],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error(`Upstream ${upstream.status}:`, detail);
    return new Response("Generation failed, please try again.", { status: 502 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";
      try {
        // SSE frames: `data: { ... }\n\n`. Pull out `choices[0].delta.content`
        // from each frame and re-emit as plain text to the client.
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let idx;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, idx).trim();
            buffer = buffer.slice(idx + 1);
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (payload === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(payload);
              const text = json.choices?.[0]?.delta?.content;
              if (text) controller.enqueue(encoder.encode(text));
            } catch {
              /* malformed line — skip */
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

// ---------------------------------------------------------------------------
// Anthropic (Claude) — paid fallback
// ---------------------------------------------------------------------------

async function streamFromAnthropic(userMessage: string): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Missing env var: ANTHROPIC_API_KEY");
    return new Response("Service temporarily unavailable", { status: 500 });
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

  const stream = await client.messages.stream({
    model,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
