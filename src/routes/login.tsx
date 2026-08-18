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
  component: LoginPage,
});

export default function LoginPage() {
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
      <div className="flex min-h-[100dvh] items-center justify-center p-6 bg-blue-50 font-sans">
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
              className="w-full h-[52px] rounded-xl bg-[#0647E8] font-bold text-[16px] text-white hover:bg-[#062BCB] cursor-pointer"
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
// COMPONENT STRUCTURE
// ----------------------------------------------------------------------

function SignInPage({ initialSuccessMessage }: { initialSuccessMessage: string | null }) {
  return (
    <div className="min-h-[100dvh] lg:h-[100dvh] w-full relative font-sans flex flex-col bg-[#0647E8] overflow-x-hidden overflow-y-auto lg:overflow-hidden box-border">
      
      {/* Background Cutout */}
      <div 
        className="absolute top-0 right-0 h-full w-[60%] bg-[#F8FAFC] hidden lg:block"
        style={{
          clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)'
        }}
      />
      
      {/* Soft overlay patterns (optional) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.1]" 
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #ffffff 2px, transparent 0)", backgroundSize: "32px 32px" }} 
        />
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-white/10 blur-[100px]" />
      </div>

      <div className="flex flex-col lg:flex-row w-full flex-1 relative z-10 h-full">
        
        {/* Left Side: Promotional Panel */}
        <div className="w-full lg:w-[45%] flex flex-col px-6 lg:px-[60px] xl:px-[80px] py-[32px] relative z-10 shrink-0 lg:h-full box-border">
          <div className="flex-none mb-[20px]">
            <BackToHome />
          </div>
          <div className="flex-1 flex flex-col justify-center max-w-[500px] w-full mx-auto lg:mx-0 animate-slide-right">
            <Logo />
            <Heading />
            <Description />
            <FeatureList />
          </div>
        </div>
        
        {/* Right Side: Login Card */}
        <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 lg:p-12 relative z-20 shrink-0 lg:h-full animate-slide-left box-border">
          <LoginCard>
            <LoginForm initialSuccessMessage={initialSuccessMessage} />
          </LoginCard>
        </div>
      </div>
      
      <style>
        {`
          .animate-slide-right { animation: fadeSlideRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-slide-left { animation: fadeSlideLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-fade-scale { animation: fadeScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          
          @keyframes fadeSlideRight {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes fadeSlideLeft {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes fadeScale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes staggerUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .stagger-1 { animation: staggerUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.1s; opacity: 0; }
          .stagger-2 { animation: staggerUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.2s; opacity: 0; }
          .stagger-3 { animation: staggerUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.3s; opacity: 0; }
          .stagger-4 { animation: staggerUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.4s; opacity: 0; }
          
          .custom-scrollbar-white::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar-white::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar-white::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        `}
      </style>
    </div>
  );
}

function BackToHome() {
  return (
    <Link 
      to="/" 
      className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors text-[14px] font-medium z-30 animate-fade-scale w-fit"
    >
      <ArrowLeft className="w-[18px] h-[18px]" /> Back to Home
    </Link>
  );
}

function Logo() {
  return (
    <div className="mb-[16px] animate-fade-scale">
      <img src="/logo.webp" alt="Clip N Copy" className="h-[44px] md:h-[50px] w-auto object-contain" />
      <div className="mt-1 text-[10px] font-bold text-blue-200 tracking-[0.2em]">
        BOOK, STATIONERY & PRINTING
      </div>
    </div>
  );
}

function Heading() {
  return (
    <h1 className="text-[52px] font-black text-white leading-[0.95] mb-[12px] tracking-tight">
      <div className="animate-slide-right" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>Create.</div>
      <div className="text-blue-200 animate-slide-right" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>Edit.</div>
      <div className="animate-slide-right" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>Copy.</div>
    </h1>
  );
}

function Description() {
  return (
    <p className="text-blue-100 text-[18px] max-w-[500px] leading-[1.4] mb-[16px] font-medium stagger-1">
      Your creative workspace starts here. Clip N Copy helps you create, edit, organize, and manage your content with ease.
    </p>
  );
}

function FeatureList() {
  const features = [
    { icon: Zap, title: "FAST CONTENT CREATION", desc: "Streamline your workflow." },
    { icon: Edit3, title: "SMART EDITING TOOLS", desc: "Everything you need to polish your work." },
    { icon: Layers, title: "EASY PROJECT MANAGEMENT", desc: "Organize your projects efficiently." },
    { icon: Cloud, title: "SECURE CLOUD STORAGE", desc: "Keep your data safe and accessible." },
  ];

  return (
    <div className="flex flex-col gap-[10px]">
      {features.map((f, i) => (
        <div key={i} className={`stagger-${i+1}`}>
          <FeatureItem icon={f.icon} title={f.title} desc={f.desc} />
        </div>
      ))}
    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-[16px] px-[16px] py-[8px] rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-sm group cursor-default h-[62px] box-border">
      <div className="w-[48px] h-[48px] bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
        <Icon className="w-[20px] h-[20px] text-[#0647E8] transition-transform duration-300" />
      </div>
      <div className="flex flex-col justify-center">
        <h3 className="text-white font-bold text-[16px] tracking-wide leading-tight">{title}</h3>
        <p className="text-blue-200 text-[14px] mt-0.5 leading-tight">{desc}</p>
      </div>
    </div>
  );
}

