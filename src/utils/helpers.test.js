import { describe, it, expect } from 'vitest';
import { buildPersonalLink, normalizeSiteData, normalizeText, formatMessageTemplate, getQrImageUrl } from './helpers';

describe('Helpers Utilities Test Suite', () => {
  
  it('normalizeText removes accents, trims and converts to lowercase', () => {
    expect(normalizeText("  Özlem & Çağatay  ")).toBe("özlem & çağatay"); 
    expect(normalizeText("IŞIK")).toBe("ışık");
  });

  it('buildPersonalLink generates correct URL with only guest name', () => {
    const base = "https://wedding.com/";
    const url = buildPersonalLink(base, "Ahmet Yılmaz");
    expect(url).toBe("https://wedding.com/?guest=Ahmet%20Y%C4%B1lmaz");
  });

  it('buildPersonalLink generates correct URL with guest name and table', () => {
    const base = "https://wedding.com/";
    const url = buildPersonalLink(base, "Ayşe Demir", "12");
    expect(url).toBe("https://wedding.com/?guest=Ay%C5%9Fe%20Demir&table=12");
  });

  it('formatMessageTemplate replaces variables correctly', () => {
    const template = "Merhaba {guest}, düğünümüze {couple} olarak bekliyoruz. {link}";
    const result = formatMessageTemplate(template, { guest: "Ali", couple: "Elif & Can", link: "https://test.co" });
    expect(result).toBe("Merhaba Ali, düğünümüze Elif & Can olarak bekliyoruz. https://test.co");
  });

  it('getQrImageUrl returns the correct API endpoint', () => {
    const link = "https://example.com";
    expect(getQrImageUrl(link)).toContain("quickchart.io");
    expect(getQrImageUrl(link)).toContain(encodeURIComponent(link));
  });

  it('upgrades saved default theme images without rewriting user uploads', () => {
    const normalized = normalizeSiteData({
      invitation: {
        introImage: "/images/themes/lavanta/8.jpg",
        heroImage: "https://example.com/custom-wedding.jpg",
        gallery: [
          "/images/themes/lavanta/antony-bec-nD9tEn63suc-unsplash.jpg",
          "https://storage.example.com/user-upload.jpg",
        ],
      },
    });

    expect(normalized.invitation.introImage).toBe("/images/themes/lavanta/8.webp");
    expect(normalized.invitation.heroImage).toBe("https://example.com/custom-wedding.jpg");
    expect(normalized.invitation.gallery).toEqual([
      "/images/themes/lavanta/antony-bec-nD9tEn63suc-unsplash.webp",
      "https://storage.example.com/user-upload.jpg",
    ]);
  });

});