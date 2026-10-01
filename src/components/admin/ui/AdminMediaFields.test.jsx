import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdminImageField, AdminMusicField } from './AdminMediaFields';

describe('AdminMediaFields Testleri', () => {
  
  describe('AdminImageField', () => {
    it('Görsel yokken boş durumu göstermeli ve yükleme butonunu aktif tutmalı', () => {
      render(<AdminImageField label="Kahraman Görseli" value="" onFileSelect={vi.fn()} onClear={vi.fn()} isUploading={false} />);
      
      expect(screen.getByText('Henüz görsel seçilmedi.')).toBeInTheDocument();
      expect(screen.getByText('Bilgisayardan Görsel Seç 🖼️')).toBeInTheDocument();
      expect(screen.queryByText('Görseli Kaldır 🗑️')).not.toBeInTheDocument();
    });

    it('Görsel varken önizleme ve sil butonunu göstermeli', () => {
      const mockOnClear = vi.fn();
      render(<AdminImageField label="Kahraman Görseli" value="test-image.jpg" onFileSelect={vi.fn()} onClear={mockOnClear} isUploading={false} />);
      
      const imgPreview = screen.getByAltText('Kahraman Görseli preview');
      expect(imgPreview).toHaveAttribute('src', 'test-image.jpg');

      const clearButton = screen.getByText('Görseli Kaldır 🗑️');
      fireEvent.click(clearButton);
      expect(mockOnClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('AdminMusicField', () => {
    it('Müzik seçildiğinde müzik ismini ve audio oynatıcıyı göstermeli', () => {
      // DÜZELTME: render fonksiyonundan container'ı dışarı aktarıyoruz
      const { container } = render(
        <AdminMusicField value="test-audio.mp3" fileName="Benim Sarkim.mp3" onFileSelect={vi.fn()} onClear={vi.fn()} />
      );
      
      expect(screen.getByText('Benim Sarkim.mp3')).toBeInTheDocument();
      
      const audioEl = container.querySelector('audio');
      expect(audioEl).toHaveAttribute('src', 'test-audio.mp3');
    });
  });
});