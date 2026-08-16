import { useEffect, useState, ReactNode } from "react";
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
  component: SignInPageWrapper,
});

function SignInPageWrapper() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { redirect, confirmed } = Route.useSearch();
  const redirectTarget = redirect || "/";

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (confirmed === "true") {
      setSuccessMessage("Email confirmed successfully. Please sign in.");
    }
  }, [confirmed]);

  if (user) {
    const userDisplayName = profile?.full_name || (user.user_metadata?.["full_name"] as string) || user.email;
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50 font-sans">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#0647E8]/10 text-[#0647E8]">
            <CheckCircle2 className="size-8" />
          </div>
          <h1 className="mt-4 text-[24px] font-black text-slate-900">Already Logged In</h1>
          <p className="mt-2 text-[15px] text-slate-500">
            You are signed in as <span className="font-semibold text-slate-900">{userDisplayName}</span>.
          </p>
          <div className="mt-8">
            <Button
              onClick={() => navigate({ to: redirectTarget })}
              className="w-full h-[56px] rounded-xl bg-[#0647E8] font-bold text-[16px] text-white hover:bg-[#062BCB] cursor-pointer"
            >
              Continue {redirectTarget === "/checkout" ? "to Checkout" : "Shopping"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <SignInPage initialSuccessMessage={successMessage} />;
}

// ----------------------------------------------------------------------
// NEW COMPONENT STRUCTURE
// ----------------------------------------------------------------------

function SignInPage({ initialSuccessMessage }: { initialSuccessMessage: string | null }) {
  return (
    <BlueBackground>
      <BackToHome />
      <div className="flex flex-col lg:flex-row w-full h-full relative z-10">
        <HeroSection>
          <Logo />
          <HeroHeading />
          <HeroDescription />
          <FeatureList />
        </HeroSection>
        
        <LoginSection>
          <LoginCard>
            <LoginForm initialSuccessMessage={initialSuccessMessage} />
          </LoginCard>
        </LoginSection>
      </div>
    </BlueBackground>
  );
}

function BlueBackground({ children }: { children: ReactNode }) {
  return (
    <div 
      className="w-[100vw] min-h-[100vh] overflow-hidden relative font-sans"
      style={{ background: "linear-gradient(135deg, #062BCB 0%, #064FEA 50%, #1236C9 100%)" }}
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Dotted pattern top right */}
        <div 
          className="absolute top-0 right-0 w-[400px] h-[400px] opacity-[0.08]" 
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.9) 2px, transparent 0)", backgroundSize: "32px 32px" }} 
        />
        {/* Dotted pattern bottom left */}
        <div 
          className="absolute bottom-0 left-0 w-[300px] h-[300px] opacity-[0.08]" 
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.9) 2px, transparent 0)", backgroundSize: "32px 32px" }} 
        />
        {/* Large soft circular gradients */}
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white opacity-5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-[#1236C9] opacity-40 blur-[100px]" />
        
        {/* Flowing thin wave lines along the bottom */}
        <svg className="absolute bottom-0 left-0 w-full h-auto opacity-[0.15]" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="none" stroke="white" strokeWidth="2" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,149.3C672,139,768,149,864,170.7C960,192,1056,224,1152,213.3C1248,203,1344,149,1392,122.7L1440,96" />
          <path fill="none" stroke="white" strokeWidth="1" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,218.7C672,213,768,171,864,149.3C960,128,1056,128,1152,144C1248,160,1344,192,1392,208L1440,224" />
        </svg>
      </div>

      {children}
    </div>
  );
}

function BackToHome() {
  return (
    <Link 
      to="/" 
      className="absolute top-8 left-8 lg:top-10 lg:left-12 flex items-center gap-2 text-white hover:text-white/80 transition-colors text-[16px] font-medium z-30"
    >
      <ArrowLeft className="w-[18px] h-[18px]" /> Back to Home
    </Link>
  );
}

function HeroSection({ children }: { children: ReactNode }) {
  return (
    <div className="w-full lg:w-[50%] flex flex-col justify-center px-8 lg:px-[80px] py-24 lg:py-16 xl:py-24">
      <div className="max-w-[560px]">
        {children}
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="mb-12">
      <img src="/logo.png" alt="Clip N Copy" className="h-10 w-auto brightness-0 invert" />
    </div>
  );
}

function HeroHeading() {
  return (
    <h1 className="text-[42px] lg:text-[52px] font-black text-white leading-[1.1] mb-6 tracking-tight">
      Create. <span className="text-[#60A5FA]">Edit.</span> Copy.
    </h1>
  );
}

function HeroDescription() {
  return (
    <p className="text-white/95 text-[16px] lg:text-[18px] mb-12 max-w-[500px] leading-relaxed font-medium">
      Your creative workspace starts here. Clip N Copy helps you create, edit, organize, and manage your content with ease.
    </p>
  );
}

function FeatureList() {
  const features = [
    { icon: Zap, title: "Fast content creation", desc: "Streamline your workflow." },
    { icon: Edit3, title: "Smart editing tools", desc: "Everything you need to polish your work." },
    { icon: Layers, title: "Easy project management", desc: "Organize your projects efficiently." },
    { icon: Cloud, title: "Secure cloud storage", desc: "Keep your data safe and accessible." },
  ];

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {features.map((f, i) => (
        <FeatureItem key={i} icon={f.icon} title={f.title} desc={f.desc} />
      ))}
    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-6">
      <div className="w-14 h-14 md:w-[56px] md:h-[56px] bg-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
        <Icon className="w-6 h-6 md:w-[24px] md:h-[24px] text-[#0647E8]" />
      </div>
      <div>
        <h3 className="text-white font-bold text-[17px] md:text-[18px]">{title}</h3>
        <p className="text-[#E0E7FF] text-[14px] md:text-[15px] mt-1">{desc}</p>
      </div>
    </div>
  );
}

