import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import IntroPage from './IntroPage';
import * as helpers from '../../utils/helpers';

// Helper fonksiyonları ve i18n mocklaması
vi.mock('../../utils/helpers', () => ({
  triggerConfetti: vi.fn()
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('IntroPage Bileşen Testleri', () => {
  const mockOpenInvitation = vi.fn();
  
  const defaultProps = {
    isOpening: false,
    copy: { introLabel: "Davetiye", introText: "Mutluluğumuza ortak olun" },
    invitation: { bride: "Hande", groom: "Haluk" },
    openInvitation: mockOpenInvitation,
    isHeroLoaded: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Hero görseli yüklendiğinde Butona tıklanabilmeli ve konfeti patlamalı', () => {
    render(<IntroPage {...defaultProps} />);
    
    const openBtn = screen.getByRole('button');
    expect(openBtn).not.toBeDisabled();
    
    fireEvent.click(openBtn);
    
    expect(mockOpenInvitation).toHaveBeenCalledTimes(1);
    expect(helpers.triggerConfetti).toHaveBeenCalledTimes(1);
  });

  it('Boşluk (Space) veya Enter tuşuna basıldığında davetiye açılmalı', () => {
    render(<IntroPage {...defaultProps} />);
    
    fireEvent.keyDown(window, { key: ' ' });
    expect(mockOpenInvitation).toHaveBeenCalledTimes(1);
    
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(mockOpenInvitation).toHaveBeenCalledTimes(2);
  });

  it('Hero görseli henüz yüklenmediyse (isHeroLoaded: false) buton disable olmalı ve tıklanamamalı', () => {
    const loadingProps = { ...defaultProps, isHeroLoaded: false };
    render(<IntroPage {...loadingProps} />);
    
    const loadingBtn = screen.getByRole('button');
    expect(loadingBtn).toBeDisabled();
    expect(screen.getByText(/Yükleniyor/i)).toBeInTheDocument();
    
    fireEvent.click(loadingBtn);
    expect(mockOpenInvitation).not.toHaveBeenCalled();
  });
});