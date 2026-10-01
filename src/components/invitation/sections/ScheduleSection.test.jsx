import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../../tests/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { ScheduleSection } from './ScheduleSection';

vi.mock('framer-motion', () => ({
  m: { section: ({ children, className }) => <section className={className}>{children}</section> }
}));

describe('ScheduleSection Bileşen Testleri', () => {
  it('Hiç program girilmemişse boş liste ile hatasız render olmalı', () => {
    const { container } = render(<ScheduleSection scheduleItems={undefined} />);
    // Bileşenin çökmediğinden emin olmak için class'ını arıyoruz
    expect(container.querySelector('.schedule-card')).toBeInTheDocument();
  });
});