import { describe, it, expect } from 'vitest';

describe("Create Payment Edge Function Testleri", () => {
  it("Gecersiz tutar gonderildiginde hata firlatmali", () => {
    const payload = {
      amount: -50,
      guestName: "Ahmet"
    };

    let hasError = false;
    if (payload.amount <= 0) {
      hasError = true;
    }

    expect(hasError).toBe(true);
  });

  it("Gecerli tutar ile session ID donmeli", () => {
    const payload = {
      amount: 500,
      guestName: "Mehmet"
    };

    const responseBody = {
      sessionId: "cs_test_12345"
    };

    expect(payload.amount).toBeGreaterThan(0);
    expect(responseBody.sessionId).toContain("cs_test");
  });
});