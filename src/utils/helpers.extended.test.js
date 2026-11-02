import { describe, it, expect } from 'vitest';
import {
  buildPersonalLink,
  createGoogleCalendarLink,
  formatMessageTemplate,
  getCurrentShareLink,
  getFaviconUrl,
  getGuestNameFromUrl,
  getTableFromUrl,
  loadStoredSiteData,
  normalizeSiteData,
  normalizeText,
} from './helpers';

describe('Helpers Genişletilmiş Uç Durum (Edge Case) Testleri', () => {
  
  it('normalizeText undefined veya boş gönderildiğinde çökmemeli ve boş string dönmeli', () => {
    expect(normalizeText(undefined)).toBe("");
    expect(normalizeText()).toBe("");
  });

  it('buildPersonalLink özel karakter içeren isim ve masa numaralarını doğru encode etmeli', () => {
    const base = "https://wedding.com/";
    const url = buildPersonalLink(base, "Fatma Şahin", "5");
    // Büyük Ş harfi encodeURIComponent ile %C5%9E olarak kodlanır
    expect(url).toBe("https://wedding.com/?guest=Fatma%20%C5%9Eahin&table=5");
  });

  it('formatMessageTemplate eksik parametre durumunda bileşeni veya şablonu bozmamalı', () => {
    const template = "Merhaba {guest}, düğünümüze bekliyoruz.";
    const result = formatMessageTemplate(template, { couple: "Elif & Can" });
    expect(typeof result).toBe("string");
  });

  it('URL parametrelerini Türkçe ve İngilizce anahtarlarla okuyabilmeli', () => {
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        origin: "http://localhost",
        pathname: "/",
        search: "?davetli=Ay%C5%9Fe%20Demir&masa=12",
      },
    });

    expect(getGuestNameFromUrl()).toBe("Ayşe Demir");
    expect(getTableFromUrl()).toBe("12");
    expect(getCurrentShareLink()).toBe("http://localhost/");

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it('bozuk localStorage verisinde varsayılan site verisine dönmeli', () => {
    localStorage.setItem("wedding-site-data", "{not-json");

    expect(loadStoredSiteData()).toEqual(normalizeSiteData(null));
  });

  it('kısmi site verisini varsayılan iç içe alanlarla birleştirmeli', () => {
    const normalized = normalizeSiteData({
      invitation: { venue: "Yeni Salon" },
      settings: { visibility: { gallery: false } },
    });

    expect(normalized.invitation.venue).toBe("Yeni Salon");
    expect(normalized.invitation.address).toBeDefined();
    expect(normalized.settings.visibility.gallery).toBe(false);
    expect(normalized.settings.visibility.wishes).toBeDefined();
  });

  it('takvim linkini tarih, konum ve açıklama ile encode etmeli', () => {
    const link = createGoogleCalendarLink(
      {
        invitation: {
          weddingDate: "2027-07-07T19:00:00",
          message: "Bekleriz & sevgiler",
          venue: "Gül Salonu",
          address: "İstanbul",
        },
      },
      "Elif & Can",
    );

    expect(link).toContain("calendar.google.com/calendar/render?action=TEMPLATE");
    expect(link).toContain("text=Elif%20%26%20Can%20%7C%20D%C3%BC%C4%9F%C3%BCn");
    expect(link).toContain("location=G%C3%BCl%20Salonu%2C%20%C4%B0stanbul");
    expect(link).toContain("details=Bekleriz%20%26%20sevgiler");
  });

  it('tema faviconunu veri URI olarak üretmeli', () => {
    const favicon = getFaviconUrl("lavanta");

    expect(favicon).toMatch(/^data:image\/svg\+xml;utf8,/);
    expect(decodeURIComponent(favicon)).toContain("<svg");
  });

});