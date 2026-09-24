import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import webpush from "npm:web-push@3.6.7"; // NPM paketini Deno içine alıyoruz

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { title, body, url } = await req.json();

    // VAPID Ayarlarını Tanımla
    webpush.setVapidDetails(
      'mailto:sizin-emailiniz@gmail.com', // Kendi e-postanızı yazın
      Deno.env.get('VAPID_PUBLIC_KEY')!, // Public key'i de Supabase Secrets'a eklemeyi unutmayın
      Deno.env.get('VAPID_PRIVATE_KEY')!
    );

    // Supabase bağlantısını kur ve veritabanındaki abonelikleri çek
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: subscriptions } = await supabaseAdmin.from('push_subscriptions').select('sub_data');

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: "Kayıtlı abone bulunamadı." }), { status: 200, headers: corsHeaders });
    }

    // Gönderilecek Mesajın İçeriği
    const payload = JSON.stringify({ title, body, url });

    // Tüm abonelere sırayla bildirimi fırlat
    const sendPromises = subscriptions.map((sub) => 
      webpush.sendNotification(sub.sub_data, payload).catch(error => {
        console.error("Bir aboneye bildirim gitmedi (belki abonelikten çıktı):", error);
      })
    );

    await Promise.all(sendPromises);

    return new Response(JSON.stringify({ success: true, count: subscriptions.length }), { headers: corsHeaders, status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 400 });
  }
});