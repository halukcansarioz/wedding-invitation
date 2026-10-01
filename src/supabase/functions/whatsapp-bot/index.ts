import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const WHATSAPP_VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const PHONE_NUMBER_ID = Deno.env.get('PHONE_NUMBER_ID');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  if (req.method === 'GET') {
    const url = new URL(req.url);
    if (url.searchParams.get("hub.verify_token") === WHATSAPP_VERIFY_TOKEN) {
      return new Response(url.searchParams.get("hub.challenge"), { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const body = await req.json();
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    
    if (message && message.type === 'text') {
      const userPhone = message.from;
      const userText = message.text.body;

      // 1. Dinamik Verileri Çek
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: settingsData } = await supabaseAdmin.from('settings').select('data').single();
      
      let systemPrompt = "Sen bir düğün asistanısın. Davetlilerin sorularına nazik, kısa ve samimi bir dille emoji kullanarak cevap ver.";
      
      if (settingsData && settingsData.data) {
        const siteData = settingsData.data;
        const bride = siteData?.invitation?.bride || "Gelin";
        const groom = siteData?.invitation?.groom || "Damat";
        const date = siteData?.invitation?.dateText || "Bilinmeyen Tarih";
        const time = siteData?.invitation?.timeText || "Bilinmeyen Saat";
        const venue = siteData?.invitation?.venue || "";
        const address = siteData?.invitation?.address || "";
        const iban = siteData?.giftRegistry?.iban || "";
        
        systemPrompt = `Sen ${bride} ve ${groom}'un düğün asistanısın. Düğün tarihi ${date} saat ${time}'da. Adres: ${venue}, ${address}. Çocuk getirmek yasaktır, sadece yetişkinler. Takı/hediye için IBAN: ${iban}. Davetlilerin sorularına nazik, kısa ve samimi bir dille emoji kullanarak cevap ver.`;
      }

      // 2. OpenAI İsteğini At
      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${OPENAI_API_KEY}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userText }
          ],
          max_tokens: 150,
          temperature: 0.3
        })
      });
      
      const aiData = await openAiRes.json();
      const replyText = aiData.choices[0].message.content.trim();

      // 3. Kullanıcıya Whatsapp Üzerinden Yanıtla
      const fbRes = await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          messaging_product: "whatsapp", 
          to: userPhone, 
          type: "text", 
          text: { body: replyText } 
        })
      });

      if (!fbRes.ok) {
        console.error("WhatsApp gönderim hatası:", await fbRes.text());
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Bot Error:", error);
    return new Response("Error", { status: 500 });
  }
});