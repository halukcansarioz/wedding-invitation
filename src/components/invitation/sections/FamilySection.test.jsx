import React from 'react';
import { render, screen, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { FamilySection } from './FamilySection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('FamilySection Bileşen Testleri', () => {
  afterEach(() => cleanup());

  it('Aile isimlerini ve basliklarini render etmeli', () => {
    const familyInfo = {
      brideFamilyTitle: "Gelin Ailesi",
      brideFamilyName: "Yilmaz",
      groomFamilyTitle: "Damat Ailesi",
      groomFamilyName: "Kaya",
      text: "Mutlulugumuzu paylasin"
    };

    render(<FamilySection familyInfo={familyInfo} />);

    expect(screen.getByText('Yilmaz')).toBeDefined();
    expect(screen.getByText('Kaya')).toBeDefined();
    expect(screen.getByText('Mutlulugumuzu paylasin')).toBeDefined();
  });
});