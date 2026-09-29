import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSAPP_API_KEY = Deno.env.get('WHATSAPP_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Array'i belirli boyutlardaki küçük paketlere bölen yardımcı fonksiyon
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunked: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // DB tabanlı Rate Limiting
    const { data: isLimited, error: rateLimitError } = await supabaseAdmin.rpc('check_rate_limit', {
      client_ip: `broadcast_whatsapp_${ip}`,
      max_req: 3, // Toplu mesaj atma işlemi nadir yapılır, limiti sıkı tutuyoruz
      window_seconds: 60
    });

    if (isLimited || rateLimitError) {
      return new Response(JSON.stringify({ success: false, error: "Hız sınırına ulaşıldı." }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Eksik yetkilendirme başlığı (Authorization header).");

    const supabaseClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Geçersiz veya süresi dolmuş oturum.");

    const { guests, message } = await req.json();
    if (!guests || !Array.isArray(guests) || guests.length === 0) {
      throw new Error("Geçerli bir misafir listesi bulunamadı.");
    }

    // YENİ: Toplu istekleri 50'şerli paketlere böler (Batch Processing)
    // Bu sayede Deno bellek şişmesi ve Timeout problemleri engellenir.
    const chunks = chunkArray(guests, 50);
    const allResults = [];

    for (const chunk of chunks) {
      const sendPromises = chunk.map(async (guest: any) => {
        const personalizedMessage = `Merhaba ${guest.name},\n\n${message}`;
        
        // Simüle edilmiş API isteği (Gerçekte WhatsApp Cloud API'ye gider)
        // await fetch('https://graph.facebook.com/...');
        
        return Promise.resolve({ success: true, phone: guest.phone });
      });

      // Paketteki 50 işlemi bekle
      const chunkResults = await Promise.allSettled(sendPromises);
      allResults.push(...chunkResults);
      
      // Diğer pakete geçmeden önce Deno Event Loop'u rahatlatmak için küçük bir bekleme
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const successfulCount = allResults.filter(r => r.status === 'fulfilled').length;

    return new Response(JSON.stringify({ success: true, processed: successfulCount, total: guests.length }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      headers: corsHeaders, status: 400 
    });
  }
});