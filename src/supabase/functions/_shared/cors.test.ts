import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCorsHeaders } from "./cors";

describe("CORS allowlist", () => {
  beforeEach(() => {
    vi.stubGlobal("Deno", {
      env: {
        get: vi.fn(() => "https://allowed.example.com, http://localhost:5173"),
      },
    });
  });

  it("izin verilen origin'i CORS başlığında yansıtmalı", () => {
    const headers = getCorsHeaders(
      new Request("https://api.example.com", {
        headers: { origin: "https://allowed.example.com" },
      }),
    ) as Record<string, string>;

    expect(headers["Access-Control-Allow-Origin"]).toBe("https://allowed.example.com");
    expect(headers.Vary).toBe("Origin");
  });

  it("izin verilmeyen origin için CORS origin başlığı döndürmemeli", () => {
    const headers = getCorsHeaders(
      new Request("https://api.example.com", {
        headers: { origin: "https://attacker.example.com" },
      }),
    ) as Record<string, string>;

    expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
  });
});
