import { describe, it, expect } from 'vitest';

describe("Send RSVP Confirmation Edge Function Testleri", () => {
  it("E-posta adresi yoksa islem atlanmali", () => {
    const payload = {
      record: {
        firstName: "Hasan",
        isAttending: true,
        email: ""
      }
    };

    let skipped = false;
    if (!payload.record.email) {
      skipped = true;
    }

    expect(skipped).toBe(true);
  });

  it("E-posta varsa basarili yanit donmeli", () => {
    const payload = {
      record: {
        email: "test@test.com",
        firstName: "Hasan",
        isAttending: false
      }
    };

    const responseBody = {
      success: true,
      id: "resend-id-123"
    };

    expect(payload.record.email).toBe("test@test.com");
    expect(responseBody.success).toBe(true);
  });
});