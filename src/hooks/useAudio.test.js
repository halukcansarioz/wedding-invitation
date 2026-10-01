import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAudio } from './useAudio';

describe('useAudio Hook Testleri', () => {
  beforeEach(() => {
    // Test öncesi LocalStorage'ı temizle
    window.localStorage.clear();
    
    // HTMLAudioElement'i mockla
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
    window.HTMLMediaElement.prototype.load = vi.fn();
  });

  it('müzik durdurulduğunda localStorage "wedding-music-muted" değerini "true" yapmalı', () => {
    const { result } = renderHook(() => useAudio('test-music.mp3'));
    
    act(() => {
      result.current.stopMusic();
    });

    expect(result.current.isMusicPlaying).toBe(false);
    expect(window.localStorage.getItem('wedding-music-muted')).toBe('true');
  });

  it('müzik oynatıldığında localStorage "wedding-music-muted" değerini "false" yapmalı', async () => {
    const { result } = renderHook(() => useAudio('test-music.mp3'));
    
    // useRef ile audio elementinin var olduğunu simüle et
    result.current.audioRef.current = new Audio();
    
    await act(async () => {
      await result.current.startMusic(true);
    });

    expect(result.current.isMusicPlaying).toBe(true);
    expect(window.localStorage.getItem('wedding-music-muted')).toBe('false');
  });
});