import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Eksik yetkilendirme başlığı (Authorization header).");

    const supabaseClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Geçersiz veya süresi dolmuş oturum.");

    const { guestName, coupleName, wishMessage } = await req.json();

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Sen ${coupleName} çifti adına düğünlerine katılan misafirlere samimi, kısa ve içten bir teşekkür mesajı yazan bir asistansın. Mesaj WhatsApp üzerinden gönderilecek. Lütfen emoji kullan.`
          },
          {
            role: "user",
            content: `Misafir Adı: ${guestName}. Misafirin bize notu (varsa): "${wishMessage}". Bu misafire düğünümüze katıldığı için özel bir teşekkür mesajı oluştur.`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    const aiData = await openAiResponse.json();
    const generatedText = aiData.choices[0].message.content.trim();

    return new Response(JSON.stringify({ success: true, text: generatedText }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      headers: corsHeaders, status: 400 
    });
  }
});