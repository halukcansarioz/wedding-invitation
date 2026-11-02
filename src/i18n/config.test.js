import { describe, expect, it } from "vitest";
import { normalizeLanguage } from "./config";

describe("locale normalization", () => {
  it.each([
    ["en-US", "en"],
    ["tr-TR", "tr"],
    ["EN-us", "en"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeLanguage(input)).toBe(expected);
  });
});
