// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Generate cryptographically secure 6-digit OTP using Web Crypto
function generateSecureOtp(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const otpNum = 100000 + (array[0] % 900000);
  return otpNum.toString();
}

// Compute SHA-256 hash of plaintext OTP
async function hashOtp(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[OTP] Missing Supabase configuration secrets");
      return new Response(
        JSON.stringify({ success: false, error: "Unable to send verification code. Missing server configuration." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON request body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const rawEmail = body.email;
    const purpose = (body.purpose || "verification").toString().trim().toLowerCase();

    if (!rawEmail || typeof rawEmail !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Email address is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const email = rawEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("[OTP] Request received for:", email, "purpose:", purpose);
    console.log("[OTP] Email validated");

    // 1. Resend Cooldown Check (60 seconds)
    const { data: recentOtps, error: checkError } = await supabase
      .from("email_otps")
      .select("last_sent_at, created_at")
      .eq("email", email)
      .eq("purpose", purpose)
      .order("created_at", { ascending: false })
      .limit(1);

    if (checkError) {
      console.error("[OTP] Database lookup error:", checkError.message);
    }

    if (recentOtps && recentOtps.length > 0) {
      const lastSentTime = new Date(recentOtps[0].last_sent_at || recentOtps[0].created_at).getTime();
      const elapsedSeconds = Math.floor((Date.now() - lastSentTime) / 1000);
      if (elapsedSeconds < 60) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Please wait before requesting another code.",
            cooldownSeconds: 60 - elapsedSeconds,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
        );
      }
    }

    // 2. Invalidate previous active unused OTPs for same email + purpose
    const nowIso = new Date().toISOString();
    const { error: invalidateError } = await supabase
      .from("email_otps")
      .update({ expires_at: nowIso })
      .eq("email", email)
      .eq("purpose", purpose)
      .is("used_at", null)
      .gt("expires_at", nowIso);

    if (invalidateError) {
      console.warn("[OTP] Warning invalidating previous OTPs:", invalidateError.message);
    }
    console.log("[OTP] Previous OTP invalidated");

    // 3. Generate secure OTP & hash
    const otp = generateSecureOtp();
    const otpHash = await hashOtp(otp);
    console.log("[OTP] OTP generated");

    // 10 minutes expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 4. Insert OTP record into email_otps table
    const { data: insertedRecord, error: insertError } = await supabase
      .from("email_otps")
      .insert({
        email,
        otp_hash: otpHash,
        purpose,
        expires_at: expiresAt,
        attempts: 0,
        max_attempts: 5,
        last_sent_at: nowIso,
        used_at: null,
      })
      .select("id")
      .single();

    if (insertError || !insertedRecord) {
      console.error("[OTP] Failed to insert OTP record:", insertError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "Unable to send verification code. Database error." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    console.log("[OTP] OTP database record created:", insertedRecord.id);

    // 5. Send Email via Resend API
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Clip N Copy <onboarding@resend.dev>";

    if (!resendApiKey) {
      console.error("[OTP] RESEND_API_KEY missing in secrets");
      // Clean up inserted record so client is not misled
      await supabase.from("email_otps").delete().eq("id", insertedRecord.id);
      return new Response(
        JSON.stringify({ success: false, error: "Unable to send verification code. RESEND_API_KEY not set." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("[OTP] Sending email through Resend from:", resendFromEmail);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333333; }
            .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e1e8ed; }
            .header { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 24px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
            .content { padding: 32px 24px; text-align: center; }
            .otp-box { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; background: #f0f4ff; border: 2px dashed #a5b4fc; padding: 16px; margin: 24px 0; border-radius: 8px; display: inline-block; }
            .info { font-size: 14px; color: #6b7280; line-height: 1.5; margin-bottom: 20px; }
            .footer { font-size: 12px; color: #9ca3af; padding: 16px 24px; text-align: center; border-top: 1px solid #f3f4f6; background: #fafafa; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Clip N Copy</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-top: 0;">Your verification code is:</p>
              <div class="otp-box">${otp}</div>
              <p class="info">This code will expire in <strong>10 minutes</strong>.</p>
              <p class="info">For your security, do not share this code with anyone.</p>
            </div>
            <div class="footer">
              If you did not request this code, you can safely ignore this email.<br>&copy; Clip N Copy. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: [email],
        subject: "Your Clip N Copy verification code",
        html: emailHtml,
      }),
    });

    let resendJson: any = {};
    try {
      resendJson = await resendRes.json();
    } catch {
      // ignore
    }

    console.log("[OTP] Resend response status:", resendRes.status, resendJson);

    if (!resendRes.ok) {
      console.error("[OTP] Resend send error details:", resendRes.status, resendJson);

      // Clean up inserted record so client knows email failed
      await supabase.from("email_otps").delete().eq("id", insertedRecord.id);

      const errorMessage = resendJson?.message || resendJson?.name || "Unable to send verification code. Please try again.";
      return new Response(
        JSON.stringify({ success: false, error: errorMessage, details: resendJson }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: resendRes.status || 400 }
      );
    }

    console.log("[OTP] Email send successful");

    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP sent to your email.",
        resendId: resendJson?.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    console.error("[OTP] Unexpected server error:", err?.message || err);
    return new Response(
      JSON.stringify({ success: false, error: "Unable to send verification code. Internal error." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
