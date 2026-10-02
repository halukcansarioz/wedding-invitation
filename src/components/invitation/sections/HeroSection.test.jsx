import React from 'react';
import { render, screen } from '../../../../tests/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { HeroSection } from './HeroSection';

vi.mock('framer-motion', () => ({
  m: {
    section: ({ children, className }) => <section className={className}>{children}</section>,
    h1: ({ children }) => 1<h1>{children}</h1>,
    p: ({ children }) => <p>{children}</p>,
    div: ({ children, className }) => <div className={className}>{children}</div>
  }
}));

describe('HeroSection Bileşen Testleri', () => {
  const mockProps = {
    invitation: {
      bride: 'Hande',
      groom: 'Haluk',
      dateText: '22 Ağustos 2026',
      timeText: '19:00',
      heroImage: 'test-image.jpg',
      heroVideo: null
    },
    copy: {
      heroLabel: 'Evleniyoruz!'
    }
  };

  it('Gelin ve damat ismini, tarihi ve etiketi doğru formatta göstermeli', () => {
    render(<HeroSection {...mockProps} />);
    
    expect(screen.getByText('Evleniyoruz!')).toBeInTheDocument();
    expect(screen.getByText('Hande')).toBeInTheDocument();
    expect(screen.getByText('Haluk')).toBeInTheDocument();
    expect(screen.getByText('22 Ağustos 2026')).toBeInTheDocument();
  });

  it('heroVideo tanımlıysa video elementini render etmeli', () => {
    const videoProps = {
      ...mockProps,
      invitation: { ...mockProps.invitation, heroVideo: 'test-video.mp4' }
    };
    
    const { container } = render(<HeroSection {...videoProps} />);
    
    const videoElement = container.querySelector('video');
    expect(videoElement).toBeInTheDocument();
    expect(videoElement).toHaveAttribute('src', 'test-video.mp4');
    expect(videoElement).toHaveAttribute('autoPlay');
  });

  it('heroVideo yoksa heroImage görselini arka plan olarak atamalı', () => {
    const { container } = render(<HeroSection {...mockProps} />);
    
    // Video olmamalı
    expect(container.querySelector('video')).not.toBeInTheDocument();

    // Görsel arkaplan div'i olmalı
    const bgElement = container.querySelector('.hero-bg');
    expect(bgElement).toBeInTheDocument();
    expect(bgElement).toHaveStyle('background-image: url(test-image.jpg)');
  });
});