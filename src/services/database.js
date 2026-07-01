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
  const message = String(error?.message || error?.name || "").toLocaleLowerCase("tr-TR");
  const code = String(error?.code || error?.status || "").toLocaleLowerCase("tr-TR");
  if (message.includes("failed to fetch") || message.includes("network") || message.includes("load failed") || error?.name === "AuthRetryableFetchError") return getSupabaseSetupMessage();
  if (message.includes("invalid login") || message.includes("invalid credentials")) return "E-posta veya şifre hatalı. Supabase Authentication > Users bölümünde oluşturduğun admin e-posta/şifresiyle giriş yapmalısın.";
  if (message.includes("email not confirmed") || message.includes("not confirmed")) return "Bu e-posta henüz doğrulanmamış. Supabase Authentication > Users bölümünden kullanıcıyı Confirm et.";
  if (message.includes("rate limit") || code === "429") return "Çok fazla deneme yapıldı. Birkaç dakika bekleyip tekrar dene.";
  if (message.includes("redirect") || message.includes("url")) return "Şifre sıfırlama yönlendirme adresi kabul edilmedi. Supabase > Authentication > URL Configuration bölümüne localhost ve canlı site adresini eklemelisin.";
  return error?.message || "İşlem tamamlanamadı. Supabase ayarlarını kontrol et.";
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