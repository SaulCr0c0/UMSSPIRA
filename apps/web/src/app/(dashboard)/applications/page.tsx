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
    <main className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-abyssal-blue">Bandeja de Solicitudes</h1>
          <span className="rounded-full border border-oatmeal bg-white px-3 py-1 text-xs font-semibold text-gray-600">
            {total} en total
          </span>
        </div>
        <p className="text-sm text-gray-600">
          Gestión y auditoría de expedientes de egresados de Ingeniería de Sistemas
        </p>
      </header>

      <section className="rounded-xl border border-oatmeal bg-white p-4">
        <ApplicationsFilters
          query={query}
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          onFilterChange={setFilter}
          onClear={clearFilters}
        />
      </section>

      <ApplicationsTable
        items={items}
        total={total}
        page={query.page}
        status={status}
        error={error}
        onPageChange={setPage}
        onClearFilters={clearFilters}
        onSelect={(application) => setSelectedId(application.id)}
      />

      <ApplicationDrawer
        open={selectedId !== null}
        applicationId={selectedId}
        onClose={() => setSelectedId(null)}
        onReviewed={reload}
      />
    </main>
  );
}