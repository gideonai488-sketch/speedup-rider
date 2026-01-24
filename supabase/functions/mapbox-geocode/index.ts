import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    
    if (!mapboxToken) {
      console.error('MAPBOX_PUBLIC_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Mapbox token not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { query, proximity, types } = await req.json();

    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ features: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect if this is a reverse geocoding request (coordinates)
    const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    const isReverseGeocode = coordPattern.test(query.trim());

    // Build Mapbox Geocoding API URL
    const params = new URLSearchParams({
      access_token: mapboxToken,
      country: 'GH', // Ghana
    });

    if (isReverseGeocode) {
      // For reverse geocoding, use single type and no limit to avoid Mapbox error
      params.append('types', 'address');
    } else {
      // For forward geocoding, use multiple types with limit
      params.append('autocomplete', 'true');
      params.append('limit', '5');
      params.append('types', types || 'address,poi,place,locality,neighborhood');
      
      if (proximity) {
        params.append('proximity', proximity);
      }
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`;

    console.log('Geocoding request for:', query);
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('Mapbox API error:', data);
      return new Response(
        JSON.stringify({ error: 'Geocoding failed', details: data }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Return simplified results
    const results = data.features.map((feature: any) => ({
      id: feature.id,
      place_name: feature.place_name,
      text: feature.text,
      center: feature.center, // [lng, lat]
      context: feature.context,
    }));

    console.log(`Found ${results.length} results for "${query}"`);

    return new Response(
      JSON.stringify({ features: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in geocode function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
