import React from 'react';
import { render } from '../../../../tests/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { CeremonySection } from './CeremonySection';

vi.mock('framer-motion', () => ({
  m: { section: ({ children, className }) => <section className={className}>{children}</section> }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('CeremonySection Bileşen Testleri', () => {
  it('eventDetails undefined veya null ise hatasız render olmalı', () => {
    const { container } = render(<CeremonySection eventDetails={undefined} />);
    expect(container.querySelector('.ceremony-card')).toBeInTheDocument();
  });
});