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
    const { latitude, longitude, countryCode } = await req.json();

    const DHL_API_KEY = Deno.env.get("DHL_API_KEY");

    if (DHL_API_KEY) {
      // Real DHL Location Finder API
      const params = new URLSearchParams({
        countryCode: countryCode || "GH",
        latitude: String(latitude || 5.6037),
        longitude: String(longitude || -0.1870),
        radius: "10000",
        limit: "10",
        serviceType: "parcel:drop-off",
      });

      const response = await fetch(
        `https://api.dhl.com/location-finder/v1/find-by-geo?${params}`,
        { headers: { "DHL-API-Key": DHL_API_KEY } }
      );

      if (response.ok) {
        const data = await response.json();
        const locations = (data.locations || []).map((loc: any) => ({
          id: loc.url?.split("/").pop() || loc.name,
          name: loc.name,
          address: loc.place?.address?.streetAddress || "",
          city: loc.place?.address?.addressLocality || "",
          latitude: loc.place?.geo?.latitude,
          longitude: loc.place?.geo?.longitude,
          distance: loc.distance,
          openingHours: loc.openingHours,
          services: loc.serviceTypes || [],
        }));

        return new Response(JSON.stringify({ success: true, locations, source: "dhl_api" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Mock service points for Accra
    const locations = [
      {
        id: "sp-1",
        name: "DHL Service Point - Accra Mall",
        address: "Tetteh Quarshie Interchange, Spintex Rd",
        city: "Accra",
        latitude: 5.6260,
        longitude: -0.1751,
        distance: 2.3,
        openingHours: "Mon-Sat 8:00-18:00",
        services: ["drop-off", "pick-up"],
      },
      {
        id: "sp-2",
        name: "DHL Express - Osu Oxford Street",
        address: "Oxford Street, Osu",
        city: "Accra",
        latitude: 5.5571,
        longitude: -0.1818,
        distance: 3.1,
        openingHours: "Mon-Fri 8:30-17:30",
        services: ["drop-off", "pick-up", "packaging"],
      },
      {
        id: "sp-3",
        name: "DHL Service Point - East Legon",
        address: "Boundary Rd, East Legon",
        city: "Accra",
        latitude: 5.6350,
        longitude: -0.1580,
        distance: 4.5,
        openingHours: "Mon-Fri 9:00-17:00",
        services: ["drop-off"],
      },
      {
        id: "sp-4",
        name: "DHL Service Point - Airport City",
        address: "Airport City, near KIA",
        city: "Accra",
        latitude: 5.6050,
        longitude: -0.1700,
        distance: 1.8,
        openingHours: "Mon-Sat 7:00-20:00",
        services: ["drop-off", "pick-up", "packaging"],
      },
    ];

    return new Response(JSON.stringify({ success: true, locations, source: "mock" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
