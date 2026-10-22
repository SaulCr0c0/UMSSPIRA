'use client';

import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import type { BoardStatus } from '@/modules/applications/frontend/services/applications-board.service';

export interface BoardFilters {
  search: string;
  career: string;
  status: '' | BoardStatus;
  period: 'all' | 'last15' | 'last30' | 'custom';
  fromDate: string;
  toDate: string;
}

export const EMPTY_FILTERS: BoardFilters = {
  search: '',
  career: '',
  status: '',
  period: 'all',
  fromDate: '',
  toDate: '',
};

const STATUS_OPTIONS: { value: '' | BoardStatus; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDING', label: 'Pendiente de validación' },
  { value: 'OBSERVED', label: 'Observado' },
  { value: 'APPROVED', label: 'Aprobado' },
  { value: 'REJECTED', label: 'Rechazado' },
];

export interface RequestsFiltersProps {
  filters: BoardFilters;
  careers: { id: string; nombre: string }[];
  onChange: (filters: BoardFilters) => void;
  onClear: () => void;
}

// Barra de búsqueda y filtros combinados (CA-04.2).
export function RequestsFilters({ filters, careers, onChange, onClear }: RequestsFiltersProps) {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.career !== '' ||
    filters.status !== '' ||
    filters.period !== 'all';

  return (
    <div className="rounded-2xl border border-oatmeal bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <Input
            label="Buscar"
            placeholder="Buscar por C.I., Nombre o Código SIS"
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-career" className="text-[13px] font-semibold text-abyssal-blue">
            Carrera
          </label>
          <select
            id="filter-career"
            value={filters.career}
            onChange={(event) => onChange({ ...filters, career: event.target.value })}
            className="h-11 rounded-lg border border-oatmeal bg-palladian px-3 text-sm text-abyssal-blue outline-none focus:border-2 focus:border-blue-fantastic focus:bg-white"
          >
            <option value="">Todas las carreras</option>
            {careers.map((career) => (
              <option key={career.id} value={career.nombre}>
                {career.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-status" className="text-[13px] font-semibold text-abyssal-blue">
            Estado
          </label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(event) => onChange({ ...filters, status: event.target.value as BoardFilters['status'] })}
            className="h-11 rounded-lg border border-oatmeal bg-palladian px-3 text-sm text-abyssal-blue outline-none focus:border-2 focus:border-blue-fantastic focus:bg-white"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-period" className="text-[13px] font-semibold text-abyssal-blue">
            Periodo de registro
          </label>
          <select
            id="filter-period"
            value={filters.period}
            onChange={(event) => {
              const period = event.target.value as BoardFilters['period'];
              onChange({
                ...filters,
                period,
                ...(period === 'custom' ? {} : { fromDate: '', toDate: '' }),
              });
            }}
            className="h-11 rounded-lg border border-oatmeal bg-palladian px-3 text-sm text-abyssal-blue outline-none focus:border-2 focus:border-blue-fantastic focus:bg-white"
          >
            <option value="all">Todo el periodo</option>
            <option value="last15">Últimos 15 días</option>
            <option value="last30">Últimos 30 días</option>
            <option value="semester1" disabled>
              Semestre I (pendiente de definición del PO)
            </option>
            <option value="semester2" disabled>
              Semestre II (pendiente de definición del PO)
            </option>
            <option value="custom">Desde / Hasta</option>
          </select>
        </div>
        <Button type="button" variant="secondary" onClick={onClear} disabled={!hasActiveFilters}>
          Limpiar filtros
        </Button>
      </div>
      {filters.period === 'custom' && (
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-from-date" className="text-[13px] font-semibold text-abyssal-blue">
              Desde
            </label>
            <input
              id="filter-from-date"
              type="date"
              max={filters.toDate || undefined}
              value={filters.fromDate}
              onChange={(event) => onChange({ ...filters, fromDate: event.target.value })}
              className="h-11 rounded-lg border border-oatmeal bg-palladian px-3 text-sm text-abyssal-blue outline-none focus:border-2 focus:border-blue-fantastic focus:bg-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-to-date" className="text-[13px] font-semibold text-abyssal-blue">
              Hasta
            </label>
            <input
              id="filter-to-date"
              type="date"
              min={filters.fromDate || undefined}
              value={filters.toDate}
              onChange={(event) => onChange({ ...filters, toDate: event.target.value })}
              className="h-11 rounded-lg border border-oatmeal bg-palladian px-3 text-sm text-abyssal-blue outline-none focus:border-2 focus:border-blue-fantastic focus:bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
