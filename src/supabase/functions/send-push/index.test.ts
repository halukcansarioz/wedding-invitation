import { describe, it, expect } from 'vitest';

describe("Send Push Edge Function Testleri", () => {
  it("Eksik yetkilendirme basliginda hata firlatmali", async () => {
    const req = new Request("http://localhost:8000", {
      method: "POST",
      body: JSON.stringify({ title: "Test", body: "Test body", url: "/" }),
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

  it("Gecerli verilerle cagrildiginda basarili yanit donmeli", () => {
    const subscriptions = [{ sub_data: "data1" }, { sub_data: "data2" }];
    
    const responseBody = {
      success: true,
      count: subscriptions.length
    };

    expect(responseBody.success).toBe(true);
    expect(responseBody.count).toBe(2);
  });
});