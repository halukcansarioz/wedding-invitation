import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.14.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { amount, guestName, note } = await req.json();
    const origin = req.headers.get('origin') || 'http://localhost:5173';

    if (!Deno.env.get('STRIPE_SECRET_KEY')) {
       throw new Error("Stripe Secret Key ortam değişkenlerinde eksik.");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'try',
            product_data: {
              name: 'Düğün Hediyesi',
              description: `${guestName} tarafından gönderilen hediye. Not: ${note}`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/?payment=cancel`,
    });

    return new Response(JSON.stringify({ success: true, paymentUrl: session.url }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      headers: corsHeaders, status: 400 
    });
  }
});