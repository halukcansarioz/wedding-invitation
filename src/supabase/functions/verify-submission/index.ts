import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const payload = await req.json()
    const guest = payload.record;

    if (!guest || guest.attendance !== "Katılacağım") {
      return new Response("Email gönderilmedi (Katılmıyor veya test isteği).", { status: 200 })
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
        to: ['senin-kendi-epostan@gmail.com'], // KENDI MAIL ADRESINI YAZ
        subject: `Yeni LCV: ${guest.name} Düğüne Katılıyor! 🎉`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #fffafb; border: 1px solid #9f4f68; border-radius: 12px;">
            <h2 style="color: #9f4f68;">Yeni Bir Misafir Katılımı Onayladı!</h2>
            <p><strong>Ad Soyad:</strong> ${guest.name}</p>
            <p><strong>Telefon:</strong> ${guest.phone || 'Belirtilmedi'}</p>
            <p><strong>Kişi Sayısı:</strong> ${guest.person_count}</p>
            <p><strong>Taraf:</strong> ${guest.side}</p>
            <p><strong>Not:</strong> ${guest.note || '-'}</p>
            <hr style="border: none; border-top: 1px solid #eee;" />
            <a href="https://senin-site-linkin.com/admin" style="display:inline-block; margin-top: 10px; padding: 10px 20px; background: #9f4f68; color: white; text-decoration: none; border-radius: 8px;">Admin Paneline Git</a>
          </div>
        `
      })
    })

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Resend Hatası: Status ${res.status}`);
      return new Response("E-posta gönderilemedi fakat kayıt başarılı.", { status: 200 });
    }

    return new Response(JSON.stringify({ success: true, message: "E-posta başarıyla gönderildi" }), { status: 200 })

  } catch (err) {
    console.error("Webhook İşleme Hatası:", err.message);
    return new Response("İşlem tamamlandı, e-posta yoksayıldı.", { status: 200 })
  }
})