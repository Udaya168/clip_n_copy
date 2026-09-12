// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper: Convert Uint8Array to Base64 in Deno
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://ioirvimctrnwipfajopv.supabase.co";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const requestId = body.customization_request_id || body.requestId || body.id;

    let requestRecord = null;

    if (requestId) {
      const { data, error } = await supabase
        .from("customization_requests")
        .select("*")
        .eq("id", requestId)
        .maybeSingle();

      if (!error && data) {
        requestRecord = data;
      }
    }

    const customerName = requestRecord?.customer_name || body.customer_name || "Customer";
    const customerPhone = requestRecord?.customer_phone || body.customer_phone || "N/A";
    const customerEmail = (requestRecord?.customer_email && requestRecord.customer_email !== "N/A")
      ? requestRecord.customer_email
      : (body.customer_email && body.customer_email !== "N/A")
      ? body.customer_email
      : (requestRecord?.customer_email || body.customer_email || "N/A");
    const fileName = requestRecord?.file_name || body.file_name || "preference_file";
    const filePath = requestRecord?.file_path || body.file_path;
    const fileUrl = requestRecord?.file_url || body.file_url;
    const customizationType = requestRecord?.customization_type || body.customization_type || "Customization";
    const title = requestRecord?.title || body.title || "N/A";
    const quantity = requestRecord?.quantity || body.quantity || 1;

    // Download attached preference file from storage
    let fileAttachment = null;
    if (filePath) {
      try {
        console.log(`[send-customization-request] Downloading file: ${filePath}`);
        const { data: fileBlob, error: downloadError } = await supabase.storage
          .from("print-files")
          .download(filePath);

        if (!downloadError && fileBlob) {
          const arrayBuffer = await fileBlob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const base64Content = uint8ArrayToBase64(uint8Array);

          fileAttachment = {
            filename: fileName,
            content: base64Content,
          };
        }
      } catch (fileErr) {
        console.warn("[send-customization-request] Storage download exception:", fileErr);
      }
    }

    const dateStr = requestRecord?.created_at
      ? new Date(requestRecord.created_at).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : new Date().toLocaleString("en-IN");

    const subjectTitle = `New Customization Printing Request (${customizationType}) - Clip N Copy`;

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subjectTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
    <div style="background-color: #0f172a; padding: 28px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">Clip N Copy</h1>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">NEW CUSTOMIZATION PRINTING REQUEST</p>
      <div style="display: inline-block; background-color: #8b5cf6; color: #ffffff; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 10px; text-transform: uppercase;">CUSTOMIZATION REQUEST</div>
    </div>
    
    <div style="padding: 28px 24px;">
      <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">
        A new customization request has been received:
      </div>

      <!-- Customer Information Card -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.6;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">CUSTOMER INFORMATION</div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 3px 0; width: 40%;">Customer Name:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 3px 0;">${customerName}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 3px 0;">Customer Email:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 3px 0;">${customerEmail}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 3px 0;">Customer Phone:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 3px 0;">${customerPhone}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 3px 0;">Request ID:</td>
            <td style="font-weight: 700; color: #8b5cf6; padding: 3px 0;">${requestId || "N/A"}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 3px 0;">Date / Time:</td>
            <td style="font-weight: 600; color: #0f172a; padding: 3px 0;">${dateStr}</td>
          </tr>
        </table>
      </div>

      <!-- CUSTOMIZATION DETAILS Card -->
      <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.6;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6d28d9; margin-bottom: 8px;">CUSTOMIZATION DETAILS</div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0; width: 40%;">Type of Customization:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${customizationType}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0;">Title / Text:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${title}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0;">Quantity:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${quantity}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0;">Contact Number:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${customerPhone}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0;">Uploaded Preference:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${fileName}</td>
          </tr>
        </table>
      </div>

      ${
        fileAttachment
          ? `<p style="font-size: 13px; color: #16a34a; font-weight: 600; margin: 0 0 16px 0;">📎 Attached preference file: <strong>"${fileName}"</strong></p>`
          : fileUrl
          ? `<p style="font-size: 13px; color: #8b5cf6; font-weight: 600; margin: 0 0 16px 0;">🔗 <a href="${fileUrl}" target="_blank" style="color: #8b5cf6;">Click to view uploaded preference file</a></p>`
          : ""
      }
    </div>

    <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0 0 4px 0; font-weight: 700; color: #0f172a;">Clip N Copy Store System</p>
      <p style="margin: 0;">Automated Customization Request Notification</p>
    </div>
  </div>
</body>
</html>
    `;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Clip N Copy <noreply@clipncopy.co.in>";
    const storeTargetEmail = Deno.env.get("STORE_EMAIL") || Deno.env.get("RESEND_TO_EMAIL") || "udayakatika@gmail.com";

    if (!resendApiKey) {
      console.error("[send-customization-request] Missing RESEND_API_KEY");
      return new Response(
        JSON.stringify({ error: "Resend API key is not configured in Supabase secrets" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const recipients = [storeTargetEmail];
    if (customerEmail && customerEmail !== "N/A" && customerEmail.includes("@") && !recipients.includes(customerEmail)) {
      recipients.push(customerEmail);
    }

    const payload: Record<string, any> = {
      from: resendFromEmail,
      to: recipients,
      subject: subjectTitle,
      html: emailHtml,
    };

    if (fileAttachment) {
      payload.attachments = [fileAttachment];
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!resendResponse.ok) {
      const resendErr = await resendResponse.json().catch(() => ({ message: "Failed to parse Resend error response" }));
      return new Response(
        JSON.stringify({
          error: "Resend email delivery failed",
          details: resendErr,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: resendResponse.status || 500 }
      );
    }

    if (requestId) {
      await supabase
        .from("customization_requests")
        .update({
          email_sent: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        email_sent: true,
        requestId: requestId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    console.error("[send-customization-request] Exception:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
