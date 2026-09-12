// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
      console.error("[verify-email-otp] Missing Supabase configuration secrets");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error. Please contact support." }),
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
    const rawOtp = body.otp;
    const purpose = (body.purpose || "verification").toString().trim().toLowerCase();

    if (!rawEmail || typeof rawEmail !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Email address is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!rawOtp || typeof rawOtp !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "OTP verification code is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const email = rawEmail.trim().toLowerCase();
    const otp = rawOtp.trim();

    if (!/^\d{6}$/.test(otp)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid verification code." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Find latest active OTP record for email + purpose where used_at IS NULL
    const { data: records, error: fetchError } = await supabase
      .from("email_otps")
      .select("*")
      .eq("email", email)
      .eq("purpose", purpose)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("[verify-email-otp] Database fetch error:", fetchError.message);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to verify OTP. Please try again." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!records || records.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "OTP not found or already used. Please request a new code." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const record = records[0];

    // Check expiry
    if (new Date(record.expires_at).getTime() < Date.now()) {
      return new Response(
        JSON.stringify({ success: false, error: "This code has expired. Please request a new one." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check max attempts
    const maxAttempts = record.max_attempts || 5;
    if (record.attempts >= maxAttempts) {
      return new Response(
        JSON.stringify({ success: false, error: "Too many incorrect attempts. Please request a new code." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Compute hash of submitted OTP
    const submittedHash = await hashOtp(otp);

    // Compare submitted hash against database hash
    if (submittedHash !== record.otp_hash) {
      const newAttempts = (record.attempts || 0) + 1;

      // Update attempts in database
      await supabase
        .from("email_otps")
        .update({ attempts: newAttempts })
        .eq("id", record.id);

      if (newAttempts >= maxAttempts) {
        return new Response(
          JSON.stringify({ success: false, error: "Too many incorrect attempts. Please request a new code." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: "Invalid verification code." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // OTP is valid! Mark as used.
    const nowIso = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("email_otps")
      .update({ used_at: nowIso })
      .eq("id", record.id);

    if (updateError) {
      console.error("[verify-email-otp] Error updating used_at:", updateError.message);
    }

    // Activate / confirm user account in Supabase Auth
    try {
      const { data: userData } = await supabase.auth.admin.getUserByEmail(email);
      if (userData?.user?.id) {
        await supabase.auth.admin.updateUserById(userData.user.id, {
          email_confirm: true,
        });
      }
    } catch (authErr) {
      console.error("[verify-email-otp] Error confirming user in Supabase Auth:", authErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    console.error("[verify-email-otp] Unexpected server error:", err?.message || err);
    return new Response(
      JSON.stringify({ success: false, error: "An unexpected error occurred while verifying OTP." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
