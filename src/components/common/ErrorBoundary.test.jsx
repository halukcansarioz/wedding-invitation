import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

const Bomb = ({ shouldThrow }) => {
  if (shouldThrow) throw new Error("Güm! Component patladı!");
  return <div>Her şey güvenli</div>;
};

describe('ErrorBoundary Kapsamlı Testleri', () => {
  let consoleErrorMock;
  let reloadMock;

  beforeEach(() => {
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    
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

    expect(screen.getByText(/Opps! Beklenmeyen bir hata oluştu/i)).toBeInTheDocument();
    
    const reloadButton = screen.getByRole('button', { name: /Sayfayı Yenile/i });
    expect(reloadButton).toBeInTheDocument();

    fireEvent.click(reloadButton);
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});