import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const ip =
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { data: isLimited, error: rateLimitError } = await supabaseAdmin.rpc("check_rate_limit", {
      client_ip: `face_match_${ip.trim()}`,
      max_req: 10,
      window_seconds: 60,
    });

    if (isLimited || rateLimitError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Hız sınırına ulaşıldı. Birazdan tekrar deneyin.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 429,
        }
      );
    }

    const { sourceImageUrl, tenantId } = await req.json();
    if (!sourceImageUrl) throw new Error("Görsel URL'i eksik.");

    // 1. Veritabanındaki onaylı düğün fotoğraflarını çek
    let photoQuery = supabaseAdmin
      .from("guest_photos")
      .select("image_url")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(12);

    if (tenantId) {
      photoQuery = photoQuery.eq("tenant_id", tenantId);
    }

    const { data: candidatePhotos } = await photoQuery;
    const candidateUrls: string[] = (candidatePhotos || [])
      .map((p: any) => p.image_url)
      .filter(Boolean);

    // Eğer hiç onaylı fotoğraf yoksa veya OpenAI anahtarı tanımlı değilse demo/aday listesini dön
    if (!OPENAI_API_KEY || candidateUrls.length === 0) {
      const fallbackMatches =
        candidateUrls.length > 0
          ? candidateUrls.slice(0, 4)
          : [
              "https://duschqflahimxgbokyuc.supabase.co/storage/v1/object/public/wedding-media/images/demo-match-1.jpg",
              "https://duschqflahimxgbokyuc.supabase.co/storage/v1/object/public/wedding-media/images/demo-match-2.jpg",
            ];

      return new Response(JSON.stringify({ success: true, matches: fallbackMatches }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 2. OpenAI Vision (gpt-4o-mini) ile referans selfie ve aday fotoğrafları karşılaştır
    const visionContent: any[] = [
      {
        type: "text",
        text: "İlk görsel aranan kişinin referans selfie fotoğrafıdır. Takip eden görseller ise düğün albümündeki numaralandırılmış fotoğraflardır (1'den başlayarak). Referans kişideki yüz/kişi özellikleri (saç, gözlük, kıyafet, görünüm) hangi numaralı albüm fotoğraflarında yer alıyor? Sadece eşleşen fotoğrafların 1-tabanlı indeks numaralarını JSON dizisi olarak döndür (örneğin: [1, 3]). Hiç eşleşme yoksa [] döndür.",
      },
      { type: "image_url", image_url: { url: sourceImageUrl } },
    ];

    candidateUrls.forEach((url) => {
      visionContent.push({ type: "image_url", image_url: { url } });
    });

    const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: visionContent }],
        max_tokens: 60,
        temperature: 0.1,
      }),
    });

    if (!openAiRes.ok) {
      throw new Error(`Görsel analiz servisi yanıt vermedi: ${openAiRes.status}`);
    }

    const aiData = await openAiRes.json();
    const rawContent = aiData.choices?.[0]?.message?.content?.trim() || "[]";
    const jsonMatch = rawContent.match(/\[[\d,\s]*\]/);
    const matchedIndices: number[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    const matchedUrls = matchedIndices
      .map((idx) => candidateUrls[idx - 1])
      .filter(Boolean);

    return new Response(JSON.stringify({ success: true, matches: matchedUrls }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: corsHeaders,
      status: 400,
    });
  }
});