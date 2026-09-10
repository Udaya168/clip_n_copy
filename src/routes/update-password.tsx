import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import { AlertCircle, CheckCircle2, Loader2, Lock, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/AuthLayout";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export default function UpdatePasswordPage() {
  const { updatePassword, signOut } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Detect recovery markers in URL hash or search params
    const hash = window.location.hash;
    const search = window.location.search;
    const isRecoveryUrl =
      hash.includes("type=recovery") ||
      hash.includes("access_token") ||
      search.includes("code=");

    const verifySession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session && (isRecoveryUrl || session.user?.app_metadata?.provider === "email")) {
          setHasValidSession(true);
          setErrorMessage(null);
        } else if (isRecoveryUrl) {
          // URL has tokens, waiting for Supabase JS client to complete exchange
          setHasValidSession(true);
          setErrorMessage(null);
        } else {
          setHasValidSession(false);
          setErrorMessage("Invalid or expired password reset link. Please request a new password reset link.");
        }
      } catch (err) {
        if (isMounted) {
          setHasValidSession(false);
          setErrorMessage("Unable to verify password reset link. Please request a new link.");
        }
      } finally {
        if (isMounted) {
          setCheckingSession(false);
        }
      }
    };

    verifySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;

      if (event === "PASSWORD_RECOVERY") {
        setHasValidSession(true);
        setErrorMessage(null);
        setCheckingSession(false);
      } else if (event === "SIGNED_IN" && session && isRecoveryUrl) {
        setHasValidSession(true);
        setErrorMessage(null);
        setCheckingSession(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please check and try again.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        setErrorMessage(error.message || "Failed to update password. Your reset link may have expired.");
      } else {
        setSuccessMessage("Password updated successfully! Redirecting to login...");
        setTimeout(async () => {
          await signOut();
          navigate("/login?confirmed=true");
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0647E8] mb-3" />
          <p className="text-slate-500 font-medium text-sm">Verifying password reset link...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        <span className="bg-[#EFF6FF] text-[#0647E8] text-[11px] font-bold px-3 py-1 rounded-full tracking-widest uppercase mb-[12px]">
          NEW PASSWORD
        </span>

        <h2 className="text-[28px] md:text-[32px] font-black text-slate-900 mb-[6px] tracking-tight">
          Update Password
        </h2>
        <p className="text-slate-500 text-[14px] mb-[24px]">
          Please enter your new password below to secure your account.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-[16px] rounded-[12px] border border-red-200 bg-red-50 p-3 text-[13px] font-medium text-red-700 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
          {!hasValidSession && (
            <div className="pt-1">
              <Link
                to="/forgot-password"
                className="inline-flex h-[36px] w-full items-center justify-center rounded-[8px] bg-red-100 font-bold text-[12px] text-red-700 hover:bg-red-200 transition-colors"
              >
                Request New Password Reset Link
              </Link>
            </div>
          )}
        </div>
      )}

      {successMessage && (
        <div className="mb-[16px] flex items-start gap-2 rounded-[12px] border border-blue-200 bg-blue-50 p-3 text-[13px] font-medium text-blue-700">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {hasValidSession && !successMessage && (
        <form onSubmit={handleSubmit} className="space-y-[12px]">
          <div className="space-y-[6px]">
            <Label htmlFor="new-password" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
              NEW PASSWORD
            </Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 w-[18px] h-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0647E8]" />
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="h-[48px] rounded-[14px] pl-[44px] text-[15px] border-slate-200 bg-slate-50/50 focus-visible:ring-[#0647E8] focus-visible:border-[#0647E8] transition-all duration-300 hover:border-slate-300 focus:bg-white focus:shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-[6px]">
            <Label htmlFor="confirm-password" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
              CONFIRM NEW PASSWORD
            </Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 w-[18px] h-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0647E8]" />
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="h-[48px] rounded-[14px] pl-[44px] text-[15px] border-slate-200 bg-slate-50/50 focus-visible:ring-[#0647E8] focus-visible:border-[#0647E8] transition-all duration-300 hover:border-slate-300 focus:bg-white focus:shadow-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || newPassword.length < 6 || !confirmPassword}
            className="mt-[20px] h-[48px] w-full rounded-[14px] border-0 text-white font-bold text-[16px] shadow-[0_8px_20px_-8px_rgba(6,71,232,0.5)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_12px_24px_-8px_rgba(6,71,232,0.6)] active:translate-y-[0px] cursor-pointer bg-[#0647E8] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Updating Password...
              </span>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      )}

      <div className="text-center pt-3">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
