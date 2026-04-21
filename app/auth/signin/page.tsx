import Link from "next/link";
import { Github, Mail } from "lucide-react";
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

/**
 * Sign-in stub. The real implementation should use NextAuth with the
 * GitHub provider + an email magic-link provider. Until that's wired up
 * this page is non-functional — links back to the generator so demos don't
 * dead-end.
 */
export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Welcome back. Pick a provider to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            leftIcon={<Github className="h-4 w-4" />}
            disabled
          >
            Continue with GitHub
          </Button>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <form className="space-y-2">
            <Input type="email" placeholder="you@work.com" required />
            <Button
              variant="primary"
              className="w-full"
              leftIcon={<Mail className="h-4 w-4" />}
              disabled
            >
              Email me a magic link
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
          <Link href="/auth/signup" className="text-primary hover:underline">
            Create account
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
