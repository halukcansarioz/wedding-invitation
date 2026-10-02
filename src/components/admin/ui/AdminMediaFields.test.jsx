import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { AdminVideoField } from './AdminMediaFields';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('AdminMediaFields - Video Alanı Testleri', () => {
  afterEach(() => cleanup());

  it('Video değeri yoksa boş state (Henüz video seçilmedi) görünmeli', () => {
    render(<AdminVideoField label="Arka Plan Videosu" value="" onFileSelect={vi.fn()} onClear={vi.fn()} />);
    
    expect(screen.getByText('Henüz video seçilmedi.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Videoyu Kaldır/i })).not.toBeInTheDocument();
  });

  it('Video URL si varsa video oynatıcıyı (HTML5 Video) ve silme butonunu render etmeli', () => {
    const mockOnClear = vi.fn();
    const { container } = render(
      <AdminVideoField label="Arka Plan Videosu" value="test-video.mp4" onFileSelect={vi.fn()} onClear={mockOnClear} />
    );
    
    // Video elementini kontrol et
    const videoEl = container.querySelector('video');
    expect(videoEl).toBeInTheDocument();
    expect(videoEl).toHaveAttribute('src', 'test-video.mp4');

    // Kaldır butonuna tıkla
    const clearBtn = screen.getByRole('button', { name: /Videoyu Kaldır/i });
    fireEvent.click(clearBtn);
    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });
});