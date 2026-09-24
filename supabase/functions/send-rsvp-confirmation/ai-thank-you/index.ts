// supabase/functions/ai-thank-you/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS (Ön Uç Tarafından Gelen İstekleri Kabul Etmek İçin)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { guestName, coupleName, wishMessage } = await req.json();

    // GEMINI_API_KEY bilginizi Supabase Secrets'a eklemeniz gerekmektedir.
    // Örn: supabase secrets set GEMINI_API_KEY=AIzaSy...
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY sunucuda eksik.");
    }

    const prompt = `Sen zarif ve samimi bir düğün asistanısın. ${coupleName} çifti adına, düğünlerine katılan ${guestName} isimli misafire kısa, duygusal ve akılda kalıcı bir teşekkür mesajı yaz. 
    Misafirin anı defterine yazdığı not: "${wishMessage}". Bu nota atıfta bulunarak ona değer verildiğini hissettir. WhatsApp'tan gönderileceği için dozunda emojiler ekle. Mesaj direk okunabilir olsun, başına sonuna açıklamalar koyma.`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 } 
      })
    });

    const aiData = await geminiRes.json();
    const generatedText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("Yapay zeka yanıt üretemedi.");
    }

    return new Response(JSON.stringify({ success: true, text: generatedText }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});