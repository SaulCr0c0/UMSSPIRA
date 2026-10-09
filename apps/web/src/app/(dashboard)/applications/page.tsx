"use client";

import { useState } from "react";
import { ApplicationDrawer } from "../../../modules/applications/frontend/components/application-drawer";
import { ApplicationsFilters } from "../../../modules/applications/frontend/components/applications-filters";
import { ApplicationsTable } from "../../../modules/applications/frontend/components/applications-table";
import { useApplications } from "../../../modules/applications/frontend/hooks/use-applications";

export default function ApplicationsPage() {
  const {
    items,
    total,
    status,
    error,
    query,
    searchInput,
    setSearchInput,
    setFilter,
    setPage,
    clearFilters,
    reload,
  } = useApplications();

  // Expediente abierto en el drawer (CA-04.3)
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex min-h-[calc(100vh-72px)] flex-col">
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 p-6">
        <header className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-blue-fantastic">Bandeja de Solicitudes</h1>
            <span className="rounded-full bg-oatmeal/50 px-3 py-1 text-xs font-semibold text-blue-fantastic">
              {total} en total
            </span>
          </div>
          <p className="text-sm text-blue-fantastic/80">
            Gestión y auditoría de expedientes de egresados de Ingeniería de Sistemas
          </p>
        </header>

        <section className="rounded-xl border border-oatmeal/60 bg-white p-4 shadow-sm">
          <ApplicationsFilters
            query={query}
            searchInput={searchInput}
            onSearchChange={setSearchInput}
            onFilterChange={setFilter}
            onClear={clearFilters}
          />
        </section>

        <section className="overflow-hidden rounded-xl border border-oatmeal/60 bg-white shadow-sm">
          <ApplicationsTable
            items={items}
            total={total}
            page={query.page}
            pageSize={query.pageSize}
            status={status}
            error={error}
            onPageChange={setPage}
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

      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-6 text-xs text-blue-fantastic">
        <p>
          <strong>Facultad de Ciencias y Tecnología</strong> — Universidad Mayor de San Simón
        </p>
        <p>© {new Date().getFullYear()} UMSSPIRA Backoffice. Sistema de Validación y Registro Académico.</p>
      </footer>
    </div>
  );
}