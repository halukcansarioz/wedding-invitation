import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PwaUpdateBanner } from "./PwaUpdateBanner";

describe("PwaUpdateBanner", () => {
  it("güncelleme olayı yokken görünmemeli", () => {
    render(<PwaUpdateBanner />);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("güncelleme olayında yenileme callbackini çalıştırmalı", () => {
    const update = vi.fn();
    render(<PwaUpdateBanner />);

    act(() => {
      window.dispatchEvent(new CustomEvent("pwa-update-available", { detail: update }));
    });
    fireEvent.click(screen.getByRole("button", { name: "Yenile" }));

    expect(update).toHaveBeenCalledWith(true);
  });
});
