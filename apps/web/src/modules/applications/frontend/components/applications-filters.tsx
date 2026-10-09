"use client";

import {
  CAREER_OPTIONS,
  STATUS_LABELS,
  type ApplicationStatus,
  type ApplicationsQuery,
} from "../services";

type FilterPatch = Partial<Pick<ApplicationsQuery, "career" | "status">>;

interface ApplicationsFiltersProps {
  query: ApplicationsQuery;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (partial: FilterPatch) => void;
  onClear: () => void;
}

const controlClass =
  "w-full rounded-lg border border-oatmeal/60 bg-white px-3 py-2.5 text-sm text-abyssal-blue outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-burning-flame";

// CA-04.2: filtros por carrera y estado, y búsqueda por C.I., nombre o Código SIS
export function ApplicationsFilters({
  query,
  searchInput,
  onSearchChange,
  onFilterChange,
  onClear,
}: ApplicationsFiltersProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-center">
      <div>
        <label htmlFor="applications-search" className="sr-only">
          Buscar
        </label>
        <input
          id="applications-search"
          type="search"
          placeholder="Buscar por C.I., Nombre o Código SIS"
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          className={controlClass}
        />
      </div>

      <div>
        <label htmlFor="applications-career" className="sr-only">
          Carrera
        </label>
        <select
          id="applications-career"
          value={query.career}
          onChange={(event) => onFilterChange({ career: event.target.value })}
          className={controlClass}
        >
          <option value="">Todas las carreras</option>
          {CAREER_OPTIONS.map((career) => (
            <option key={career} value={career}>
              {career}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="applications-status" className="sr-only">
          Estado
        </label>
        <select
          id="applications-status"
          value={query.status}
          onChange={(event) => onFilterChange({ status: event.target.value as "" | ApplicationStatus })}
          className={controlClass}
        >
          <option value="">Todos los estados</option>
          {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="rounded-lg border border-oatmeal/60 bg-white px-4 py-2.5 text-sm font-semibold text-abyssal-blue hover:bg-palladian"
      >
        Limpiar filtros
      </button>
    </div>
  );
}