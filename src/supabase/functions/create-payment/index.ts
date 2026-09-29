import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.14.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { data: isLimited, error: rateLimitError } = await supabaseAdmin.rpc('check_rate_limit', {
          client_ip: `create_payment_${ip}`,
          max_req: 10,
          window_seconds: 60
        });

        if (isLimited || rateLimitError) {
          return new Response(JSON.stringify({ success: false, error: "Çok fazla ödeme isteği oluşturuldu. Lütfen 1 dakika bekleyin." }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 
          });
        }
    }

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
      // YENİ EKLENDİ: Ödeme tamamlandığında veritabanına yazmak için gereken veriler
      metadata: {
        guestName: guestName || 'Bilinmeyen Misafir',
        note: note || ''
      }
    });

    return new Response(JSON.stringify({ success: true, paymentUrl: session.url }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      headers: corsHeaders, status: 400 
    });
  }
});