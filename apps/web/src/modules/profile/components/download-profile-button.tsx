'use client';

import { Download } from 'lucide-react';

import type { ProfileHeader, TimelineSection } from '@/modules/profile/data/profile-data';
import { buildProfileJson, hasProfileBlocks } from '@/modules/profile/utils/build-profile-json';
import { buildProfileFileName } from '@/modules/profile/utils/profile-file-name';

type DownloadProfileButtonProps = {
  header: ProfileHeader;
  sections: TimelineSection[];
};

/**
 * Descarga el perfil en JSON directamente en el navegador, sin recargar la página.
 * El endpoint GET /api/v1/perfil/exportar-json todavía no existe en el backend, por eso
 * el archivo se genera en el cliente a partir de los datos del perfil.
 */
function downloadProfile(header: ProfileHeader, sections: TimelineSection[]) {
  const now = new Date();
  const content = JSON.stringify(buildProfileJson(header, sections, now), null, 2);
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));

  const link = document.createElement('a');
  link.href = url;
  link.download = buildProfileFileName(header.name, now);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function DownloadProfileButton({ header, sections }: DownloadProfileButtonProps) {
  // Sin bloques completados no hay nada que exportar
  const disabled = !hasProfileBlocks(sections);

  return (
    <button
      type="button"
      onClick={() => downloadProfile(header, sections)}
      disabled={disabled}
      title={disabled ? 'Completa al menos un bloque de tu perfil para descargarlo' : undefined}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-umss-navy px-6 py-3.5 text-sm font-bold text-umss-cream transition hover:bg-umss-ink disabled:cursor-not-allowed disabled:bg-umss-sand disabled:text-umss-navy/50"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      Descargar
    </button>
  );
}
