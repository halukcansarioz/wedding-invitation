import { describe, expect, it, vi } from "vitest";
import { fetchWithRetry, getReadableAuthError } from "./database";

describe("Database service functions", () => {
  it("translates common auth errors", () => {
    expect(getReadableAuthError({ status: 400, message: "invalid login credentials" })).toBe("E-posta veya şifre hatalı.");
    expect(getReadableAuthError({ status: 429, message: "rate limit exceeded" })).toBe("Çok fazla deneme yapıldı. Birkaç dakika bekleyip tekrar deneyin.");
    expect(getReadableAuthError({ message: "Internal server error" })).toBe("Internal server error");
    expect(getReadableAuthError(null)).toBe("Bilinmeyen bir hata oluştu.");
  });

  it("returns a successful result without retrying", async () => {
    const mockFetch = vi.fn().mockResolvedValue("Başarılı");

    await expect(fetchWithRetry(mockFetch, 3, 10)).resolves.toBe("Başarılı");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("retries failed requests and then throws the final error", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Ağ hatası"));

    await expect(fetchWithRetry(mockFetch, 3, 10)).rejects.toThrow("Ağ hatası");
    expect(mockFetch).toHaveBeenCalledTimes(3);
  }, 15000); // CI ortamı için zaman aşımı payı
});