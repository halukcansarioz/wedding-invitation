import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
// Supabase Dashboard -> Edge Functions -> Secrets sekmesinden ADMIN_EMAIL eklenmeli
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL'); 

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

    if (!res.ok) return new Response("E-posta gönderilemedi fakat kayıt başarılı.", { status: 200 });
    return new Response(JSON.stringify({ success: true, message: "E-posta başarıyla gönderildi" }), { status: 200 })

  } catch (err) {
    return new Response("İşlem tamamlandı, e-posta yoksayıldı.", { status: 200 })
  }
})