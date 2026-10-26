import { supabase } from "../supabaseClient";
import { normalizeSiteData, dbGuestToUi, dbWishToUi } from "../utils/helpers";
import { optimizeImage } from "../utils/imageOptimizer";
import { SiteData, Guest, Wish } from "../types";
import { get, set } from "idb-keyval";
import { getActiveTenantId } from "../utils/tenant";

export const getSupabaseUrl = (): string =>
  String(import.meta.env?.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");

export const getSupabaseKey = (): string =>
  String(
    import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env?.VITE_SUPABASE_ANON_KEY ||
      ""
  ).trim();

export const getSupabaseSetupMessage = (): string => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  if (!url || !key) {
    return "Supabase bağlantısı eksik. .env.local içinde VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerleri olmalı.";
  }
  return "Supabase bağlantısı kurulamadı. Project URL / anon key değerlerini kontrol et.";
};

export const getReadableAuthError = (error: any): string => {
  if (!error) return "Bilinmeyen bir hata oluştu.";
  const status = error?.status || error?.code;
  const message = String(error?.message || error?.name || "").toLowerCase();
  if (status === 400 && message.includes("invalid login")) return "E-posta veya şifre hatalı.";
  if (status === 429) {
    return "Çok fazla deneme yapıldı. Birkaç dakika bekleyip tekrar deneyin.";
  }
  return error?.message || "İşlem tamamlanamadı. Bağlantınızı kontrol edin.";
};

export const isSupabaseReady = (): boolean => Boolean(getSupabaseUrl() && getSupabaseKey());

export const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      if (attempt === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)));
    }
  }
  throw new Error("Tüm denemeler başarısız oldu.");
};

const extractSettingsPayload = (rawData: any): any => {
  if (!rawData) return null;
  if (Array.isArray(rawData)) {
    if (rawData.length === 0) return null;
    return extractSettingsPayload(rawData[0]);
  }
  if (rawData.content && typeof rawData.content === "object") return rawData.content;
  if (rawData.data && typeof rawData.data === "object" && !Array.isArray(rawData.data)) {
    return rawData.data;
  }
  if (rawData.invitation || rawData.settings) return rawData;
  return null;
};

export const loadSettingsFromDatabase = async (
  explicitTenantId?: string | null
): Promise<SiteData | null> => {
  if (!isSupabaseReady()) return null;
  const tenantId =
    explicitTenantId !== undefined ? explicitTenantId || "main" : getActiveTenantId() || "main";

  return fetchWithRetry(async () => {
    const { data, error } = await supabase
      .from("invitation_settings")
      .select("content")
      .eq("id", tenantId)
      .single();

    if (error) {
      if (tenantId !== "main") {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("invitation_settings")
          .select("content")
          .eq("id", "main")
          .single();
        if (!fallbackError && fallbackData) {
          return normalizeSiteData(extractSettingsPayload(fallbackData)) as SiteData;
        }
      }
      throw error;
    }
    return normalizeSiteData(extractSettingsPayload(data)) as SiteData;
  });
};

export const saveSettingsToDatabase = async (
  settings: SiteData,
  explicitTenantId?: string | null
): Promise<void> => {
  if (!isSupabaseReady()) throw new Error("Supabase ayarları eksik.");
  const tenantId =
    explicitTenantId !== undefined ? explicitTenantId || "main" : getActiveTenantId() || "main";

  const { error } = await supabase.from("invitation_settings").upsert(
    { id: tenantId, content: settings as any, updated_at: new Date().toISOString() },
    { onConflict: "id" }
  );
  if (error) throw error;
};

