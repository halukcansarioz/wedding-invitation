import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAudio } from './useAudio';

describe('useAudio Kapsamlı Hook Testleri', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
    window.HTMLMediaElement.prototype.load = vi.fn();
  });

  it('toggleMusic fonksiyonu müzik kapalıyken açmalı, açıkken kapatmalı', async () => {
    const { result } = renderHook(() => useAudio('test-music.mp3'));
    result.current.audioRef.current = new Audio();
    await act(async () => {
      await result.current.toggleMusic();
    });
    expect(result.current.isMusicPlaying).toBe(true);
    expect(window.localStorage.getItem('wedding-music-muted')).toBe('false');
    await act(async () => {
      await result.current.toggleMusic();
    });
    expect(result.current.isMusicPlaying).toBe(false);
    expect(window.localStorage.getItem('wedding-music-muted')).toBe('true');
  });

  it('Kullanıcı daha önce müziği kapattıysa (localStorage), otomatik oynatmaya zorlanmadıkça başlamamalı', async () => {
    window.localStorage.setItem('wedding-music-muted', 'true');

    const { result } = renderHook(() => useAudio('test-music.mp3'));
    result.current.audioRef.current = new Audio();

    await act(async () => {
      await result.current.startMusic(false);
    });
    expect(result.current.isMusicPlaying).toBe(false);

    await act(async () => {
      await result.current.startMusic(true);
    });
    expect(result.current.isMusicPlaying).toBe(true);
  });
});
