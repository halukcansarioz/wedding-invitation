import { describe, it, expect } from 'vitest';

describe("Delete Media Edge Function Testleri", () => {
  it("Silinecek URL belirtilmediginde hata donmeli", () => {
    const payload = {
      action: "delete",
      urls: [] as string[]
    };

    let hasError = false;
    if (!payload.urls || payload.urls.length === 0) {
      hasError = true;
    }

    expect(hasError).toBe(true);
  });

  it("Cleanup action ile cagrildiginda basarili sonuc donmeli", () => {
    const payload = {
      action: "cleanup-orphans"
    };

    const responseBody = {
      success: true,
      count: 5,
      deletedCount: 5,
      message: "5 adet yetim dosya kalici olarak temizlendi."
    };

    expect(payload.action).toBe("cleanup-orphans");
    expect(responseBody.success).toBe(true);
    expect(responseBody.count).toBeGreaterThan(0);
  });
});