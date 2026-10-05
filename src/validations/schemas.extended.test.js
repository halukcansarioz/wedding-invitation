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
    const shortNameData = { 
      name: "Ali", 
      attendance: "Katılacağım" 
    };
    const result = rsvpSchema.safeParse(shortNameData);
    // Zod şeması min(3) kuralına sahip olduğu için "Ali" (3 karakter) geçerlidir, "Al" ise geçersiz olmalıdır.
    const invalidShortName = { name: "Al", attendance: "Katılacağım" };
    expect(getRsvpSchema(mockT).safeParse(invalidShortName).success).toBe(false);
  });
});