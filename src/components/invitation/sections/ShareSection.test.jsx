import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ShareSection } from './ShareSection';

vi.mock('framer-motion', () => ({
  m: { section: ({ children }) => <section>{children}</section> }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('ShareSection Bileşen Testleri', () => {
  let mockCopyLink;

  beforeEach(() => {
    mockCopyLink = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Cihaz Web Share API desteklemiyorsa (navigator.share yoksa) kopyalama fonksiyonuna (fallback) düşmeli', async () => {
    // navigator.share özelliğini kasıtlı olarak siliyoruz (Masaüstü Chrome/Firefox simülasyonu)
    const originalShare = navigator.share;
    delete navigator.share;

    render(<ShareSection copyInvitationLink={mockCopyLink} shareText="Davetiye" />);
    
    const shareButton = screen.getByRole('button', { name: /Davetiyeyi Paylaş/i });
    fireEvent.click(shareButton);

    // navigator.share olmadığı için sistem otomatik olarak kopyalama fonksiyonunu çağırmalı
    expect(mockCopyLink).toHaveBeenCalledTimes(1);

    // Test bitiminde navigator ortamını geri yükle
    navigator.share = originalShare;
  });

  it('Cihaz Web Share API destekliyorsa native paylaşım menüsünü tetiklemeli', async () => {
    // navigator.share özelliğini mockluyoruz (Mobil cihaz simülasyonu)
    navigator.share = vi.fn().mockResolvedValue(true);

    // Bileşen güncellendiği için artık copy verilerini tanıyacaktır
    render(<ShareSection copyInvitationLink={mockCopyLink} copy={{ shareTitle: "Düğün", shareDescription: "Bekleriz" }} />);
    
    const shareButton = screen.getByRole('button', { name: /Davetiyeyi Paylaş/i });
    fireEvent.click(shareButton);

    expect(navigator.share).toHaveBeenCalledWith(expect.objectContaining({
      title: "Düğün",
      text: "Bekleriz"
    }));
    
    // Native share çalıştığı için fallback fonksiyonu çalışmamalı
    expect(mockCopyLink).not.toHaveBeenCalled();
  });
});