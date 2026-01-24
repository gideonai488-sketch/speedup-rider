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
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    const paystackPublicKey = Deno.env.get("PAYSTACK_PUBLIC_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, paymentMethod, customerId, callbackUrl } = await req.json();

    console.log(`Processing payment for order: ${orderId}, method: ${paymentMethod}`);
    console.log(`Paystack keys configured: secret=${!!paystackSecretKey}, public=${!!paystackPublicKey}`);

    if (!orderId || !paymentMethod || !customerId) {
      throw new Error("Missing required fields: orderId, paymentMethod, or customerId");
    }

    // Get the order details with rider info
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
    const riderEarnings = deliveryFee; // Rider gets 100% of delivery fee

    console.log(`Order total: ${totalAmount}, Delivery fee: ${deliveryFee}, Rider earnings: ${riderEarnings}`);

    // Get customer profile - customerId can be either profile.id or auth.user.id
    let customerProfile = await supabase
      .from("profiles")
      .select("id, user_id")
      .eq("id", customerId)
      .maybeSingle();

    // If not found by profile.id, try by user_id
    if (!customerProfile.data) {
      customerProfile = await supabase
        .from("profiles")
        .select("id, user_id")
        .eq("user_id", customerId)
        .single();
    }

    if (!customerProfile.data) {
      throw new Error("Customer profile not found");
    }

    const profile = customerProfile.data;

    // Get customer email from auth.users via service role
    const { data: authUser } = await supabase.auth.admin.getUserById(profile.user_id);
    const customerEmail = authUser?.user?.email || `customer_${profile.id}@speedrush.app`;

    const { data: customerWallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", profile.id)
      .single();

    // Process payment based on method
    if (paymentMethod === "wallet") {
      // Wallet payment - deduct from customer wallet
      if (!customerWallet || (customerWallet.balance || 0) < totalAmount) {
        throw new Error("Insufficient wallet balance");
      }

      await supabase
        .from("wallets")
        .update({ balance: (customerWallet.balance || 0) - totalAmount })
        .eq("id", customerWallet.id);

      await supabase.from("transactions").insert({
        wallet_id: customerWallet.id,
        amount: -totalAmount,
        type: "order_payment",
        description: `Payment for order ${order.order_number}`,
        order_id: orderId,
      });
      
      console.log(`Deducted GH₵${totalAmount} from customer wallet`);
    } else if (paymentMethod === "momo" || paymentMethod === "card") {
      // Paystack payment
      if (!paystackSecretKey) {
        throw new Error("Payment gateway not configured. Please contact support.");
      }

      console.log("Initiating Paystack payment...");
      
      const reference = `SR_${orderId.slice(0, 8)}_${Date.now()}`;
      const frontendCallback = callbackUrl || `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/track/${orderId}`;
      
      // Determine channel based on payment method
      const channels = paymentMethod === "momo" ? ["mobile_money"] : ["card"];
      
      const paystackPayload = {
        email: customerEmail,
        amount: Math.round(totalAmount * 100), // Paystack uses pesewas (smallest unit)
        currency: "GHS",
        reference,
        callback_url: frontendCallback,
        channels,
        metadata: {
          order_id: orderId,
          customer_id: customerId,
          rider_id: order.rider_id,
          delivery_fee: deliveryFee,
          platform_fee: PLATFORM_FEE,
          order_number: order.order_number,
        },
      };

      console.log("Paystack payload:", JSON.stringify(paystackPayload, null, 2));

      const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paystackPayload),
      });

      const paystackData = await paystackResponse.json();
      
      console.log("Paystack response:", JSON.stringify(paystackData, null, 2));
      
      if (!paystackData.status) {
        console.error("Paystack error:", paystackData);
        throw new Error(paystackData.message || "Payment initialization failed");
      }

      console.log("Paystack transaction initialized:", paystackData.data.reference);
      
      // Return authorization URL for frontend to redirect
      return new Response(
        JSON.stringify({
          success: true,
          requiresRedirect: true,
          authorizationUrl: paystackData.data.authorization_url,
          accessCode: paystackData.data.access_code,
          reference: paystackData.data.reference,
          publicKey: paystackPublicKey,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Credit rider earnings (100% of delivery fee) - will use Paystack transfer when key is added
    if (order.rider_id) {
      const { data: riderProfile } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", order.rider_id)
        .single();

      if (riderProfile) {
        // Get or create rider wallet
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
          // Credit rider with 100% of delivery fee
          await supabase
            .from("wallets")
            .update({ balance: (riderWallet.balance || 0) + riderEarnings })
            .eq("id", riderWallet.id);

          await supabase.from("transactions").insert({
            wallet_id: riderWallet.id,
            amount: riderEarnings,
            type: "earnings",
            description: `Delivery earnings from order ${order.order_number}`,
            order_id: orderId,
          });

          console.log(`Credited GH₵${riderEarnings} to rider ${riderProfile.full_name}`);
          
          // TODO: When Paystack key is added, use Paystack Transfer API to send to rider's bank
          // const riderBankDetails = await getRiderBankDetails(riderProfile.id);
          // if (riderBankDetails && paystackSecretKey) {
          //   await initiatePaystackTransfer(riderEarnings, riderBankDetails);
          // }
        }
      }
    }

    // Credit admin with platform fee - will use Paystack when key is added
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
        riderEarnings: riderEarnings,
        total: totalAmount,
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