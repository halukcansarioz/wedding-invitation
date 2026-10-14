import React from 'react';
import { render, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WishesSection } from './WishesSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'tr' } })
}));

vi.mock('../../../hooks/useAudioRecorder', () => ({
  useAudioRecorder: () => ({
    isRecording: false,
    recordingTime: 0,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    clearRecording: vi.fn(),
    audioBlob: null,
    uploadAudio: vi.fn()
  })
}));

describe('WishesSection Bileşen Testleri', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('WishesSection bileşeni hatasız bir şekilde render olmalı', () => {
    const { container } = render(<WishesSection submitWish={vi.fn()} />);
    expect(container).toBeDefined();
  });
});