import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const TURNSTILE_SECRET_KEY = Deno.env.get('TURNSTILE_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { type, data, turnstileToken } = await req.json();

    const authHeader = req.headers.get('Authorization');
    let isAdmin = false;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) isAdmin = true;
    }

    let isOfflineSync = false;
    
    // GÜVENLİK GÜNCELLEMESİ: OFFLINE_TOKEN sadece admin tarafından kullanılabilir
    if (turnstileToken === "OFFLINE_TOKEN") {
      if (!isAdmin) {
        throw new Error("Güvenlik İhlali: Çevrimdışı senkronizasyon sadece yetkili oturumlar (admin) tarafından yapılabilir.");
      }
      isOfflineSync = true;
    } else if (!isAdmin) {
      // Normal ziyaretçiler için Turnstile zorunluluğu
      if (!turnstileToken || turnstileToken === "MISSING_TOKEN") {
        throw new Error("Güvenlik doğrulaması (Turnstile) başarısız.");
      }
      
      const formData = new URLSearchParams();
      formData.append('secret', TURNSTILE_SECRET_KEY!);
      formData.append('response', turnstileToken);

      const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData,
      });
      const turnstileData = await turnstileRes.json();
      if (!turnstileData.success) throw new Error("Bot doğrulaması geçilemedi.");
    }

    let result;
    if (type === 'guest') {
      if (isOfflineSync) {
        data.note = (data.note ? data.note + " " : "") + "[Çevrimdışı Senkronizasyon]";
      }
      const { data: guestData, error } = await supabaseAdmin.from('guests').insert([data]).select().single();
      if (error) throw error;
      result = guestData;
    } else if (type === 'wish') {
      if (isOfflineSync) {
        data.approved = false; // Çevrimdışı gönderilen mesajlar kesinlikle onaya düşer
      }
      const { data: wishData, error } = await supabaseAdmin.from('wishes').insert([data]).select().single();
      if (error) throw error;
      result = wishData;
    } else {
      throw new Error("Geçersiz form tipi.");
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})