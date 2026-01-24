import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLATFORM_FEE = 5; // GH₵ 5 platform fee per order

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, paymentMethod, customerId } = await req.json();

    console.log(`Processing payment for order: ${orderId}, method: ${paymentMethod}`);

    if (!orderId || !paymentMethod || !customerId) {
      throw new Error("Missing required fields: orderId, paymentMethod, or customerId");
    }

    // Get the order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, rider:rider_id(id, user_id)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order fetch error:", orderError);
      throw new Error("Order not found");
    }

    if (order.payment_status === "paid") {
      return new Response(
        JSON.stringify({ success: true, message: "Order already paid" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totalAmount = Number(order.total);
    const deliveryFee = Number(order.delivery_fee) || 0;

    console.log(`Order total: ${totalAmount}, Delivery fee: ${deliveryFee}`);

    // Get customer wallet
    const { data: customerProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", customerId)
      .single();

    if (!customerProfile) {
      throw new Error("Customer profile not found");
    }

    const { data: customerWallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", customerProfile.id)
      .single();

    // If paying with wallet, check balance
    if (paymentMethod === "wallet") {
      if (!customerWallet || (customerWallet.balance || 0) < totalAmount) {
        throw new Error("Insufficient wallet balance");
      }

      // Deduct from customer wallet
      await supabase
        .from("wallets")
        .update({ balance: (customerWallet.balance || 0) - totalAmount })
        .eq("id", customerWallet.id);

      // Record customer payment transaction
      await supabase.from("transactions").insert({
        wallet_id: customerWallet.id,
        amount: -totalAmount,
        type: "order_payment",
        description: `Payment for order ${order.order_number}`,
        order_id: orderId,
      });
    }

    // Get admin profile (first admin user)
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (adminProfile) {
      // Get or create admin wallet
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
        // Add platform fee to admin wallet
        await supabase
          .from("wallets")
          .update({ balance: (adminWallet.balance || 0) + PLATFORM_FEE })
          .eq("id", adminWallet.id);

        // Record admin platform fee transaction
        await supabase.from("transactions").insert({
          wallet_id: adminWallet.id,
          amount: PLATFORM_FEE,
          type: "deposit",
          description: `Platform fee from order ${order.order_number}`,
          order_id: orderId,
        });

        console.log(`Platform fee of GH₵${PLATFORM_FEE} credited to admin`);
      }
    }

    // Update order payment status
    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        payment_method: paymentMethod,
        paid_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    console.log(`Payment processed successfully for order ${orderId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment processed successfully",
        platformFee: PLATFORM_FEE,
        total: totalAmount
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Payment processing error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});