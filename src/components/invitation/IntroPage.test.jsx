import React from 'react';
// 1. DÜZELTME: test-utils için 3 kademe yukarı çıkılmalı
import { render, screen, cleanup } from '../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import IntroPage from './IntroPage';
// 2. DÜZELTME: helpers için 2 kademe yukarı çıkılmalı
import { triggerConfetti } from '../../utils/helpers';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

vi.mock('../../utils/helpers', () => ({
  triggerConfetti: vi.fn()
}));

describe('IntroPage Bileşen Testleri', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Giriş sayfası gelin ve damat adını doğru render etmeli', () => {
    const mockProps = {
      isOpening: false,
      copy: { introLabel: 'Davetiye', introText: 'Bekliyoruz', openButton: 'Aç' },
      invitation: { bride: 'Hande', groom: 'Haluk' },
      openInvitation: vi.fn(),
      isHeroLoaded: true
    };

    render(<IntroPage {...mockProps} />);
    
    expect(screen.getByText('Hande')).toBeDefined();
    expect(screen.getByText('Haluk')).toBeDefined();
  });
});