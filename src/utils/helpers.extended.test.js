import { describe, it, expect, vi } from 'vitest';
import {
  buildPersonalLink,
  createCsv,
  createExcelTable,
  createGoogleCalendarLink,
  dbGuestToUi,
  downloadTextFile,
  formatMessageTemplate,
  getCurrentShareLink,
  getFaviconUrl,
  getGuestNameFromUrl,
  getNavigationLinks,
  getTableFromUrl,
  loadStoredSiteData,
  normalizeSiteData,
  normalizeText,
  uiGuestToDb,
  uiWishToDb,
  dbWishToUi,
  touchAdminSession,
  clearAdminSessionTimestamp,
  isAdminSessionFresh,
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

  it('misafir CSV çıktısında Türkçe başlıkları ve tırnak kaçışını korumalı', () => {
    const csv = createCsv([
      {
        name: 'Ayşe "A" Demir',
        attendance: "Katılacak",
        phone: "555 123",
        personCount: 2,
        side: "Gelin",
        hasChild: "Hayır",
        tableNumber: 4,
        songRequest: "Bir şarkı",
        note: 'Not "özel"',
      },
    ]);

    expect(csv).toContain("Ad Soyad,Katılım,Telefon");
    expect(csv).toContain('"Ayşe ""A"" Demir"');
    expect(csv).toContain('"Not ""özel"""');
  });

  it('anı defteri CSV çıktısında onay durumunu dile göre çevirmeli', () => {
    const csv = createCsv(
      [{ name: "John", message: 'We "love" you', approved: false }],
      "wishes",
      true,
    );

    expect(csv).toContain("Name,Message,Status");
    expect(csv).toContain('"We ""love"" you"');
    expect(csv).toContain('"Pending"');
  });

  it('Excel çıktısını tablo HTML olarak üretmeli', () => {
    const html = createExcelTable([{ name: "Ali", message: "Merhaba", approved: true }], "wishes");

    expect(html).toContain("<table");
    expect(html).toContain("<th");
    expect(html).toContain("<td>Ali</td>");
    expect(html).toContain("</table>");
  });

  it('misafir modellerini UI ve DB arasında varsayılanlarla dönüştürmeli', () => {
    const dbGuest = dbGuestToUi({
      id: "guest-1",
      name: "Zeynep",
      attendance: "Katılacak",
      person_count: null,
      phone: null,
      table_number: null,
    });

    expect(dbGuest.personCount).toBe("1");
    expect(dbGuest.phone).toBe("");
    expect(uiGuestToDb(dbGuest).person_count).toBe(1);
    expect(uiGuestToDb(dbGuest).table_number).toBeNull();
  });

  it('wish modellerinde audio alanlarını iki yönde eşlemeli', () => {
    const dbWish = uiWishToDb({ name: "Ali", message: "Mutluluklar", audioUrl: "audio.webm" });
    expect(dbWish.audio_url).toBe("audio.webm");
    expect(dbWish.approved).toBe(true);
    expect(dbWishToUi({ ...dbWish, id: "wish-1" }).audioUrl).toBe("audio.webm");
  });

  it('admin oturum zaman damgasını oluşturup temizleyebilmeli', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-02T08:00:00Z"));

    touchAdminSession();
    expect(isAdminSessionFresh()).toBe(true);

    vi.setSystemTime(new Date("2026-11-02T08:31:00Z"));
    expect(isAdminSessionFresh()).toBe(false);

    clearAdminSessionTimestamp();
    expect(isAdminSessionFresh()).toBe(false);
    vi.useRealTimers();
  });

  it('boş export listelerinde boş CSV ve tablo üretmeli', () => {
    expect(createCsv([])).toBe("");
    expect(createExcelTable([])).toContain("<table");
  });

  it('İngilizce misafir export başlıklarını üretmeli', () => {
    expect(createCsv([{ name: "John", attendance: "Yes" }], "guests", true))
      .toContain("Name,Attendance,Phone,Person Count");
  });

  it('kişisel linkte boş opsiyonel alanları eklememeli', () => {
    expect(buildPersonalLink("https://wedding.com/?old=value", "  Ali  ", "", "", ""))
      .toBe("https://wedding.com/?guest=Ali");
  });

  it('eksik mekan bilgisiyle güvenli harita linki üretmeli', () => {
    const links = getNavigationLinks({});

    expect(links.google).toContain("https://www.google.com/maps/search/");
    expect(links.apple).toContain("https://maps.apple.com/");
    expect(links.waze).toContain("navigate=yes");
  });

  it('metin dosyasını indirmek için geçici anchor oluşturmalı', () => {
    const createUrl = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    const revokeUrl = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    downloadTextFile("guests.csv", "name,value", "text/csv");

    expect(createUrl).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeUrl).toHaveBeenCalledWith("blob:test");

    createUrl.mockRestore();
    revokeUrl.mockRestore();
    click.mockRestore();
  });

});