import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { bank_code, account_number, business_name, percentage_charge } = await req.json();

    if (!bank_code || !account_number || !business_name) {
      throw new Error("Missing required fields: bank_code, account_number, business_name");
    }

    // Get rider profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, phone, subaccount_code")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    console.log(`Creating/updating subaccount for rider: ${profile.full_name}`);

    // If rider already has a subaccount, update it
    if (profile.subaccount_code) {
      console.log(`Updating existing subaccount: ${profile.subaccount_code}`);
      
      const updateResponse = await fetch(
        `https://api.paystack.co/subaccount/${profile.subaccount_code}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            business_name,
            settlement_bank: bank_code,
            account_number,
            percentage_charge: percentage_charge || 0, // Platform takes flat fee, not percentage
          }),
        }
      );

      const updateData = await updateResponse.json();
      console.log("Paystack update response:", updateData);

      if (!updateData.status) {
        throw new Error(updateData.message || "Failed to update subaccount");
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          subaccount_code: profile.subaccount_code,
          message: "Subaccount updated successfully" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new subaccount
    const createResponse = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        business_name,
        settlement_bank: bank_code,
        account_number,
        percentage_charge: percentage_charge || 0,
        primary_contact_email: user.email,
        primary_contact_name: profile.full_name,
        primary_contact_phone: profile.phone,
      }),
    });

    const createData = await createResponse.json();
    console.log("Paystack create response:", createData);

    if (!createData.status) {
      throw new Error(createData.message || "Failed to create subaccount");
    }

    const subaccountCode = createData.data.subaccount_code;

    // Save subaccount code to profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ subaccount_code: subaccountCode })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Failed to save subaccount code:", updateError);
      throw new Error("Failed to save subaccount code");
    }

    console.log(`Subaccount created successfully: ${subaccountCode}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        subaccount_code: subaccountCode,
        message: "Subaccount created successfully" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Create subaccount error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
