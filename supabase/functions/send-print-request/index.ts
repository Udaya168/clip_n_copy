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
    const requestId = body.print_request_id || body.requestId || body.id;

    let requestRecord = null;

    if (requestId) {
      const { data, error } = await supabase
        .from("print_requests")
        .select("*")
        .eq("id", requestId)
        .maybeSingle();

      if (!error && data) {
        requestRecord = data;
      }
    }

    // Merge fallback from body parameters
    const customerName = requestRecord?.customer_name || body.customer_name || "Customer";
    const customerEmail = requestRecord?.customer_email || body.customer_email || "N/A";
    const customerPhone = requestRecord?.customer_phone || body.customer_phone || "N/A";
    const fileName = requestRecord?.file_name || body.file_name || "print_document";
    const filePath = requestRecord?.file_path || body.file_path;
    const fileUrl = requestRecord?.file_url || body.file_url;
    const printType = requestRecord?.print_type || body.print_type || "B&W";
    const copies = requestRecord?.copies || body.copies || 1;
    const paper = requestRecord?.paper || body.paper || "A4";
    const finishing = requestRecord?.finishing || body.finishing || "None";
    const totalAmount = requestRecord?.total_amount || body.total_amount || 0;

    // Check duplicate
    if (requestRecord && requestRecord.email_sent) {
      console.log(`[send-print-request] Email already sent for print request ${requestId}`);
      return new Response(
        JSON.stringify({ success: true, duplicate: true, message: "Email already sent for this print request" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Download attached file from Supabase storage bucket 'print-files'
    let fileAttachment = null;
    if (filePath) {
      try {
        console.log(`[send-print-request] Downloading file from storage: ${filePath}`);
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
          console.log(`[send-print-request] Successfully converted storage file attachment (${uint8Array.byteLength} bytes)`);
        } else {
          console.warn("[send-print-request] Download storage error:", downloadError?.message);
        }
      } catch (fileErr) {
        console.warn("[send-print-request] Storage download exception:", fileErr);
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

    const subjectTitle = `New Print Request - ${fileName}`;

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
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">New Print Order Request</p>
      <div style="display: inline-block; background-color: #0647e8; color: #ffffff; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 10px; text-transform: uppercase;">PRINT REQUEST</div>
    </div>
    
    <div style="padding: 28px 24px;">
      <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">
        New print request submitted by ${customerName}:
      </div>

      <!-- Customer Details Card -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.6;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Customer Information</div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 3px 0; width: 35%;">Customer Name:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 3px 0;">${customerName}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 3px 0;">Customer Phone:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 3px 0;">${customerPhone}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 3px 0;">Customer Email:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 3px 0;">${customerEmail}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 3px 0;">Request ID:</td>
            <td style="font-weight: 700; color: #0647e8; padding: 3px 0;">${requestId || "N/A"}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 3px 0;">Request Date/Time:</td>
            <td style="font-weight: 600; color: #0f172a; padding: 3px 0;">${dateStr}</td>
          </tr>
        </table>
      </div>

      <!-- Print Specifications Card -->
      <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.6;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 8px;">Print Specifications</div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0; width: 35%;">File Name:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${fileName}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0;">Print Type:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${printType}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0;">Copies:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${copies}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0;">Paper:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${paper}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0;">Finishing:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${finishing}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 6px 0; border-top: 1px solid #cbd5e1;">Total Amount:</td>
            <td style="font-weight: 800; color: #0647e8; font-size: 16px; padding: 6px 0; border-top: 1px solid #cbd5e1;">₹${totalAmount}</td>
          </tr>
        </table>
      </div>

      ${
        fileAttachment
          ? `<p style="font-size: 13px; color: #16a34a; font-weight: 600; margin: 0 0 16px 0;">📎 Attached file: <strong>"${fileName}"</strong></p>`
          : fileUrl
          ? `<p style="font-size: 13px; color: #0647e8; font-weight: 600; margin: 0 0 16px 0;">🔗 <a href="${fileUrl}" target="_blank" style="color: #0647e8;">Click to view uploaded file</a></p>`
          : ""
      }
    </div>

    <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0 0 4px 0; font-weight: 700; color: #0f172a;">Clip N Copy Store System</p>
      <p style="margin: 0;">Automated Print Request Notification</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email via Resend API
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Clip N Copy <noreply@clipncopy.co.in>";
    const storeTargetEmail = Deno.env.get("STORE_EMAIL") || Deno.env.get("RESEND_TO_EMAIL") || "udayakatika@gmail.com";

    if (!resendApiKey) {
      console.error("[send-print-request] Missing RESEND_API_KEY environment variable");
      return new Response(
        JSON.stringify({ error: "Resend API key is not configured in Supabase secrets" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const payload: Record<string, any> = {
      from: resendFromEmail,
      to: [storeTargetEmail],
      subject: subjectTitle,
      html: emailHtml,
    };

    if (fileAttachment) {
      payload.attachments = [fileAttachment];
    }

    console.log(`[send-print-request] Sending Resend email to ${storeTargetEmail} from ${resendFromEmail}`);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(`[send-print-request] Resend response HTTP status: ${resendResponse.status}`);

    if (!resendResponse.ok) {
      const resendErr = await resendResponse.json().catch(() => ({ message: "Failed to parse Resend error response" }));
      console.error("[send-print-request] Resend error response:", resendErr);
      return new Response(
        JSON.stringify({
          error: "Resend email delivery failed",
          details: resendErr,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: resendResponse.status || 500 }
      );
    }

    // Update email_sent = true in DB if request ID exists
    if (requestId) {
      await supabase
        .from("print_requests")
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
    console.error("[send-print-request] Exception:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
