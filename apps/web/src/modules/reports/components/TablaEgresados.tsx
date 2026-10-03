'use client';

import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, List } from 'lucide-react';
import type { Egresado } from '../data/egresados.mock';

const PAGE_SIZE = 10;

const COLUMNAS = [
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

interface TablaEgresadosProps {
  egresados: Egresado[];
}

export function TablaEgresados({ egresados }: TablaEgresadosProps) {
  const [pagina, setPagina] = useState(1);

  const total = egresados.length;
  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Si cambian los filtros, vuelve a la página 1
  useEffect(() => {
    setPagina(1);
  }, [egresados]);

  const inicio = (pagina - 1) * PAGE_SIZE;
  const visibles = egresados.slice(inicio, inicio + PAGE_SIZE);
  const desde = total === 0 ? 0 : inicio + 1;
  const hasta = Math.min(inicio + PAGE_SIZE, total);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#1B2632]">Vista General de Titulados</h2>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md border border-[#C9C1B1] bg-[#EEE9DF] px-4 py-2 text-sm font-medium text-[#1B2632] hover:bg-[#C9C1B1]/50"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Exportar
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#C9C1B1]">
        <table className="min-w-[1500px] w-full text-sm">
          <thead className="bg-[#1B2632] text-white">
            <tr>
              {COLUMNAS.map((col) => (
                <th key={col} className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibles.length === 0 ? (
              <tr>
                <td colSpan={COLUMNAS.length} className="bg-[#FBF9F5] px-4 py-10 text-center text-[#2C3B4D]">
                  No se encontraron egresados con esos filtros.
                </td>
              </tr>
            ) : (
              visibles.map((e, i) => (
                <tr key={e.numeroRegistro} className={i % 2 === 0 ? 'bg-[#FBF9F5]' : 'bg-[#F4EFE4]'}>
                  <td className="whitespace-nowrap px-4 py-4 text-center text-[#2C3B4D]">{e.numeroRegistro}</td>
                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#1B2632]">{e.nombreCompleto}</td>
                  <td className="px-4 py-4 text-center text-[#2C3B4D]">{e.codigoSis}</td>
                  <td className="px-4 py-4 text-center text-[#2C3B4D]">{e.telefono}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-[#2C3B4D]">{e.correo}</td>
                  <td className="px-4 py-4 text-center text-[#2C3B4D]">{e.fechaIngreso}</td>
                  <td className="px-4 py-4 text-center text-[#2C3B4D]">{e.fechaTitulacion}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-center text-[#2C3B4D]">{e.duracionEstudio}</td>
                  <td className="px-4 py-4 text-center text-[#2C3B4D]">{e.fechaRevision}</td>
                  <td className="px-4 py-4 text-center text-[#2C3B4D]">{e.motivoRechazo ?? '—'}</td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block rounded px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white ${
                        e.estado === 'VERIFICADO' ? 'bg-[#2C3B4D]' : 'bg-[#FFB162]'
                      }`}
                    >
                      {e.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="flex items-center gap-2 text-sm text-[#2C3B4D]">
          <List className="h-4 w-4" />
          Mostrando {desde}-{hasta} de {total} registros
        </p>

        <nav className="flex items-center gap-2" aria-label="Paginación">
          <button
            type="button"
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
            className="rounded-md border border-[#C9C1B1] bg-[#EEE9DF] px-4 py-2 text-sm font-medium uppercase text-[#1B2632] hover:bg-[#C9C1B1]/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPagina(n)}
              aria-current={n === pagina ? 'page' : undefined}
              className={`h-10 w-10 rounded-md border text-sm font-medium ${
                n === pagina
                  ? 'border-[#1B2632] bg-[#1B2632] text-white'
                  : 'border-[#C9C1B1] bg-[#EEE9DF] text-[#1B2632] hover:bg-[#C9C1B1]/50'
              }`}
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            className="rounded-md border border-[#C9C1B1] bg-[#EEE9DF] px-4 py-2 text-sm font-medium uppercase text-[#1B2632] hover:bg-[#C9C1B1]/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
          </button>
        </nav>
      </div>
    </section>
  );
}