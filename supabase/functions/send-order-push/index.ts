// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const record = body.record || body;

    const orderId = record.id || record.order_number;
    const orderNumber = record.order_number || record.orderNumber || orderId;
    const totalAmount = record.total_amount || record.totalAmount || 0;
    const customerName = record.customer_name || record.customerName || "Customer";

    // Fetch all active push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("endpoint, subscription");

    if (subError) {
      throw subError;
    }

    console.log(`Sending Web Push for Order #${orderNumber} to ${subscriptions?.length || 0} subscribers.`);

    const payload = JSON.stringify({
      title: `🔔 New Order Received #${orderNumber}`,
      body: `Customer: ${customerName} — ₹${totalAmount}`,
      orderId: orderId,
      orderNumber: orderNumber,
      totalAmount: totalAmount,
      customerName: customerName,
      url: `/admin/orders?orderId=${orderId}`,
    });

    const results = [];
    if (subscriptions) {
      for (const sub of subscriptions) {
        results.push({ endpoint: sub.endpoint, status: "queued" });
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: subscriptions?.length || 0, payload, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
