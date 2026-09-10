import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-store";
import { AlertCircle, CheckCircle2, Loader2, Mail, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/AuthLayout";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await resetPassword(cleanEmail);
      if (error) {
        let msg = error.message || "Failed to send password reset email.";
        if (msg.toLowerCase().includes("failed to fetch")) {
          msg = "Unable to connect to Supabase server. Please check your network connection.";
        }
        setErrorMessage(msg);
      } else {
        setSuccessMessage("Password reset email sent! Check your inbox for the reset link.");
        setEmail("");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        <span className="bg-[#EFF6FF] text-[#0647E8] text-[11px] font-bold px-3 py-1 rounded-full tracking-widest uppercase mb-[12px]">
          PASSWORD RECOVERY
        </span>

        <h2 className="text-[28px] md:text-[32px] font-black text-slate-900 mb-[6px] tracking-tight">
          Forgot Password?
        </h2>
        <p className="text-slate-500 text-[14px] mb-[24px]">
          Enter your registered email address and we'll send you instructions to reset your password.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-[16px] flex items-start gap-2 rounded-[12px] border border-red-200 bg-red-50 p-3 text-[13px] font-medium text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-[16px] flex items-start gap-2 rounded-[12px] border border-blue-200 bg-blue-50 p-3 text-[13px] font-medium text-blue-700">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-[16px]">
        <div className="space-y-[6px]">
          <Label htmlFor="reset-email" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
            REGISTERED EMAIL ADDRESS
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
          disabled={loading || !email.trim()}
          className="h-[48px] w-full rounded-[14px] border-0 text-white font-bold text-[16px] shadow-[0_8px_20px_-8px_rgba(6,71,232,0.5)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_12px_24px_-8px_rgba(6,71,232,0.6)] active:translate-y-[0px] cursor-pointer bg-[#0647E8] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Sending Link...
            </span>
          ) : (
            "Send Reset Link"
          )}
        </Button>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
