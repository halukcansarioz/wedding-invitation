export type WhatsAppTextMessage = {
  from: string;
  text: {
    body: string;
  };
  type: "text";
};

export const DEFAULT_SYSTEM_PROMPT =
  "Sen bir düğün asistanısın. Davetlilerin sorularına nazik, kısa ve samimi bir dille emoji kullanarak cevap ver.";

export function getVerificationResponse(
  url: URL,
  verifyToken: string | undefined
): { body: string; status: number } {
  if (url.searchParams.get("hub.verify_token") === verifyToken && verifyToken) {
    return {
      body: url.searchParams.get("hub.challenge") || "",
      status: 200,
    };
  }

  return { body: "Forbidden", status: 403 };
}

export function extractTextMessage(body: unknown): WhatsAppTextMessage | null {
  if (!body || typeof body !== "object") return null;

  const message = (body as {
    entry?: Array<{
      changes?: Array<{
        value?: {
          messages?: Array<{
            type?: unknown;
            from?: unknown;
            text?: { body?: unknown };
          }>;
        };
      }>;
    }>;
  }).entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (
    message?.type !== "text" ||
    typeof message.from !== "string" ||
    !message.from ||
    typeof message.text?.body !== "string" ||
    !message.text.body.trim()
  ) {
    return null;
  }

  return {
    type: "text",
    from: message.from,
    text: { body: message.text.body },
  };
}

export function buildSystemPrompt(siteData: unknown): string {
  if (!siteData || typeof siteData !== "object") return DEFAULT_SYSTEM_PROMPT;

  const data = siteData as {
    invitation?: {
      bride?: unknown;
      groom?: unknown;
      dateText?: unknown;
      timeText?: unknown;
      venue?: unknown;
      address?: unknown;
    };
    giftRegistry?: { iban?: unknown };
  };
  const invitation = data.invitation || {};
  const text = (value: unknown, fallback = "") =>
    typeof value === "string" ? value : fallback;

  return `Sen ${text(invitation.bride, "Gelin")} ve ${text(invitation.groom, "Damat")}'un düğün asistanısın. Düğün tarihi ${text(invitation.dateText, "Bilinmeyen Tarih")} saat ${text(invitation.timeText, "Bilinmeyen Saat")}'da. Adres: ${text(invitation.venue)}, ${text(invitation.address)}. Çocuk getirmek yasaktır, sadece yetişkinler. Takı/hediye için IBAN: ${text(data.giftRegistry?.iban)}. Davetlilerin sorularına nazik, kısa ve samimi bir dille emoji kullanarak cevap ver.`;
}
