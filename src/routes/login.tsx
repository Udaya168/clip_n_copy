import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import { AlertCircle, CheckCircle2, Loader2, Lock, Mail, ArrowLeft, Send, Zap, Edit3, Layers, Cloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string; confirmed?: string } => {
    const res: { redirect?: string; confirmed?: string } = {};
    if (typeof search["redirect"] === "string" && search["redirect"].trim().length > 0) {
      res.redirect = search["redirect"];
    }
    if (typeof search["confirmed"] === "string" && search["confirmed"].trim().length > 0) {
      res.confirmed = search["confirmed"];
    }
    return res;
  },
  head: () => ({
    meta: [
      { title: "Login — Clip N Copy" },
      { name: "description", content: "Sign in to your Clip N Copy account to track orders and save wishlist items." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, resetPassword, resendConfirmation, user, profile } = useAuth();
  const navigate = useNavigate();
  const { redirect, confirmed } = Route.useSearch();
  const redirectTarget = redirect || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  // Requirement 8: If returned from email confirmation link (?confirmed=true)
  useEffect(() => {
    if (confirmed === "true") {
      setSuccessMessage("Email confirmed successfully. Please sign in.");
    }
  }, [confirmed]);

  // If already logged in, redirect to redirectTarget or home
  if (user) {
    const userDisplayName = profile?.full_name || (user.user_metadata?.["full_name"] as string) || user.email;
    return (
      <div className="section-shell flex min-h-[60vh] flex-col items-center justify-center py-12">
        <div className="card-lift w-full max-w-md rounded-3xl border border-border bg-background p-8 text-center shadow-soft">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-8" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-black">Already Logged In</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You are signed in as <span className="font-semibold text-foreground">{userDisplayName}</span>.
          </p>
          <div className="mt-6 flex flex-col gap-3">
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowResend(false);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn(email, password);
      if (res.error) {
        let msg = res.error.message || "Invalid email or password.";
        if (msg.toLowerCase().includes("failed to fetch")) {
          msg = "Unable to connect to Supabase server. Please check your network connection or verify VITE_SUPABASE_URL in your .env file.";
        } else if (msg.toLowerCase().includes("rate limit")) {
          msg = "Email rate limit exceeded. Supabase temporary limit reached for email sending. Please wait a few minutes before trying again.";
        }
        setErrorMessage(msg);

        // Requirement 3.3 & 4: If email is not confirmed
        if (res.requiresConfirmation || msg.toLowerCase().includes("confirm your email")) {
          setShowResend(true);
        }
      } else {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        let target = redirectTarget === "/admin" ? "/" : redirectTarget;
        if (session?.user?.id) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle();
          if (prof?.role === "admin") {
            console.log("[Login] Admin user role verified, redirecting to /admin");
            target = "/admin";
          } else {
            console.log("[Login] Normal user role verified, redirecting to storefront");
            if (redirectTarget === "/admin") {
              target = "/";
            }
          }
        }
        setSuccessMessage("Successfully logged in! Redirecting...");
        setTimeout(() => {
          navigate({ to: target });
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setErrorMessage("Please enter your email address to resend confirmation.");
      return;
    }

    setResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await resendConfirmation(email);
      if (error) {
        setErrorMessage(error.message || "Failed to resend confirmation email.");
      } else {
        setSuccessMessage("Confirmation email sent! Please check your inbox.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to resend confirmation email.");
    } finally {
      setResending(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage("Please enter your email address first.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        setErrorMessage(error.message || "Failed to send password reset email.");
      } else {
        setSuccessMessage("Password reset email sent! Check your inbox.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 w-full bg-background">
      {/* Left Promotional Column */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center bg-muted/30 p-8 lg:px-12 lg:py-8 border-r border-border">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="inline-block mb-6">
            <img src="/logo.png" alt="Clip N Copy" className="h-8 w-auto object-contain" />
          </Link>
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight text-foreground">
              Create. Edit. Copy.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your creative workspace starts here. Clip N Copy helps you create, edit, organize, and manage your content with ease.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Zap className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Fast content creation</h3>
                  <p className="text-sm text-muted-foreground">Streamline your workflow.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Edit3 className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Smart editing tools</h3>
                  <p className="text-sm text-muted-foreground">Everything you need to polish your work.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Layers className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Easy project management</h3>
                  <p className="text-sm text-muted-foreground">Organize your projects efficiently.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Cloud className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Secure cloud storage</h3>
                  <p className="text-sm text-muted-foreground">Keep your data safe and accessible.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Column */}
      <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        <div className="w-full max-w-md mx-auto">
          <Link
            to="/"
            className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to Home
          </Link>

          <div className="card-lift rounded-3xl border border-border bg-background p-5 sm:p-6 shadow-soft">
            <div className="text-center">
              <Link to="/" className="inline-block lg:hidden mb-3">
                <img src="/logo.png" alt="Clip N Copy" className="mx-auto h-8 w-auto object-contain" />
              </Link>
              {!resetMode && (
                <div className="mx-auto mb-2 w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                  Welcome Back
                </div>
              )}
              <h2 className="font-display text-xl font-black tracking-tight sm:text-2xl">
                {resetMode ? "Reset Password" : "Sign In"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {resetMode
                  ? "Enter your email to receive password reset instructions."
                  : "Sign in to continue creating with Clip N Copy."}
              </p>
            </div>

            {errorMessage && (
              <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
                {/* Requirement 4: Resend confirmation email button */}
                {showResend && (
                  <Button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="mt-1 h-8 w-full rounded-xl bg-destructive/20 text-destructive font-bold text-xs hover:bg-destructive/30 cursor-pointer"
                  >
                    {resending ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Loader2 className="size-3.5 animate-spin" /> Resending...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        <Send className="size-3.5" /> Resend confirmation email
                      </span>
                    )}
                  </Button>
                )}
              </div>
            )}

            {successMessage && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/10 p-3 text-xs font-medium text-primary">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {!resetMode ? (
              <form onSubmit={handleLogin} className="mt-4 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-10 rounded-xl pl-9 text-sm border-border bg-background focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetMode(true);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 rounded-xl pl-9 text-sm border-border bg-background focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-3 h-10 w-full rounded-full bg-primary font-bold text-primary-foreground transition-transform active:scale-[0.98] hover:bg-primary/90 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="size-4 animate-spin" /> Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                
                <div className="relative mt-4 flex items-center justify-center py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative bg-background px-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    Or
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="reset-email" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-10 rounded-xl pl-9 text-sm border-border bg-background focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-10 w-full rounded-full bg-primary font-bold text-primary-foreground transition-transform active:scale-[0.98] hover:bg-primary/90 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="size-4 animate-spin" /> Sending link...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setResetMode(false);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Back to Login
                </button>
              </form>
            )}

            <div className="mt-1 pt-1 text-center">
              <p className="text-xs text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  search={redirect ? { redirect } : {}}
                  className="font-bold text-primary hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
