'use client';

import { Eye } from 'lucide-react';
import type { Graduate } from '../data/graduates.mock';

interface GraduatesTableProps {
  graduates: Graduate[];
  onViewReason: (graduate: Graduate) => void;
  startIndex?: number;
}

function StatusBadge({ status }: { status: Graduate['status'] }) {
  const isVerified = status === 'VERIFICADO';

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
        isVerified ? 'bg-[#1e293b] text-white' : 'bg-[#dc2626] text-white'
      }`}
    >
      {status}
    </span>
  );
}

export function GraduatesTable({
  graduates,
  onViewReason,
  startIndex = 0,
}: GraduatesTableProps) {
  return (
    <>
      {/* Vista de escritorio / tablet (Scroll horizontal controlado) */}
      <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1550px] border-collapse text-left text-sm">
            <thead className="bg-[#1e293b] text-xs font-bold uppercase tracking-wide text-white">
              <tr>
                <th className="px-4 py-4">Nro</th>
                <th className="px-4 py-4">Número de registro</th>
                <th className="px-4 py-4">Nombre completo</th>
                <th className="px-4 py-4">Código SIS</th>
                <th className="px-4 py-4">Teléfono</th>
                <th className="px-4 py-4">Correo electrónico</th>
                <th className="px-4 py-4">Fecha de ingreso</th>
                <th className="px-4 py-4">Fecha de titulación</th>
                <th className="px-4 py-4">Duración de estudio</th>
                <th className="px-4 py-4">Fecha de revisión</th>
                <th className="px-4 py-4">Motivo de rechazo</th>
                <th className="px-4 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {graduates.map((record, index) => (
                <tr className="align-top hover:bg-slate-50/80" key={record.id}>
                  <td className="whitespace-nowrap px-4 py-4">
                    {startIndex + index + 1}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-800">
                    {record.registrationNumber}
                  </td>
                  <td className="min-w-52 px-4 py-4 font-medium text-slate-900">
                    {record.fullName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">{record.sisCode}</td>
                  <td className="whitespace-nowrap px-4 py-4">{record.phone}</td>
                  <td className="px-4 py-4">{record.email}</td>
                  <td className="whitespace-nowrap px-4 py-4">{record.admissionDate}</td>
                  <td className="whitespace-nowrap px-4 py-4">{record.degreeDate ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-4">{record.studyDuration}</td>
                  <td className="whitespace-nowrap px-4 py-4">{record.reviewDate}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {record.status === 'VERIFICADO' ? (
                      <span aria-label="Sin motivo de rechazo" className="text-slate-400">
                        —
                      </span>
                    ) : (
                      <button
                        className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                        onClick={() => onViewReason(record)}
                        type="button"
                      >
                        <Eye aria-hidden="true" size={15} />
                        Ver motivo
                      </button>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <StatusBadge status={record.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista móvil (Tarjetas colapsables semánticas) */}
      <div className="space-y-3 md:hidden">
        {graduates.map((record) => (
          <article
            className="rounded-lg border border-[#d8d1c3] bg-[#fffaf0] p-2 shadow-sm"
            key={record.id}
          >
            <div className="flex items-start justify-between gap-2 border-b border-[#e4ded2] px-1 pb-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {record.registrationNumber}
                </p>
                <h3 className="mt-2 truncate text-xs font-bold text-slate-900">
                  {record.fullName}
                </h3>
                <p className="mt-0.5 truncate text-[10px] text-slate-600">{record.email}</p>
              </div>
              <StatusBadge status={record.status} />
            </div>

            <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-2 rounded-md border border-[#eee8dd] bg-white px-2 py-2 text-[9px]">
              <div>
                <dt className="font-semibold uppercase text-slate-500">Código SIS</dt>
                <dd className="mt-0.5 font-semibold text-slate-800">{record.sisCode}</dd>
              </div>
              <div>
                <dt className="font-semibold uppercase text-slate-500">Teléfono</dt>
                <dd className="mt-0.5 break-words text-slate-800">{record.phone}</dd>
              </div>
              <div>
                <dt className="font-semibold uppercase text-slate-500">Fecha de ingreso</dt>
                <dd className="mt-0.5 text-slate-800">{record.admissionDate}</dd>
              </div>
              <div>
                <dt className="font-semibold uppercase text-slate-500">Fecha de titulación</dt>
                <dd className="mt-0.5 text-slate-800">{record.degreeDate ?? '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold uppercase text-slate-500">Duración de estudio</dt>
                <dd className="mt-0.5 text-slate-800">{record.studyDuration}</dd>
              </div>
              <div>
                <dt className="font-semibold uppercase text-slate-500">Fecha de revisión</dt>
                <dd className="mt-0.5 text-slate-800">{record.reviewDate}</dd>
              </div>
            </dl>

            <div className="pt-2">
              {record.status === 'VERIFICADO' ? (
                <span className="block text-center text-[10px] text-slate-400">—</span>
              ) : (
                <button
                  className="inline-flex min-h-6 w-full items-center justify-center gap-1 rounded-md border border-red-300 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                  onClick={() => onViewReason(record)}
                  type="button"
                >
                  <Eye aria-hidden="true" size={12} />
                  Ver motivo de observación
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}