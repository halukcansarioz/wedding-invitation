import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { amount, guestName, note } = await req.json();

    // TODO: Burada Iyzico veya PayTR API'sine istek atılarak bir Checkout URL oluşturulur.
    // Örnek Stripe/Iyzico Payload'u:
    /*
    const paymentSession = await fetch('https://api.iyzipay.com/v1/checkout', {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${Deno.env.get('PAYMENT_API_KEY')}` },
       body: JSON.stringify({ price: amount, buyerName: guestName, description: note })
    });
    */

    // Simülasyon: Başarılı ödeme linki döndürülüyor
    const mockPaymentUrl = `https://sandbox-checkout.iyzico.com/pay/${Date.now()}`;

    return new Response(JSON.stringify({ success: true, paymentUrl: mockPaymentUrl }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      headers: corsHeaders, status: 400 
    });
  }
});