import React from "react";
import { describe, expect, it, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen, cleanup } from "../../../../tests/test-utils";
import { SystemChecksTab } from "./SystemChecksTab";

describe("SystemChecksTab", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("başlangıçta çalıştırma çağrısı göstermeli", () => {
    render(<SystemChecksTab isEn={false} />);
    expect(screen.getByRole("button", { name: "Testleri Çalıştır" })).toBeInTheDocument();
    expect(screen.queryByText("Yerel depolama")).toBeNull();
  });

  it("butona basınca kontrolleri çalıştırıp sonuçları göstermeli", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    render(<SystemChecksTab isEn={false} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Testleri Çalıştır" }));
    });
    expect(await screen.findByText("Yerel depolama")).toBeInTheDocument();
    expect(await screen.findByText("Görüntü alanı")).toBeInTheDocument();
  });

  it("İngilizce modda İngilizce etiketleri göstermeli", () => {
    render(<SystemChecksTab isEn />);
    expect(screen.getByRole("button", { name: "Run Checks" })).toBeInTheDocument();
    expect(screen.getByText("Run a safe browser health check")).toBeInTheDocument();
  });

  it("rapor indirme ve geçmiş temizleme butonlarını göstermeli", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    render(<SystemChecksTab isEn={false} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Testleri Çalıştır" }));
    });
    expect(await screen.findByRole("button", { name: "Raporu İndir" })).toBeInTheDocument();
    expect(screen.getByText(/Önceki çalışmalar/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Geçmişi Temizle" })).toBeInTheDocument();
  });
});
