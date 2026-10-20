const RESERVED_PATHS = new Set(['admin', 'live', 'login', 'register', '']);

export function getActiveTenantId(): string | null {
  if (typeof window === 'undefined') return null;
  const segments = window.location.pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const firstSegment = segments[0].toLowerCase();
  if (RESERVED_PATHS.has(firstSegment)) {
    return null;
  }
  return firstSegment;
}