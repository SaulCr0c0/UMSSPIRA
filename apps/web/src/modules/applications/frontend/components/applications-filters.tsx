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
  "h-11 w-full rounded-lg border border-oatmeal bg-palladian/50 px-3 text-sm text-abyssal-blue outline-none placeholder:text-gray-500 focus:border-blue-fantastic";

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 4v5h-5" />
    </svg>
  );
}

export function ApplicationsFilters({
  query,
  searchInput,
  onSearchChange,
  onFilterChange,
  onClear,
}: ApplicationsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <label htmlFor="applications-search" className="sr-only">
          Buscar
        </label>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          <SearchIcon />
        </span>
        <input
          id="applications-search"
          type="search"
          placeholder="Buscar por C.I., Nombre o Código SIS"
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          className={`${controlClass} pl-9`}
        />
      </div>

      <div className="lg:w-56">
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

      <div className="lg:w-56">
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
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-oatmeal bg-white px-4 text-sm font-semibold text-abyssal-blue hover:bg-palladian"
      >
        <RefreshIcon />
        Limpiar filtros
      </button>
    </div>
  );
}