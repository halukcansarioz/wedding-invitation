import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL'); 
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Başarısız işlemleri veritabanına loglayan yardımcı fonksiyon
async function logFailedEmail(guestId: string, guestName: string, errorMsg: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  await supabaseAdmin.from('email_logs').insert([{
    guest_id: guestId,
    guest_name: guestName,
    status: 'failed',
    error_message: errorMsg
  }]);
}

serve(async (req) => {
  try {
    const payload = await req.json()
    const guest = payload.record;

    if (!guest || guest.attendance !== "Katılacağım" || !ADMIN_EMAIL) {
      return new Response("Email gönderilmedi (Katılmıyor, test isteği veya admin email eksik).", { status: 200 })
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        from: 'Düğün Davetiyesi <onboarding@resend.dev>', 
        to: [ADMIN_EMAIL], 
        subject: `Yeni LCV: ${guest.name} Düğüne Katılıyor! 🎉`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #fffafb; border: 1px solid #9f4f68; border-radius: 12px;">
            <h2 style="color: #9f4f68;">Yeni Bir Misafir Katılımı Onayladı!</h2>
            <p><strong>Ad Soyad:</strong> ${guest.name}</p>
            <p><strong>Telefon:</strong> ${guest.phone || 'Belirtilmedi'}</p>
            <p><strong>Kişi Sayısı:</strong> ${guest.person_count}</p>
            <p><strong>Taraf:</strong> ${guest.side}</p>
            <p><strong>Not:</strong> ${guest.note || '-'}</p>
          </div>
        `
      })
    })

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      await logFailedEmail(guest.id, guest.name, `Resend API Error: ${res.status} - ${errorText}`);
      return new Response("E-posta gönderilemedi fakat hata loglandı.", { status: 200 });
    }
    
    return new Response(JSON.stringify({ success: true, message: "E-posta başarıyla gönderildi" }), { status: 200 })

  } catch (err: any) {
    // Timeout veya Network hatası durumunda catch bloğu çalışır
    const payload = await req.json().catch(() => null);
    if (payload?.record) {
      await logFailedEmail(payload.record.id, payload.record.name, err.message || "Timeout / Network Error");
    }
    return new Response("İşlem tamamlandı, e-posta hatası loglandı.", { status: 200 })
  }
})