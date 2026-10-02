'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, RotateCw } from 'lucide-react';

export type FiltroEstado = 'todos' | 'VERIFICADO' | 'OBSERVADO';

interface BuscadorEgresadosProps {
  onFiltrar: (estado: FiltroEstado, texto: string) => void;
}

export function BuscadorEgresados({ onFiltrar }: BuscadorEgresadosProps) {
  const [estado, setEstado] = useState<FiltroEstado>('todos');
  const [texto, setTexto] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltrar(estado, texto);
  };

  const handleReset = () => {
    setEstado('todos');
    setTexto('');
    onFiltrar('todos', '');
  };

  return (
    <section className="rounded-lg border border-[#C9C1B1] bg-[#EEE9DF] p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#C9C1B1] pb-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-[#1B2632]">
          <SlidersHorizontal className="h-5 w-5" />
          Egresados registrados
        </h2>
        <button
          type="button"
          onClick={handleReset}
          aria-label="Limpiar filtros"
          className="text-[#2C3B4D] hover:text-[#1B2632]"
        >
          <RotateCw className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex w-full flex-col gap-1.5 lg:w-80">
          <label htmlFor="estado" className="text-xs font-semibold uppercase tracking-wide text-[#2C3B4D]">
            Parámetro de estado
          </label>
          <select
            id="estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value as FiltroEstado)}
            className="h-11 rounded-md border border-[#C9C1B1] bg-white px-3 text-sm text-[#1B2632] focus:outline-none focus:ring-2 focus:ring-[#FFB162]"
          >
            <option value="todos">todos</option>
            <option value="VERIFICADO">verificado</option>
            <option value="OBSERVADO">observado</option>
          </select>
        </div>

        <div className="flex w-full flex-1 flex-col gap-1.5">
          <label htmlFor="busqueda" className="text-xs font-semibold uppercase tracking-wide text-[#2C3B4D]">
            Búsqueda por código SIS o nombre
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2C3B4D]/60" />
            <input
              id="busqueda"
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Ej: 201804921 o Morales Albarracín..."
              className="h-11 w-full rounded-md border border-[#C9C1B1] bg-white pl-9 pr-3 text-sm text-[#1B2632] placeholder:text-[#2C3B4D]/50 focus:outline-none focus:ring-2 focus:ring-[#FFB162]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="h-11 w-full rounded-md bg-[#2C3B4D] px-8 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#1B2632] lg:w-72"
        >
          Filtrar
        </button>
      </form>
    </section>
  );
}