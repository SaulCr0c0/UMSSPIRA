'use client';

import { useState } from 'react';
import type { Graduate } from '../data/graduates.mock';
import { EmptyState } from './empty-state';

const PAGE_SIZE = 10;

const TABLE_COLUMNS = [
  'Número de registro',
  'Nombre completo',
  'Código SIS',
  'Teléfono',
  'Correo electrónico',
  'Fecha de ingreso',
  'Fecha de titulación',
  'Duración de estudio',
  'Fecha de revisión',
  'Motivo de rechazo',
  'Estado',
];

interface GraduatesTableProps {
  graduates: Graduate[];
}

export function GraduatesTable({ graduates }: GraduatesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const total = graduates.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (total === 0) {
    return <EmptyState />;
  }

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleGraduates = graduates.slice(startIndex, startIndex + PAGE_SIZE);
  const fromRecord = startIndex + 1;
  const toRecord = Math.min(startIndex + PAGE_SIZE, total);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1B2632]">Vista General de Titulados</h2>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-[#1B2632] text-white">
            <tr>
              {TABLE_COLUMNS.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {visibleGraduates.map((grad, index) => (
              <tr
                key={grad.id || grad.registrationNumber}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="whitespace-nowrap px-4 py-3 text-center text-gray-700">
                  {grad.registrationNumber}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                  {grad.fullName}
                </td>
                <td className="px-4 py-3 text-center text-gray-700">{grad.sisCode}</td>
                <td className="px-4 py-3 text-center text-gray-700">{grad.phone}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">{grad.email}</td>
                <td className="px-4 py-3 text-center text-gray-700">{grad.admissionDate}</td>
                <td className="px-4 py-3 text-center text-gray-700">{grad.degreeDate ?? '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-center text-gray-700">
                  {grad.studyDuration}
                </td>
                <td className="px-4 py-3 text-center text-gray-700">{grad.reviewDate}</td>
                <td className="px-4 py-3 text-center text-gray-700">
                  {grad.rejectionReason ?? '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block rounded px-2.5 py-1 text-xs font-semibold ${
                      grad.status === 'VERIFICADO'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {grad.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 py-2 sm:flex-row">
        <p className="text-sm text-gray-600">
          Mostrando {fromRecord} - {toRecord} de {total} registros
        </p>

        <nav className="flex items-center gap-2" aria-label="Paginación">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>

          <span className="text-xs text-gray-600">
            Página {currentPage} de {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </nav>
      </div>
    </section>
  );
}