import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StoryTab } from './StoryTab';
import { useStore } from '../../../store/useStore';
import * as dbServices from '../../../services/database';

vi.mock('../../../store/useStore');
vi.mock('../../../services/database', () => ({
  uploadMediaFile: vi.fn(),
  deleteMediaFile: vi.fn().mockResolvedValue(true)
}));

describe('StoryTab Admin Bileşen Testleri', () => {
  let mockUpdateDraftArrayItem, mockAddDraftArrayItem, mockRemoveDraftArrayItem;

  beforeEach(() => {
    mockUpdateDraftArrayItem = vi.fn();
    mockAddDraftArrayItem = vi.fn();
    mockRemoveDraftArrayItem = vi.fn();

    useStore.mockImplementation((selector) => selector({
      adminDraft: {
        settings: { visibility: { story: true } },
        storyTimeline: [
          { date: "2020", title: "Tanışma", description: "İlk görüş", image: "old-image.jpg" }
        ]
      },
      updateDraftObject: vi.fn(),
      saveSiteContent: vi.fn(),
      updateDraftArrayItem: mockUpdateDraftArrayItem,
      addDraftArrayItem: mockAddDraftArrayItem,
      removeDraftArrayItem: mockRemoveDraftArrayItem,
      moveDraftArrayItem: vi.fn()
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Yeni anı ekle butonuna basıldığında boş bir anı objesi eklemeli', () => {
    render(<StoryTab isEn={false} />);
    
    const addBtn = screen.getByRole('button', { name: /Yeni Anı Ekle/i });
    fireEvent.click(addBtn);

    expect(mockAddDraftArrayItem).toHaveBeenCalledWith('storyTimeline', {
      date: "Yeni Tarih", title: "Yeni Anı", description: "", image: ""
    });
  });

  it('Görsel kaldırıldığında deleteMediaFile çağrılmalı ve state güncellenmeli', async () => {
    render(<StoryTab isEn={false} />);
    
    const removeImgBtn = screen.getByRole('button', { name: /Görseli Kaldır/i });
    fireEvent.click(removeImgBtn);

    expect(dbServices.deleteMediaFile).toHaveBeenCalledWith('old-image.jpg');
    
    await waitFor(() => {
      expect(mockUpdateDraftArrayItem).toHaveBeenCalledWith('storyTimeline', 0, 'image', '');
    });
  });

  it('Anı tümden silindiğinde içindeki görsel de storage üzerinden silinmeli', async () => {
    render(<StoryTab isEn={false} />);
    
    // Aksiyon butonlarındaki Sil butonunu bul
    const deleteMemoryBtn = screen.getByRole('button', { name: /Sil 🗑️/i });
    fireEvent.click(deleteMemoryBtn);

    expect(dbServices.deleteMediaFile).toHaveBeenCalledWith('old-image.jpg');
    await waitFor(() => {
      expect(mockRemoveDraftArrayItem).toHaveBeenCalledWith('storyTimeline', 0);
    });
  });
});