import { describe, expect, it } from "vitest";
import { optimizeImage, optimizeImageFile } from "./imageOptimizer";

describe("image optimizer", () => {
  it("returns missing files unchanged", async () => {
    expect(await optimizeImage(null)).toBeNull();
    expect(await optimizeImageFile(undefined)).toBeUndefined();
  });

  it("bypasses non-image and unsupported image formats", async () => {
    const textFile = new File(["text"], "notes.txt", { type: "text/plain" });
    const svgFile = new File(["<svg />"], "icon.svg", { type: "image/svg+xml" });
    const gifFile = new File(["gif"], "animation.gif", { type: "image/gif" });

    expect(await optimizeImage(textFile)).toBe(textFile);
    expect(await optimizeImage(svgFile)).toBe(svgFile);
    expect(await optimizeImage(gifFile)).toBe(gifFile);
    expect(await optimizeImageFile(svgFile)).toBe(svgFile);
  });

  it("keeps image files unchanged in webdriver environments", async () => {
    const imageFile = new File(["image"], "photo.jpg", { type: "image/jpeg" });
    const originalWebdriver = navigator.webdriver;

    Object.defineProperty(navigator, "webdriver", {
      configurable: true,
      value: true,
    });

    expect(await optimizeImageFile(imageFile)).toBe(imageFile);

    Object.defineProperty(navigator, "webdriver", {
      configurable: true,
      value: originalWebdriver,
    });
  });
});
