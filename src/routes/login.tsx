import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import { AlertCircle, CheckCircle2, Loader2, Lock, Mail, ArrowLeft, Send, Zap, Edit3, Layers, Cloud, Smartphone, RefreshCw, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";


export default function LoginPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const confirmed = searchParams.get('confirmed');

  const redirectTarget = redirect || "/";

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (confirmed === "true") {
      setSuccessMessage("Email confirmed successfully. Please sign in.");
    }
  }, [confirmed]);

  if (user) {
    const rawName = profile?.full_name || (user.user_metadata?.["full_name"] as string);
    const userDisplayName = rawName ? rawName.split(" ")[0] : (user.email ? user.email.split("@")[0] : "");
    const welcomeText = rawName ? `Welcome back,\n${rawName}` : (userDisplayName ? `Welcome back,\n${userDisplayName}` : "Welcome back");
    
    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-6 bg-slate-50/50 font-sans">
        <div className="w-full max-w-md rounded-[24px] border border-slate-200 bg-white p-8 sm:p-10 text-center shadow-[0_8px_30px_-4px_rgba(6,71,232,0.08)]">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#0647E8]/10 text-[#0647E8] mb-6">
            <CheckCircle2 className="size-8" />
          </div>
          <h1 className="text-[28px] font-black text-slate-900 leading-tight whitespace-pre-line tracking-tight">
            {welcomeText}
          </h1>
          <p className="mt-3 text-[15px] font-medium text-slate-500">
            You’re signed in and ready to shop.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Button
              onClick={() => navigate(redirectTarget)}
              className="w-full h-[52px] rounded-[14px] bg-[#0647E8] font-bold text-[16px] text-white shadow-[0_8px_20px_-8px_rgba(6,71,232,0.5)] hover:-translate-y-[2px] hover:shadow-[0_12px_24px_-8px_rgba(6,71,232,0.6)] hover:bg-[#062BCB] transition-all duration-300 cursor-pointer"
            >
              Continue {redirectTarget === "/checkout" ? "to Checkout" : "Shopping"}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/account")}
              className="w-full h-[52px] rounded-[14px] border-slate-200 font-bold text-[16px] text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              View My Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <SignInPage initialSuccessMessage={successMessage} />;
}

import { AuthLayout } from "@/components/AuthLayout";

// ----------------------------------------------------------------------
// COMPONENT STRUCTURE
// ----------------------------------------------------------------------

function SignInPage({ initialSuccessMessage }: { initialSuccessMessage: string | null }) {
  return (
    <AuthLayout>
      <LoginForm initialSuccessMessage={initialSuccessMessage} />
    </AuthLayout>
  );
}

