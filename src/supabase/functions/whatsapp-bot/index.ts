import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  buildSystemPrompt,
  extractTextMessage,
  getVerificationResponse,
} from "./helpers.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const WHATSAPP_VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN");
const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
const PHONE_NUMBER_ID = Deno.env.get("PHONE_NUMBER_ID");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  if (req.method === "GET") {
    const url = new URL(req.url);
    const verification = getVerificationResponse(url, WHATSAPP_VERIFY_TOKEN);
    return new Response(verification.body, { status: verification.status });
  }

  try {
    const body = await req.json();
    const message = extractTextMessage(body);

    if (message && message.type === "text") {
      const userPhone = message.from;
      const userText = message.text.body;
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: invitationSettingsRow } = await supabaseAdmin
        .from("invitation_settings")
        .select("content")
        .eq("id", "main")
        .maybeSingle();

      let siteData = invitationSettingsRow?.content;
      if (!siteData) {
        const { data: legacySettingsRow } = await supabaseAdmin
          .from("settings")
          .select("data")
          .maybeSingle();
        siteData = legacySettingsRow?.data;
      }

      const systemPrompt = buildSystemPrompt(siteData);
      const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userText },
          ],
          max_tokens: 150,
          temperature: 0.3,
        }),
      });

      const aiData = await openAiRes.json();
      const replyText = aiData.choices?.[0]?.message?.content?.trim() || "";
      const fbRes = await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: userPhone,
          type: "text",
          text: { body: replyText },
        }),
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
