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
 * Sign-in page — authentication is on the roadmap.
 * The UI is complete; the providers will be wired up in a future release.
 */
export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Accounts are coming soon. In the meantime, the generator is fully
            free — no sign-in required.
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
            <Input type="email" placeholder="you@work.com" required disabled />
            <Button
              variant="primary"
              className="w-full"
              leftIcon={<Mail className="h-4 w-4" />}
              disabled
            >
              Email me a magic link
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-xs">
          <Link href="/generator" className="text-primary hover:underline">
            Go to the generator →
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
