import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { packageWeight, packageLength, packageWidth, packageHeight, originCountry, destinationCountry, destinationCity, destinationPostalCode } = await req.json();

    const DHL_API_KEY = Deno.env.get("DHL_API_KEY");
    const DHL_API_SECRET = Deno.env.get("DHL_API_SECRET");

    if (DHL_API_KEY && DHL_API_SECRET) {
      // Real DHL API call
      const credentials = btoa(`${DHL_API_KEY}:${DHL_API_SECRET}`);
      const today = new Date();
      const shipDate = today.toISOString().split('T')[0];

      const ratePayload = {
        customerDetails: {
          shipperDetails: {
            postalCode: "00233",
            cityName: "Accra",
            countryCode: originCountry || "GH",
          },
          receiverDetails: {
            postalCode: destinationPostalCode || "10001",
            cityName: destinationCity || "New York",
            countryCode: destinationCountry || "US",
          },
        },
        accounts: [{ typeCode: "shipper", number: Deno.env.get("DHL_ACCOUNT_NUMBER") || "" }],
        plannedShippingDateAndTime: `${shipDate}T10:00:00 GMT+00:00`,
        unitOfMeasurement: "metric",
        isCustomsDeclarable: true,
        packages: [{
          weight: packageWeight || 1,
          dimensions: {
            length: packageLength || 20,
            width: packageWidth || 15,
            height: packageHeight || 10,
          },
        }],
      };

      const response = await fetch("https://express.api.dhl.com/mydhlapi/rates", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ratePayload),
      });

      if (response.ok) {
        const data = await response.json();
        const products = (data.products || []).map((p: any) => ({
          productName: p.productName,
          productCode: p.productCode,
          totalPrice: p.totalPrice?.[0]?.price || 0,
          currency: p.totalPrice?.[0]?.priceCurrency || "USD",
          estimatedDeliveryDate: p.deliveryCapabilities?.estimatedDeliveryDateAndTime,
          deliveryDays: p.deliveryCapabilities?.totalTransitDays,
        }));

        return new Response(JSON.stringify({ success: true, products, source: "dhl_api" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Mock response when no DHL credentials
    const baseRate = (packageWeight || 1) * 12;
    const volumeFactor = ((packageLength || 20) * (packageWidth || 15) * (packageHeight || 10)) / 5000;
    const chargeableWeight = Math.max(packageWeight || 1, volumeFactor);
    
    const products = [
      {
        productName: "DHL Express Worldwide",
        productCode: "P",
        totalPrice: Math.round(chargeableWeight * 15 + baseRate),
        currency: "USD",
        estimatedDeliveryDate: new Date(Date.now() + 3 * 86400000).toISOString(),
        deliveryDays: 3,
      },
      {
        productName: "DHL Express 12:00",
        productCode: "Y",
        totalPrice: Math.round(chargeableWeight * 22 + baseRate * 1.5),
        currency: "USD",
        estimatedDeliveryDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        deliveryDays: 2,
      },
      {
        productName: "DHL Economy Select",
        productCode: "H",
        totalPrice: Math.round(chargeableWeight * 8 + baseRate * 0.7),
        currency: "USD",
        estimatedDeliveryDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        deliveryDays: 7,
      },
    ];

    return new Response(JSON.stringify({ success: true, products, source: "mock" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
