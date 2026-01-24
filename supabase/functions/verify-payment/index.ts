import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLATFORM_FEE = 5; // GH₵ 5 platform fee per order

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { reference, orderId } = await req.json();

    console.log(`Verifying payment reference: ${reference} for order: ${orderId}`);

    if (!reference) {
      throw new Error("Missing payment reference");
    }

    if (!paystackSecretKey) {
      throw new Error("Payment gateway not configured");
    }

    // Verify transaction with Paystack
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
    });

    const verifyData = await verifyResponse.json();
    console.log("Paystack verification response:", JSON.stringify(verifyData, null, 2));

    if (!verifyData.status || verifyData.data.status !== "success") {
      console.error("Payment verification failed:", verifyData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: verifyData.data?.gateway_response || "Payment not successful" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { metadata } = verifyData.data;
    const actualOrderId = metadata?.order_id || orderId;

    if (!actualOrderId) {
      throw new Error("Order ID not found in payment metadata");
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", actualOrderId)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderError);
      throw new Error("Order not found");
    }

    // Already paid - return success
    if (order.payment_status === "paid") {
      console.log("Order already marked as paid");
      return new Response(
        JSON.stringify({ success: true, message: "Payment already processed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const deliveryFee = Number(order.delivery_fee) || 0;
    const riderEarnings = deliveryFee;
    const riderId = metadata?.rider_id || order.rider_id;

    // Credit rider earnings (100% of delivery fee)
    if (riderId) {
      const { data: riderProfile } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", riderId)
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
            order_id: actualOrderId,
          });

          console.log(`Credited GH₵${riderEarnings} to rider ${riderProfile.full_name}`);
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
          order_id: actualOrderId,
        });

        console.log(`Platform fee of GH₵${PLATFORM_FEE} credited to admin`);
      }
    }

    // Update order payment status
    const paymentChannel = verifyData.data.channel === "mobile_money" ? "momo" : "card";
    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        payment_method: paymentChannel,
        paid_at: new Date().toISOString(),
      })
      .eq("id", actualOrderId);

    console.log(`Payment verified and processed for order ${actualOrderId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified successfully",
        paymentMethod: paymentChannel,
        amount: verifyData.data.amount / 100, // Convert from pesewas to GHS
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Payment verification error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
