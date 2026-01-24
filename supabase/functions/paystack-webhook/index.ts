import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

// Helper function to create HMAC signature
async function createHmacSignature(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

const PLATFORM_FEE = 5; // GH₵ 5 platform fee

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Verify webhook signature if Paystack key exists
    if (paystackSecretKey && signature) {
      const hash = await createHmacSignature(paystackSecretKey, body);
      
      if (hash !== signature) {
        console.error("Invalid Paystack signature");
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const event = JSON.parse(body);
    console.log("Paystack webhook event:", event.event);

    if (event.event === "charge.success") {
      const { metadata, reference, amount } = event.data;
      const { order_id, customer_id, rider_id, delivery_fee, platform_fee } = metadata || {};

      console.log(`Processing successful payment for order: ${order_id}`);

      if (!order_id) {
        console.error("No order_id in metadata");
        return new Response(
          JSON.stringify({ error: "Missing order_id" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get order details
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", order_id)
        .single();

      if (orderError || !order) {
        console.error("Order not found:", orderError);
        return new Response(
          JSON.stringify({ error: "Order not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (order.payment_status === "paid") {
        console.log("Order already paid");
        return new Response(
          JSON.stringify({ success: true, message: "Already processed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const riderEarnings = delivery_fee || Number(order.delivery_fee);

      // Credit rider earnings
      if (rider_id) {
        const { data: riderProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", rider_id)
          .single();

        if (riderProfile) {
          let { data: riderWallet } = await supabase
            .from("wallets")
            .select("*")
            .eq("user_id", riderProfile.id)
            .maybeSingle();

          if (!riderWallet) {
            const { data: newWallet } = await supabase
              .from("wallets")
              .insert({ user_id: riderProfile.id, balance: 0 })
              .select()
              .single();
            riderWallet = newWallet;
          }

          if (riderWallet) {
            await supabase
              .from("wallets")
              .update({ balance: (riderWallet.balance || 0) + riderEarnings })
              .eq("id", riderWallet.id);

            await supabase.from("transactions").insert({
              wallet_id: riderWallet.id,
              amount: riderEarnings,
              type: "earnings",
              description: `Delivery earnings from order ${order.order_number}`,
              order_id: order_id,
            });

            console.log(`Credited GH₵${riderEarnings} to rider`);
            
            // TODO: Initiate Paystack transfer to rider's bank account
            // This requires storing rider bank details in profiles table
          }
        }
      }

      // Credit admin with platform fee
      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .limit(1)
        .single();

      if (adminProfile) {
        let { data: adminWallet } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", adminProfile.id)
          .maybeSingle();

        if (!adminWallet) {
          const { data: newWallet } = await supabase
            .from("wallets")
            .insert({ user_id: adminProfile.id, balance: 0 })
            .select()
            .single();
          adminWallet = newWallet;
        }

        if (adminWallet) {
          await supabase
            .from("wallets")
            .update({ balance: (adminWallet.balance || 0) + PLATFORM_FEE })
            .eq("id", adminWallet.id);

          await supabase.from("transactions").insert({
            wallet_id: adminWallet.id,
            amount: PLATFORM_FEE,
            type: "deposit",
            description: `Platform fee from order ${order.order_number}`,
            order_id: order_id,
          });

          console.log(`Platform fee of GH₵${PLATFORM_FEE} credited to admin`);
        }
      }

      // Update order payment status
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          payment_method: "paystack",
          paid_at: new Date().toISOString(),
        })
        .eq("id", order_id);

      console.log(`Payment completed for order ${order_id}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});