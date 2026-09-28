import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sourceImageUrl } = await req.json();

    if (!sourceImageUrl) {
      throw new Error("Görsel URL'i eksik.");
    }

    const mockMatches = [
      "https://duschqflahimxgbokyuc.supabase.co/storage/v1/object/public/wedding-media/images/demo-match-1.jpg",
      "https://duschqflahimxgbokyuc.supabase.co/storage/v1/object/public/wedding-media/images/demo-match-2.jpg"
    ];

    await new Promise(resolve => setTimeout(resolve, 2000));

    return new Response(JSON.stringify({ success: true, matches: mockMatches }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      headers: corsHeaders, status: 400 
    });
  }
});