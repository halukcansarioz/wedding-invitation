import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.14.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (request) => {
  const signature = request.headers.get('Stripe-Signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    return new Response('Webhook secret veya imza eksik.', { status: 400 });
  }

  try {
    const body = await request.text();
    // Stripe imzasını doğrula (Güvenlik)
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Sadece başarılı ödeme (checkout tamamlanması) olayını dinliyoruz
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const guestName = session.metadata?.guestName || 'Bilinmeyen Misafir';
      const note = session.metadata?.note || '';
      const amount = session.amount_total ? session.amount_total / 100 : 0; // Kuruştan TL'ye çevir

      // Veritabanına Başarılı Ödemeyi Kaydet
      const { error } = await supabaseAdmin.from('payments').insert([{
        guest_name: guestName,
        amount: amount,
        currency: session.currency?.toUpperCase() || 'TRY',
        stripe_session_id: session.id,
        status: 'completed',
        note: note
      }]);

      if (error) {
        console.error("Ödeme veritabanına kaydedilirken hata:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});