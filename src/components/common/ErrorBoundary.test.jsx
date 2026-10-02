import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

// Hata fırlatan sahte (Bomb) bileşen
const Bomb = ({ shouldThrow }) => {
  if (shouldThrow) throw new Error("Güm! Component patladı!");
  return <div>Her şey güvenli</div>;
};

describe('ErrorBoundary Kapsamlı Testleri', () => {
  let consoleErrorMock;
  let reloadMock;

  beforeEach(() => {
    // React'ın hata anında terminali kırmızıya boyamasını önlüyoruz
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Sayfa yenileme fonksiyonunu mockla
    reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true
    });
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
    vi.restoreAllMocks();
  });

  it('Hata olmadığında çocuk (child) bileşeni normal render etmeli', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Her şey güvenli')).toBeInTheDocument();
  });

  it('Derinlerde bir bileşen çöktüğünde güvenli (Fallback) UI arayüzüne geçiş yapmalı', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    // Kendi kendine çöken bileşen yerine hata yönetimi UI'ı görünmeli
    expect(screen.getByText(/Opps! Beklenmeyen bir hata oluştu/i)).toBeInTheDocument();
    
    // Geri Dön / Sayfayı Yenile butonu görünür olmalı
    const reloadButton = screen.getByRole('button', { name: /Sayfayı Yenile/i });
    expect(reloadButton).toBeInTheDocument();

    // Butona tıklandığında sayfayı yeniden yüklemeli
    fireEvent.click(reloadButton);
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});