import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

// Hata fırlatan sahte bir bileşen
const Bomb = ({ shouldThrow }) => {
  if (shouldThrow) throw new Error("Güm! Sahte Hata!");
  return <div>Her şey yolunda</div>;
};

describe('ErrorBoundary Bileşen Testleri', () => {
  let consoleErrorMock;

  beforeEach(() => {
    // Test terminalini "React Error Boundary Yakaladı" loglarıyla kirletmemek için console.error'u gizliyoruz
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
  });

  it('hata yoksa çocuk bileşenleri normal şekilde render etmeli', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Her şey yolunda')).toBeInTheDocument();
  });

  it('çocuk bileşende hata çıkarsa fallback UI (hata ekranı) göstermeli', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    // Uygulama çökmemeli, bunun yerine kullanıcı dostu hata mesajı çıkmalı
    expect(screen.getByText(/Opps! Beklenmeyen bir hata oluştu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sayfayı Yenile/i })).toBeInTheDocument();
  });

  it('Yenile butonuna tıklandığında sayfayı yeniden yüklemeli (reload)', () => {
    // window.location.reload fonksiyonunu mockluyoruz
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true
    });

    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: /Sayfayı Yenile/i });
    fireEvent.click(reloadButton);

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});