import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// E-posta gönderimi için ücretsiz Resend.com API'sini kullanacağız
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const payload = await req.json()
    
    // Supabase Webhook payload'ı (yeni eklenen misafir 'record' içinde gelir)
    const guest = payload.record;

    // Sadece "Katılacağım" diyenler için mail atsın
    if (!guest || guest.attendance !== "Katılacağım") {
      return new Response("Email gönderilmedi (Katılmıyor veya test isteği).", { status: 200 })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Düğün Davetiyesi <onboarding@resend.dev>', // Resend'in varsayılan test adresi
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

    if (res.ok) {
      return new Response(JSON.stringify({ success: true, message: "E-posta başarıyla gönderildi" }), { status: 200 })
    } else {
      const errorInfo = await res.text()
      return new Response(`Resend API Hatası: ${errorInfo}`, { status: 400 })
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})