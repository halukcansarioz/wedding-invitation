import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StoryTab } from './StoryTab';
import { useStore } from '../../../store/useStore';
import * as dbServices from '../../../services/database';

vi.mock('../../../services/database', () => ({
  uploadMediaFile: vi.fn(),
  deleteMediaFile: vi.fn().mockResolvedValue(true)
}));

describe('StoryTab Admin Bileşen Testleri', () => {
  let initialState;

  beforeEach(() => {
    initialState = useStore.getState();
    useStore.setState({
      adminDraft: {
        settings: { visibility: { story: true } },
        storyTimeline: [
          { date: "2020", title: "Tanışma", description: "İlk görüş", image: "old-image.jpg" }
        ]
      }
    });
  });

  afterEach(() => {
    cleanup();
    useStore.setState(initialState, true);
    vi.clearAllMocks();
  });

  it('Yeni anı ekle butonuna basıldığında boş bir anı objesi eklemeli', () => {
    render(<StoryTab isEn={false} />);
    
    const addBtn = screen.getByRole('button', { name: /Yeni Anı Ekle/i });
    fireEvent.click(addBtn);

    const items = useStore.getState().adminDraft.storyTimeline;
    expect(items.length).toBe(2);
    expect(items[1].title).toBe('Yeni Anı');
  });

  it('Görsel kaldırıldığında deleteMediaFile çağrılmalı ve state güncellenmeli', async () => {
    render(<StoryTab isEn={false} />);
    
    const removeImgBtn = screen.getByRole('button', { name: /Görseli Kaldır/i });
    fireEvent.click(removeImgBtn);

    expect(dbServices.deleteMediaFile).toHaveBeenCalledWith('old-image.jpg');
    
    await waitFor(() => {
      expect(useStore.getState().adminDraft.storyTimeline[0].image).toBe('');
    });
  });

  it('Anı tümden silindiğinde içindeki görsel de storage üzerinden silinmeli', async () => {
    render(<StoryTab isEn={false} />);
    
    const deleteMemoryBtn = screen.getByRole('button', { name: /Sil 🗑️/i });
    fireEvent.click(deleteMemoryBtn);

    expect(dbServices.deleteMediaFile).toHaveBeenCalledWith('old-image.jpg');
    await waitFor(() => {
      expect(useStore.getState().adminDraft.storyTimeline.length).toBe(0);
    });
  });
});