function LoginCard({ children }: { children: ReactNode }) {
  return (
    <div 
      className="w-full bg-[#FFFFFF] relative z-20 mx-auto"
      style={{ 
        maxWidth: '540px',
        borderRadius: '30px',
        padding: '44px 40px',
        boxShadow: '0 40px 80px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)'
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
      <div className="flex flex-col items-center text-center">
        {!resetMode && (
          <span 
            className="bg-[#EFF6FF] text-[#0647E8] text-[11px] font-bold px-3 py-1 rounded-full tracking-widest uppercase mb-[16px]"
          >
            WELCOME BACK
          </span>
        )}
        
        <h2 className="text-[28px] md:text-[32px] font-black text-slate-900 mb-[8px] tracking-tight">
          {resetMode ? "Reset Password" : "Sign In"}
        </h2>
        <p className="text-slate-500 text-[14px] mb-[32px]">
          {resetMode 
            ? "Enter your email to receive password reset instructions." 
            : "Sign in to continue creating with Clip N Copy."}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-[20px] rounded-[12px] border border-red-200 bg-red-50 p-3 text-[13px] font-medium text-red-700 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
          {showResend && (
            <Button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="h-[36px] w-full rounded-[8px] bg-red-100 text-red-700 font-bold text-[12px] hover:bg-red-200 shadow-none cursor-pointer"
            >
              {resending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Resending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-3 h-3" /> Resend confirmation email
                </span>
              )}
            </Button>
          )}
        </div>
      )}

      {successMessage && (
        <div className="mb-[20px] flex items-start gap-2 rounded-[12px] border border-blue-200 bg-blue-50 p-3 text-[13px] font-medium text-blue-700">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {!resetMode ? (
        <form onSubmit={handleLogin} className="space-y-[20px]">
          <div className="space-y-[8px]">
            <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
              EMAIL ADDRESS
            </Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 w-[18px] h-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0647E8]" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-[52px] rounded-[14px] pl-[44px] text-[15px] border-slate-200 bg-slate-50/50 focus-visible:ring-[#0647E8] focus-visible:border-[#0647E8] transition-all duration-300 hover:border-slate-300 focus:bg-white focus:shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-[8px]">
            <div className="flex items-center justify-between ml-1">
              <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                PASSWORD
              </Label>
              <button
                type="button"
                onClick={() => {
                  setResetMode(true);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-[12px] font-semibold text-[#0647E8] hover:text-[#062BCB] hover:underline transition-all duration-300 cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 w-[18px] h-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0647E8]" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-[52px] rounded-[14px] pl-[44px] text-[15px] border-slate-200 bg-slate-50/50 focus-visible:ring-[#0647E8] focus-visible:border-[#0647E8] transition-all duration-300 hover:border-slate-300 focus:bg-white focus:shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 ml-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded text-[#0647E8] focus:ring-[#0647E8] w-[16px] h-[16px] border-slate-300 cursor-pointer"
            />
            <Label htmlFor="remember" className="text-[14px] text-slate-600 font-medium cursor-pointer">
              Remember me
            </Label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-[32px] h-[56px] w-full rounded-[14px] border-0 text-white font-bold text-[16px] shadow-[0_8px_20px_-8px_rgba(6,71,232,0.5)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_12px_24px_-8px_rgba(6,71,232,0.6)] hover:brightness-105 active:translate-y-[0px] cursor-pointer bg-[#0647E8]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
          
          <div className="relative mt-[24px] flex items-center justify-center py-[8px]">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative bg-white px-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              OR
            </div>
          </div>

          <div className="mt-[20px] text-center">
            <p className="text-[14px] text-slate-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                search={redirect ? { redirect } : {}}
                className="font-bold text-[#0647E8] hover:text-[#062BCB] hover:underline transition-all duration-300"
              >
                Create an account
              </Link>
            </p>
          </div>
        </form>
      ) : (
        <form onSubmit={handleForgotPassword} className="space-y-[20px]">
          <div className="space-y-[8px]">
            <Label htmlFor="reset-email" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
              EMAIL ADDRESS
            </Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 w-[18px] h-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0647E8]" />
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-[52px] rounded-[14px] pl-[44px] text-[15px] border-slate-200 bg-slate-50/50 focus-visible:ring-[#0647E8] focus-visible:border-[#0647E8] transition-all duration-300 hover:border-slate-300 focus:bg-white focus:shadow-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-[32px] h-[56px] w-full rounded-[14px] border-0 text-white font-bold text-[16px] shadow-[0_8px_20px_-8px_rgba(6,71,232,0.5)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_12px_24px_-8px_rgba(6,71,232,0.6)] hover:brightness-105 active:translate-y-[0px] cursor-pointer bg-[#0647E8]"
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
            className="w-full mt-[20px] text-[14px] font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Back to Login
          </button>
        </form>
      )}
    </>
  );
}

