import Link from "next/link";
import { Sparkles, Zap, Palette, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Marketing-style landing page. Functions as the entry point and explains
 * what the tool does before the user dives into the generator.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Top nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-primary to-secondary" />
          <span className="font-semibold text-sm">UI Component Generator</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/auth/signin" className="text-xs text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
          <Link href="/generator">
            <Button size="sm" leftIcon={<Sparkles className="h-3.5 w-3.5" />}>
              Open generator
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <Badge variant="outline" className="mb-4">
          Free preview · Bring your own API key
        </Badge>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
          Describe it. Ship it.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground">
          Generate production-ready React + Tailwind components from a single
          sentence. Live preview, code editor, theme system — all in the browser.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/generator">
            <Button size="lg" leftIcon={<Sparkles className="h-4 w-4" />}>
              Start generating
            </Button>
          </Link>
          <a
            href="https://github.com/anthropics/anthropic-sdk-typescript"
            target="_blank"
            rel="noreferrer"
          >
            <Button size="lg" variant="outline">
              Read the docs
            </Button>
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Feature
          icon={<Zap className="h-5 w-5" />}
          title="Streaming output"
          description="See the code being typed in real time, just like in chat."
        />
        <Feature
          icon={<Palette className="h-5 w-5" />}
          title="Theme system"
          description="10+ palettes, dark mode, and a custom palette composer."
        />
        <Feature
          icon={<Library className="h-5 w-5" />}
          title="Component library"
          description="Save, tag and favorite — your library lives in your browser."
        />
        <Feature
          icon={<Sparkles className="h-5 w-5" />}
          title="Free to run"
          description="Uses Groq's free tier by default. Ollama, Claude & OpenAI also supported."
        />
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold text-sm">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
