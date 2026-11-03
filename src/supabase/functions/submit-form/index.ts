// @ts-ignore The Supabase Edge Runtime provides the Deno/JSR module at deployment time.
import { serve } from "jsr:@std/http/server";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { buildSubmitPayload } from "./payload.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count += 1;
  return false;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req, "POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown-ip";

    if (isRateLimited(clientIp)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Çok fazla istek gönderdiniz. Lütfen 1 dakika bekleyip tekrar deneyin.",
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, data, turnstileToken, tenantId } = await req.json();
    if (data?.honeypot) {
      return new Response(JSON.stringify({ success: false, error: "Spam tespit edildi." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const TURNSTILE_SECRET_KEY = Deno.env.get("TURNSTILE_SECRET_KEY");
    const allowTestBypass = Deno.env.get("ALLOW_TEST_BYPASS") === "true";
    const isBypassToken =
      allowTestBypass &&
      (turnstileToken === "OFFLINE_SYNC" || turnstileToken === "e2e-bypass-token");

    if (TURNSTILE_SECRET_KEY && !isBypassToken) {
      const formData = new FormData();
      formData.append("secret", TURNSTILE_SECRET_KEY);
      formData.append("response", turnstileToken || "");
      formData.append("remoteip", clientIp);

      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: formData,
      });
      const verifyOutcome = await verifyRes.json();

      if (!verifyOutcome.success) {
        return new Response(
          JSON.stringify({ success: false, error: "Güvenlik doğrulaması (Turnstile) başarısız." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return new Response(JSON.stringify({ success: false, error: "Geçersiz veri." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tableName = type === "guest" ? "guests" : type === "wish" ? "wishes" : null;
    if (!tableName) {
      return new Response(JSON.stringify({ success: false, error: "Geçersiz form tipi." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanData = buildSubmitPayload(type, data, tenantId);

    if (tableName === "wishes") {
      const settingsQuery = supabaseAdmin
        .from("invitation_settings")
        .select("content")
        .eq("id", typeof tenantId === "string" ? tenantId : "main")
        .maybeSingle();
      const { data: settingsRow } = await settingsQuery;
      const requiresApproval = settingsRow?.content?.settings?.requireWishApproval === true;
      cleanData.approved = !requiresApproval;
    }

    const { data: inserted, error: dbError } = await supabaseAdmin
      .from(tableName)
      .insert([cleanData])
      .select()
      .single();

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ success: true, data: inserted }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
