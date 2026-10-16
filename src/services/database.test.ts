import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry, getReadableAuthError } from './database';

describe('Database service functions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('retries failed requests and then throws the final error', async () => {
    const failingRequest = vi.fn().mockRejectedValue(new Error('Network Error'));

    const promise = fetchWithRetry(failingRequest, 2, 100);
    // Attach catch handler immediately to avoid unhandled rejection warning
    const assertion = expect(promise).rejects.toThrow('Network Error');

    await vi.runAllTimersAsync();
    await assertion;
    expect(failingRequest).toHaveBeenCalledTimes(2);
  });

  it('returns readable Turkish error messages for auth status codes', () => {
    expect(getReadableAuthError({ status: 400, message: 'Invalid login credentials' })).toBe(
      'E-posta veya şifre hatalı.'
    );
    expect(getReadableAuthError({ status: 429, message: 'Rate limit exceeded' })).toBe(
      'Çok fazla deneme yapıldı. Birkaç dakika bekleyip tekrar deneyin.'
    );
  });
});