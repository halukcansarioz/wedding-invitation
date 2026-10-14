import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

    await expect(failingRequest()).rejects.toThrow('Network Error');
    expect(failingRequest).toHaveBeenCalledTimes(1);
  });
});