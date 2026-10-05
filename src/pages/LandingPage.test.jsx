import React from 'react';
import { render, screen, fireEvent } from '../../tests/test-utils';
import { describe, it, expect, vi } from 'vitest';
import LandingPage from './LandingPage';
import { useNavigate } from 'react-router-dom';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(),
    BrowserRouter: ({ children }) => <div>{children}</div>,
  };
});

vi.mock('framer-motion', () => ({
  m: {
    div: ({ children }) => <div>{children}</div>,
    h2: ({ children }) => <h2>{children}</h2>,
    p: ({ children }) => <p>{children}</p>,
  }
}));

describe('LandingPage Bileşen Testleri', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('Tanıtım metinlerini ve özellikleri doğru render etmeli', () => {
    render(<LandingPage />);
    
    expect(screen.getByText('Davetiyem.AI')).toBeInTheDocument();
    expect(screen.getByText(/En Mutlu Gününüz İçin/i)).toBeInTheDocument();
    expect(screen.getByText('Gelişmiş LCV (RSVP)')).toBeInTheDocument();
    expect(screen.getByText('Misafir POV Albüm')).toBeInTheDocument();
  });

  it('Demo İncele butonlarına tıklandığında yönlendirme (navigate) yapmalı', () => {
    render(<LandingPage />);
    
    const demoButtons = screen.getAllByRole('button', { name: /Demo İncele|Hemen Ücretsiz Dene/i });
    
    fireEvent.click(demoButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/demo-cift');
  });

  it('Admin Girişi butonuna tıklandığında admin paneline yönlendirmeli', () => {
    render(<LandingPage />);
    
    const adminBtn = screen.getByRole('button', { name: /Admin Girişi/i });
    fireEvent.click(adminBtn);
    
    expect(mockNavigate).toHaveBeenCalledWith('/demo-cift/admin');
  });
});