function LoginSection({ children }: { children: ReactNode }) {
  return (
    <div className="w-full lg:w-[50%] flex flex-col items-center justify-center p-6 lg:p-8 xl:p-12 relative">
      {children}
    </div>
  );
}

function LoginCard({ children }: { children: ReactNode }) {
  return (
    <div 
      className="w-full max-w-[480px] bg-white p-[40px] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.3)] relative z-10"
      style={{ 
        borderRadius: '24px',
        maxHeight: 'calc(100vh - 80px)',
        overflowY: 'auto'
      }}
    >
      {children}
    </div>
  );
}

function LoginForm({ initialSuccessMessage }: { initialSuccessMessage: string | null }) {
  const { signIn, resetPassword, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const redirectTarget = redirect || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(initialSuccessMessage);
  const [showResend, setShowResend] = useState(false);
  const [resetMode, setResetMode] = useState(false);

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
            target = "/admin";
          } else {
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
    <>
      <div className="flex flex-col items-center text-center mb-8">
        {!resetMode && (
          <span className="bg-[#EFF6FF] text-[#0647E8] text-[12px] font-bold px-4 py-1.5 rounded-full tracking-widest uppercase mb-6">
            WELCOME BACK
          </span>
        )}
        
        <h2 className="text-[32px] md:text-[36px] font-black text-slate-900 mb-2 tracking-tight">
          {resetMode ? "Reset Password" : "Sign In"}
        </h2>
        <p className="text-slate-600 text-[15px]">
          {resetMode 
            ? "Enter your email to receive password reset instructions." 
            : "Sign in to continue creating with Clip N Copy."}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-[16px] border border-red-200 bg-red-50 p-4 text-[14px] font-medium text-red-700 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
          {showResend && (
            <Button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="h-[40px] w-full rounded-[12px] bg-red-100 text-red-700 font-bold text-[13px] hover:bg-red-200 shadow-none cursor-pointer"
            >
              {resending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Resending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" /> Resend confirmation email
                </span>
              )}
            </Button>
          )}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-[16px] border border-blue-200 bg-blue-50 p-4 text-[14px] font-medium text-blue-700">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {!resetMode ? (
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[12px] font-bold uppercase tracking-wider text-slate-500 ml-1">
              EMAIL ADDRESS
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 w-5 h-5 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-[56px] rounded-[16px] pl-[48px] text-[15px] border-slate-200 bg-white focus-visible:ring-[#0647E8] focus-visible:border-[#0647E8] transition-all hover:border-slate-300 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <Label htmlFor="password" className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
                PASSWORD
              </Label>
              <button
                type="button"
                onClick={() => {
                  setResetMode(true);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-[13px] font-semibold text-[#0647E8] hover:underline transition-all cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 w-5 h-5 -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-[56px] rounded-[16px] pl-[48px] text-[15px] border-slate-200 bg-white focus-visible:ring-[#0647E8] focus-visible:border-[#0647E8] transition-all hover:border-slate-300 shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 ml-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded text-[#0647E8] focus:ring-[#0647E8] w-4 h-4 border-slate-300 cursor-pointer"
            />
            <Label htmlFor="remember" className="text-[14px] text-slate-600 font-medium cursor-pointer">
              Remember me
            </Label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-6 h-[56px] w-full rounded-[14px] border-0 text-white font-bold text-[16px] shadow-[0_12px_24px_-12px_rgba(6,71,232,0.6)] transition-all hover:translate-y-[-2px] hover:shadow-[0_16px_32px_-12px_rgba(6,71,232,0.7)] active:translate-y-[0px] cursor-pointer"
            style={{ background: "linear-gradient(to right, #062BCB, #0647E8)" }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
          
          <div className="relative mt-8 flex items-center justify-center py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative bg-white px-4 text-[12px] font-bold uppercase tracking-widest text-slate-400">
              OR
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[15px] text-slate-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                search={redirect ? { redirect } : {}}
                className="font-bold text-[#0647E8] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </form>
      ) : (
        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div className="space-y-2.5">
            <Label htmlFor="reset-email" className="text-[12px] font-bold uppercase tracking-wider text-slate-500 ml-1">
              EMAIL ADDRESS
            </Label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 w-5 h-5 -translate-y-1/2 text-slate-400" />
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-[56px] rounded-[16px] pl-[48px] text-[15px] border-slate-200 bg-white focus-visible:ring-[#0647E8] focus-visible:border-[#0647E8] transition-all hover:border-slate-300 shadow-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-6 h-[56px] w-full rounded-[14px] border-0 text-white font-bold text-[16px] shadow-[0_12px_24px_-12px_rgba(6,71,232,0.6)] transition-all hover:translate-y-[-2px] hover:shadow-[0_16px_32px_-12px_rgba(6,71,232,0.7)] active:translate-y-[0px] cursor-pointer"
            style={{ background: "linear-gradient(to right, #062BCB, #0647E8)" }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Sending link...
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
            className="w-full mt-6 text-[15px] font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Back to Login
          </button>
        </form>
      )}
    </>
  );
}
