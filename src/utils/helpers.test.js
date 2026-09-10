import { describe, it, expect } from 'vitest';
import { buildPersonalLink, normalizeText, formatMessageTemplate, getQrImageUrl } from './helpers';

describe('Helpers Utilities Test Suite', () => {
  
  it('normalizeText removes accents, trims and converts to lowercase', () => {
    expect(normalizeText("  Özlem & Çağatay  ")).toBe("özlem & çağatay"); // Note: toLocaleLowerCase returns turkish equivalents
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
    expect(getQrImageUrl(link)).toContain("api.qrserver.com");
    expect(getQrImageUrl(link)).toContain(encodeURIComponent(link));
  });

});