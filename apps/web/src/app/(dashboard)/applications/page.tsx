"use client";

import { useState } from "react";
import { ApplicationDrawer } from "../../../modules/applications/frontend/components/application-drawer";
import { ApplicationsFilters } from "../../../modules/applications/frontend/components/applications-filters";
import { ApplicationsSummaryCards } from "../../../modules/applications/frontend/components/applications-summary";
import { ApplicationsTable } from "../../../modules/applications/frontend/components/applications-table";
import { useApplications } from "../../../modules/applications/frontend/hooks/use-applications";

export default function ApplicationsPage() {
  const {
    items,
    total,
    status,
    error,
    query,
    summary,
    searchInput,
    setSearchInput,
    setFilter,
    setPage,
    setPageSize,
    clearFilters,
    reload,
  } = useApplications();

  // Expediente abierto en el drawer (CA-04.3)
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-6 rounded-2xl bg-palladian p-6">
        <div className="max-w-3xl space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-truffle-trouble">
            Comisión de Acreditación FCyT • UMSS
          </p>
          <h1 className="font-display text-3xl font-bold text-abyssal-blue">Bandeja de Solicitudes Académicas</h1>
          <p className="text-sm text-gray-700">
            Revisión y validación de expedientes de titulación y acreditación para egresados de Ingeniería de
            Sistemas y Licenciatura en Informática. En conformidad con la Res. FCyT N° 104/2024, el ciclo de
            auditoría documental dispone de un plazo máximo estricto de 48 horas continuas desde el registro
            del postulante.
          </p>
        </div>

        <div className="rounded-xl bg-white/70 px-5 py-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-600">SLA institucional FCyT</p>
          <p className="mt-1 font-display text-4xl font-bold text-abyssal-blue">
            {summary ? `${summary.slaCompliance}%` : "—"}
          </p>
          {summary && (
            <p
              className={`mt-1 text-xs font-semibold ${
                summary.slaCompliance >= 90 ? "text-green-800" : "text-truffle-trouble"
              }`}
            >
              {summary.slaCompliance >= 90 ? "En cumplimiento normativo" : "Por debajo de la meta"}
            </p>
          )}
        </div>
      </header>

      <ApplicationsSummaryCards summary={summary} />

      <section className="rounded-2xl bg-white p-6 shadow-lg">
        <ApplicationsFilters
          query={query}
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          onFilterChange={setFilter}
          onClear={clearFilters}
          trailing={
            <button
              type="button"
              disabled
              title="Disponible en una próxima versión"
              className="rounded-lg bg-palladian px-4 py-2.5 text-sm font-semibold text-abyssal-blue disabled:opacity-60"
            >
              Exportar Acta CSV/PDF
            </button>
          }
        />
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-lg">
        <ApplicationsTable
          items={items}
          total={total}
          page={query.page}
          pageSize={query.pageSize}
          status={status}
          error={error}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onClearFilters={clearFilters}
          onSelect={(application) => setSelectedId(application.id)}
        />
      </section>

      <ApplicationDrawer
        open={selectedId !== null}
        applicationId={selectedId}
        onClose={() => setSelectedId(null)}
        onReviewed={reload}
      />
    </main>
  );
}