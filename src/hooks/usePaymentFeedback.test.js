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

    // window.location ve window.history.replaceState mocklaması
    originalLocation = window.location;
    delete window.location;
    window.location = { search: '', pathname: '/' };
    window.history.replaceState = vi.fn();
  });

  afterEach(() => {
    window.location = originalLocation;
    vi.clearAllMocks();
  });

  it('URL parametresinde ?payment=success varsa başarı mesajı göstermeli ve URL temizlenmeli', () => {
    window.location.search = '?payment=success';
    
    renderHook(() => usePaymentFeedback());

    // Başarı alerti tetiklenmeli
    expect(mockShowAppAlert).toHaveBeenCalledWith(
      expect.stringContaining('Hediyeniz başarıyla ulaştı'),
      expect.objectContaining({ tone: 'success' })
    );

    // URL'deki parametreleri gizlemek için replaceState çağrılmalı
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