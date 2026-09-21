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
  const dummyObj = {
    from: () => dummyObj,
    select: () => dummyObj,
    insert: () => dummyObj,
    update: () => dummyObj,
    eq: () => dummyObj,
    order: () => dummyObj,
    limit: () => dummyObj,
    single: () => dummyObj,
    not: () => dummyObj,
    delete: () => dummyObj,
    upsert: () => dummyObj,
    then: (cb) => cb({ data: null, error: { message: "Supabase eksik (Dev Modu)" } }),
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: null, error: { message: "Mock Client" } }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ error: null }),
      updateUser: async () => ({ error: null })
    },
    storage: {
      from: () => dummyObj,
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
      upload: async () => ({ data: null, error: { message: "Mock Upload" } }),
      remove: async () => ({ data: null, error: null })
    },
    channel: () => dummyObj,
    on: () => dummyObj,
    subscribe: () => dummyObj,
    removeChannel: () => {}
  };
  return dummyObj;
};

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabase();