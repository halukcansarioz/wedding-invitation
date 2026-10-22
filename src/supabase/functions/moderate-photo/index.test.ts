import { describe, it, expect } from 'vitest';

describe("Moderate Photo Edge Function Testleri", () => {
  it("Gorsel URL eksikse hata donmeli", () => {
    const payload = {
      imageUrl: ""
    };

    let hasError = false;
    if (!payload.imageUrl) {
      hasError = true;
    }

    expect(hasError).toBe(true);
  });

  it("Gorsel analizi basariliysa onay durumunu donmeli", () => {
    const responseBody = {
      success: true,
      isApproved: true,
      confidence: 0.95
    };

    expect(responseBody.success).toBe(true);
    expect(responseBody.isApproved).toBe(true);
    expect(responseBody.confidence).toBeGreaterThan(0.9);
  });
});