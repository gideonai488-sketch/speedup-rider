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
    const { trackingNumber } = await req.json();
    if (!trackingNumber) {
      return new Response(JSON.stringify({ error: "Tracking number required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const DHL_API_KEY = Deno.env.get("DHL_API_KEY");

    if (DHL_API_KEY) {
      // Real DHL Tracking API (unified tracking)
      const response = await fetch(
        `https://api-eu.dhl.com/track/shipments?trackingNumber=${trackingNumber}`,
        { headers: { "DHL-API-Key": DHL_API_KEY } }
      );

      if (response.ok) {
        const data = await response.json();
        const shipment = data.shipments?.[0];
        if (shipment) {
          const events = (shipment.events || []).map((e: any) => ({
            timestamp: e.timestamp,
            location: e.location?.address?.addressLocality || "Unknown",
            description: e.description || e.statusCode,
            statusCode: e.statusCode,
          }));

          return new Response(JSON.stringify({
            success: true,
            status: shipment.status?.statusCode || "unknown",
            statusDescription: shipment.status?.description,
            estimatedDelivery: shipment.estimatedTimeOfDelivery,
            events,
            source: "dhl_api",
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // Mock tracking response
    const now = Date.now();
    const events = [
      { timestamp: new Date(now - 2 * 86400000).toISOString(), location: "Accra, Ghana", description: "Shipment picked up from sender", statusCode: "picked_up" },
      { timestamp: new Date(now - 1.5 * 86400000).toISOString(), location: "Accra, Ghana", description: "Arrived at DHL Service Point", statusCode: "at_service_point" },
      { timestamp: new Date(now - 1 * 86400000).toISOString(), location: "Accra, Ghana", description: "Departed from origin facility", statusCode: "in_transit" },
      { timestamp: new Date(now - 0.5 * 86400000).toISOString(), location: "Leipzig, Germany", description: "Arrived at DHL hub", statusCode: "in_transit" },
      { timestamp: new Date(now).toISOString(), location: "Leipzig, Germany", description: "In transit to destination", statusCode: "in_transit" },
    ];

    return new Response(JSON.stringify({
      success: true,
      status: "in_transit",
      statusDescription: "In transit to destination country",
      estimatedDelivery: new Date(now + 2 * 86400000).toISOString(),
      events,
      source: "mock",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
