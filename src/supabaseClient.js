import { createClient } from "@supabase/supabase-js";

const supabaseUrl = String(import.meta.env?.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = String(
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
    import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
    ""
).trim();

if (import.meta.env?.PROD && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error("Kritik Hata: Supabase ortam değişkenleri eksik! Uygulama başlatılamıyor.");
}

// Konsol hatalarını ve başarısız ağ isteklerini önleyen mock/proxy obje
const createMockSupabase = () => {
  const warnDev = (method) => {
    console.warn(`[Supabase Mock Uyarı]: ${method} çalıştırıldı. Çevresel değişkenler eksik olduğu için veritabanı işlemi yapılmadı.`);
    return dummyObj;
  };

  const dummyObj = {
    from: () => warnDev('from()'),
    select: () => warnDev('select()'),
    insert: () => warnDev('insert()'),
    update: () => warnDev('update()'),
    eq: () => warnDev('eq()'),
    order: () => warnDev('order()'),
    limit: () => warnDev('limit()'),
    single: () => warnDev('single()'),
    not: () => warnDev('not()'),
    delete: () => warnDev('delete()'),
    upsert: () => warnDev('upsert()'),
    then: (cb) => cb({ data: null, error: { message: "Supabase eksik (Dev Modu)" } }),
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => {
        console.warn("[Supabase Mock Uyarı]: signInWithPassword çağrıldı.");
        return { data: null, error: { message: "Supabase Env bilgileri eksik. Gerçek giriş yapılamaz." } };
      },
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ error: null }),
      updateUser: async () => ({ error: null })
    },
    storage: {
      from: () => warnDev('storage.from()'),
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
      upload: async () => {
        console.warn("[Supabase Mock Uyarı]: Dosya yükleme işlemi simüle edildi.");
        return { data: null, error: { message: "Mock Upload" } };
      },
      remove: async () => ({ data: null, error: null })
    },
    channel: () => warnDev('channel()'),
    on: () => warnDev('on()'),
    subscribe: () => warnDev('subscribe()'),
    removeChannel: () => {}
  };
  return dummyObj;
};

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabase();