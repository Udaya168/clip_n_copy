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
    const requestId = body.requestId || body.id;

    if (!requestId) {
      return new Response(
        JSON.stringify({ error: "Missing requestId in request body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 1. Fetch print_requests record from database
    const { data: requestRecord, error: dbError } = await supabase
      .from("print_requests")
      .select("*")
      .eq("id", requestId)
      .maybeSingle();

    if (dbError || !requestRecord) {
      console.error("[send-print-request-email] Record not found:", dbError?.message || requestId);
      return new Response(
        JSON.stringify({ error: `Print request record not found for id: ${requestId}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // 2. Prevent duplicate email sending
    if (requestRecord.email_sent) {
      console.log(`[send-print-request-email] Email already sent for request ${requestId}`);
      return new Response(
        JSON.stringify({ success: true, duplicate: true, message: "Email already sent for this print request" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // 3. Download attached file from Supabase storage bucket 'print-files'
    let fileAttachment = null;
    if (requestRecord.file_path) {
      try {
        console.log(`[send-print-request-email] Downloading file from storage: ${requestRecord.file_path}`);
        const { data: fileBlob, error: downloadError } = await supabase.storage
          .from("print-files")
          .download(requestRecord.file_path);

        if (!downloadError && fileBlob) {
          const arrayBuffer = await fileBlob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const base64Content = uint8ArrayToBase64(uint8Array);

          fileAttachment = {
            filename: requestRecord.file_name || "print_document",
            content: base64Content,
          };
          console.log(`[send-print-request-email] Successfully downloaded and converted file attachment (${uint8Array.byteLength} bytes)`);
        } else {
          console.warn("[send-print-request-email] Could not download file attachment:", downloadError?.message);
        }
      } catch (fileErr) {
        console.warn("[send-print-request-email] Exception downloading attachment:", fileErr);
      }
    }

    // 4. Build Email Content
    const customerName = requestRecord.customer_name || "Customer";
    const customerEmail = requestRecord.customer_email || "N/A";
    const customerPhone = requestRecord.customer_phone || "N/A";
    const dateStr = requestRecord.created_at
      ? new Date(requestRecord.created_at).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : new Date().toLocaleString("en-IN");

    const subjectTitle = "New Printing Order - Clip N Copy";

    let bwPages = body.bw_pages || body.bwPages;
    let colorPages = body.color_pages || body.colorPages;

    const rawPrintType = requestRecord.print_type || body.print_type || "B&W";

    if (!bwPages && rawPrintType) {
      const match = rawPrintType.match(/B&W:\s*([^,|)]+)/i);
      if (match) bwPages = match[1].trim();
    }
    if (!colorPages && rawPrintType) {
      const match = rawPrintType.match(/Color:\s*([^,|)]+)/i);
      if (match) colorPages = match[1].trim();
    }

    const isBwAndColor = /B&W \+ Color/i.test(rawPrintType) || /Black & White \+ Color/i.test(rawPrintType);
    const isColorOnly = /Color/i.test(rawPrintType) && !isBwAndColor;

    let printTypeAndPagesRows = "";
    if (isBwAndColor) {
      const finalBw = bwPages && bwPages !== "N/A" ? bwPages : "1-20";
      const finalColor = colorPages && colorPages !== "N/A" ? colorPages : "21-40";
      printTypeAndPagesRows = `
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0; width: 40%;">Print Type:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">B&amp;W + Color</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0;">B&amp;W Pages:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${finalBw}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0;">Color Pages:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${finalColor}</td>
          </tr>
      `;
    } else if (isColorOnly) {
      const finalColor = colorPages && colorPages !== "N/A" ? colorPages : "All pages";
      printTypeAndPagesRows = `
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0; width: 40%;">Print Type:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">Color</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0;">Color Pages:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${finalColor}</td>
          </tr>
      `;
    } else {
      const finalBw = bwPages && bwPages !== "N/A" ? bwPages : "All pages";
      printTypeAndPagesRows = `
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0; width: 40%;">Print Type:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">B&amp;W</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0;">B&amp;W Pages:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${finalBw}</td>
          </tr>
      `;
    }

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
      <div style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 10px; text-transform: uppercase;">PRINT REQUEST</div>
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
            <td style="font-weight: 600; color: #64748b; padding: 3px 0; width: 35%;">Name:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 3px 0;">${customerName}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 3px 0;">Phone:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 3px 0;">${customerPhone}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 3px 0;">Email:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 3px 0;">${customerEmail}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 3px 0;">Request ID:</td>
            <td style="font-weight: 700; color: #3b82f6; padding: 3px 0;">${requestRecord.id}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 3px 0;">Submitted Date:</td>
            <td style="font-weight: 600; color: #0f172a; padding: 3px 0;">${dateStr}</td>
          </tr>
        </table>
      </div>

      <!-- PRINT SPECIFICATIONS Card -->
      <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.6;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 8px;">PRINT SPECIFICATIONS</div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0; width: 40%;">File Name:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${requestRecord.file_name}</td>
          </tr>
          ${printTypeAndPagesRows}
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0;">Copies:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${requestRecord.copies}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0;">Paper:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${requestRecord.paper}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 4px 0;">Finishing:</td>
            <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${requestRecord.finishing || "None"}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding: 6px 0; border-top: 1px solid #cbd5e1;">Total Amount:</td>
            <td style="font-weight: 800; color: #2563eb; font-size: 16px; padding: 6px 0; border-top: 1px solid #cbd5e1;">₹${requestRecord.total_amount}</td>
          </tr>
        </table>
      </div>

      ${
        fileAttachment
          ? `<p style="font-size: 13px; color: #16a34a; font-weight: 600; margin: 0 0 16px 0;">📎 The document file <strong>"${requestRecord.file_name}"</strong> is attached to this email.</p>`
          : requestRecord.file_url
          ? `<p style="font-size: 13px; color: #2563eb; font-weight: 600; margin: 0 0 16px 0;">🔗 <a href="${requestRecord.file_url}" target="_blank" style="color: #2563eb;">Click here to download uploaded file</a></p>`
          : ""
      }
    </div>

    <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0 0 4px 0; font-weight: 700; color: #0f172a;">Clip N Copy Store System</p>
      <p style="margin: 0;">Automated Print Request Email</p>
    </div>
  </div>
</body>
</html>
    `;

    // 5. Send email via Resend API
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Clip N Copy <onboarding@resend.dev>";
    const storeTargetEmail = Deno.env.get("STORE_EMAIL") || Deno.env.get("RESEND_TO_EMAIL") || "udayakatika@gmail.com";

    if (!resendApiKey) {
      console.error("[send-print-request-email] Missing RESEND_API_KEY environment variable in Supabase secrets");
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

    console.log(`[send-print-request-email] Sending Resend email to ${recipients.join(", ")} from ${resendFromEmail} with attachment: ${Boolean(fileAttachment)}`);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(`[send-print-request-email] Resend HTTP Status: ${resendResponse.status}`);

    if (!resendResponse.ok) {
      const resendErr = await resendResponse.json().catch(() => ({ message: "Failed to parse Resend error response" }));
      console.error("[send-print-request-email] Resend API Error:", resendErr);
      return new Response(
        JSON.stringify({
          error: "Resend email delivery failed",
          details: resendErr,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: resendResponse.status || 500 }
      );
    }

    // 6. Update email_sent = true in DB
    await supabase
      .from("print_requests")
      .update({ email_sent: true, updated_at: new Date().toISOString() })
      .eq("id", requestId);

    return new Response(
      JSON.stringify({
        success: true,
        email_sent: true,
        requestId: requestId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    console.error("[send-print-request-email] Exception:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
