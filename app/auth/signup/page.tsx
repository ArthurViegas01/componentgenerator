import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** Sign-up stub — mirrors `signin/page.tsx`. See that file's comment. */
export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Free tier: 10 generations per day. No card required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            leftIcon={<Github className="h-4 w-4" />}
            disabled
          >
            Sign up with GitHub
          </Button>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <form className="space-y-2">
            <Input placeholder="Full name" required />
            <Input type="email" placeholder="you@work.com" required />
            <Button variant="primary" className="w-full" disabled>
              Create account
            </Button>
          </form>
          <p className="text-center text-[11px] text-muted-foreground">
            Auth is stubbed in this build — wire up NextAuth to enable it.
          </p>
        </CardContent>
        <CardFooter className="justify-between text-xs">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            ← Home
          </Link>
          <Link href="/auth/signin" className="text-primary hover:underline">
            Sign in instead
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
