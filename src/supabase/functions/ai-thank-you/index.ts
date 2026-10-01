import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// YENİ: Veritabanına Hata Loglama Fonksiyonu
async function logErrorToDatabase(supabaseAdmin: any, functionName: string, errorMsg: string, additionalData: any = {}) {
  try {
    await supabaseAdmin.from('error_logs').insert([{
      function_name: functionName,
      error_message: errorMsg,
      additional_data: additionalData,
      created_at: new Date().toISOString()
    }]);
  } catch (logErr) {
    console.error("Hata loglanamadı:", logErr);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  let supabaseAdmin: any;

  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const { data: isLimited, error: rateLimitError } = await supabaseAdmin.rpc('check_rate_limit', {
      client_ip: `ai_thank_you_${ip}`,
      max_req: 5,
      window_seconds: 60
    });

    if (isLimited || rateLimitError) {
      const errMsg = rateLimitError ? rateLimitError.message : "Rate limit aşıldı.";
      await logErrorToDatabase(supabaseAdmin, 'ai-thank-you', errMsg, { ip });
      
      return new Response(JSON.stringify({ success: false, error: "Çok fazla istek gönderildi. Lütfen 1 dakika bekleyin." }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Eksik yetkilendirme başlığı.");

    const supabaseClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Geçersiz veya süresi dolmuş oturum.");

    const { guestName, coupleName } = await req.json();

    if (!OPENAI_API_KEY) throw new Error("OpenAI API Anahtarı tanımlanmamış.");

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Sen profesyonel ve sıcak bir tonla çalışan, yeni evlenmiş çiftin (gelin ve damat) asistanısın. Çift adına düğüne gelen misafirlere teşekkür mesajı yazıyorsun. Mesajlar kısa, samimi ve WhatsApp üzerinden gönderilmeye uygun olmalı. Emoji kullanabilirsin." },
          { role: "user", content: `Düğünümüze katılan misafirimiz "${guestName}" için, biz "${coupleName}" adına sıcak ve içten bir teşekkür mesajı yazar mısın? Sadece mesajı döndür.` }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!openAiResponse.ok) {
        const errText = await openAiResponse.text();
        throw new Error(`OpenAI API Hatası: ${errText}`);
    }

    const aiData = await openAiResponse.json();
    const text = aiData.choices[0].message.content.trim();

    return new Response(JSON.stringify({ success: true, text }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 
    });

  } catch (error: any) {
    if (supabaseAdmin) {
       await logErrorToDatabase(supabaseAdmin, 'ai-thank-you', error.message, { stack: error.stack });
    }
    
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      headers: corsHeaders, status: 400 
    });
  }
});