import { chromium } from "@playwright/test";

const paths = ["/", "/admin", "/live"];
const baseUrl = process.env.AUDIT_BASE_URL || "http://localhost:5173";
const browser = await chromium.launch({ headless: true });
try {
  for (const pathname of paths) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3,
      serviceWorkers: "block",
    });
    const page = await context.newPage();
    const started = Date.now();
    await page.goto(`${baseUrl}${pathname}`, { waitUntil: "domcontentloaded" });
    const domContentLoadedMs = Date.now() - started;
    await page.waitForTimeout(1600);
    const metrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType("resource").map((entry) => ({
        name: entry.name.replace(location.origin, ""),
        type: entry.initiatorType,
        transfer: entry.transferSize || 0,
        body: entry.decodedBodySize || 0,
        duration: Math.round(entry.duration),
      }));
      const visibleImages = [...document.images].filter((image) => image.getBoundingClientRect().width > 0).map((image) => ({
        src: image.currentSrc.replace(location.origin, ""),
        loading: image.loading,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
      }));
      const navigation = performance.getEntriesByType("navigation")[0];
      const app = document.querySelector(".app");
      const intro = document.querySelector(".intro-page");
      const storedSiteData = JSON.parse(localStorage.getItem("wedding-site-data") || "null");
      return {
        title: document.title,
        viewport: `${innerWidth}x${innerHeight}`,
        docWidth: document.documentElement.scrollWidth,
        localImages: {
          introImage: storedSiteData?.invitation?.introImage || null,
          heroImage: storedSiteData?.invitation?.heroImage || null,
        },
        introImageVariable: app ? getComputedStyle(app).getPropertyValue("--intro-image") : null,
        heroImageVariable: app ? getComputedStyle(app).getPropertyValue("--hero-image") : null,
        introBackground: intro ? getComputedStyle(intro).backgroundImage : null,
        readyState: document.readyState,
        domInteractiveMs: Math.round(navigation?.domInteractive || 0),
        domCompleteMs: Math.round(navigation?.domComplete || 0),
        resources: resources.length,
        transferKB: Math.round(resources.reduce((sum, item) => sum + item.transfer, 0) / 1024),
        byType: Object.fromEntries(["script", "img", "css", "link", "fetch", "xmlhttprequest"].map((type) => [type, resources.filter((item) => item.type === type).reduce((sum, item) => sum + item.transfer, 0)])),
        largest: resources.filter((item) => item.transfer > 0).sort((a, b) => b.transfer - a.transfer).slice(0, 8),
        visibleImages,
      };
    });
    console.log(JSON.stringify({ route: pathname, domContentLoadedMs, ...metrics }));
    await context.close();
  }
} finally {
  await browser.close();
}
