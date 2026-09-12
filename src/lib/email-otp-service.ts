import { supabase } from "./supabase";

export interface SendOtpResult {
  success: boolean;
  message?: string;
  error?: string;
  cooldownSeconds?: number | undefined;
}

export interface VerifyOtpResult {
  success: boolean;
  verified?: boolean;
  error?: string;
}

/**
 * Sends a 6-digit Email OTP to the specified email address via Supabase Edge Function (`send-email-otp`).
 * Never interacts directly with the `email_otps` table from the browser.
 */
export async function sendEmailOtp(
  email: string,
  purpose = "verification"
): Promise<SendOtpResult> {
  if (!email || !email.trim()) {
    return { success: false, error: "Please enter a valid email address." };
  }

  try {
    const { data, error } = await supabase.functions.invoke("send-email-otp", {
      body: { email: email.trim().toLowerCase(), purpose },
    });

    if (error) {
      console.warn("[Email OTP Service] send-email-otp error object:", {
        name: error.name,
        message: error.message,
        status: (error as any).status,
      });
      let errorMessage = "Unable to send verification code. Please try again.";
      let cooldownSeconds: number | undefined;

      try {
        if (error.context) {
          const bodyJson = await error.context.json();
          if (bodyJson?.error) errorMessage = bodyJson.error;
          if (bodyJson?.cooldownSeconds) cooldownSeconds = bodyJson.cooldownSeconds;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } catch {
        if (error.message) errorMessage = error.message;
      }

      const result: SendOtpResult = { success: false, error: errorMessage };
      if (typeof cooldownSeconds === "number") {
        result.cooldownSeconds = cooldownSeconds;
      }
      return result;
    }

    if (data?.error) {
      const result: SendOtpResult = { success: false, error: data.error };
      if (typeof data.cooldownSeconds === "number") {
        result.cooldownSeconds = data.cooldownSeconds;
      }
      return result;
    }

    return {
      success: true,
      message: data?.message || "OTP sent to your email.",
    };
  } catch (err: any) {
    console.error("[Email OTP Service] sendEmailOtp error:", err);
    return {
      success: false,
      error: err?.message || "An unexpected network error occurred while sending OTP.",
    };
  }
}

/**
 * Verifies a 6-digit Email OTP via Supabase Edge Function (`verify-email-otp`).
 * Never interacts directly with the `email_otps` table from the browser.
 */
export async function verifyEmailOtp(
  email: string,
  otp: string,
  purpose = "verification"
): Promise<VerifyOtpResult> {
  if (!email || !email.trim()) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (!otp || !otp.trim() || !/^\d{6}$/.test(otp.trim())) {
    return { success: false, error: "Please enter a valid 6-digit OTP code." };
  }

  try {
    const { data, error } = await supabase.functions.invoke("verify-email-otp", {
      body: { email: email.trim().toLowerCase(), otp: otp.trim(), purpose },
    });

    if (error) {
      console.warn("[Email OTP Service] verify-email-otp response:", error);
      let errorMessage = "Invalid OTP verification code.";

      try {
        if (error.context && typeof error.context.json === "function") {
          const bodyJson = await error.context.json();
          if (bodyJson?.error) errorMessage = bodyJson.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } catch {
        if (error.message) errorMessage = error.message;
      }

      return { success: false, verified: false, error: errorMessage };
    }

    if (data?.error) {
      return { success: false, verified: false, error: data.error };
    }

    return {
      success: true,
      verified: data?.verified ?? true,
    };
  } catch (err: any) {
    console.error("[Email OTP Service] verifyEmailOtp error:", err);
    return {
      success: false,
      verified: false,
      error: err?.message || "An unexpected network error occurred while verifying OTP.",
    };
  }
}
