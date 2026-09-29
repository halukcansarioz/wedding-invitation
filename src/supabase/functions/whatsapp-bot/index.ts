import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const WHATSAPP_VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const PHONE_NUMBER_ID = Deno.env.get('PHONE_NUMBER_ID');

serve(async (req) => {
  // 1. Meta Webhook Kurulumu Doğrulaması (GET isteği için)
  if (req.method === 'GET') {
    const url = new URL(req.url);
    if (url.searchParams.get("hub.verify_token") === WHATSAPP_VERIFY_TOKEN) {
      return new Response(url.searchParams.get("hub.challenge"), { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // 2. Gelen Mesajı İşleme (POST)
  try {
    const body = await req.json();
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    
    if (message && message.type === 'text') {
      const userPhone = message.from;
      const userText = message.text.body;

      // OpenAI'ye düğün detaylarıyla prompt gönderme
      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${OPENAI_API_KEY}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: "Sen Handenur ve Haluk Can'ın düğün asistanısın. Düğün tarihi 07 Ağustos 2027 saat 19:00'da. Adres: Fenerbahçe Orduevi Plaj Düğün Salonu, Kadıköy/İstanbul. Çocuk getirmek yasaktır, sadece yetişkinler. Takı/hediye için IBAN: TR53 0011 1000 0000 0145 4005 17. Davetlilerin sorularına nazik, kısa ve samimi bir dille emoji kullanarak cevap ver." 
            },
            { role: "user", content: userText }
          ],
          max_tokens: 150,
          temperature: 0.3
        })
      });
      
      const aiData = await openAiRes.json();
      const replyText = aiData.choices[0].message.content.trim();

      // Meta API ile yanıtı WhatsApp'tan kullanıcıya iletme
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