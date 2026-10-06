import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

interface DeleteMediaPayload {
  action?: "delete" | "cleanup-orphans";
  url?: string;
  urls?: string[];
  bucket?: string;
  path?: string;
}

/**
 * Verilen tam URL veya göreli yoldan bucket ve dosya yolunu ayrıştırır.
 */
function parseStorageUrl(rawUrl: string): { bucket: string; path: string } | null {
  try {
    const url = new URL(rawUrl, "http://localhost");
    const pathname = url.pathname;

    // Örn: /storage/v1/object/public/{bucket}/{path} veya /{bucket}/{path}
    const publicMatch = pathname.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)$/);
    if (publicMatch) {
      return {
        bucket: publicMatch[1],
        path: decodeURIComponent(publicMatch[2]),
      };
    }

    const segments = pathname.replace(/^\/+/, "").split("/");
    if (segments.length >= 2) {
      return {
        bucket: segments[0],
        path: decodeURIComponent(segments.slice(1).join("/")),
      };
    }

    return null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  // Preflight (OPTIONS) isteği anında 200 OK ile cevaplanmalıdır
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Sunucu ortam değişkenleri eksik." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const authHeader = req.headers.get("Authorization");
    const isServiceRoleCaller = authHeader?.includes(SUPABASE_SERVICE_ROLE_KEY);

    // Eğer doğrudan service_role ile çağrılmadıysa, oturumu doğrula
    if (!isServiceRoleCaller) {
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Yetkisiz istek. Authorization başlığı gerekli." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || "", {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: authError } = await client.auth.getUser();

      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: "Geçersiz veya süresi dolmuş oturum." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const body: DeleteMediaPayload = await req.json().catch(() => ({}));
    const action = body.action || "delete";

    // 1. AKSİYON: BELİRLİ DOSYALARI SİLME
    if (action === "delete") {
      const urlsToDelete: string[] = [];
      if (body.url) urlsToDelete.push(body.url);
      if (Array.isArray(body.urls)) urlsToDelete.push(...body.urls);

      if (body.bucket && body.path) {
        const { error } = await supabaseAdmin.storage.from(body.bucket).remove([body.path]);
        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, count: 1 }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (urlsToDelete.length === 0) {
        return new Response(
          JSON.stringify({ error: "Silinecek medya URL'si belirtilmedi." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const bucketMap = new Map<string, string[]>();
      for (const u of urlsToDelete) {
        const parsed = parseStorageUrl(u);
        if (parsed) {
          const list = bucketMap.get(parsed.bucket) || [];
          list.push(parsed.path);
          bucketMap.set(parsed.bucket, list);
        }
      }

      let totalDeleted = 0;
      for (const [bucket, paths] of bucketMap.entries()) {
        const { data, error } = await supabaseAdmin.storage.from(bucket).remove(paths);
        if (error) {
          console.error(`Bucket ${bucket} silme hatası:`, error);
        } else {
          totalDeleted += data?.length || paths.length;
        }
      }

      return new Response(
        JSON.stringify({ success: true, count: totalDeleted }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. AKSİYON: ÇÖP TOPLAYICI (GARBAGE COLLECTION)
    if (action === "cleanup-orphans") {
      const knownBuckets = ["images", "guest_photos", "audio_wishes"];
      let orphanCount = 0;

      // Veritabanında kullanılan aktif medyaları topla
      const { data: settingsRow } = await supabaseAdmin.from("settings").select("data").single();
      const siteData = settingsRow?.data || {};

      const activeUrls = new Set<string>();

      // Settings içerisindeki medyalar
      if (siteData.invitation?.heroImage) activeUrls.add(siteData.invitation.heroImage);
      if (siteData.invitation?.heroVideo) activeUrls.add(siteData.invitation.heroVideo);
      if (siteData.invitation?.musicFile) activeUrls.add(siteData.invitation.musicFile);
      if (Array.isArray(siteData.invitation?.gallery)) {
        siteData.invitation.gallery.forEach((g: string) => activeUrls.add(g));
      }
      if (Array.isArray(siteData.storyTimeline)) {
        siteData.storyTimeline.forEach((s: any) => { if (s?.image) activeUrls.add(s.image); });
      }

      // Guest photos tablosundaki aktif medyalar
      const { data: guestPhotos } = await supabaseAdmin.from("guest_photos").select("image_url");
      guestPhotos?.forEach((gp: any) => { if (gp.image_url) activeUrls.add(gp.image_url); });

      // Wishes ses dosyaları
      const { data: wishes } = await supabaseAdmin.from("wishes").select("audio_url");
      wishes?.forEach((w: any) => { if (w.audio_url) activeUrls.add(w.audio_url); });

      for (const bucket of knownBuckets) {
        const { data: fileList, error: listError } = await supabaseAdmin.storage.from(bucket).list();
        if (listError || !fileList) continue;

        const filesToDelete: string[] = [];
        for (const file of fileList) {
          const isReferenced = Array.from(activeUrls).some((url) => url.includes(file.name));
          if (!isReferenced) {
            filesToDelete.push(file.name);
          }
        }

        if (filesToDelete.length > 0) {
          const { error: removeError } = await supabaseAdmin.storage.from(bucket).remove(filesToDelete);
          if (!removeError) orphanCount += filesToDelete.length;
        }
      }

      return new Response(
        JSON.stringify({ success: true, count: orphanCount, message: `${orphanCount} adet yetim dosya temizlendi.` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Geçersiz aksiyon." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Storage delete function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Bilinmeyen sunucu hatası" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});