export const loadGuestsFromDatabase = async (
  explicitTenantId?: string | null
): Promise<Guest[]> => {
  if (!isSupabaseReady()) return [];
  const tenantId = explicitTenantId !== undefined ? explicitTenantId : getActiveTenantId();

  let query = supabase.from("guests").select("*");
  if (tenantId && typeof query.eq === "function") {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(1000);
  if (error || !Array.isArray(data)) return [];
  return data.map(dbGuestToUi);
};

export const loadPublicGuestsSummaryFromDatabase = async (
  explicitTenantId?: string | null
): Promise<Guest[]> => {
  if (!isSupabaseReady()) return [];
  const tenantId = explicitTenantId !== undefined ? explicitTenantId : getActiveTenantId();

  let query = supabase.from("guests").select("id, attendance, person_count");
  if (tenantId && typeof query.eq === "function") {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(1000);
  if (error || !Array.isArray(data)) return [];
  return data.map((g: any) => ({
    id: g.id,
    name: "",
    attendance: g.attendance,
    personCount: String(g.person_count || 1),
    side: "Ortak",
    hasChild: "Hayır",
    has_arrived: false,
  }));
};

export const loadAllWishesFromDatabase = async (
  explicitTenantId?: string | null
): Promise<Wish[]> => {
  if (!isSupabaseReady()) return [];
  const tenantId = explicitTenantId !== undefined ? explicitTenantId : getActiveTenantId();

  let query = supabase.from("wishes").select("*");
  if (tenantId && typeof query.eq === "function") {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(1000);
  if (error || !Array.isArray(data)) return [];
  return data.map(dbWishToUi);
};

export const loadPublishedWishesFromDatabase = async (
  explicitTenantId?: string | null
): Promise<Wish[]> => {
  if (!isSupabaseReady()) return [];
  const tenantId = explicitTenantId !== undefined ? explicitTenantId : getActiveTenantId();

  let query = supabase.from("wishes").select("*").eq("approved", true);
  if (tenantId && typeof query.eq === "function") {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(1000);
  if (error || !Array.isArray(data)) return [];
  return data.map(dbWishToUi);
};

export const uploadMediaFile = async (
  rawFile: File,
  folder = "media"
): Promise<string | null> => {
  if (!rawFile) return null;
  if (!isSupabaseReady()) throw new Error("Supabase ayarları eksik.");

  let fileToUpload: File | Blob = rawFile;
  if (folder === "images" || rawFile.type.startsWith("image/")) {
    try {
      fileToUpload = (await optimizeImage(rawFile)) as File | Blob;
    } catch {
      // Keep the original file when image optimization is unavailable.
    }
  }

  const tenantId = getActiveTenantId();
  const tenantPrefix = tenantId ? `${tenantId}/` : "";
  const fileExt = rawFile.name.split(".").pop() || "file";
  const safeName = rawFile.name
    .replace(/\.[^/.]+$/, "")
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  const fileName = `${folder}/${tenantPrefix}${Date.now()}-${safeName || "upload"}.${fileExt}`;

  const { error } = await supabase.storage.from("wedding-media").upload(fileName, fileToUpload, {
    cacheControl: "3600",
    upsert: true,
    contentType: fileToUpload.type || undefined,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("wedding-media").getPublicUrl(fileName);
  return data.publicUrl;
};

export const uploadAndModerateGuestPhoto = async (
  rawFile: File
): Promise<{ url: string | null; isApproved: boolean }> => {
  if (!isSupabaseReady()) throw new Error("Supabase ayarları eksik.");

  const url = await uploadMediaFile(rawFile, "guest_photos");
  if (!url) return { url: null, isApproved: false };

  const tenantId = getActiveTenantId();
  const insertPayload: Record<string, any> = { image_url: url, approved: false };
  if (tenantId) insertPayload.tenant_id = tenantId;

  try {
    const res = await supabase.functions.invoke("moderate-photo", { body: { imageUrl: url } });
    const isSafe = Boolean(res?.data?.isSafe);
    insertPayload.approved = isSafe;
    await supabase.from("guest_photos").insert([insertPayload]);
    return { url, isApproved: isSafe };
  } catch {
    await supabase.from("guest_photos").insert([insertPayload]);
    return { url, isApproved: false };
  }
};

export const deleteMediaFile = async (fileUrl: string): Promise<void> => {
  if (!fileUrl || !isSupabaseReady() || !fileUrl.includes(".supabase.co")) return;
  try {
    const urlObj = new URL(fileUrl);
    const pathSegments = urlObj.pathname.split("/object/public/wedding-media/");
    if (pathSegments.length < 2) return;
    const filePath = decodeURIComponent(pathSegments[1]);
    const { error } = await supabase.storage.from("wedding-media").remove([filePath]);
    if (error) throw error;
  } catch {
    const failedDeletes: string[] = (await get("failed_deletes")) || [];
    if (!failedDeletes.includes(fileUrl)) {
      failedDeletes.push(fileUrl);
      await set("failed_deletes", failedDeletes);
    }
  }
};

export const syncFailedDeletes = async (): Promise<{
  successCount: number;
  failCount: number;
}> => {
  const failedDeletes: string[] = (await get("failed_deletes")) || [];
  if (failedDeletes.length === 0 || !navigator.onLine) {
    return { successCount: 0, failCount: failedDeletes.length };
  }

  const remainingFails: string[] = [];
  let successCount = 0;
  for (const fileUrl of failedDeletes) {
    try {
      const urlObj = new URL(fileUrl);
      const pathSegments = urlObj.pathname.split("/object/public/wedding-media/");
      if (pathSegments.length < 2) continue;
      const filePath = decodeURIComponent(pathSegments[1]);
      const { error } = await supabase.storage.from("wedding-media").remove([filePath]);
      if (error) throw error;
      successCount++;
    } catch {
      remainingFails.push(fileUrl);
    }
  }

  await set("failed_deletes", remainingFails);
  return { successCount, failCount: remainingFails.length };
};

export const runStorageGarbageCollection = async (): Promise<void> => {
  try {
    const failedDeletes: string[] = (await get("failed_deletes")) || [];
    if (failedDeletes.length > 50) {
      await set("failed_deletes", failedDeletes.slice(-50));
      console.log("[Garbage Collection] 'failed_deletes' temizlendi.");
    }
  } catch (error) {
    console.error("[Garbage Collection] Hatası:", error);
  }
};

export const restoreBackupToDatabase = async (parsedData: any): Promise<void> => {
  if (!isSupabaseReady()) throw new Error("Supabase bağlantısı kurulamadı.");
  const tenantId = getActiveTenantId();

  if (parsedData.siteData) await saveSettingsToDatabase(parsedData.siteData, tenantId);
  if (parsedData.guests && parsedData.guests.length > 0) {
    let deleteQuery = supabase.from("guests").delete();
    deleteQuery = tenantId ? deleteQuery.eq("tenant_id", tenantId) : deleteQuery.not("id", "is", null);
    await deleteQuery;

    const guestsToInsert = parsedData.guests.map(
      ({ id, created_at, updated_at, ...rest }: any) => ({
        ...rest,
        ...(tenantId ? { tenant_id: tenantId } : {}),
      })
    );
    await supabase.from("guests").insert(guestsToInsert);
  }
  if (parsedData.wishes && parsedData.wishes.length > 0) {
    let deleteQuery = supabase.from("wishes").delete();
    deleteQuery = tenantId ? deleteQuery.eq("tenant_id", tenantId) : deleteQuery.not("id", "is", null);
    await deleteQuery;

    const wishesToInsert = parsedData.wishes.map(
      ({ id, created_at, updated_at, ...rest }: any) => ({
        ...rest,
        ...(tenantId ? { tenant_id: tenantId } : {}),
      })
    );
    await supabase.from("wishes").insert(wishesToInsert);
  }
};