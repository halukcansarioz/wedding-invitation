import { describe, it, expect } from 'vitest';
import { normalizeText, buildPersonalLink, formatMessageTemplate } from './helpers';

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

});