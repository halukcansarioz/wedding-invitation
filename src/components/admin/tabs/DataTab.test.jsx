import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DataTab } from './DataTab';
import * as dbServices from '../../../services/database';

vi.mock('../../../services/database', () => ({
  syncFailedDeletes: vi.fn()
}));

describe('DataTab Admin Bileşen Kapsamlı Testleri', () => {
  let mockExportAll, mockImportAll, mockSetImportText;

  beforeEach(() => {
    mockExportAll = vi.fn();
    mockImportAll = vi.fn();
    mockSetImportText = vi.fn();
    vi.clearAllMocks(); 
  });

  afterEach(() => {
    cleanup();
  });

  it('İçe Aktar (Import) textarea alanına veri girildiğinde state güncellenmeli', () => {
    render(
      <DataTab 
        isEn={false} 
        exportAllDataJson={mockExportAll} 
        importAllDataJson={mockImportAll} 
        dataImportText="" 
        setDataImportText={mockSetImportText} 
        saveSiteContent={vi.fn()} 
      />
    );
    
    const textarea = screen.getByPlaceholderText(/JSON içeriğini buraya yapıştırın/i);
    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } });
    
    expect(mockSetImportText).toHaveBeenCalledWith('{"test": "data"}');
  });

  it('JSON İndir butonuna tıklandığında export fonksiyonu tetiklenmeli', () => {
    render(
      <DataTab 
        isEn={false} 
        exportAllDataJson={mockExportAll} 
        importAllDataJson={mockImportAll} 
      />
    );
    
    const exportBtn = screen.getByRole('button', { name: /JSON İndir ⬇️/i });
    fireEvent.click(exportBtn);
    
    expect(mockExportAll).toHaveBeenCalledTimes(1);
  });

  it('Depolama Temizliği (Garbage Collection) hataya düşerse hata mesajı vermeli', async () => {
    // Hata durumunu simüle et
    dbServices.syncFailedDeletes.mockRejectedValue(new Error('Network Error'));
    
    render(<DataTab isEn={false} />);
    
    const cleanBtn = screen.getByRole('button', { name: /Depolama Temizliğini Başlat/i });
    fireEvent.click(cleanBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Temizlik sırasında bir hata oluştu.')).toBeInTheDocument();
    });
  });
});