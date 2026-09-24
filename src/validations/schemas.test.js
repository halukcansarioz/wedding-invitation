import { describe, it, expect } from 'vitest';
import { getRsvpSchema, getWishSchema } from './schemas';
import { NOTE_MAX_LENGTH, WISH_MAX_LENGTH } from '../config/constants';

// i18next t() fonksiyonunu simüle eden sahte fonksiyon
const mockT = (key) => key;

describe('Form Doğrulama Şemaları (Zod)', () => {
  
  describe('RSVP (LCV) Şeması', () => {
    const rsvpSchema = getRsvpSchema(mockT);

    it('geçerli verileri kabul etmeli', () => {
      const validData = { name: "Ahmet Yılmaz", attendance: "Katılacağım", phone: "05554443322" };
      const result = rsvpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('isim 3 karakterden kısaysa hata vermeli', () => {
      const invalidData = { name: "Ali", attendance: "Katılacağım" }; // 3 karaktere izin var
      expect(rsvpSchema.safeParse(invalidData).success).toBe(true);

      const invalidData2 = { name: "Al", attendance: "Katılacağım" }; // 2 karakter hata vermeli
      const result = rsvpSchema.safeParse(invalidData2);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('form.missingNameMessage');
    });

    it('not alanı maksimum sınırı aşarsa hata vermeli', () => {
      const longNote = "a".repeat(NOTE_MAX_LENGTH + 1);
      const invalidData = { name: "Ahmet Yılmaz", attendance: "Katılacağım", note: longNote };
      const result = rsvpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Anı Defteri (Wish) Şeması', () => {
    const wishSchema = getWishSchema(mockT);

    it('geçerli mesajları kabul etmeli', () => {
      const validData = { name: "Ayşe", message: "Bir ömür boyu mutluluklar dilerim!" };
      expect(wishSchema.safeParse(validData).success).toBe(true);
    });

    it('mesaj 5 karakterden kısaysa hata vermeli', () => {
      const invalidData = { name: "Ayşe", message: "Kısa" };
      const result = wishSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('form.missingWishMessage');
    });
  });
});