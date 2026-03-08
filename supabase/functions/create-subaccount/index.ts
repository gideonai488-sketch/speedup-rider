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

    const { bank_code, account_number, business_name, rider_id } = await req.json();

    if (!bank_code || !account_number || !business_name) {
      throw new Error("Missing required fields: bank_code, account_number, business_name");
    }

    let profile;
    let userEmail = "";

    // If rider_id is provided (admin creating for rider), use that
    if (rider_id) {
      console.log(`Admin creating subaccount for rider: ${rider_id}`);
      
      const { data: riderProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, phone, subaccount_code, user_id")
        .eq("id", rider_id)
        .single();

      if (profileError || !riderProfile) {
        throw new Error("Rider profile not found");
      }
      
      profile = riderProfile;
      
      // Get email from auth
      if (profile.user_id) {
        const { data: authUser } = await supabase.auth.admin.getUserById(profile.user_id);
        userEmail = authUser?.user?.email || "";
      }
    } else {
      // Get authorization header for self-service
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        throw new Error("No authorization header");
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        throw new Error("Unauthorized");
      }

      userEmail = user.email || "";

      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, phone, subaccount_code")
        .eq("user_id", user.id)
        .single();

      if (profileError || !userProfile) {
        throw new Error("Profile not found");
      }
      
      profile = userProfile;
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
            percentage_charge: 0,
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
        percentage_charge: 0,
        primary_contact_email: userEmail || `rider_${profile.id}@speedup.app`,
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
