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
import { Pagination } from '../../../modules/reports/components/pagination';
import { ObservationModal } from '../../../modules/reports/components/observation-modal';
import { useDashboardIndicators } from '../../../modules/reports/hooks/use-dashboard-indicators';
import { useGraduates } from '../../../modules/reports/hooks/use-graduates';
import type { Graduate } from '../../../modules/reports/data/graduates.mock';

const ITEMS_PER_PAGE = 10;

export default function ReportsPage() {
  const {
    data: indicators,
    loading: loadingIndicators,
    error: errorIndicators,
  } = useDashboardIndicators();
  const { data: graduates, loading: loadingGraduates } = useGraduates();

  // Estados de filtrado (HU2)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilterOption>('TODOS');

  // Estados de paginación y modal (HU3)
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGraduate, setSelectedGraduate] = useState<Graduate | null>(null);

  // Filtrado reactivo en memoria
  const filteredGraduates = useMemo(() => {
    if (!graduates) return [];

    return graduates.filter((graduate) => {
      const matchesStatus =
        selectedStatus === 'TODOS' || graduate.status === selectedStatus;

      const normalizedQuery = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !normalizedQuery ||
        graduate.fullName.toLowerCase().includes(normalizedQuery) ||
        graduate.sisCode.includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });
  }, [graduates, selectedStatus, searchTerm]);

  // Manejadores reactivos que resetean la paginación al alterar filtros
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: StatusFilterOption) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('TODOS');
    setCurrentPage(1);
  };

  // Rebanado (slice) de la lista para paginación estricta de 10 elementos
  const paginatedGraduates = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGraduates.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredGraduates, currentPage]);

  if (loadingIndicators || loadingGraduates) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Cargando módulo de reportes...</p>
      </div>
    );
  }

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Indicadores</h1>
        <p className="text-sm text-gray-500">Padrón y reportería institucional de titulados</p>
      </div>

      {errorIndicators ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {errorIndicators}
        </div>
      ) : (
        indicators && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard title="Titulados registrados" value={indicators.totalGraduates} />
            <KpiCard title="Titulados verificados" value={indicators.verifiedGraduates} />
            <KpiCard title="Titulados observados" value={indicators.observedGraduates} />
            <KpiCard title="Mentores activos" value={indicators.activeMentors} />
          </div>
        )
      )}

      {/* Controles de Búsqueda y Filtrado (HU2) */}
      <section className="flex flex-col gap-4 rounded-lg border border-[#C9C1B1] bg-[#EEE9DF] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <GraduatesSearch
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onReset={handleResetFilters}
        />
        <GraduatesStatusFilter
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
        />
      </section>

      {/* Tabla con Paginación o Estado Vacío (HU1 + HU3) */}
      {filteredGraduates.length === 0 ? (
        <EmptyState onRefresh={handleResetFilters} />
      ) : (
        <div className="space-y-2">
          <GraduatesTable
            graduates={paginatedGraduates}
            onViewReason={setSelectedGraduate}
          />
          <Pagination
            currentPage={currentPage}
            totalItems={filteredGraduates.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modal de Detalle de Observación (HU3) */}
      {selectedGraduate && (
        <ObservationModal
          graduate={selectedGraduate}
          onClose={() => setSelectedGraduate(null)}
        />
      )}
    </main>
  );
}