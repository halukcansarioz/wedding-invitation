import { describe, it, expect, beforeEach } from 'vitest';
import { getActiveTenantId } from './tenant';

describe('Multi-Tenant URL Ayrıştırma (getActiveTenantId) Testleri', () => {
  beforeEach(() => {
    // JSDOM ortamında pathname'i güvenli bir şekilde sıfırlama
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        pathname: '/'
      },
      writable: true
    });
  });

  it('Kök dizinde (/) null dönmeli', () => {
    expect(getActiveTenantId()).toBeNull();
  });

  it('Rezerve edilmiş sistem rotalarında (/admin, /live, /login, /register) null dönmeli', () => {
    const paths = ['/admin', '/live', '/login', '/register'];
    paths.forEach(path => {
      Object.defineProperty(window, 'location', {
        value: { ...window.location, pathname: path },
        writable: true
      });
      expect(getActiveTenantId()).toBeNull();
    });
  });

  it('Özel çift (tenant) URL adreslerinde küçük harfe çevrilmiş tenant kimliğini dönmeli', () => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, pathname: '/Handenur-Haluk/live' },
      writable: true
    });
    expect(getActiveTenantId()).toBe('handenur-haluk');
  });
});