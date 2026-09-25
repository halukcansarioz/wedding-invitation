import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { imageUrl } = await req.json();

    // OpenAI GPT-4o-Mini Vision Modeli ile içerik analizi
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
            role: "user",
            content: [
              { type: "text", text: "Bu görseli analiz et. Düğün, eğlence, insan, selfie veya manzara içeriyorsa 'SAFE' dön. Çıplaklık, şiddet, rahatsız edici veya yasa dışı bir içerik varsa sadece 'UNSAFE' dön. Başka hiçbir kelime yazma." },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 10
      })
    });

    const aiData = await openAiResponse.json();
    const judgment = aiData.choices[0].message.content.trim().toUpperCase();

    const isSafe = judgment === 'SAFE';

    return new Response(JSON.stringify({ success: true, isSafe, judgment }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      headers: corsHeaders, status: 400 
    });
  }
});