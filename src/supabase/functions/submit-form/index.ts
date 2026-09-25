import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const BAD_WORDS = ["küfür1", "argo2", "kötükelime", "spam"]; 

const TURNSTILE_SECRET_KEY = Deno.env.get('TURNSTILE_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

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
    let authError = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user || user.role !== 'authenticated') {
        authError = error?.message || "Geçersiz yetki";
      } else {
        isAdmin = true;
      }
    }

    let isOfflineSync = false;
    
    if (turnstileToken === "OFFLINE_TOKEN") {
      if (!isAdmin) throw new Error(`Güvenlik İhlali: Çevrimdışı senkronizasyon reddedildi.`);
      isOfflineSync = true;
    } else if (!isAdmin) {
      if (!turnstileToken || turnstileToken === "MISSING_TOKEN") throw new Error("Güvenlik doğrulaması (Turnstile) başarısız.");
      const formData = new URLSearchParams();
      formData.append('secret', TURNSTILE_SECRET_KEY!);
      formData.append('response', turnstileToken);
      const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: formData });
      const turnstileData = await turnstileRes.json();
      if (!turnstileData.success) throw new Error("Bot doğrulaması geçilemedi.");
    }

    let result;
    if (type === 'guest') {
      if (isOfflineSync) data.note = (data.note ? data.note + " " : "") + "[Çevrimdışı Senkronizasyon]";
      const { data: guestData, error } = await supabaseAdmin.from('guests').insert([data]).select().single();
      if (error) throw error;
      result = guestData;
      
    } else if (type === 'wish') {
      const messageText = (data.message || "").toLowerCase();
      const containsBadWord = BAD_WORDS.some(word => messageText.includes(word));
      if (containsBadWord) throw new Error("Mesajınız topluluk kurallarına aykırı kelimeler içeriyor.");

      // AI ÇEVİRİ İŞLEMİ
      let translatedMessage = "";
      if (OPENAI_API_KEY) {
        try {
          const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: "Sen profesyonel bir çevirmensin. Gelen metin Türkçe ise harika bir İngilizce'ye çevir. Gelen metin İngilizce veya başka bir dil ise Türkçe'ye çevir. Sadece çeviriyi yaz, tırnak işareti veya ek bilgi ekleme." },
                { role: "user", content: data.message }
              ]
            })
          });
          const aiData = await aiResponse.json();
          translatedMessage = aiData.choices[0].message.content.trim();
        } catch (err) {
          console.warn("Çeviri yapılamadı", err);
        }
      }

      data.message_translated = translatedMessage;
      if (isOfflineSync) data.approved = false; 

      const { data: wishData, error } = await supabaseAdmin.from('wishes').insert([data]).select().single();
      if (error) throw error;
      result = wishData;
    } else {
      throw new Error("Geçersiz form tipi.");
    }

    return new Response(JSON.stringify({ success: true, data: result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }
})