import { describe, it, expect } from 'vitest';
import { getRsvpSchema } from './schemas';
import { NOTE_MAX_LENGTH } from '../config/constants';

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
    
    // Zod şeması honeypot'u optional olarak tanımladığı için success true döner, asıl filtreleme form onSubmit'te yapılır.
    expect(result.success).toBe(true);
  });
});