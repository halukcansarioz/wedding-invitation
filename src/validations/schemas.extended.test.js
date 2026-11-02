import { describe, it, expect } from 'vitest';
import { getRsvpSchema } from './schemas';

const mockT = (key) => key;

describe('RSVP Zod Şeması Ek Doğrulama Testleri', () => {
  const rsvpSchema = getRsvpSchema(mockT);

  it('İsim alanı boş bırakıldığında RSVP şeması doğrulama hatası vermeli', () => {
    const invalidData = { 
      name: "", 
      attendance: "Katılacağım" 
    };
    const result = rsvpSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('İsim alanı 3 karakterden kısa olduğunda RSVP şeması reddetmeli', () => {
    const invalidShortName = { name: "Al", attendance: "Katılacağım" };
    expect(getRsvpSchema(mockT).safeParse(invalidShortName).success).toBe(false);
  });

  it('Not alanı tam sınırda kabul edilmeli ve bir karakter üstü reddedilmeli', () => {
    const schema = getRsvpSchema(mockT);
    const base = { name: "Ali Veli", attendance: "Katılacağım" };

    expect(schema.safeParse({ ...base, note: "a".repeat(160) }).success).toBe(true);
    expect(schema.safeParse({ ...base, note: "a".repeat(161) }).success).toBe(false);
  });

  it('RSVP alanlarında eksik olmayan doğru türleri korumalı', () => {
    const parsed = getRsvpSchema(mockT).parse({
      name: "Ali Veli",
      attendance: "Katılacağım",
      phone: "5551234567",
      personCount: "2",
      side: "Gelin",
      hasChild: "Hayır",
      songRequest: "Bir şarkı",
      note: "Not",
    });

    expect(parsed.personCount).toBe("2");
    expect(parsed.songRequest).toBe("Bir şarkı");
  });
});