function LoginForm({ initialSuccessMessage }: { initialSuccessMessage: string | null }) {
  const { signIn, signInWithPhoneOtp, verifyPhoneOtp, signInWithGoogle, resetPassword, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const redirectTarget = redirect || "/";

  const [authMethod, setAuthMethod] = useState<"mobile" | "email">("mobile");

  // Email state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Mobile state
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(initialSuccessMessage);
  const [showResend, setShowResend] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  useEffect(() => {
    let timer: any = null;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogle(redirectTarget);
      if (res.error) {
        setErrorMessage(res.error.message || "Failed to sign in with Google.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in with Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    const fullPhone = `${countryCode}${cleanPhone}`;
    setLoading(true);

    try {
      const res = await signInWithPhoneOtp(fullPhone);
      if (res.error) {
        let msg = res.error.message || "Failed to send OTP.";
        if (
          msg.toLowerCase().includes("unsupported") ||
          msg.toLowerCase().includes("disabled") ||
          msg.toLowerCase().includes("not enabled")
        ) {
          msg = "Phone OTP authentication is not enabled in your Supabase Auth settings. Please enable the Phone provider in Supabase Dashboard -> Authentication -> Providers -> Phone.";
        }
        setErrorMessage(msg);
      } else {
        setOtpSent(true);
        setCooldown(60);
        setSuccessMessage(`OTP sent successfully to ${fullPhone}.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setErrorMessage("Please enter the 6-digit OTP code.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const fullPhone = `${countryCode}${cleanPhone}`;
    setLoading(true);

    try {
      const res = await verifyPhoneOtp(fullPhone, cleanOtp);
      if (res.error) {
        setErrorMessage(res.error.message || "Invalid or expired OTP code.");
      } else {
        setSuccessMessage("OTP verified! Redirecting...");
        let target = redirectTarget === "/admin" ? "/" : redirectTarget;
        if (res.user?.id) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", res.user.id)
            .maybeSingle();
          if (prof?.role === "admin") {
            target = "/admin";
          }
        }
        setTimeout(() => {
          navigate(target);
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    const cleanPhone = phone.replace(/\D/g, "");
    const fullPhone = `${countryCode}${cleanPhone}`;

    setResending(true);
    try {
      const res = await signInWithPhoneOtp(fullPhone);
      if (res.error) {
        setErrorMessage(res.error.message || "Failed to resend OTP.");
      } else {
        setCooldown(60);
        setSuccessMessage(`New OTP sent to ${fullPhone}.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

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
          navigate(target);
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
          <span className="bg-[#EFF6FF] text-[#0647E8] text-[11px] font-bold px-3 py-1 rounded-full tracking-widest uppercase mb-[12px]">
            WELCOME BACK
          </span>
        )}

        <h2 className="text-[28px] md:text-[32px] font-black text-slate-900 mb-[6px] tracking-tight">
          {resetMode ? "Reset Password" : "Sign In"}
        </h2>
        <p className="text-slate-500 text-[14px] mb-[24px]">
          {resetMode
            ? "Enter your email to receive password reset instructions."
            : "Sign in to continue creating with Clip N Copy."}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-[16px] rounded-[12px] border border-red-200 bg-red-50 p-3 text-[13px] font-medium text-red-700 space-y-2">
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
        <div className="mb-[16px] flex items-start gap-2 rounded-[12px] border border-blue-200 bg-blue-50 p-3 text-[13px] font-medium text-blue-700">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {!resetMode ? (
        <div className="space-y-[16px]">
          {/* Google Sign In Button */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="h-[48px] w-full rounded-[14px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[15px] shadow-sm flex items-center justify-center gap-3 transition-all cursor-pointer"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#0647E8]" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              OR
            </div>
          </div>

          {/* Auth Method Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("mobile");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-[13px] font-bold rounded-lg transition-all cursor-pointer ${
                authMethod === "mobile"
                  ? "bg-white text-[#0647E8] shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              📱 Mobile Number
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod("email");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-[13px] font-bold rounded-lg transition-all cursor-pointer ${
                authMethod === "email"
                  ? "bg-white text-[#0647E8] shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              ✉️ Email & Password
            </button>
          </div>

          {/* MOBILE OTP FORM */}
          {authMethod === "mobile" ? (
            !otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-[12px] pt-1">
                <div className="space-y-[6px]">
                  <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                    MOBILE NUMBER
                  </Label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="h-[48px] rounded-[14px] border border-slate-200 bg-slate-50/50 px-3 text-[14px] font-bold text-slate-700 focus:outline-none focus:border-[#0647E8] focus:bg-white cursor-pointer shrink-0"
                    >
                      <option value="+91">🇮🇳 +91</option>
                    </select>
                    <div className="relative flex-1 group">
                      <Phone className="absolute left-4 top-1/2 w-[18px] h-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0647E8]" />
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        maxLength={10}
                        required
                        className="h-[48px] rounded-[14px] pl-[44px] text-[15px] font-mono border-slate-200 bg-slate-50/50 focus-visible:ring-[#0647E8] focus-visible:border-[#0647E8] transition-all duration-300 hover:border-slate-300 focus:bg-white focus:shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || phone.replace(/\D/g, "").length !== 10}
                  className="mt-[16px] h-[48px] w-full rounded-[14px] border-0 text-white font-bold text-[16px] shadow-[0_8px_20px_-8px_rgba(6,71,232,0.5)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_12px_24px_-8px_rgba(6,71,232,0.6)] active:translate-y-[0px] cursor-pointer bg-[#0647E8] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Sending OTP...
                    </span>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-[14px] pt-1">
                <div className="flex items-center justify-between bg-blue-50/80 border border-blue-100 rounded-xl p-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">OTP sent to </span>
                    <span className="font-bold text-slate-900">{countryCode} {phone}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                      setErrorMessage(null);
                    }}
                    className="text-[#0647E8] font-bold hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-[6px]">
                  <Label htmlFor="otp" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                    ENTER 6-DIGIT OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                    className="h-[48px] rounded-[14px] text-center font-mono text-[20px] font-extrabold tracking-[0.3em] border-slate-200 bg-slate-50/50 focus-visible:ring-[#0647E8] focus-visible:border-[#0647E8] transition-all focus:bg-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.trim().length !== 6}
                  className="h-[48px] w-full rounded-[14px] border-0 text-white font-bold text-[16px] shadow-[0_8px_20px_-8px_rgba(6,71,232,0.5)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_12px_24px_-8px_rgba(6,71,232,0.6)] active:translate-y-[0px] cursor-pointer bg-[#0647E8] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Verifying OTP...
                    </span>
                  ) : (
                    "Verify OTP & Sign In"
                  )}
                </Button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500 font-medium">Didn't receive OTP?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={cooldown > 0 || resending}
                    className="font-bold text-[#0647E8] hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" /> Sending...
                      </>
                    ) : cooldown > 0 ? (
                      `Resend OTP in ${cooldown}s`
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" /> Resend OTP
                      </>
                    )}
                  </button>
                </div>
              </form>
            )
          ) : (
            /* EMAIL & PASSWORD FORM */
            <form onSubmit={handleLogin} className="space-y-[12px] pt-1">
              <div className="space-y-[6px]">
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
                    className="h-[48px] rounded-[14px] pl-[44px] text-[15px] border-slate-200 bg-slate-50/50 focus-visible:ring-[#0647E8] focus-visible:border-[#0647E8] transition-all duration-300 hover:border-slate-300 focus:bg-white focus:shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-[6px]">
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
                    className="h-[48px] rounded-[14px] pl-[44px] text-[15px] border-slate-200 bg-slate-50/50 focus-visible:ring-[#0647E8] focus-visible:border-[#0647E8] transition-all duration-300 hover:border-slate-300 focus:bg-white focus:shadow-sm"
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
                className="mt-[20px] h-[48px] w-full rounded-[14px] border-0 text-white font-bold text-[16px] shadow-[0_8px_20px_-8px_rgba(6,71,232,0.5)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_12px_24px_-8px_rgba(6,71,232,0.6)] active:translate-y-[0px] cursor-pointer bg-[#0647E8]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          )}

          <div className="mt-[16px] text-center pt-1">
            <p className="text-[14px] text-slate-600">
              Don't have an account?{" "}
              <Link
                to={redirect ? `/signup?redirect=${redirect}` : "/signup"}
                className="font-bold text-[#0647E8] hover:text-[#062BCB] hover:underline transition-all duration-300"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleForgotPassword} className="space-y-[12px]">
          <div className="space-y-[6px]">
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
            className="w-full mt-[16px] text-[14px] font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Back to Login
          </button>
        </form>
      )}
    </>
  );
}

