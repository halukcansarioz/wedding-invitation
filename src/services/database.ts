import { describe, it, expect, vi } from 'vitest';
import { getReadableAuthError, fetchWithRetry } from './database';

describe('Database Servis Fonksiyonları Testleri', () => {
  
  describe('getReadableAuthError', () => {
    it('400 hatası için geçersiz giriş (invalid login) mesajını doğru çevirmeli', () => {
      const error = { status: 400, message: "invalid login credentials" };
      expect(getReadableAuthError(error)).toBe("E-posta veya şifre hatalı.");
    });

    it('429 hatası için çok fazla istek (rate limit) mesajını dönmeli', () => {
      const error = { status: 429, message: "rate limit exceeded" };
      expect(getReadableAuthError(error)).toBe("Çok fazla deneme yapıldı. Birkaç dakika bekleyip tekrar deneyin.");
    });

    it('Bilinmeyen hatalar için varsayılan bir mesaj dönmeli', () => {
      const error = { message: "Internal server error" };
      expect(getReadableAuthError(error)).toBe("Internal server error");
      expect(getReadableAuthError(null)).toBe("Bilinmeyen bir hata oluştu.");
    });
  });

  describe('fetchWithRetry', () => {
    it('başarılı olan bir işlemi ilk denemede çözmeli (resolve)', async () => {
      const mockFetch = vi.fn().mockResolvedValue("Başarılı");
      const result = await fetchWithRetry(mockFetch, 3, 10);
      
      expect(result).toBe("Başarılı");
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('hata durumunda belirtilen sayı kadar tekrar denemeli (retry) ve sonra hata fırlatmalı', async () => {
      // Sürekli hata fırlatan bir mock fonksiyon
      const mockFetch = vi.fn().mockRejectedValue(new Error("Ağ hatası"));
      
      try {
        await fetchWithRetry(mockFetch, 3, 10);
      } catch (e) {
        // Fonksiyonun tam olarak 3 kez çağrıldığını onayla
        expect(mockFetch).toHaveBeenCalledTimes(3);
        expect((e as Error).message).toBe("Ağ hatası");
      }
    });
  });
});