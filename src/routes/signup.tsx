import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { AlertCircle, CheckCircle2, Loader2, Lock, Mail, User, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/AuthLayout";


export default function SignupPage() {
  const { signUp, user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

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
              onClick={() => navigate(redirectTarget )}
              className="w-full h-[52px] rounded-xl bg-[#0647E8] font-bold text-[16px] text-white hover:bg-[#062BCB] cursor-pointer"
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
      <div className="flex min-h-[100dvh] items-center justify-center p-6 bg-blue-50 font-sans">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#0647E8]/10 text-[#0647E8]">
            <MailCheck className="size-8" />
          </div>
          <h1 className="mt-5 text-[24px] font-black text-slate-900">
            Account created successfully.
          </h1>
          <p className="mt-3 text-[15px] font-medium text-slate-800">
            Please check your email and confirm your email address before signing in.
          </p>
          <p className="mt-2 text-[13px] text-slate-500">
            After confirming your email, return to Clip N Copy and sign in.
          </p>
          <div className="mt-8">
            <Link to={redirect ? `/login?redirect=${redirect}` : "/login"}
              className="inline-flex h-[52px] w-full items-center justify-center rounded-xl bg-[#0647E8] font-bold text-[16px] text-white hover:bg-[#062BCB] cursor-pointer"
            >
              Go to Login
            </Link>
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
          navigate(redirectTarget );
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
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        <h2 className="text-[28px] md:text-[32px] font-black text-slate-900 mb-[6px] tracking-tight">
          Create Account
        </h2>
        <p className="text-slate-500 text-[14px] mb-[24px]">
          Create your Clip N Copy account
        </p>
      </div>

      {errorMessage && (
        <div className="mb-[16px] rounded-[12px] border border-red-200 bg-red-50 p-3 text-[13px] font-medium text-red-700 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-[16px] flex items-start gap-2 rounded-[12px] border border-blue-200 bg-blue-50 p-3 text-[13px] font-medium text-blue-700">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-[12px]">
        <div className="space-y-[6px]">
          <Label htmlFor="full-name" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
            Name
          </Label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 w-[18px] h-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0647E8]" />
            <Input
              id="full-name"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-[48px] rounded-[14px] pl-[44px] text-[15px] border-slate-200 bg-slate-50/50 focus-visible:ring-[#0647E8] focus-visible:border-[#0647E8] transition-all duration-300 hover:border-slate-300 focus:bg-white focus:shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-[6px]">
          <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
            Email
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
              className="h-[48px] rounded-[14px] pl-[44px] text-[15px] border-slate-200 bg-slate-50/50 focus-visible:ring-[#0647E8] focus-visible:border-[#0647E8] transition-all duration-300 hover:border-slate-300 focus:bg-white focus:shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-[6px]">
          <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
            Password
          </Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 w-[18px] h-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0647E8]" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-[48px] rounded-[14px] pl-[44px] text-[15px] border-slate-200 bg-slate-50/50 focus-visible:ring-[#0647E8] focus-visible:border-[#0647E8] transition-all duration-300 hover:border-slate-300 focus:bg-white focus:shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-[6px]">
          <Label htmlFor="confirm-password" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
            Confirm Password
          </Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 w-[18px] h-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0647E8]" />
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-[48px] rounded-[14px] pl-[44px] text-[15px] border-slate-200 bg-slate-50/50 focus-visible:ring-[#0647E8] focus-visible:border-[#0647E8] transition-all duration-300 hover:border-slate-300 focus:bg-white focus:shadow-sm"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-[24px] h-[48px] w-full rounded-[14px] border-0 text-white font-bold text-[16px] shadow-[0_8px_20px_-8px_rgba(6,71,232,0.5)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_12px_24px_-8px_rgba(6,71,232,0.6)] hover:brightness-105 active:translate-y-[0px] cursor-pointer bg-[#0647E8]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </Button>
        
        <div className="mt-[16px] text-center">
          <p className="text-[14px] text-slate-600">
            Already have an account?{" "}
            <Link to={redirect ? `/login?redirect=${redirect}` : "/login"}
              className="font-bold text-[#0647E8] hover:text-[#062BCB] hover:underline transition-all duration-300"
            >
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

