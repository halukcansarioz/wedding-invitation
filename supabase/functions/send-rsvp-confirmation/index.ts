// Supabase Edge Runtime bu JSR modülünü çözer; normal TypeScript sunucusu çözemez.
// @ts-ignore Deno/JSR import'u Supabase Edge Runtime tarafından sağlanır.
import { serve } from "jsr:@std/http/server"

// Supabase panelinden ekleyeceğimiz Resend API anahtarı
const denoRuntime = (globalThis as typeof globalThis & {
  Deno: { env: { get(name: string): string | undefined } }
}).Deno
const RESEND_API_KEY = denoRuntime.env.get('RESEND_API_KEY')

type RsvpGuest = {
  email?: string
  firstName?: string
  isAttending?: boolean
}

type WebhookPayload = {
  record?: RsvpGuest
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

serve(async (req: Request) => {
  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY ortam değişkeni tanımlanmamış.')
    }

    // Supabase Webhook'tan gelen yeni kayıt verisini al
    const payload = await req.json() as WebhookPayload
    const guest = payload.record

    // Misafir e-posta adresi girmemişse işlemi durdur
    if (!guest?.email) {
      return new Response("E-posta adresi yok, atlandı.", { status: 200 })
    }

    // Resend üzerinden onay maili gönder
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Davetiye <onboarding@resend.dev>', // Kendi onaylı domainin varsa buraya yaz
        to: [guest.email],
        subject: 'LCV Onayınız Alındı! 🥂',
        html: `
          <h2>Merhaba ${guest.firstName},</h2>
          <p>LCV formunu doldurduğun için teşekkür ederiz.</p>
          <p><strong>Katılım Durumun:</strong> ${guest.isAttending ? 'Katılıyorum 🎉' : 'Katılamıyorum 😔'}</p>
          ${guest.isAttending ? '<p>07 Ağustos 2027 saat 19:00\'da görüşmek üzere!</p>' : '<p>Aramızda olamayacağın için üzgünüz.</p>'}
        `
      })
    })

    const data = await res.json()
    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})