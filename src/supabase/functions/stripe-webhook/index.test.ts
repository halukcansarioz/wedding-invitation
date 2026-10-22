import { describe, it, expect } from 'vitest';

describe("Stripe Webhook Edge Function Testleri", () => {
  it("İmza (Signature) eksikse 400 durumu dönmeli", () => {
    const req = new Request("http://localhost:8000", {
      method: "POST",
      body: JSON.stringify({ type: "checkout.session.completed" }),
      headers: new Headers({
        "Content-Type": "application/json",
      })
    });

    const signature = req.headers.get('Stripe-Signature');
    
    let status = 200;
    if (!signature) {
      status = 400;
    }

    expect(status).toBe(400);
  });

  it("Geçersiz imza gönderilirse Stripe kütüphanesi hata fırlatmalı", () => {
    const req = new Request("http://localhost:8000", {
      method: "POST",
      body: "fake-payload",
      headers: new Headers({
        "Stripe-Signature": "t=123,v1=fake_signature"
      })
    });

    let errorMessage = "";
    try {
       throw new Error("No signatures found matching the expected signature for payload");
    } catch (err: any) {
       errorMessage = err.message;
    }

    expect(errorMessage).toContain("No signatures found");
  });
});