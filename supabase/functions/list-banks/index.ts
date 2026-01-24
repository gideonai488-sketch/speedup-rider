import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    console.log("Fetching Ghana banks from Paystack...");

    // Fetch banks from Paystack for Ghana
    const response = await fetch(
      "https://api.paystack.co/bank?country=ghana&use_cursor=false&perPage=100",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    console.log(`Found ${data.data?.length || 0} banks`);

    if (!data.status) {
      throw new Error(data.message || "Could not fetch banks");
    }

    // Return formatted bank list
    const banks = data.data.map((bank: any) => ({
      code: bank.code,
      name: bank.name,
      type: bank.type,
      active: bank.active,
    }));

    return new Response(
      JSON.stringify({ success: true, banks }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("List banks error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
