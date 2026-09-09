import { createClient } from "@supabase/supabase-js";

const supabaseUrl = String(import.meta.env?.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = String(
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
    import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
    ""
).trim();

// Canlı (Production) ortamdaysak ve key eksikse uygulamayı durdur (Fail-fast mekanizması)
if (import.meta.env?.PROD && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error("Kritik Hata: Supabase ortam değişkenleri eksik! Uygulama başlatılamıyor. Lütfen VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerlerini kontrol edin.");
}

// Env eksikken uygulama geliştirme (dev) ortamında komple çökmesin diye geçici placeholder kullanılır.
// Asıl kontrol App.jsx içinde isSupabaseReady() ile yapılıyor.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);