import { describe, it, expect } from 'vitest';
import { getRsvpSchema, getWishSchema } from './schemas';
import { NOTE_MAX_LENGTH, WISH_MAX_LENGTH } from '../config/constants';

const mockT = (key) => key;

describe('RSVP Zod Şeması İleri Seviye Sınır (Boundary) Testleri', () => {
  const rsvpSchema = getRsvpSchema(mockT);

  it('Telefon, kişi sayısı, yakınlık ve çocuk durumu alanları boş geçilse bile kabul etmeli (Opsiyonel alanlar)', () => {
    const minimalData = { 
      name: "Ali Veli", 
      attendance: "Katılacağım" 
      // Diğer tüm alanlar eksik
    };
    const result = rsvpSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
  });

  it('Şarkı isteği (songRequest) 100 karakteri geçerse reddetmeli', () => {
    const longSong = "a".repeat(101);
    const invalidData = { name: "Ali", attendance: "Katılacağım", songRequest: longSong };
    
    const result = rsvpSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('Honeypot alanı dolu olduğunda geçişe izin vermeli (Bot tespiti component seviyesinde yapılır, schema kabul eder)', () => {
    const honeypotData = { name: "Bot", attendance: "Katılacağım", honeypot: "spam-data" };
    const result = rsvpSchema.safeParse(honeypotData);
    
    expect(result.success).toBe(true);
  });
});

describe('WishSchema Ek Sınır ve Validasyon Testleri', () => {
  const wishSchema = getWishSchema(mockT);

  it('Anı defteri mesajı 2 karakterden kısa ise (minimum sınır ihlali) reddetmeli', () => {
    const invalidData = { name: "Ahmet", message: "A" };
    const result = wishSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('Anı defteri mesajı izin verilen maksimum uzunluğu (WISH_MAX_LENGTH) aşarsa reddetmeli', () => {
    const longMessage = "a".repeat(WISH_MAX_LENGTH + 1);
    const invalidData = { name: "Ahmet", message: longMessage };
    const result = wishSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('İsim alanı 2 karakterden kısa olduğunda hata vermeli', () => {
    const invalidData = { name: "A", message: "Tebrikler, çok mutlu olun!" };
    const result = wishSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});