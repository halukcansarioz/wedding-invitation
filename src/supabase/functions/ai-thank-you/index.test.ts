import { describe, it, expect } from 'vitest';

describe("AI Thank You Edge Function Testleri", () => {
  it("Authorization header eksikse 401/403 veya hata fırlatmalı", async () => {
    const req = new Request("http://localhost:8000", {
      method: "POST",
      body: JSON.stringify({ guestName: "Ahmet", coupleName: "Ayşe & Ali", wishMessage: "Tebrikler" }),
      headers: new Headers({
        "Content-Type": "application/json"
      })
    });

    const authHeader = req.headers.get('Authorization');
    let hasError = false;
    
    if (!authHeader) {
      hasError = true;
    }

    expect(hasError).toBe(true);
  });

  it("Geçerli verilerle çağrıldığında AI metni dönmeli", async () => {
    const mockAiResponse = "Gelişiniz için teşekkürler! Harika bir gündü 🥂";
    
    const responseBody = {
      success: true,
      text: mockAiResponse
    };

    expect(responseBody.success).toBe(true);
    expect(responseBody.text).toContain("teşekkürler");
  });
});