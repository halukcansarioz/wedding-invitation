import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FloatingMenu } from "./FloatingMenu";

const renderMenu = (overrides = {}) => {
  const props = {
    isEn: false,
    toggleLanguage: vi.fn(),
    toggleMusic: vi.fn(),
    isMusicPlaying: false,
    showScrollDown: true,
    scrollToNext: vi.fn(),
    showScrollTop: true,
    scrollToPrev: vi.fn(),
    ...overrides,
  };

  return { ...render(<FloatingMenu {...props} />), props };
};

describe("FloatingMenu", () => {
  it("renders accessible names for every icon control", () => {
    renderMenu();

    expect(screen.getByRole("link", { name: "Yönetici panelini aç" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    expect(screen.getByRole("button", { name: "Switch to English" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Müziği aç" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Önceki bölüm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sonraki bölüm" })).toBeInTheDocument();
  });

  it("reflects music state and forwards control actions", () => {
    const { props } = renderMenu({ isMusicPlaying: true });

    const musicButton = screen.getByRole("button", { name: "Müziği kapat" });
    expect(musicButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Switch to English" }));
    fireEvent.click(musicButton);
    fireEvent.click(screen.getByRole("button", { name: "Önceki bölüm" }));
    fireEvent.click(screen.getByRole("button", { name: "Sonraki bölüm" }));

    expect(props.toggleLanguage).toHaveBeenCalledOnce();
    expect(props.toggleMusic).toHaveBeenCalledOnce();
    expect(props.scrollToPrev).toHaveBeenCalledOnce();
    expect(props.scrollToNext).toHaveBeenCalledOnce();
  });

  it("applies the hidden state to unavailable scroll controls", () => {
    const { container } = renderMenu({ showScrollDown: false, showScrollTop: false });

    expect(container.querySelector(".scroll-up-btn")).toHaveClass("hidden-btn");
    expect(container.querySelector(".scroll-down-btn")).toHaveClass("hidden-btn");
  });
});
