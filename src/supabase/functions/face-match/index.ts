import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // DB tabanlı rate limiting check
    const { data: isLimited, error: rateLimitError } = await supabaseAdmin.rpc('check_rate_limit', {
      client_ip: `face_match_${ip}`,
      max_req: 10,
      window_seconds: 60
    });

    if (isLimited || rateLimitError) {
      return new Response(JSON.stringify({ success: false, error: "Hız sınırına ulaşıldı. Birazdan tekrar deneyin." }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 
      });
    }

    const { sourceImageUrl } = await req.json();
    if (!sourceImageUrl) throw new Error("Görsel URL'i eksik.");

    // Simülasyon Gecikmesi
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockMatches = [
      "https://duschqflahimxgbokyuc.supabase.co/storage/v1/object/public/wedding-media/images/demo-match-1.jpg",
      "https://duschqflahimxgbokyuc.supabase.co/storage/v1/object/public/wedding-media/images/demo-match-2.jpg"
    ];

    return new Response(JSON.stringify({ success: true, matches: mockMatches }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      headers: corsHeaders, status: 400 
    });
  }
});