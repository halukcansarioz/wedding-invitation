import { describe, expect, it } from "vitest";
import {
  checkSupabaseReachability,
  clearSystemCheckHistory,
  getSystemChecks,
  loadSystemCheckHistory,
  saveSystemCheckRun,
  summarizeSystemChecks,
} from "./systemChecks";

describe("systemChecks", () => {
  it("tarayıcı kontrollerini beklenen kimliklerle üretir", () => {
    const checks = getSystemChecks();
    expect(checks.map((check) => check.id)).toEqual([
      "online",
      "storage",
      "service-worker",
      "viewport",
      "accessibility-images",
      "accessibility-buttons",
      "performance",
      "pwa-cache",
    ]);
    expect(checks.every((check) => ["pass", "warn", "fail"].includes(check.status))).toBe(true);
  });

  it("eksik görsel alt metnini uyarı olarak raporlar", () => {
    const image = document.createElement("img");
    image.alt = "";
    document.body.appendChild(image);

    const result = getSystemChecks().find((check) => check.id === "accessibility-images");
    expect(result?.status).toBe("warn");
    image.remove();
  });

  it("etiketli butonları erişilebilir kabul eder", () => {
    const button = document.createElement("button");
    button.setAttribute("aria-label", "Kapat");
    document.body.appendChild(button);

    const result = getSystemChecks().find((check) => check.id === "accessibility-buttons");
    expect(result?.status).toBe("pass");
    button.remove();
  });

  it("sonuçları durumlarına göre özetler", () => {
    expect(
      summarizeSystemChecks([
        { id: "a", label: "A", status: "pass", detail: "" },
        { id: "b", label: "B", status: "warn", detail: "" },
        { id: "c", label: "C", status: "fail", detail: "" },
        { id: "d", label: "D", status: "pass", detail: "" },
      ])
    ).toEqual({ pass: 2, warn: 1, fail: 1 });
  });

  it("Supabase 401 yanıtını endpoint erişilebilirliği olarak kabul eder", async () => {
    const result = await checkSupabaseReachability(
      async () => new Response(null, { status: 401 }),
      "https://example.supabase.co"
    );
    expect(result.status).toBe("pass");
  });

  it("Supabase erişim hatasını fail olarak raporlar", async () => {
    const result = await checkSupabaseReachability(
      async () => { throw new Error("offline"); },
      "https://example.supabase.co"
    );
    expect(result.status).toBe("fail");
  });

  it("test geçmişini en fazla 10 kayıtla saklar ve temizler", () => {
    for (let i = 0; i < 12; i += 1) {
      saveSystemCheckRun({ id: String(i), createdAt: new Date().toISOString(), checks: [] });
    }
    expect(loadSystemCheckHistory()).toHaveLength(10);
    clearSystemCheckHistory();
    expect(loadSystemCheckHistory()).toEqual([]);
  });
});
