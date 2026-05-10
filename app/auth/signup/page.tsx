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

/** Sign-up page — authentication is on the roadmap. */
export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Accounts are coming soon. The generator is free to use right now —
            no sign-up required.
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
            <Input placeholder="Full name" required disabled />
            <Input type="email" placeholder="you@work.com" required disabled />
            <Button variant="primary" className="w-full" disabled>
              Create account
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
