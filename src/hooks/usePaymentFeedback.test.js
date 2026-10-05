import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePaymentFeedback } from './usePaymentFeedback';
import { useStore } from '../store/useStore';

vi.mock('../store/useStore');
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'tr' } })
}));

describe('usePaymentFeedback Hook Testleri', () => {
  let mockShowAppAlert;
  let originalLocation;

  beforeEach(() => {
    mockShowAppAlert = vi.fn();
    useStore.mockReturnValue(mockShowAppAlert);

    // Güvenli window.location mock'laması (TypeError önleme)
    originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { search: '', pathname: '/' },
      writable: true
    });
    window.history.replaceState = vi.fn();
  });

  afterEach(() => {
    // Lokasyonu orijinal haline güvenle geri döndür
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true
    });
    vi.clearAllMocks();
  });

  it('URL parametresinde ?payment=success varsa başarı mesajı göstermeli ve URL temizlenmeli', () => {
    window.location.search = '?payment=success';
    
    renderHook(() => usePaymentFeedback());

    expect(mockShowAppAlert).toHaveBeenCalledWith(
      expect.stringContaining('Hediyeniz başarıyla ulaştı'),
      expect.objectContaining({ tone: 'success' })
    );
    expect(window.history.replaceState).toHaveBeenCalledWith(null, "", "/");
  });

  it('URL parametresinde ?payment=cancel varsa iptal mesajı göstermeli', () => {
    window.location.search = '?payment=cancel';
    
    renderHook(() => usePaymentFeedback());

    expect(mockShowAppAlert).toHaveBeenCalledWith(
      expect.stringContaining('iptal edildi'),
      expect.objectContaining({ tone: 'info' })
    );
  });

  it('URL parametresi yoksa hiçbir işlem yapmamalı', () => {
    window.location.search = '';
    
    renderHook(() => usePaymentFeedback());

    expect(mockShowAppAlert).not.toHaveBeenCalled();
    expect(window.history.replaceState).not.toHaveBeenCalled();
  });
});