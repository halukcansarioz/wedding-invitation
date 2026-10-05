import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import IntroPage from './IntroPage';

vi.mock('../../utils/helpers', () => ({
  triggerConfetti: vi.fn()
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('IntroPage Bileşen Testleri', () => {
  const mockProps = {
    isOpening: false,
    isHeroLoaded: true,
    openInvitation: vi.fn(),
    copy: { introLabel: "Düğün Davetiyesi", introText: "Hoş geldiniz", openButton: "Daveti Aç" },
    invitation: { bride: "Hande", groom: "Haluk" },
    personalGuestName: "",
    personalTableNumber: ""
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('Gelin ve damat ismini ekranda doğru şekilde göstermeli', () => {
    render(<IntroPage {...mockProps} />);
    expect(screen.getByText('Hande')).toBeInTheDocument();
    expect(screen.getByText('Haluk')).toBeInTheDocument();
  });

  it('Arka plan (hero) yüklenmemişse buton "Yükleniyor..." göstermeli ve tıklamayı engellemeli', () => {
    render(<IntroPage {...mockProps} isHeroLoaded={false} />);
    const button = screen.getByRole('button');
    
    // GÜNCELLENDİ: Spinner SVG'si eklendiği için regex ile metin içeriği doğrulandı
    expect(button).toHaveTextContent(/Yükleniyor/i);
    
    fireEvent.click(button);
    expect(mockProps.openInvitation).not.toHaveBeenCalled();
  });

  it('Kişiye özel link ile girildiğinde misafir adını ve masa numarasını göstermeli', () => {
    render(
      <IntroPage 
        {...mockProps} 
        personalGuestName="Ahmet Yılmaz" 
        personalTableNumber="5" 
      />
    );
    expect(screen.getByText(/Sevgili Ahmet Yılmaz/i)).toBeInTheDocument();
    expect(screen.getByText(/Masa: 5/i)).toBeInTheDocument();
  });

  it('Space veya Enter tuşuna basıldığında zarf açılmalı', () => {
    render(<IntroPage {...mockProps} />);
    
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(mockProps.openInvitation).toHaveBeenCalled();
  });
});