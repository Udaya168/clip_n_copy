import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-store";
import { AlertCircle, CheckCircle2, Loader2, Lock, Mail, User, ArrowLeft, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const val = search["redirect"];
    if (typeof val === "string" && val.trim().length > 0) {
      return { redirect: val };
    }
    return {};
  },
  head: () => ({
    meta: [
      { title: "Sign Up — Clip N Copy" },
      { name: "description", content: "Create a new Clip N Copy account to start ordering stationery and school supplies." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signUp, user, profile } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const redirectTarget = redirect || "/";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  if (user) {
    const userDisplayName = profile?.full_name || (user.user_metadata?.["full_name"] as string) || user.email;
    return (
      <div className="section-shell flex min-h-[60vh] flex-col items-center justify-center py-12">
        <div className="card-lift w-full max-w-md rounded-3xl border border-border bg-background p-8 text-center shadow-soft">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-8" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-black">Account Active</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You are logged in as <span className="font-semibold text-foreground">{userDisplayName}</span>.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => navigate({ to: redirectTarget })}
              className="w-full rounded-full bg-primary font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              Continue {redirectTarget === "/checkout" ? "to Checkout" : "Shopping"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Requirement 1: Confirmation message screen after signup
  if (signupSuccess) {
    return (
      <div className="section-shell flex min-h-[70vh] items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="card-lift rounded-3xl border border-border bg-background p-6 shadow-soft sm:p-8 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
              <MailCheck className="size-8" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-black tracking-tight sm:text-3xl text-foreground">
              Account created successfully.
            </h1>
            <p className="mt-3 text-sm font-medium text-foreground">
              Please check your email and confirm your email address before signing in.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              After confirming your email, return to Clip N Copy and sign in.
            </p>
            <div className="mt-8">
              <Link
                to="/login"
                search={redirect ? { redirect } : {}}
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary font-bold text-primary-foreground transition-transform active:scale-[0.98] hover:bg-primary/90 cursor-pointer"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);

    try {
      // Requirement 1 & 5: Save Full Name in profiles.full_name with role='user'
      const { error, confirmed } = await signUp(fullName.trim(), email, password);

      if (error) {
        let msg = error.message || "Failed to create account. Please try again.";
        if (msg.toLowerCase().includes("failed to fetch")) {
          msg = "Unable to connect to Supabase server. Please check your network connection or verify VITE_SUPABASE_URL in your .env file.";
        } else if (msg.toLowerCase().includes("rate limit")) {
          msg = "Email rate limit exceeded. Supabase temporary limit reached for email sending. Please wait a few minutes before trying again, or try logging in if you already received the link.";
        }
        setErrorMessage(msg);
      } else if (confirmed) {
        // If email confirmation is disabled in Supabase, directly log in & redirect
        setSuccessMessage("Account created successfully! Redirecting...");
        setTimeout(() => {
          navigate({ to: redirectTarget });
        }, 1000);
      } else {
        // Show post-signup confirmation message
        setSignupSuccess(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-shell flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to Home
        </Link>

        <div className="card-lift rounded-3xl border border-border bg-background p-6 shadow-soft sm:p-8">
          <div className="text-center">
            <Link to="/" className="inline-block">
              <img src="/logo.webp" alt="Clip N Copy" className="mx-auto h-10 w-auto object-contain" />
            </Link>
            <h1 className="mt-4 font-display text-2xl font-black tracking-tight sm:text-3xl">
              Create Account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign up for Clip N Copy to get started
            </p>
          </div>

          {errorMessage && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-primary/20 bg-primary/10 p-3.5 text-xs font-medium text-primary">
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="full-name"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-11 rounded-xl pl-10 text-sm border-border bg-background focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl pl-10 text-sm border-border bg-background focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 rounded-xl pl-10 text-sm border-border bg-background focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl pl-10 text-sm border-border bg-background focus-visible:ring-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full rounded-full bg-primary font-bold text-primary-foreground transition-transform active:scale-[0.98] hover:bg-primary/90 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                search={redirect ? { redirect } : {}}
                className="font-bold text-primary hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
