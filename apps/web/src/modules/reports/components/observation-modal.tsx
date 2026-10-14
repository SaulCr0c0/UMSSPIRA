'use client';

import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { Graduate } from '../data/graduates.mock';

interface ObservationModalProps {
  graduate: Graduate;
  onClose: () => void;
}

export function ObservationModal({ graduate, onClose }: ObservationModalProps) {
  // Cierre accesible con tecla Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/55 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="observation-modal-title"
        aria-modal="true"
        className="w-full max-w-2xl overflow-hidden rounded-sm bg-white shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 bg-[#25384a] px-6 py-5 text-white sm:px-8">
          <div className="flex gap-3">
            <div
              aria-hidden="true"
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-[#c7783e] text-[#c7783e]"
            >
              !
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#d8783c]">
                Resolución de dictamen administrativo
              </p>
              <h2 id="observation-modal-title" className="mt-1 text-xl font-bold leading-tight sm:text-2xl">
              Expediente de Observación y Motivos de Rechazo
              </h2>
            </div>
          </div>
          <button
            aria-label="Cerrar modal"
            className="rounded-md p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <div className="space-y-3 px-4 py-4 sm:px-5">
          <div className="grid grid-cols-1 divide-y divide-[#ddd8ca] bg-[#f1eee6] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Número de registro
              </p>
              <p className="mt-0.5 text-xs font-semibold text-slate-700">
                {graduate.registrationNumber}
              </p>
            </div>
            <div className="px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Código SIS
              </p>
              <p className="mt-0.5 text-xs font-semibold text-slate-700">{graduate.sisCode}</p>
            </div>
            <div className="px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Postulante titulado
              </p>
              <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">
                {graduate.fullName}
              </p>
            </div>
          </div>

          <div className="border border-red-200 bg-red-50 px-3 py-3 sm:px-4">
            <div className="flex gap-2">
              <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-red-500" size={16} />
              <div>
                <p className="text-sm font-bold text-red-700">
                  Causales Determinantes de Inadmisibilidad
                </p>
                <p className="mt-1 text-xs leading-relaxed text-red-700">
                  El grado no ha sido incorporado al padrón general debido al incumplimiento de
                  las siguientes disposiciones del Código Universitario:
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Lista detallada de causales y motivos formales
            </p>
            <div className="bg-[#f1eee6] px-4 py-3">
              <div className="flex gap-2 text-xs leading-relaxed text-slate-700">
                <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
                <p>
                  <strong className="font-bold text-slate-800">Motivo registrado: </strong>
                  {graduate.rejectionReason || 'No se especificó un motivo para este expediente.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-4 grid grid-cols-1 divide-y divide-[#ddd8ca] bg-[#f1eee6] sm:mx-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Fecha de emisión de dictamen
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-700">
              {graduate.reviewDate} — (Auditoría Central)
            </p>
          </div>
          <div className="px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Responsable de dictamen pericial
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-700">
              Dirección de Carrera
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#ddd8ca] bg-[#f1eee6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-[10px] text-slate-500">
            Resolución vinculante · Vía reconsideración ordinaria: 15 días hábiles
          </p>
          <button
            className="rounded-md bg-[#25384a] px-7 py-2 text-xs font-bold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            onClick={onClose}
            type="button"
          >
            Cerrar Dictamen
          </button>
        </div>
      </section>
    </div>
  );
}