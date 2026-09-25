import { supabase } from "../supabaseClient";
import { normalizeSiteData, dbGuestToUi, dbWishToUi } from "../utils/helpers";
import { optimizeImage } from "../utils/imageOptimizer";
import { SiteData, Guest, Wish } from "../types";
import { get, set } from 'idb-keyval'; // IndexedDB entegrasyonu

export const getSupabaseUrl = (): string => String(import.meta.env?.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");
export const getSupabaseKey = (): string => String(import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY || "").trim();

export const getSupabaseSetupMessage = (): string => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  if (!url || !key) return "Supabase bağlantısı eksik. .env.local içinde VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerleri olmalı.";
  return "Supabase bağlantısı kurulamadı. Project URL / anon key değerlerini kontrol et.";
};

export const getReadableAuthError = (error: any): string => {
  if (!error) return "Bilinmeyen bir hata oluştu.";
  const status = error?.status || error?.code;
  const message = String(error?.message || error?.name || "").toLocaleLowerCase("tr-TR");
  if (status === 400 && message.includes("invalid login")) return "E-posta veya şifre hatalı.";
  if (status === 429) return "Çok fazla deneme yapıldı. Birkaç dakika bekleyip tekrar deneyin.";
  return error?.message || "İşlem tamamlanamadı. Bağlantınızı kontrol edin.";
};

export const isSupabaseReady = (): boolean => Boolean(getSupabaseUrl() && getSupabaseKey());

export const fetchWithRetry = async <T>(fetchFn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchFn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1))); 
    }
  }
  throw new Error("Tüm denemeler başarısız oldu.");
};

export const loadSettingsFromDatabase = async (): Promise<SiteData | null> => {
  if (!isSupabaseReady()) return null;
  return fetchWithRetry(async () => {
    const { data, error } = await supabase.from("invitation_settings").select("content").eq("id", "main").single();
    if (error) throw error;
    return normalizeSiteData(data?.content || null) as SiteData;
  });
};

export const saveSettingsToDatabase = async (settings: SiteData): Promise<void> => {
  if (!isSupabaseReady()) throw new Error("Supabase ayarları eksik.");
  const { error } = await supabase.from("invitation_settings").upsert({ id: "main", content: settings as any, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
};

export const loadGuestsFromDatabase = async (): Promise<Guest[]> => {
  if (!isSupabaseReady()) return [];
  const { data, error } = await supabase.from("guests").select("*").order("created_at", { ascending: false }).limit(1000);
  if (error) return [];
  return (data || []).map(dbGuestToUi);
};

export const loadAllWishesFromDatabase = async (): Promise<Wish[]> => {
  if (!isSupabaseReady()) return [];
  const { data, error } = await supabase.from("wishes").select("*").order("created_at", { ascending: false }).limit(1000);
  if (error) return [];
  return (data || []).map(dbWishToUi);
};

export const loadPublishedWishesFromDatabase = async (): Promise<Wish[]> => {
  if (!isSupabaseReady()) return [];
  const { data, error } = await supabase.from("wishes").select("*").eq("approved", true).order("created_at", { ascending: false }).limit(1000);
  if (error) return [];
  return (data || []).map(dbWishToUi);
};

export const uploadMediaFile = async (rawFile: File, folder = "media"): Promise<string | null> => {
  if (!rawFile) return null;
  if (!isSupabaseReady()) throw new Error("Supabase ayarları eksik.");
  
  let fileToUpload: File | Blob = rawFile;
  if (folder === "images" || rawFile.type.startsWith("image/")) {
    try { fileToUpload = await optimizeImage(rawFile) as File | Blob; } catch (e) { }
  }

  const fileExt = rawFile.name.split(".").pop() || "file";
  const safeName = rawFile.name.replace(/\.[^/.]+$/, "").toLocaleLowerCase("tr-TR").replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/gi, "-").replace(/^-+\vert{}-+$/g, ""); 
  const fileName = `${folder}/${Date.now()}-${safeName || "upload"}.${fileExt}`;
  
  const { error } = await supabase.storage.from("wedding-media").upload(fileName, fileToUpload, { cacheControl: "3600", upsert: true, contentType: fileToUpload.type || undefined });
  if (error) throw error;
  
  const { data } = supabase.storage.from("wedding-media").getPublicUrl(fileName);
  return data.publicUrl;
};

export const uploadAndModerateGuestPhoto = async (rawFile: File): Promise<{ url: string | null, isApproved: boolean }> => {
  if (!isSupabaseReady()) throw new Error("Supabase ayarları eksik.");
  
  const url = await uploadMediaFile(rawFile, "guest_photos");
  if (!url) return { url: null, isApproved: false };

  try {
    const res = await supabase.functions.invoke('moderate-photo', {
      body: { imageUrl: url }
    });

    const isSafe = res?.data?.isSafe;
    await supabase.from('guest_photos').insert([{ image_url: url, approved: isSafe }]);
    return { url, isApproved: isSafe };
  } catch (err) {
    await supabase.from('guest_photos').insert([{ image_url: url, approved: false }]);
    return { url, isApproved: false };
  }
};

export const deleteMediaFile = async (fileUrl: string): Promise<void> => {
  if (!fileUrl || !isSupabaseReady() || !fileUrl.includes(".supabase.co")) return;
  try {
    const urlObj = new URL(fileUrl);
    const pathSegments = urlObj.pathname.split('/object/public/wedding-media/');
    if (pathSegments.length < 2) return;
    const filePath = decodeURIComponent(pathSegments[1]);
    const { error } = await supabase.storage.from("wedding-media").remove([filePath]);
    if (error) throw error;
  } catch (error) {
    const failedDeletes: string[] = (await get('failed_deletes')) || [];
    if (!failedDeletes.includes(fileUrl)) {
      failedDeletes.push(fileUrl);
      await set('failed_deletes', failedDeletes);
    }
  }
};

export const syncFailedDeletes = async (): Promise<void> => {
  const failedDeletes: string[] = (await get('failed_deletes')) || [];
  if (failedDeletes.length === 0 || !navigator.onLine) return;

  const remainingFails: string[] = [];
  
  for (const fileUrl of failedDeletes) {
    try {
      const urlObj = new URL(fileUrl);
      const pathSegments = urlObj.pathname.split('/object/public/wedding-media/');
      if (pathSegments.length < 2) continue;
      const filePath = decodeURIComponent(pathSegments[1]);
      const { error } = await supabase.storage.from("wedding-media").remove([filePath]);
      if (error) throw error;
    } catch (err) {
      remainingFails.push(fileUrl);
    }
  }
  
  await set('failed_deletes', remainingFails);
};

export const restoreBackupToDatabase = async (parsedData: any): Promise<void> => {
  if (!isSupabaseReady()) throw new Error("Supabase bağlantısı kurulamadı.");
  if (parsedData.siteData) await saveSettingsToDatabase(parsedData.siteData);
  if (parsedData.guests && parsedData.guests.length > 0) {
     await supabase.from("guests").delete().not("id", "is", null);
     const guestsToInsert = parsedData.guests.map(({ id, created_at, updated_at, ...rest }: any) => rest);
     await supabase.from("guests").insert(guestsToInsert);
  }
  if (parsedData.wishes && parsedData.wishes.length > 0) {
     await supabase.from("wishes").delete().not("id", "is", null);
     const wishesToInsert = parsedData.wishes.map(({ id, created_at, updated_at, ...rest }: any) => rest);
     await supabase.from("wishes").insert(wishesToInsert);
  }
};