import { fireEvent, render, screen } from '@testing-library/react';

import { profileHeader, profileTimeline } from '@/modules/profile/data/profile-data';
import type { TimelineSection } from '@/modules/profile/data/profile-data';

import DownloadProfileButton from './download-profile-button';

describe('DownloadProfileButton', () => {
  const createObjectURL = jest.fn(() => 'blob:perfil');
  const revokeObjectURL = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 2));
    Object.assign(URL, { createObjectURL, revokeObjectURL });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
  });

  it('descarga el perfil en JSON con el nombre esperado', () => {
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.download).toBe('perfil_carlos_mendoza_rios_2026-10-02.json');
      expect(this.href).toBe('blob:perfil');
    });

    render(<DownloadProfileButton header={profileHeader} sections={profileTimeline} />);
    fireEvent.click(screen.getByRole('button', { name: 'Descargar' }));

    expect(click).toHaveBeenCalledTimes(1);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:perfil');
  });

  it('se desactiva cuando el perfil no tiene bloques', () => {
    const empty: TimelineSection[] = [
      { title: 'EDUCACIÓN', items: [] },
      { title: 'EXPERIENCIA LABORAL', items: [] },
      { title: 'CERTIFICACIONES', items: [] },
    ];

    render(<DownloadProfileButton header={profileHeader} sections={empty} />);

    expect(screen.getByRole('button', { name: 'Descargar' })).toBeDisabled();
  });
});
