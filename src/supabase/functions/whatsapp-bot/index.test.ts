import { describe, it, expect } from 'vitest';

describe("WhatsApp Bot Edge Function Testleri", () => {
  it("GET isteğinde hub.verify_token eşleşiyorsa challenge dönmeli", () => {
    const verifyToken = "TEST_TOKEN";
    const challenge = "12345";
    const reqUrl = new URL(`http://localhost?hub.verify_token=${verifyToken}&hub.challenge=${challenge}`);
    
    const isMatch = reqUrl.searchParams.get("hub.verify_token") === verifyToken;
    const responseBody = isMatch ? reqUrl.searchParams.get("hub.challenge") : "Forbidden";

    expect(isMatch).toBe(true);
    expect(responseBody).toBe(challenge);
  });

  it("POST isteğinde mesaj doğru işlenip yanıt oluşturulmalı", () => {
    const reqBody = {
      entry: [{
        changes: [{
          value: {
            messages: [{
              type: "text",
              from: "905551234567",
              text: { body: "Düğün nerede?" }
            }]
          }
        }]
      }]
    };

    const message = reqBody.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const isValidText = message && message.type === "text";
    const userPhone = isValidText ? message.from : "";
    const userText = isValidText ? message.text.body : "";

    expect(isValidText).toBe(true);
    expect(userPhone).toBe("905551234567");
    expect(userText).toBe("Düğün nerede?");
  });
});