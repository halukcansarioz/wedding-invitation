import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSAPP_API_KEY = Deno.env.get('WHATSAPP_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // 1. JWT Token Kontrolü (Güvenlik)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Eksik yetkilendirme başlığı (Authorization header).");

    const supabaseClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Geçersiz veya süresi dolmuş oturum.");

    // 2. Mesaj Gönderimi
    const { guests, message } = await req.json();

    const sendPromises = guests.map(async (guest: any) => {
      const personalizedMessage = `Merhaba ${guest.name},\n\n${message}`;
      
      // Aşağıdaki fetch kodu WhatsApp Cloud API içindir. (Kendi API Provider'ınıza göre uyarlayabilirsiniz)
      /*
      return fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${WHATSAPP_API_KEY}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: guest.phone.replace(/\D/g, ""),
          type: "text",
          text: { body: personalizedMessage }
        })
      });
      */
      
      return Promise.resolve({ success: true, phone: guest.phone }); // Simülasyon
    });

    const results = await Promise.allSettled(sendPromises);

    return new Response(JSON.stringify({ success: true, processed: results.length }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      headers: corsHeaders, status: 400 
    });
  }
});