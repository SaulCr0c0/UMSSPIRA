"use client";

import type { ReactNode } from "react";
import {
  AGE_LABELS,
  CAREER_OPTIONS,
  STATUS_LABELS,
  shortCareer,
  type AgeFilter,
  type ApplicationStatus,
  type ApplicationsQuery,
} from "../services";

type FilterPatch = Partial<Pick<ApplicationsQuery, "career" | "status" | "age">>;

interface ApplicationsFiltersProps {
  query: ApplicationsQuery;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (partial: FilterPatch) => void;
  onClear: () => void;
  trailing?: ReactNode;
}

const AGE_OPTIONS: { value: AgeFilter; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "within48", label: AGE_LABELS.within48 },
  { value: "over48", label: AGE_LABELS.over48 },
];

const controlClass =
  "w-full rounded-lg bg-palladian px-3 py-2.5 text-sm text-abyssal-blue outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-burning-flame";

interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

export function ApplicationsFilters({
  query,
  searchInput,
  onSearchChange,
  onFilterChange,
  onClear,
  trailing,
}: ApplicationsFiltersProps) {
  const chips: FilterChip[] = [];
  if (query.career) {
    chips.push({
      key: "career",
      label: `Carrera: Ing. ${shortCareer(query.career)}`,
      onRemove: () => onFilterChange({ career: "" }),
    });
  }
  if (query.status) {
    chips.push({
      key: "status",
      label: `Estado: ${STATUS_LABELS[query.status]}`,
      onRemove: () => onFilterChange({ status: "" }),
    });
  }
  if (query.age) {
    chips.push({
      key: "age",
      label: `Antigüedad: ${AGE_LABELS[query.age]}`,
      onRemove: () => onFilterChange({ age: "" }),
    });
  }
  if (query.search) {
    chips.push({
      key: "search",
      label: `Búsqueda: ${query.search}`,
      onRemove: () => onSearchChange(""),
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_auto_auto] lg:items-center">
        <div>
          <label htmlFor="applications-search" className="sr-only">
            Buscar
          </label>
          <input
            id="applications-search"
            type="search"
            placeholder="Buscar por código (EGR-...), C.I. o nombre completo"
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

        <div role="group" aria-label="Antigüedad" className="inline-flex rounded-lg bg-palladian p-1">
          {AGE_OPTIONS.map((option) => {
            const selected = query.age === option.value;
            return (
              <button
                key={option.label}
                type="button"
                aria-pressed={selected}
                onClick={() => onFilterChange({ age: option.value })}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                  selected ? "bg-abyssal-blue text-white" : "text-abyssal-blue"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {trailing}
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold uppercase tracking-wide text-gray-500">Filtros activos:</span>
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 rounded-full bg-palladian px-3 py-1 font-semibold text-abyssal-blue"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.onRemove}
                aria-label={`Quitar filtro ${chip.label}`}
                className="text-truffle-trouble hover:opacity-70"
              >
                ×
              </button>
            </span>
          ))}
          <button type="button" onClick={onClear} className="font-semibold text-truffle-trouble hover:underline">
            Restablecer filtros
          </button>
        </div>
      )}
    </div>
  );
}