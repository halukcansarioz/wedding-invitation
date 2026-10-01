import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ResponsiveSlideShow } from './ResponsiveSlideShow';

describe('ResponsiveSlideShow Bileşen Testleri', () => {
  let originalInnerWidth;
  let originalInnerHeight;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.innerHeight = originalInnerHeight;
    vi.restoreAllMocks();
  });

  it('Masaüstü görünümde (width > 768px) slayt yapısı OLMADAN alt alta render etmeli', () => {
    window.innerWidth = 1024; // Masaüstü çözünürlüğü
    fireEvent(window, new Event('resize'));

    const { container } = render(
      <ResponsiveSlideShow>
        <div>Bölüm 1</div>
        <div>Bölüm 2</div>
      </ResponsiveSlideShow>
    );

    // .invitation-page class'lı standart kapsayıcı olmalı
    expect(container.querySelector('.invitation-page')).toBeInTheDocument();
    // İleri/Geri butonları (slide-controls) DOM'da OLMAMALI
    expect(container.querySelector('.slide-controls')).not.toBeInTheDocument();
  });

  it('Mobil görünümde (width <= 768px) dokunmatik kaydırma (swipe) hareketini algılamalı', () => {
    window.innerWidth = 375; // iPhone X çözünürlüğü
    fireEvent(window, new Event('resize'));

    const { container } = render(
      <ResponsiveSlideShow>
        <div>Bölüm 1</div>
        <div>Bölüm 2</div>
      </ResponsiveSlideShow>
    );

    const slideContainer = container.querySelector('.slideshow-container');
    expect(slideContainer).toBeInTheDocument();

    // Bölüm 1 görünür olmalı
    expect(screen.getByText('Bölüm 1')).toBeInTheDocument();

    // Yukarı doğru parmak kaydırma (Swipe Up -> Sonraki slayta geçiş) simülasyonu
    fireEvent.touchStart(slideContainer, { touches: [{ clientY: 500 }] });
    fireEvent.touchEnd(slideContainer, { changedTouches: [{ clientY: 200 }] }); // 300px yukarı kaydırıldı

    // İleri butonuna basılmış gibi Bölüm 2'nin ekrana gelmesini bekleriz (Animasyon/State update için)
    // Not: Animasyonlu geçiş olduğu için state güncellenecek ve Bölüm 2 render edilecek.
    expect(screen.getByText('Bölüm 2')).toBeInTheDocument();
  });

  it('Yatay telefonda genişlik 768px üstünde olsa da slayt düzenini kullanmalı', () => {
    window.innerWidth = 844;
    window.innerHeight = 390;
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query.includes('(orientation: landscape)') && query.includes('(pointer: coarse)'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(
      <ResponsiveSlideShow>
        <div>Bölüm 1</div>
        <div>Bölüm 2</div>
      </ResponsiveSlideShow>
    );

    expect(container.querySelector('.slideshow-container')).toBeInTheDocument();
  });
});