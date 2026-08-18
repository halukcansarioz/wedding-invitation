import { supabase } from "../supabaseClient";
import { normalizeSiteData, dbGuestToUi, dbWishToUi } from "../utils/helpers";

export const getSupabaseUrl = () => String(import.meta.env?.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");
export const getSupabaseKey = () => String(import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY || "").trim();

export const getSupabaseSetupMessage = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  if (!url || !key) return "Supabase bağlantısı eksik. .env.local içinde VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerleri olmalı. Dosyayı değiştirdikten sonra npm run dev sunucusunu kapatıp yeniden aç.";
  if (!url.startsWith("https://") || !url.includes(".supabase.co")) return "Supabase URL hatalı görünüyor. Dashboard linki değil, Project Settings > API kısmındaki Project URL kullanılmalı.";
  return "Supabase bağlantısı kurulamadı. Project URL / anon key değerlerini, internet bağlantını ve Supabase projesinin aktif olduğunu kontrol et.";
};

export const getReadableAuthError = (error) => {
  if (!error) return "Bilinmeyen bir hata oluştu.";

  const status = error?.status || error?.code;
  const message = String(error?.message || error?.name || "").toLocaleLowerCase("tr-TR");

  // HTTP ve Supabase özel durum kodlarına göre kesin yakalama
  if (status === 400 && message.includes("invalid login")) return "E-posta veya şifre hatalı. Supabase Authentication > Users bölümünde oluşturduğunuz admin e-posta/şifresiyle giriş yapmalısınız.";
  if (status === 429) return "Çok fazla deneme yapıldı. Güvenlik nedeniyle birkaç dakika bekleyip tekrar deneyin.";
  if (status === 401 && message.includes("email not confirmed")) return "Bu e-posta henüz doğrulanmamış. Supabase Authentication kısmından hesabınızı doğrulayın.";
  if (status === 404 || message.includes("not found")) return "Kayıt bulunamadı. Silinmiş veya taşınmış olabilir.";
  if (error?.name === "AuthApiError" && message.includes("url")) return "Yönlendirme hatası. Supabase > Authentication > URL Configuration bölümüne localhost ve canlı site adresini eklemelisiniz.";
  
  // Ağ (Network) Hataları
  if (message.includes("failed to fetch") || message.includes("network") || error?.name === "AuthRetryableFetchError") {
     return getSupabaseSetupMessage();
  }

  return error?.message || "İşlem tamamlanamadı. Lütfen internet bağlantınızı ve Supabase ayarlarını kontrol edin.";
};

export const isSupabaseReady = () => Boolean(getSupabaseUrl() && getSupabaseKey());

export const loadSettingsFromDatabase = async () => {
  if (!isSupabaseReady()) return null;
  const { data, error } = await supabase.from("invitation_settings").select("content").eq("id", "main").single();
  if (error) { console.error("Ayarlar Supabase'den alınamadı:", error); return null; }
  return normalizeSiteData(data?.content || null);
};

export const saveSettingsToDatabase = async (settings) => {
  if (!isSupabaseReady()) throw new Error("Supabase ayarları eksik. .env.local dosyasını kontrol et.");
  const { error } = await supabase.from("invitation_settings").upsert({ id: "main", content: settings, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
};

export const loadPublishedWishesFromDatabase = async () => {
  if (!isSupabaseReady()) return [];
  const { data, error } = await supabase.from("wishes").select("*").eq("approved", true).order("created_at", { ascending: false });
  if (error) { console.error("Yayındaki anı defteri mesajları alınamadı:", error); return []; }
  return (data || []).map(dbWishToUi);
};

export const loadGuestsFromDatabase = async () => {
  if (!isSupabaseReady()) return [];
  const { data, error } = await supabase.from("guests").select("*").order("created_at", { ascending: false });
  if (error) { console.error("Katılım kayıtları alınamadı:", error); return []; }
  return (data || []).map(dbGuestToUi);
};

export const loadAllWishesFromDatabase = async () => {
  if (!isSupabaseReady()) return [];
  const { data, error } = await supabase.from("wishes").select("*").order("created_at", { ascending: false });
  if (error) { console.error("Anı defteri mesajları alınamadı:", error); return []; }
  return (data || []).map(dbWishToUi);
};

export const uploadMediaFile = async (file, folder = "media") => {
  if (!file) return null;
  if (!isSupabaseReady()) throw new Error("Supabase ayarları eksik. Dosya yüklemek için .env.local dosyasını kontrol et.");
  const fileExt = file.name.split(".").pop() || "file";
  const safeName = file.name.replace(/\.[^/.]+$/, "").toLocaleLowerCase("tr-TR").replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/gi, "-").replace(/^-+|-+$/g, "");
  const fileName = `${folder}/${Date.now()}-${safeName || "upload"}.${fileExt}`;
  const { error } = await supabase.storage.from("wedding-media").upload(fileName, file, { cacheControl: "3600", upsert: true, contentType: file.type || undefined });
  if (error) {
    const message = String(error.message || "").toLocaleLowerCase("tr-TR");
    if (message.includes("bucket") || message.includes("not found")) throw new Error("Görsel/müzik yüklenemedi. Supabase Storage içinde wedding-media adlı public bucket oluşturmalısın.");
    if (message.includes("row-level security") || message.includes("policy") || message.includes("permission")) throw new Error("Görsel/müzik yüklenemedi. wedding-media Storage bucket için authenticated policy eksik.");
    throw error;
  }
  const { data } = supabase.storage.from("wedding-media").getPublicUrl(fileName);
  return data.publicUrl;
};

export const deleteMediaFile = async (fileUrl) => {
  if (!fileUrl || !isSupabaseReady() || !fileUrl.includes(".supabase.co")) return;
  try {
    const urlObj = new URL(fileUrl);
    const pathSegments = urlObj.pathname.split('/object/public/wedding-media/');
    if (pathSegments.length < 2) return;
    const filePath = decodeURIComponent(pathSegments[1]);

    // Temaların varsayılan medyalarını yanlışlıkla silmemek için koruma
    if (filePath.startsWith("media/Rose") || filePath.startsWith("media/Sage") || filePath.startsWith("media/Gold") || filePath.startsWith("media/Burgundy") || filePath.startsWith("media/Lavanta") || filePath.startsWith("media/Minimal") || filePath.startsWith("media/Dark")) return;

    await supabase.storage.from("wedding-media").remove([filePath]);
  } catch (error) {
    console.error("Dosya silinirken hata:", error);
  }
};

export const restoreBackupToDatabase = async (parsedData) => {
  if (!isSupabaseReady()) throw new Error("Supabase bağlantısı kurulamadı.");
  
  if (parsedData.siteData) {
     await saveSettingsToDatabase(parsedData.siteData);
  }
  
  if (parsedData.guests && parsedData.guests.length > 0) {
     await supabase.from("guests").delete().not("id", "is", null);
     const guestsToInsert = parsedData.guests.map(({ id, created_at, updated_at, ...rest }) => rest);
     await supabase.from("guests").insert(guestsToInsert);
  }
  
  if (parsedData.wishes && parsedData.wishes.length > 0) {
     await supabase.from("wishes").delete().not("id", "is", null);
     const wishesToInsert = parsedData.wishes.map(({ id, created_at, updated_at, ...rest }) => rest);
     await supabase.from("wishes").insert(wishesToInsert);
  }
};