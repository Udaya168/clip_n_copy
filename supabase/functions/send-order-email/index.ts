// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Authenticate user from Bearer Token (never trust frontend-supplied email)
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (!authHeader) {
      console.warn("[send-order-email] Auth failed: Missing Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Missing Authorization header in request" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      console.warn("[send-order-email] Auth failed: Empty token string");
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Empty Bearer token in Authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("[send-order-email] Auth verification error:", authError?.message || "No user found for token");
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: `Authentication failed: ${authError?.message || "Invalid or expired session token"}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const recipientEmail = user.email || user.user_metadata?.email;
    if (!recipientEmail) {
      console.error("[send-order-email] User missing email address:", user.id);
      return new Response(
        JSON.stringify({
          error: "Forbidden",
          message: "Authenticated user does not have a verified email address associated with their account",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    console.log(`[send-order-email] Authenticated user: ${user.id} (${recipientEmail})`);

    // 2. Read request body
    const body = await req.json();
    const rawId = body.orderId || body.id;
    const rawOrderNumber = body.orderNumber;

    if (!rawId && !rawOrderNumber) {
      return new Response(
        JSON.stringify({ error: "Order ID or Order Number is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const isUuid = (val: any): boolean =>
      typeof val === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());

    let order = null;

    // Method 1: If rawId is a valid UUID, search by id
    if (rawId && isUuid(rawId)) {
      console.log(`[send-order-email] Attempting lookup by UUID (orders.id): ${rawId}`);
      const { data, error } = await supabase.from("orders").select("*").eq("id", rawId.trim());
      if (!error && data && data.length > 0) {
        order = data[0];
        console.log(`[send-order-email] Order found by UUID (orders.id)`);
      }
    }

    // Method 2: If no order yet and rawId is present, try matching against order_number
    if (!order && rawId) {
      console.log(`[send-order-email] Attempting lookup by order_number (rawId): ${rawId}`);
      const { data, error } = await supabase.from("orders").select("*").eq("order_number", String(rawId).trim());
      if (!error && data && data.length > 0) {
        order = data[0];
        console.log(`[send-order-email] Order found by order_number (rawId)`);
      }
    }

    // Method 3: If no order yet and rawOrderNumber is present, try matching against order_number
    if (!order && rawOrderNumber) {
      console.log(`[send-order-email] Attempting lookup by order_number (rawOrderNumber): ${rawOrderNumber}`);
      const { data, error } = await supabase.from("orders").select("*").eq("order_number", String(rawOrderNumber).trim());
      if (!error && data && data.length > 0) {
        order = data[0];
        console.log(`[send-order-email] Order found by order_number (rawOrderNumber)`);
      }
    }

    if (!order) {
      console.log(`[send-order-email] Order not found for rawId: "${rawId}", rawOrderNumber: "${rawOrderNumber}"`);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // 4. Action & Recipient Email Resolution
    const action = String(body.action || body.type || "confirmation").toLowerCase();
    const rejectionReason = String(body.rejectionReason || body.reason || order.rejection_reason || "Store unable to fulfill order").trim();

    // Priority 1: Customer email stored on order record in database
    // Priority 2: Email of auth user linked via user_id
    // Priority 3: Email of authenticated user calling the endpoint
    let targetCustomerEmail = order.customer_email || order.customerEmail;
    if (!targetCustomerEmail && order.user_id) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
        if (userData?.user?.email) {
          targetCustomerEmail = userData.user.email;
        }
      } catch (_e) {
        // ignore
      }
    }
    if (!targetCustomerEmail) {
      targetCustomerEmail = recipientEmail;
    }

    // 5. Duplicate Check: Ensure email type is sent ONCE per order
    if (action === "accepted" && order.accepted_email_sent_at) {
      return new Response(
        JSON.stringify({
          success: true,
          duplicate: true,
          message: `Acceptance email already sent for order ${order.order_number}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    if (action === "rejected" && order.rejected_email_sent_at) {
      return new Response(
        JSON.stringify({
          success: true,
          duplicate: true,
          message: `Rejection email already sent for order ${order.order_number}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    if (action === "confirmation" && order.confirmation_email_sent_at) {
      return new Response(
        JSON.stringify({
          success: true,
          duplicate: true,
          message: `Confirmation email already sent for order ${order.order_number}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // 6. Fetch order items
    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    const orderItems = items && items.length > 0 ? items : [];

    // Calculate item list HTML rows
    const itemRowsHtml = orderItems
      .map((item) => {
        const qty = item.quantity || 1;
        const price = Number(item.price || 0);
        const subtotal = qty * price;
        const variantText = item.variant ? `<br><small style="color: #64748b;">Variant: ${item.variant}</small>` : "";
        return `
          <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px;">
              <strong>${item.product_name || "Stationery Product"}</strong>${variantText}
            </td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: center;">${qty}</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: right;">₹${price}</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: right; font-weight: 700;">₹${subtotal}</td>
          </tr>
        `;
      })
      .join("");

    const orderDateStr = order.created_at
      ? new Date(order.created_at).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : new Date().toLocaleDateString("en-IN");

    const totalAmountNum = Number(order.total_amount || 0);
    const subtotalCalculated = orderItems.reduce((acc, i) => acc + Number(i.price || 0) * (i.quantity || 1), 0);
    const shippingFee = totalAmountNum > subtotalCalculated && subtotalCalculated > 0
      ? `₹${totalAmountNum - subtotalCalculated}`
      : "FREE";

    // 7. Build Professional HTML Email Body based on Action
    let subjectTitle = `Order Confirmation - Clip N Copy #${order.order_number}`;
    let badgeText = "ORDER CONFIRMED";
    let badgeColor = "#0647e8";
    let introGreeting = `Hi ${order.customer_name || "Valued Customer"},`;
    let introParagraph = `Thank you for shopping with <strong>Clip N Copy</strong>! Your order <strong>#${order.order_number}</strong> has been successfully placed and is now being processed by our store.`;
    let extraBannerHtml = "";

    if (action === "accepted") {
      subjectTitle = `Order Accepted! - Clip N Copy #${order.order_number}`;
      badgeText = "ORDER ACCEPTED";
      badgeColor = "#16a34a";
      introParagraph = `Great news! Your order <strong>#${order.order_number}</strong> has been <strong>ACCEPTED</strong> by Clip N Copy store. Our team is now preparing your items for delivery / pickup.`;
    } else if (action === "rejected") {
      subjectTitle = `Order Update - Clip N Copy #${order.order_number}`;
      badgeText = "ORDER CANCELLED / REJECTED";
      badgeColor = "#dc2626";
      introParagraph = `We regret to inform you that your order <strong>#${order.order_number}</strong> could not be accepted at this time.`;
      extraBannerHtml = `
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #991b1b; line-height: 1.5;">
          <strong style="color: #7f1d1d; display: block; margin-bottom: 4px; font-size: 14px;">Reason for Rejection:</strong>
          ${rejectionReason}
        </div>
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
    <div style="background-color: #0f172a; padding: 32px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Clip N Copy</h1>
      <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 14px;">Total solutions in stationery & xerox</p>
      <div style="display: inline-block; background-color: ${badgeColor}; color: #ffffff; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${badgeText}</div>
    </div>
    
    <div style="padding: 32px 24px;">
      <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">${introGreeting}</div>
      <p style="font-size: 14px; color: #475569; margin-top: 0; margin-bottom: 20px; line-height: 1.5;">
        ${introParagraph}
      </p>

      ${extraBannerHtml}

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px; line-height: 1.6;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="font-weight: 600; color: #64748b; padding-bottom: 6px; width: 40%;">Order Number:</td>
            <td style="font-weight: 700; color: #0647e8; padding-bottom: 6px;">#${order.order_number}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding-bottom: 6px;">Order Date:</td>
            <td style="font-weight: 600; color: #0f172a; padding-bottom: 6px;">${orderDateStr}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding-bottom: 6px;">Payment Method:</td>
            <td style="font-weight: 600; color: #0f172a; padding-bottom: 6px;">${order.payment_method || "UPI / Online"}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b; padding-bottom: 6px;">Delivery Address:</td>
            <td style="font-weight: 600; color: #0f172a; padding-bottom: 6px;">${order.address || "Store Pickup"}</td>
          </tr>
        </table>
      </div>

      <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 12px;">Ordered Items</div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; padding: 10px 8px;">Item</th>
            <th style="text-align: center; font-size: 11px; text-transform: uppercase; color: #64748b; padding: 10px 8px;">Qty</th>
            <th style="text-align: right; font-size: 11px; text-transform: uppercase; color: #64748b; padding: 10px 8px;">Price</th>
            <th style="text-align: right; font-size: 11px; text-transform: uppercase; color: #64748b; padding: 10px 8px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemRowsHtml || `<tr><td colspan="4" style="padding: 12px 8px; text-align: center; color: #64748b;">Clip N Copy Stationery Order</td></tr>`}
        </tbody>
      </table>

      <table style="width: 100%; margin-top: 16px; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: #64748b;">Subtotal</td>
          <td style="padding: 4px 0; font-size: 13px; text-align: right; font-weight: 600; color: #0f172a;">₹${subtotalCalculated || totalAmountNum}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: #64748b;">Delivery / Shipping</td>
          <td style="padding: 4px 0; font-size: 13px; text-align: right; font-weight: 600; color: #0f172a;">${shippingFee}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0 4px 0; border-top: 2px solid #e2e8f0; font-size: 16px; font-weight: 800; color: #0f172a;">Final Total</td>
          <td style="padding: 12px 0 4px 0; border-top: 2px solid #e2e8f0; font-size: 18px; font-weight: 800; text-align: right; color: #0647e8;">₹${totalAmountNum}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f1f5f9; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0 0 6px 0; font-weight: 700; color: #0f172a;">Clip N Copy Stationery & Xerox</p>
      <p style="margin: 0 0 6px 0;">Shop No. 171, 3rd Main, ITPL Main Rd, Kundalahalli Colony, Bengaluru, Karnataka 560037</p>
      <p style="margin: 0;">Contact Us: <a href="mailto:clipncopy1@gmail.com" style="color: #0647e8; text-decoration: none; font-weight: 600;">clipncopy1@gmail.com</a> · 099860 55335</p>
    </div>
  </div>
</body>
</html>
    `;

    // 8. Send email via Resend API (or SendGrid API) if configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Clip N Copy <onboarding@resend.dev>";
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");

    if (resendApiKey) {
      console.log(`[send-order-email] Sending [${action}] email via Resend API to ${targetCustomerEmail} from ${resendFromEmail}`);
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFromEmail,
          to: [targetCustomerEmail],
          subject: subjectTitle,
          html: emailHtml,
        }),
      });

      console.log(`[send-order-email] Resend API HTTP status: ${resendRes.status}`);

      if (!resendRes.ok) {
        const errorDetails = await resendRes.json().catch(() => ({ message: "Failed to parse Resend error body" }));
        console.error("[send-order-email] Resend API error response:", errorDetails);
        return new Response(
          JSON.stringify({
            error: "Failed to send email via Resend",
            details: errorDetails,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: resendRes.status || 500 }
        );
      }
    } else if (sendgridApiKey) {
      console.log(`[send-order-email] Sending [${action}] email via SendGrid API to ${targetCustomerEmail}`);
      const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: targetCustomerEmail }] }],
          from: { email: "clipncopy1@gmail.com", name: "Clip N Copy" },
          subject: subjectTitle,
          content: [{ type: "text/html", value: emailHtml }],
        }),
      });

      console.log(`[send-order-email] SendGrid API HTTP status: ${sgRes.status}`);

      if (!sgRes.ok) {
        const errorDetails = await sgRes.json().catch(() => ({ message: "Failed to parse SendGrid error body" }));
        console.error("[send-order-email] SendGrid API error response:", errorDetails);
        return new Response(
          JSON.stringify({
            error: "Failed to send email via SendGrid",
            details: errorDetails,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: sgRes.status || 500 }
        );
      }
    } else {
      console.log(`[send-order-email] [Email Simulation] Formatted [${action}] Email for #${order.order_number} to ${targetCustomerEmail}`);
    }

    // 9. Update DB order record with timestamp timestamp ONLY after verified success
    const updatePayload: Record<string, string> = {};
    if (action === "accepted") {
      updatePayload.accepted_email_sent_at = new Date().toISOString();
    } else if (action === "rejected") {
      updatePayload.rejected_email_sent_at = new Date().toISOString();
    } else {
      updatePayload.confirmation_email_sent_at = new Date().toISOString();
    }

    await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        success: true,
        orderNumber: order.order_number,
        recipientEmail: recipientEmail,
        sent: true,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    console.error("[send-order-email error]", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to process order email" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
