const DEFAULT_ALLOWED_ORIGINS = [
  "https://wedding-invitation-halook.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
];

function getAllowedOrigins(): string[] {
  const configured = (globalThis as typeof globalThis & {
    Deno?: { env: { get(name: string): string | undefined } };
  }).Deno?.env.get("ALLOWED_ORIGINS");
  return (configured ? configured.split(",") : DEFAULT_ALLOWED_ORIGINS)
    .map((origin: string) => origin.trim())
    .filter(Boolean);
}

export function getCorsHeaders(request: Request, methods = "GET, POST, OPTIONS"): HeadersInit {
  const origin = request.headers.get("origin");
  const allowedOrigins = getAllowedOrigins();
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : null;

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }

  return headers;
}
