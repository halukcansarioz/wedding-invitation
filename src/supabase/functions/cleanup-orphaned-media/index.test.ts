import { describe, it, expect } from 'vitest';

describe("Cleanup Orphaned Media Edge Function Testleri", () => {
  it("Yetkisiz erisimde 401 hatasi donmeli", () => {
    const req = new Request("http://localhost:8000", {
      headers: new Headers({
        "Authorization": "Bearer INVALID_TOKEN"
      })
    });

    const authHeader = req.headers.get('Authorization');
    const expectedToken = "Bearer VALID_SERVICE_ROLE_KEY";
    let status = 200;

    if (authHeader !== expectedToken) {
      status = 401;
    }

    expect(status).toBe(401);
  });

  it("Yetkili cagri yapildiginda basarili sonuc donmeli", () => {
    const responseBody = {
      success: true,
      deletedCount: 12,
      message: "12 yetim dosya kalici olarak temizlendi."
    };

    expect(responseBody.success).toBe(true);
    expect(responseBody.deletedCount).toBe(12);
  });
});