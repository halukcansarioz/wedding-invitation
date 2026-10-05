import React from 'react';
import { render, screen, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, afterEach } from 'vitest';
import AdminCharts from './AdminCharts';

vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div data-testid="recharts-container">{children}</div>,
  };
});

describe('AdminCharts Bileşen Testleri', () => {
  const mockSideData = [
    { name: 'Gelin Tarafı', value: 40 },
    { name: 'Damat Tarafı', value: 60 }
  ];

  const mockCheckInData = [
    { name: 'Gelenler', value: 80 },
    { name: 'Beklenenler', value: 20 }
  ];

  // DOM temizliği eklenerek testler arası sızıntı önlendi
  afterEach(() => {
    cleanup();
  });

  it('Grafik başlıklarını İngilizce ve Türkçe dillerine göre doğru render etmeli', () => {
    const { rerender } = render(
      <AdminCharts sideData={mockSideData} checkInData={mockCheckInData} isEn={false} />
    );
    
    expect(screen.getByText('Misafir Dağılımı')).toBeInTheDocument();
    expect(screen.getByText('Kapı Giriş Durumu')).toBeInTheDocument();

    rerender(<AdminCharts sideData={mockSideData} checkInData={mockCheckInData} isEn={true} />);
    
    expect(screen.getByText('Guest Distribution')).toBeInTheDocument();
    expect(screen.getByText('Check-in Status')).toBeInTheDocument();
  });

  it('Veri dizileri boş gönderildiğinde (empty state) bileşen çökmemeli', () => {
    const { container } = render(
      <AdminCharts sideData={[]} checkInData={[]} isEn={false} />
    );
    
    // Cleanup sayesinde artık burada sadece 2 adet container bulunacak
    const containers = screen.getAllByTestId('recharts-container');
    expect(containers).toHaveLength(2);
    expect(container).toBeInTheDocument();
  });
});