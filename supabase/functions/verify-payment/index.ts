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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    
    // ========================================
    // AUTHENTICATION CHECK - CRITICAL SECURITY
    // ========================================
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's auth token to validate
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate the JWT and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      console.error("Authentication failed:", claimsError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authenticatedUserId = claimsData.user.id;
    console.log(`Authenticated user: ${authenticatedUserId}`);

    // Now use service role for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { reference, orderId } = await req.json();

    console.log(`Verifying payment reference: ${reference} for order: ${orderId}`);

    if (!reference) {
      throw new Error("Missing payment reference");
    }

    if (!paystackSecretKey) {
      throw new Error("Payment gateway not configured");
    }

    // ========================================
    // IDEMPOTENCY CHECK - Prevent duplicate processing
    // ========================================
    const { data: existingPayment } = await supabase
      .from("payment_idempotency")
      .select("*")
      .eq("payment_reference", reference)
      .maybeSingle();

    if (existingPayment) {
      console.log(`Payment ${reference} already processed, returning cached result`);
      return new Response(
        JSON.stringify(existingPayment.result || { success: true, message: "Payment already processed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    // Get user's profile for authorization
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", authenticatedUserId)
      .single();

    if (profileError || !userProfile) {
      console.error("User profile not found:", profileError);
      throw new Error("User profile not found");
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

    // ========================================
    // AUTHORIZATION CHECK - Verify user is related to this order
    // ========================================
    const isCustomer = order.customer_id === userProfile.id;
    const isRider = order.rider_id === userProfile.id;
    const isAdmin = userProfile.role === 'admin';

    if (!isCustomer && !isRider && !isAdmin) {
      console.error(`Authorization failed: User ${userProfile.id} is not related to order ${actualOrderId}`);
      return new Response(
        JSON.stringify({ success: false, error: "Not authorized to verify this payment" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Already paid - return success (idempotent)
    if (order.payment_status === "paid") {
      console.log("Order already marked as paid");
      
      // Record in idempotency table (ignore if exists)
      await supabase.from("payment_idempotency").upsert({
        payment_reference: reference,
        order_id: actualOrderId,
        result: { success: true, message: "Payment already processed" }
      }, { onConflict: 'payment_reference', ignoreDuplicates: true });
      
      return new Response(
        JSON.stringify({ success: true, message: "Payment already processed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record this payment to prevent duplicate processing
    const { error: idempotencyError } = await supabase
      .from("payment_idempotency")
      .insert({
        payment_reference: reference,
        order_id: actualOrderId,
      });

    if (idempotencyError && idempotencyError.code === '23505') {
      // Duplicate key - another request is processing this payment
      console.log(`Payment ${reference} is being processed by another request`);
      return new Response(
        JSON.stringify({ success: true, message: "Payment is being processed" }),
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

    const result = {
      success: true,
      message: "Payment verified successfully",
      paymentMethod: paymentChannel,
      amount: verifyData.data.amount / 100,
    };

    // Update idempotency record with result
    await supabase
      .from("payment_idempotency")
      .update({ result })
      .eq("payment_reference", reference);

    return new Response(
      JSON.stringify(result),
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
