import React from 'react';
import { render } from '../../../../tests/test-utils';
import { describe, it, expect } from 'vitest';
import { ScheduleSection } from './ScheduleSection';

describe('ScheduleSection Bileşen Testleri', () => {
  it('Hiç program girilmemişse boş liste ile hatasız render olmalı', () => {
    const { container } = render(<ScheduleSection scheduleItems={undefined} />);
    expect(container.querySelector('.schedule-card')).toBeInTheDocument();
  });
});