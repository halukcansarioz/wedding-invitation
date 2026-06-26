import { supabase } from "../supabaseClient";
import { mergeSiteData } from "../utils/storage";

export const getSupabaseUrl = () =>
  String(import.meta.env?.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");

export const getSupabaseKey = () =>
  String(
    import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env?.VITE_SUPABASE_ANON_KEY ||
      ""
  ).trim();

export const getSupabaseSetupMessage = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  if (!url || !key) {
    return "Supabase bağlantısı eksik. .env.local içinde VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerleri olmalı. Dosyayı değiştirdikten sonra npm run dev sunucusunu kapatıp yeniden aç.";
  }

  if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
    return "Supabase URL hatalı görünüyor. Dashboard linki değil, Project Settings > API kısmındaki Project URL kullanılmalı. Örnek: https://abcxyz.supabase.co";
  }

  return "Supabase bağlantısı kurulamadı. Project URL / anon key değerlerini, internet bağlantını ve Supabase projesinin aktif olduğunu kontrol et.";
};

export const getReadableAuthError = (error) => {
  const message = String(error?.message || error?.name || "").toLocaleLowerCase("tr-TR");
  const code = String(error?.code || error?.status || "").toLocaleLowerCase("tr-TR");

  if (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("load failed") ||
    message.includes("fetcherror") ||
    error?.name === "AuthRetryableFetchError"
  ) {
    return getSupabaseSetupMessage();
  }

  if (message.includes("invalid login") || message.includes("invalid credentials")) {
    return "E-posta veya şifre hatalı. 1234 artık geçerli değil; Supabase Authentication > Users bölümünde oluşturduğun admin e-posta/şifresiyle giriş yapmalısın. Kullanıcıyı manuel oluşturduysan Confirm edilmiş olduğundan emin ol.";
  }

  if (message.includes("email not confirmed") || message.includes("not confirmed")) {
    return "Bu e-posta henüz doğrulanmamış. Supabase Authentication > Users bölümünden kullanıcıyı Confirm et veya e-posta doğrulamasını tamamla.";
  }

  if (message.includes("email rate limit") || message.includes("rate limit") || code === "429") {
    return "Çok fazla deneme yapıldı. Birkaç dakika bekleyip tekrar dene.";
  }

  if (message.includes("redirect") || message.includes("url")) {
    return "Şifre sıfırlama yönlendirme adresi kabul edilmedi. Supabase > Authentication > URL Configuration bölümüne localhost ve canlı site adresini eklemelisin.";
  }

  return error?.message || "İşlem tamamlanamadı. Supabase ayarlarını kontrol et.";
};

export const isSupabaseReady = () => Boolean(getSupabaseUrl() && getSupabaseKey());

export const loadSettingsFromDatabase = async () => {
  if (!isSupabaseReady()) return null;

  const { data, error } = await supabase
    .from("invitation_settings")
    .select("content")
    .eq("id", "main")
    .single();

  if (error) {
    console.error("Ayarlar Supabase'den alınamadı:", error);
    return null;
  }

  return mergeSiteData(data?.content || null);
};

export const saveSettingsToDatabase = async (settings) => {
  if (!isSupabaseReady()) {
    throw new Error("Supabase ayarları eksik. .env.local dosyasını kontrol et.");
  }

  const { error } = await supabase
    .from("invitation_settings")
    .update({
      content: settings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "main");

  if (error) {
    throw error;
  }
};

export const dbGuestToUi = (guest) => ({
  id: guest.id,
  name: guest.name || "",
  phone: guest.phone || "",
  attendance: guest.attendance || "Katılacağım",
  personCount: String(guest.person_count ?? guest.personCount ?? "1"),
  side: guest.side || "Gelin Tarafı",
  hasChild: guest.has_child ?? guest.hasChild ?? "Hayır",
  note: guest.note || "",
  createdAt: guest.created_at || guest.createdAt || "",
});

export const uiGuestToDb = (guest) => ({
  name: guest.name || "",
  phone: guest.phone || "",
  attendance: guest.attendance || "Katılacağım",
  person_count: String(guest.personCount ?? guest.person_count ?? "1"),
  side: guest.side || "Gelin Tarafı",
  has_child: guest.hasChild ?? guest.has_child ?? "Hayır",
  note: guest.note || "",
});

export const dbWishToUi = (wish) => ({
  id: wish.id,
  name: wish.name || "",
  message: wish.message || "",
  approved: wish.approved !== false,
  createdAt: wish.created_at || wish.createdAt || "",
});

export const uiWishToDb = (wish) => ({
  name: wish.name || "",
  message: wish.message || "",
  approved: wish.approved !== false,
});

export const loadPublishedWishesFromDatabase = async () => {
  if (!isSupabaseReady()) return [];

  const { data, error } = await supabase
    .from("wishes")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Yayındaki anı defteri mesajları alınamadı:", error);
    return [];
  }

  return (data || []).map(dbWishToUi);
};

export const loadGuestsFromDatabase = async () => {
  if (!isSupabaseReady()) return [];

  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Katılım kayıtları alınamadı:", error);
    return [];
  }

  return (data || []).map(dbGuestToUi);
};

export const loadAllWishesFromDatabase = async () => {
  if (!isSupabaseReady()) return [];

  const { data, error } = await supabase
    .from("wishes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Anı defteri mesajları alınamadı:", error);
    return [];
  }

  return (data || []).map(dbWishToUi);
};

export const uploadMediaFile = async (file, folder = "media") => {
  if (!file) return null;

  if (!isSupabaseReady()) {
    throw new Error("Supabase ayarları eksik. Dosya yüklemek için .env.local dosyasını kontrol et.");
  }

  const fileExt = file.name.split(".").pop() || "file";
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  const fileName = `${folder}/${Date.now()}-${safeName || "upload"}.${fileExt}`;

  const { error } = await supabase.storage
    .from("wedding-media")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || undefined,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("wedding-media").getPublicUrl(fileName);
  return data.publicUrl;
}