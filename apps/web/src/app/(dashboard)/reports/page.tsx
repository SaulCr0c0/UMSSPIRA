'use client';

import { useState, useMemo } from 'react';
import { KpiCard } from '../../../modules/reports/components/kpi-card';
import { GraduatesTable } from '../../../modules/reports/components/graduates-table';
import { EmptyState } from '../../../modules/reports/components/empty-state';
import { GraduatesSearch } from '../../../modules/reports/components/graduates-search';
import {
  GraduatesStatusFilter,
  type StatusFilterOption,
} from '../../../modules/reports/components/graduates-status-filter';
import { useDashboardIndicators } from '../../../modules/reports/hooks/use-dashboard-indicators';
import { useGraduates } from '../../../modules/reports/hooks/use-graduates';

export default function ReportsPage() {
  const {
    data: indicators,
    loading: loadingIndicators,
    error: errorIndicators,
  } = useDashboardIndicators();
  const { data: graduates, loading: loadingGraduates } = useGraduates();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilterOption>('TODOS');

  // Filtrado reactivo en cliente (HU2)
  const filteredGraduates = useMemo(() => {
    if (!graduates) return [];

    return graduates.filter((graduate) => {
      // 1. Filtro por estado
      const matchesStatus =
        selectedStatus === 'TODOS' || graduate.status === selectedStatus;

      // 2. Filtro predictivo por nombre o código SIS
      const normalizedQuery = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !normalizedQuery ||
        graduate.fullName.toLowerCase().includes(normalizedQuery) ||
        graduate.sisCode.includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });
  }, [graduates, selectedStatus, searchTerm]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('TODOS');
  };

  if (loadingIndicators || loadingGraduates) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Cargando módulo de reportes...</p>
      </div>
    );
  }

  return (
    <main className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard de Indicadores
        </h1>
      </div>

      {errorIndicators ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {errorIndicators}
        </div>
      ) : (
        indicators && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Titulados registrados"
              value={indicators.totalGraduates}
            />
            <KpiCard
              title="Titulados verificados"
              value={indicators.verifiedGraduates}
            />
            <KpiCard
              title="Titulados observados"
              value={indicators.observedGraduates}
            />
            <KpiCard
              title="Mentores activos"
              value={indicators.activeMentors}
            />
          </div>
        )
      )}

      {/* Barra de herramientas: Búsqueda predictiva y filtro por estado (HU2) */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-[#C9C1B1] bg-[#EEE9DF] p-4 shadow-sm">
        <GraduatesSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onReset={handleResetFilters}
        />
        <GraduatesStatusFilter
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
      </section>

      {/* Renderizado condicional: Tabla o estado vacío */}
      {filteredGraduates.length === 0 ? (
        <EmptyState onRefresh={handleResetFilters} />
      ) : (
        <GraduatesTable graduates={filteredGraduates} />
      )}
    </main>
  );
}