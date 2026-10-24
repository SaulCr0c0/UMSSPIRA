'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

import { enlaceDeDescarga, obtenerEnlaceRespaldo } from '@/modules/profile/services/perfil-api';

type BackupViewerModalProps = {
  certificationId: string;
  // Se muestra como título del visor
  certificationName: string;
  onClose: () => void;
};

const secondaryButtonClassName =
  'rounded-lg border border-truffle-trouble bg-white px-5 py-2.5 text-sm font-bold text-truffle-trouble transition hover:bg-palladian';
const primaryButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-truffle-trouble px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-95';

// Visor de la foto JPG real del respaldo (HU-10). Se monta al abrirse, así cada apertura pide un enlace nuevo
export function BackupViewerModal({ certificationId, certificationName, onClose }: BackupViewerModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Si el modal se cierra antes de que llegue el enlace, la respuesta ya no se usa
    let active = true;
    obtenerEnlaceRespaldo(certificationId)
      .then((enlace) => {
        if (active) setImageUrl(enlace.url);
      })
      .catch(() => {
        // Los estados de carga y error del visor se agregan en T10.4
      });
    return () => {
      active = false;
    };
  }, [certificationId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-abyssal-blue/50 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-viewer-title"
        className="flex w-full max-w-[720px] flex-col rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="backup-viewer-title" className="text-lg font-bold leading-snug text-blue-fantastic">
            {certificationName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar visor"
            className="shrink-0 rounded p-1 text-blue-fantastic transition hover:bg-palladian"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center rounded-lg bg-palladian">
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- el enlace firmado vence, no se optimiza con next/image
            <img src={imageUrl} alt={`Respaldo de ${certificationName}`} className="rounded-lg" />
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className={secondaryButtonClassName}>
            Cerrar
          </button>
          {/* La API responde el JPG original como adjunto con descargar=1 */}
          {imageUrl && (
            <a href={enlaceDeDescarga(imageUrl)} download className={primaryButtonClassName}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Descargar
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
