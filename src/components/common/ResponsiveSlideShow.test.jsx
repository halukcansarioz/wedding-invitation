import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ResponsiveSlideShow } from './ResponsiveSlideShow';

describe('ResponsiveSlideShow Bileşen Testleri', () => {
  let originalInnerWidth;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
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
});