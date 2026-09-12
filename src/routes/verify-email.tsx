import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2, MailCheck, RefreshCw, KeyRound, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/AuthLayout";
import { sendEmailOtp, verifyEmailOtp } from "@/lib/email-otp-service";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawEmail = searchParams.get("email") || (typeof window !== "undefined" ? sessionStorage.getItem("registration_otp_email") : "") || "";
  const redirect = searchParams.get("redirect");

  const email = rawEmail.trim().toLowerCase();

  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    email ? "A 6-digit verification code has been sent to your email." : null
  );
  const [verified, setVerified] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus OTP input on mount & log mount info
  useEffect(() => {
    console.log("[REGISTER OTP] page mounted");
    if (email) {
      console.log("[REGISTER OTP] email:", email);
    }
    if (otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [email]);

  // 60-second cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage("No email address provided. Please return to the signup page.");
      return;
    }

    const cleanCode = otpCode.replace(/\D/g, "");
    if (cleanCode.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit verification code.");
      return;
    }

    setLoading(true);
    console.log("[REGISTER OTP] verification started");
    try {
      const res = await verifyEmailOtp(email, cleanCode, "verification");
      console.log("[REGISTER OTP] verification result", { success: res.success, verified: res.verified });

      if (!res.success || !res.verified) {
        setErrorMessage(res.error || "Invalid verification code.");
      } else {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("registration_otp_pending");
          sessionStorage.removeItem("registration_otp_email");
        }
        setVerified(true);
        setSuccessMessage("Email verified successfully.");
        setTimeout(() => {
          const targetUrl = redirect ? `/login?confirmed=true&redirect=${encodeURIComponent(redirect)}` : "/login?confirmed=true";
          navigate(targetUrl);
        }, 1200);
      }
    } catch (err: any) {
      console.log("[REGISTER OTP] verification result", { success: false, verified: false, error: err?.message });
      setErrorMessage(err?.message || "An unexpected error occurred while verifying code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage("No email address provided. Please return to the signup page.");
      return;
    }

    if (cooldown > 0) {
      setErrorMessage(`Please wait before requesting another code.`);
      return;
    }

    setResending(true);
    try {
      const res = await sendEmailOtp(email, "verification");
      if (!res.success) {
        setErrorMessage(res.error || "Unable to send verification code. Please try again.");
        if (res.cooldownSeconds && res.cooldownSeconds > 0) {
          setCooldown(res.cooldownSeconds);
        }
      } else {
        setSuccessMessage(res.message || "OTP sent to your email.");
        setCooldown(60);
        setOtpCode("");
        setTimeout(() => otpInputRef.current?.focus(), 100);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Unable to send verification code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const formattedCooldown = cooldown > 0 ? `${cooldown}s` : null;

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#0647E8]/10 text-[#0647E8] mb-4">
          {verified ? (
            <CheckCircle2 className="size-7 text-green-600" />
          ) : (
            <MailCheck className="size-7" />
          )}
        </div>

        <h2 className="text-[26px] md:text-[30px] font-black text-slate-900 mb-[6px] tracking-tight">
          Verify your email
        </h2>
        <p className="text-slate-500 text-[14px] mb-[20px]">
          Enter the 6-digit code sent to your email.
        </p>

        {email && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[13px] font-semibold text-slate-700 mb-[20px]">
            <span>{email}</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mb-[16px] flex items-start gap-2 rounded-[12px] border border-red-200 bg-red-50 p-3 text-[13px] font-medium text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-[16px] flex items-start gap-2 rounded-[12px] border border-blue-200 bg-blue-50 p-3 text-[13px] font-medium text-blue-700">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {verified ? (
        <div className="text-center py-4">
          <p className="text-slate-600 text-sm font-medium mb-4">
            Redirecting to sign in page...
          </p>
          <Link
            to={redirect ? `/login?confirmed=true&redirect=${encodeURIComponent(redirect)}` : "/login?confirmed=true"}
            className="inline-flex h-[48px] w-full items-center justify-center rounded-[14px] bg-[#0647E8] font-bold text-[16px] text-white hover:bg-[#062BCB]"
          >
            Continue to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-[16px]">
          <div className="space-y-[6px]">
            <Label htmlFor="otp" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
              ENTER 6-DIGIT CODE
            </Label>
            <div className="relative group">
              <Input
                id="otp"
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onPaste={(e) => {
                  e.preventDefault();
                  const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                  if (pasted) setOtpCode(pasted);
                }}
                disabled={loading || resending}
                required
                className="h-[52px] tracking-[0.5em] text-center font-mono text-xl font-bold rounded-[14px] border-slate-200 bg-slate-50/50 focus-visible:ring-[#0647E8] focus-visible:border-[#0647E8] transition-all focus:bg-white focus:shadow-sm disabled:opacity-50"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || resending || otpCode.replace(/\D/g, "").length !== 6}
            className="h-[48px] w-full rounded-[14px] border-0 text-white font-bold text-[16px] shadow-[0_8px_20px_-8px_rgba(6,71,232,0.5)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_12px_24px_-8px_rgba(6,71,232,0.6)] active:translate-y-[0px] cursor-pointer bg-[#0647E8] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Verifying...
              </span>
            ) : (
              "Verify Email"
            )}
          </Button>

          <div className="flex items-center justify-between text-[13px] text-slate-500 pt-2 px-1">
            <span>Didn't receive code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={loading || resending || cooldown > 0}
              className="font-bold text-[#0647E8] hover:underline flex items-center gap-1.5 disabled:opacity-50 disabled:no-underline cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
              {cooldown > 0 ? `Resend OTP in ${formattedCooldown}` : "Resend OTP"}
            </button>
          </div>

          <div className="pt-2 text-center border-t border-slate-100">
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to registration
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
