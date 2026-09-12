import React, { useState, useEffect, useRef } from "react";
import { Mail, KeyRound, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { sendEmailOtp, verifyEmailOtp } from "@/lib/email-otp-service";

export interface EmailOtpVerificationProps {
  email?: string;
  purpose?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
}

export const EmailOtpVerification: React.FC<EmailOtpVerificationProps> = ({
  email: initialEmail = "",
  purpose = "verification",
  onSuccess,
  onCancel,
  title = "Email Verification",
  subtitle = "We will send a 6-digit verification code to your email address.",
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">(initialEmail ? "email" : "email");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Handle countdown timer for 60-second cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus OTP input automatically when stepping into OTP entry
  useEffect(() => {
    if (step === "otp" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting another OTP.`);
      return;
    }

    setIsSending(true);
    try {
      const res = await sendEmailOtp(targetEmail, purpose);
      if (!res.success) {
        setError(res.error || "Failed to send verification code.");
        if (res.cooldownSeconds && res.cooldownSeconds > 0) {
          setCooldown(res.cooldownSeconds);
        }
      } else {
        setInfoMessage(res.message || "OTP sent to your email.");
        setStep("otp");
        setCooldown(60);
        setOtp("");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while sending OTP.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanOtp = otp.replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      setError("Please enter a complete 6-digit OTP code.");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await verifyEmailOtp(email.trim().toLowerCase(), cleanOtp, purpose);
      if (!res.success || !res.verified) {
        setError(res.error || "Invalid verification code.");
      } else {
        setIsVerified(true);
        setInfoMessage("Email verified successfully!");
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 800);
        }
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while verifying OTP.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
    setError(null);
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      setOtp(pastedData);
      setError(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg transition-all">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
          {isVerified ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : step === "otp" ? (
            <KeyRound className="w-6 h-6" />
          ) : (
            <Mail className="w-6 h-6" />
          )}
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {infoMessage && !error && (
        <div className="mb-4 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-indigo-500" />
          <span>{infoMessage}</span>
        </div>
      )}

      {isVerified ? (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 text-sm font-semibold mb-4">
            <CheckCircle2 className="w-4 h-4" /> Verification Complete
          </div>
        </div>
      ) : step === "email" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={isSending || !!initialEmail}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm disabled:opacity-75"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSending}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSending || !email.trim() || cooldown > 0}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Code...
                </>
              ) : cooldown > 0 ? (
                `Wait ${cooldown}s`
              ) : (
                "Send OTP Code"
              )}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Enter 6-Digit Code
              </label>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
              >
                Change Email
              </button>
            </div>

            <div className="relative">
              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                onPaste={handleOtpPaste}
                placeholder="000000"
                disabled={isVerifying}
                className="w-full tracking-[0.5em] text-center font-mono text-xl font-bold py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:opacity-50"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 text-center">
              Sent to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="submit"
              disabled={isVerifying || otp.length !== 6}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>Didn't receive code?</span>
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={isSending || isVerifying || cooldown > 0}
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 disabled:opacity-50 disabled:no-underline"
              >
                <RefreshCw className={`w-3 h-3 ${isSending ? "animate-spin" : ""}`} />
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
