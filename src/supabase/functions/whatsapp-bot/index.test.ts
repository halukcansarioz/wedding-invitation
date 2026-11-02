import { describe, expect, it } from "vitest";
import {
  buildSystemPrompt,
  DEFAULT_SYSTEM_PROMPT,
  extractTextMessage,
  getVerificationResponse,
} from "./helpers";

describe("WhatsApp Bot webhook yardımcıları", () => {
  describe("webhook doğrulama", () => {
    it("doğru token ile challenge ve 200 döndürür", () => {
      const url = new URL(
        "https://example.com?hub.verify_token=secret&hub.challenge=challenge-123"
      );

      expect(getVerificationResponse(url, "secret")).toEqual({
        body: "challenge-123",
        status: 200,
      });
    });

    it("yanlış token ile challenge sızdırmadan 403 döndürür", () => {
      const url = new URL(
        "https://example.com?hub.verify_token=wrong&hub.challenge=secret-challenge"
      );

      expect(getVerificationResponse(url, "secret")).toEqual({
        body: "Forbidden",
        status: 403,
      });
    });

    it("token tanımlı değilse eşleşen boş tokenı kabul etmez", () => {
      const url = new URL(
        "https://example.com?hub.verify_token=&hub.challenge=challenge"
      );

      expect(getVerificationResponse(url, undefined).status).toBe(403);
    });

    it("challenge parametresi yoksa başarılı yanıtta boş body döndürür", () => {
      const url = new URL("https://example.com?hub.verify_token=secret");

      expect(getVerificationResponse(url, "secret")).toEqual({
        body: "",
        status: 200,
      });
    });
  });

  describe("mesaj ayıklama", () => {
    it("geçerli text mesajından telefon ve metni çıkarır", () => {
      const message = extractTextMessage({
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      type: "text",
                      from: "905551234567",
                      text: { body: "Düğün nerede?" },
                    },
                  ],
                },
              },
            ],
          },
        ],
      });

      expect(message).toEqual({
        type: "text",
        from: "905551234567",
        text: { body: "Düğün nerede?" },
      });
    });

    it.each([
      ["null body", null],
      ["eksik entry", {}],
      ["boş entry", { entry: [] }],
      ["text olmayan mesaj", { entry: [{ changes: [{ value: { messages: [{ type: "image" }] } }] }] }],
      ["telefon olmayan mesaj", { entry: [{ changes: [{ value: { messages: [{ type: "text", text: { body: "Merhaba" } }] } }] }] }],
      ["metni olmayan mesaj", { entry: [{ changes: [{ value: { messages: [{ type: "text", from: "90555" }] } }] }] }],
      ["boş metin", { entry: [{ changes: [{ value: { messages: [{ type: "text", from: "90555", text: { body: "   " } }] } }] }] }],
    ])("%s için null döndürür", (_name, body) => {
      expect(extractTextMessage(body)).toBeNull();
    });

    it("ilk mesaj dışındaki ek mesajları yanlışlıkla işlemez", () => {
      const body = {
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    { type: "image", from: "90555" },
                    { type: "text", from: "90555", text: { body: "Merhaba" } },
                  ],
                },
              },
            ],
          },
        ],
      };

      expect(extractTextMessage(body)).toBeNull();
    });
  });

  describe("dinamik sistem promptu", () => {
    it("davetiye ve IBAN bilgilerini prompta ekler", () => {
      const prompt = buildSystemPrompt({
        invitation: {
          bride: "Ayşe",
          groom: "Mehmet",
          dateText: "12 Haziran 2027",
          timeText: "19:00",
          venue: "Lavanta Bahçesi",
          address: "İstanbul",
        },
        giftRegistry: { iban: "TR00 1234" },
      });

      expect(prompt).toContain("Ayşe ve Mehmet");
      expect(prompt).toContain("12 Haziran 2027");
      expect(prompt).toContain("19:00");
      expect(prompt).toContain("Lavanta Bahçesi, İstanbul");
      expect(prompt).toContain("TR00 1234");
      expect(prompt).toContain("Çocuk getirmek yasaktır");
    });

    it("site verisi yoksa güvenli varsayılan promptu kullanır", () => {
      expect(buildSystemPrompt(null)).toBe(DEFAULT_SYSTEM_PROMPT);
      expect(buildSystemPrompt(undefined)).toBe(DEFAULT_SYSTEM_PROMPT);
    });

    it("eksik alanlarda hata vermeden varsayılan metinleri kullanır", () => {
      const prompt = buildSystemPrompt({ invitation: { bride: "Elif" } });

      expect(prompt).toContain("Elif ve Damat");
      expect(prompt).toContain("Bilinmeyen Tarih");
      expect(prompt).toContain("Bilinmeyen Saat");
      expect(prompt).not.toContain("undefined");
    });

    it("geçersiz alan tiplerini prompta ham haliyle taşımaz", () => {
      const prompt = buildSystemPrompt({
        invitation: { bride: 42, groom: { name: "test" } },
        giftRegistry: { iban: ["TR00"] },
      });

      expect(prompt).toContain("Gelin ve Damat");
      expect(prompt).not.toContain("[object Object]");
      expect(prompt).not.toContain("TR00");
    });
  });
});
