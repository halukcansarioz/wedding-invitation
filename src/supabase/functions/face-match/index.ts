import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- IN-MEMORY RATE LIMITER ---
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; 
const MAX_REQUESTS = 10; 

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  if (record.count >= MAX_REQUESTS) return true;
  record.count++;
  return false;
}
// ------------------------------

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return new Response(JSON.stringify({ success: false, error: "Hız sınırına ulaşıldı." }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 
      });
    }

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