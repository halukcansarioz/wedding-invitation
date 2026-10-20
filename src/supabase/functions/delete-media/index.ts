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

function parseStorageUrl(rawUrl: string): { bucket: string; path: string } | null {
  try {
    const url = new URL(rawUrl, "http://localhost");
    const pathname = url.pathname;

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
      const {
        data: { user },
        error: authError,
      } = await client.auth.getUser();

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

    // 2. AKSİYON: BİRLEŞTİRİLMİŞ ÇÖP TOPLAYICI (GARBAGE COLLECTION)
    if (action === "cleanup-orphans") {
      let orphanCount = 0;
      const activeUrls = new Set<string>();

      const collectSiteDataUrls = (siteData: any) => {
        if (!siteData) return;
        if (siteData.invitation?.heroImage) activeUrls.add(siteData.invitation.heroImage);
        if (siteData.invitation?.heroVideo) activeUrls.add(siteData.invitation.heroVideo);
        if (siteData.invitation?.musicFile) activeUrls.add(siteData.invitation.musicFile);
        if (Array.isArray(siteData.invitation?.gallery)) {
          siteData.invitation.gallery.forEach((g: string) => g && activeUrls.add(g));
        }
        if (Array.isArray(siteData.storyTimeline)) {
          siteData.storyTimeline.forEach((s: any) => {
            if (s?.image) activeUrls.add(s.image);
          });
        }
      };

      // Hem yeni invitation_settings hem de eski settings tablosunu tara
      const { data: invitationSettingsRows } = await supabaseAdmin.from("invitation_settings").select("content");
      invitationSettingsRows?.forEach((r: any) => collectSiteDataUrls(r.content));

      const { data: legacySettingsRows } = await supabaseAdmin.from("settings").select("data");
      legacySettingsRows?.forEach((r: any) => collectSiteDataUrls(r.data));

      // Guest photos tablosundaki aktif medyalar
      const { data: guestPhotos } = await supabaseAdmin.from("guest_photos").select("image_url");
      guestPhotos?.forEach((gp: any) => {
        if (gp.image_url) activeUrls.add(gp.image_url);
      });

      // Wishes ses dosyaları (audio_url ve audioUrl)
      const { data: wishes } = await supabaseAdmin.from("wishes").select("*");
      wishes?.forEach((w: any) => {
        const audio = w.audio_url || w.audioUrl;
        if (audio) activeUrls.add(audio);
      });

      const activeUrlList = Array.from(activeUrls);

      // A) wedding-media alt klasörlerini tara (images, media, music, audio_wishes, video)
      const subFolders = ["", "images", "media", "music", "audio_wishes", "video"];
      for (const folder of subFolders) {
        const { data: files, error: listErr } = await supabaseAdmin.storage
          .from("wedding-media")
          .list(folder || undefined);
        if (listErr || !files) continue;

        const pathsToDelete: string[] = [];
        for (const file of files) {
          if (!file.id || file.name === ".emptyFolderPlaceholder") continue;
          const fullPath = folder ? `${folder}/${file.name}` : file.name;
          const isUsed = activeUrlList.some((u) => u.includes(file.name));
          if (!isUsed) {
            pathsToDelete.push(fullPath);
          }
        }

        if (pathsToDelete.length > 0) {
          const { error: rmErr } = await supabaseAdmin.storage.from("wedding-media").remove(pathsToDelete);
          if (!rmErr) orphanCount += pathsToDelete.length;
        }
      }

      // B) Diğer kök kovaları tara
      const rootBuckets = ["images", "guest_photos", "audio_wishes"];
      for (const bucket of rootBuckets) {
        const { data: fileList, error: listError } = await supabaseAdmin.storage.from(bucket).list();
        if (listError || !fileList) continue;

        const filesToDelete: string[] = [];
        for (const file of fileList) {
          if (!file.id || file.name === ".emptyFolderPlaceholder") continue;
          const isReferenced = activeUrlList.some((url) => url.includes(file.name));
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
        JSON.stringify({
          success: true,
          count: orphanCount,
          deletedCount: orphanCount,
          message: `${orphanCount} adet yetim dosya kalıcı olarak temizlendi.`,
        }),
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