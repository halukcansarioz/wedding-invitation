import React from 'react';
import { render, screen } from '../../../../tests/test-utils';
import { describe, it, expect } from 'vitest';
import { HeroSection } from './HeroSection';

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
});