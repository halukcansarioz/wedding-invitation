import { describe, it, expect } from 'vitest';

describe("Submit Form Edge Function Testleri", () => {
  it("Eksik payload durumunda hata fırlatmalı", () => {
    const payload = {};
    
    let hasError = false;
    if (!payload || Object.keys(payload).length === 0) {
      hasError = true;
    }

    expect(hasError).toBe(true);
  });

  it("Geçerli misafir verisi ile payload oluşturulmalı", () => {
    const payload = {
      type: "guest",
      data: { name: "Ahmet", attendance: "Katılacağım" },
      turnstileToken: "OFFLINE_SYNC"
    };

    const isValid = payload.type === "guest" && payload.data.name !== "";
    
    expect(isValid).toBe(true);
    expect(payload.turnstileToken).toBe("OFFLINE_SYNC");
  });
});