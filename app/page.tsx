import Link from "next/link";
import {
  Sparkles,
  Zap,
  Palette,
  Library,
  Github,
  ArrowRight,
  Code2,
  Eye,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Marketing landing page — the first impression of the generator.
 * Sections: Navbar · Hero · Demo mockup · How it works · Features · Footer
 */
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <DemoMockup />
        <HowItWorks />
        <Features />
      </main>

      <Footer />
    </div>
  );
}

/* ─── Navbar ──────────────────────────────────────────────────────────────── */

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold leading-none">✦</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">
            UI Component Generator
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="https://github.com/ArthurViegas01/componentgenerator"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Docs
          </a>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <a
            href="https://github.com/ArthurViegas01/componentgenerator"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <Link href="/auth/signin" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
            Sign in
          </Link>
          <Link href="/generator">
            <Button size="sm" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Open generator
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="mx-auto max-w-4xl px-6 pt-24 pb-12 text-center">
      <Badge variant="outline" className="mb-5 gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        Free preview · Bring your own API key
      </Badge>

      <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] bg-gradient-to-br from-primary via-secondary to-secondary bg-clip-text text-transparent">
        Describe it.
        <br />
        Ship it.
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
        Turn a plain-English prompt into a{" "}
        <span className="text-foreground font-medium">
          production-ready React + Tailwind component
        </span>{" "}
        in seconds. Watch the code stream live, tweak it in a Monaco editor, and
        see the result render instantly — no build step, no signup.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/generator">
          <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
            <Sparkles className="h-4 w-4" />
            Start generating
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <a
          href="https://github.com/ArthurViegas01/componentgenerator"
          target="_blank"
          rel="noreferrer"
        >
          <Button size="lg" variant="outline" className="gap-2">
            <Github className="h-4 w-4" />
            View on GitHub
          </Button>
        </a>
      </div>

      {/* Social proof pills */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        {["React + Tailwind", "Monaco Editor", "Groq / Claude / OpenAI", "Browser-only — no server needed"].map((item) => (
          <span key={item} className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ─── Demo Mockup ─────────────────────────────────────────────────────────── */

function DemoMockup() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-20">
      <div className="relative rounded-xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/50">
          <span className="h-3 w-3 rounded-full bg-red-400/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
          <span className="h-3 w-3 rounded-full bg-green-400/80" />
          <span className="ml-3 text-xs text-muted-foreground font-mono">
            uicomponentgenerator.netlify.app/generator
          </span>
        </div>

        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border min-h-[360px]">
          {/* Left: prompt + streaming code */}
          <div className="p-5 flex flex-col gap-4">
            {/* Prompt bubble */}
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
              <p className="text-xs text-primary font-medium mb-1">Prompt</p>
              <p className="text-sm text-foreground/80">
                A pricing card with three tiers, a highlighted "Pro" plan, and a gradient CTA button
              </p>
            </div>

            {/* Streaming code */}
            <div className="flex-1 rounded-lg bg-muted/60 p-3 font-mono text-xs text-muted-foreground overflow-hidden">
              <div className="space-y-0.5">
                <div><span className="text-secondary">export default</span> <span className="text-primary">function</span> <span className="text-foreground">PricingCard</span>() {"{"}</div>
                <div className="pl-4"><span className="text-secondary">return</span> (</div>
                <div className="pl-8">{"<"}<span className="text-primary">div</span> <span className="text-secondary">className</span>=<span className="text-green-500">"grid grid-cols-3 gap-4"</span>{">"}</div>
                <div className="pl-12">{"<"}<span className="text-primary">PlanCard</span> <span className="text-secondary">plan</span>=<span className="text-green-500">"Starter"</span> {"..."} /{">"}</div>
                <div className="pl-12">{"<"}<span className="text-primary">PlanCard</span> <span className="text-secondary">plan</span>=<span className="text-green-500">"Pro"</span> <span className="text-secondary">highlighted</span> {"..."} /{">"}</div>
                <div className="pl-12">{"<"}<span className="text-primary">PlanCard</span> <span className="text-secondary">plan</span>=<span className="text-green-500">"Enterprise"</span> {"..."} /{">"}</div>
                <div className="pl-8">{"</"}<span className="text-primary">div</span>{">"}</div>
                <div className="pl-4">)</div>
                <div>{"}"}</div>
                <div className="mt-2 flex items-center gap-1">
                  <span className="inline-block h-3.5 w-0.5 bg-primary animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: live preview */}
          <div className="p-5 flex flex-col gap-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Live Preview
            </p>
            <div className="flex-1 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-2 w-full text-center">
                {/* Starter */}
                <div className="rounded-lg border border-border p-3 flex flex-col gap-2">
                  <p className="text-xs font-semibold">Starter</p>
                  <p className="text-lg font-bold">$0</p>
                  <p className="text-[10px] text-muted-foreground">/ month</p>
                  <button className="mt-auto rounded border border-border text-[10px] px-2 py-1 text-muted-foreground">
                    Get started
                  </button>
                </div>
                {/* Pro — highlighted */}
                <div className="rounded-lg border-2 border-primary p-3 flex flex-col gap-2 shadow-lg shadow-primary/20 scale-105 bg-primary/5">
                  <p className="text-xs font-semibold text-primary">Pro</p>
                  <p className="text-lg font-bold">$12</p>
                  <p className="text-[10px] text-muted-foreground">/ month</p>
                  <button className="mt-auto rounded bg-gradient-to-r from-primary to-secondary text-[10px] px-2 py-1 text-white font-medium">
                    Start free trial
                  </button>
                </div>
                {/* Enterprise */}
                <div className="rounded-lg border border-border p-3 flex flex-col gap-2">
                  <p className="text-xs font-semibold">Enterprise</p>
                  <p className="text-lg font-bold">$49</p>
                  <p className="text-[10px] text-muted-foreground">/ month</p>
                  <button className="mt-auto rounded border border-border text-[10px] px-2 py-1 text-muted-foreground">
                    Contact us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ────────────────────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Describe your component",
      description:
        "Type a plain-English prompt — as simple as \"a login form with social buttons\" or as specific as you need. No special syntax required.",
    },
    {
      number: "02",
      icon: <Zap className="h-5 w-5" />,
      title: "Watch the code stream in",
      description:
        "The AI generates clean, idiomatic React + Tailwind code token by token — just like chatting with a senior dev. Powered by Groq's free tier by default.",
    },
    {
      number: "03",
      icon: <Eye className="h-5 w-5" />,
      title: "Preview, edit & ship",
      description:
        "Your component renders live in the browser as the code arrives. Tweak it in the built-in Monaco editor, swap themes, then copy or save it to your library.",
    },
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 pb-20">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          From idea to component in three steps
        </h2>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          No build pipeline, no boilerplate, no context-switching. Just describe
          what you need and ship.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-3 relative">
        {/* Connector line (desktop only) */}
        <div className="hidden sm:block absolute top-7 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center text-center gap-3">
            <div className="relative">
              <div className="h-14 w-14 rounded-full border border-border bg-card flex items-center justify-center text-primary shadow-md shadow-primary/10">
                {step.icon}
              </div>
              <span className="absolute -top-2 -right-2 text-[10px] font-bold text-primary/60 font-mono">
                {step.number}
              </span>
            </div>
            <h3 className="font-semibold text-sm">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Features ────────────────────────────────────────────────────────────── */

function Features() {
  return (
    <section className="bg-muted/40 border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Everything you need, nothing you don't
          </h2>
          <p className="mt-3 text-muted-foreground">
            A focused toolset built for speed — browser-first, zero-install.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon={<Zap className="h-5 w-5" />}
            title="Streaming output"
            description="Code arrives token by token in real time — just like chatting with a colleague, but faster. No waiting for a full response."
          />
          <Feature
            icon={<Palette className="h-5 w-5" />}
            title="Theme system"
            description="10+ curated color palettes, full dark-mode support, and a custom palette composer so every component fits your brand."
          />
          <Feature
            icon={<Library className="h-5 w-5" />}
            title="Component library"
            description="Save, tag, and favorite your generated components. Your personal library lives in the browser — no account needed."
          />
          <Feature
            icon={<Code2 className="h-5 w-5" />}
            title="Monaco editor"
            description="The same editor powering VS Code, right in the browser. Syntax highlighting, autocomplete, and instant live preview as you type."
          />
        </div>

        {/* Model support callout */}
        <div className="mt-8 rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm">Works with your preferred model</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Groq is the default (free, fast). Bring your own Claude, OpenAI, or Ollama key — switch at any time.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 text-xs font-medium text-muted-foreground">
            <ModelBadge label="Groq" color="bg-orange-500/15 text-orange-600" />
            <ModelBadge label="Claude" color="bg-amber-500/15 text-amber-600" />
            <ModelBadge label="OpenAI" color="bg-emerald-500/15 text-emerald-600" />
            <ModelBadge label="Ollama" color="bg-sky-500/15 text-sky-600" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ModelBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
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
    <div className="rounded-xl border border-border bg-card p-5 hover:shadow-md hover:shadow-primary/5 transition-shadow">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold text-sm">{title}</h3>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">✦</span>
          </div>
          <span className="text-sm font-medium">UI Component Generator</span>
        </div>

        <div className="flex items-center gap-5 text-xs text-muted-foreground">
          <Link href="/generator" className="hover:text-foreground transition-colors">
            Generator
          </Link>
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <a
            href="https://github.com/ArthurViegas01/componentgenerator"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>
        </div>

        <p className="text-xs text-muted-foreground">
          Built by{" "}
          <a
            href="https://github.com/ArthurViegas01"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors underline underline-offset-2"
          >
            Arthur Viegas
          </a>
        </p>
      </div>
    </footer>
  );
}
