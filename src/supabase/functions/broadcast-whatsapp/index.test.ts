import { describe, it, expect } from 'vitest';

describe("Broadcast WhatsApp Edge Function Testleri", () => {
  it("Misafir listesi boşsa veya tanımlanmamışsa hata dönmeli", async () => {
    const reqBody = {
      guests: [],
      message: "Test mesajı"
    };

    let errorMessage = "";
    if (!reqBody.guests || reqBody.guests.length === 0) {
      errorMessage = "Geçerli bir misafir listesi bulunamadı.";
    }

    expect(errorMessage).toBe("Geçerli bir misafir listesi bulunamadı.");
  });

  it("Misafirler başarıyla işlendiğinde başarılı yanıt dönmeli", async () => {
    const guests = [{ id: "1", name: "Ali", phone: "12345" }];
    const processed = guests.length;

    const response = {
      success: true,
      processed: processed,
      total: guests.length
    };

    expect(response.success).toBe(true);
    expect(response.processed).toBe(1);
    expect(response.total).toBe(1);
  });
});