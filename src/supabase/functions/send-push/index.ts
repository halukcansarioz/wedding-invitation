import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import webpush from "npm:web-push@3.6.7"; 

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Eksik yetkilendirme başlığı (Authorization header).");

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Geçersiz veya süresi dolmuş oturum.");

    const { title, body, url } = await req.json();

    webpush.setVapidDetails(
      'mailto:sizin-emailiniz@gmail.com', 
      Deno.env.get('VAPID_PUBLIC_KEY')!, 
      Deno.env.get('VAPID_PRIVATE_KEY')!
    );

    const supabaseAdmin = createClient(
      SUPABASE_URL, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: subscriptions } = await supabaseAdmin.from('push_subscriptions').select('sub_data');

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: "Kayıtlı abone bulunamadı." }), { status: 200, headers: corsHeaders });
    }

    const payload = JSON.stringify({ title, body, url });

    const sendPromises = subscriptions.map((sub) => 
      webpush.sendNotification(sub.sub_data, payload).catch(error => {
        console.error("Bir aboneye bildirim gitmedi (belki abonelikten çıktı):", error);
      })
    );

    await Promise.all(sendPromises);

    return new Response(JSON.stringify({ success: true, count: subscriptions.length }), { headers: corsHeaders, status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 400 });
  }
});