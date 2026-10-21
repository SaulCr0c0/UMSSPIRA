'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { RotateCcw } from 'lucide-react';

// HU 4: Exportação institucional em PDF (Dadier Cadima)
import {
  GraduatesReportExport,
  type GraduateStatus,
} from '../../../modules/reports/graduates/pdf';

// HU 5: Exportação de nómina em CSV (Miguel Vargas / Anelis Córdova)
import { GraduateCsvExport } from '../../../modules/reports/graduates/csv/graduate-csv-export';

const ITEMS_PER_PAGE = 10;
const REPORTS_LIST_STATE_KEY = 'umsspira:reports-liststate';

interface ReportsListState {
  searchTerm: string;
  selectedStatus: StatusFilterOption;
  currentPage: number;
}

function readReportsListState(): ReportsListState | null {
  if (typeof window === 'undefined') return null;

  try {
    const storedState = window.localStorage.getItem(REPORTS_LIST_STATE_KEY);
    if (!storedState) return null;

    const parsedState = JSON.parse(storedState) as Partial<ReportsListState>;
    const { currentPage, searchTerm, selectedStatus } = parsedState;

    if (
      typeof searchTerm !== 'string' ||
      (selectedStatus !== 'TODOS' &&
        selectedStatus !== 'VERIFICADO' &&
        selectedStatus !== 'OBSERVADO') ||
      typeof currentPage !== 'number' ||
      !Number.isInteger(currentPage) ||
      currentPage <= 0
    ) {
      return null;
    }

    return {
      searchTerm,
      selectedStatus,
      currentPage,
    };
  } catch {
    return null;
  }
}

/**
 * Normaliza y limpia cadenas de texto para búsquedas homogéneas.
 * - Soporta valores indefinidos o nulos para evitar errores estrictos de TS.
 * - Bug 2: Elimina comas (`,`) para flexibilizar la búsqueda de nombres/apellidos.
 * - Bug 4: Normaliza espacios múltiples a un único espacio.
 */
function normalizeText(value?: string | null): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export default function ReportsPage() {
  const {
    data: indicators,
    loading: loadingIndicators,
    error: errorIndicators,
  } = useDashboardIndicators();
  const { data: graduates, loading: loadingGraduates } = useGraduates();

  // Estados de filtragem (HU 2)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] =
    useState<StatusFilterOption>('TODOS');

  // Estados de paginação y modal (HU 3)
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGraduate, setSelectedGraduate] = useState<Graduate | null>(null);
  const [hasRestoredListState, setHasRestoredListState] = useState(false);

  useEffect(() => {
    const storedState = readReportsListState();

    if (storedState) {
      setSearchTerm(storedState.searchTerm);
      setSelectedStatus(storedState.selectedStatus);
      setCurrentPage(storedState.currentPage);
    }

    setHasRestoredListState(true);
  }, []);

  // Mapeamento de status para o contrato de exportação em PDF da HU 4
  const pdfExportStatus = useMemo<GraduateStatus>(() => {
    if (selectedStatus === 'OBSERVADO') return 'observed';
    return 'verified';
  }, [selectedStatus]);

  /**
   * Filtragem e ordenamento reativo na memória (HU 2).
   * - Bug 1: Ordena priorizando coincidencias que inicien con la búsqueda (ranking de relevancia).
   * - Bug 2: Tokeniza el término de búsqueda para permitir hallar "Perez Juan" o "Juan Perez" sin comas.
   */
  const filteredGraduates = useMemo(() => {
    if (!graduates) return [];

    const normalizedQuery = normalizeText(searchTerm);

    // 1. Filtrado
    const filtered = graduates.filter((graduate) => {
      const matchesStatus =
        selectedStatus === 'TODOS' || graduate.status === selectedStatus;

      if (!matchesStatus) return false;
      if (!normalizedQuery) return true;

      const normalizedName = normalizeText(graduate.fullName);
      const normalizedSis = normalizeText(graduate.sisCode);

      // Tokenización para búsqueda flexible por términos independientes (Bug 2)
      const queryTokens = normalizedQuery.split(' ').filter(Boolean);
      const matchesSearch = queryTokens.every(
        (token) => normalizedName.includes(token) || normalizedSis.includes(token)
      );

      return matchesSearch;
    });

    if (!normalizedQuery) return filtered;

    // 2. Ranking / Prioridad de ordenamiento (Bug 1)
    return [...filtered].sort((a, b) => {
      const nameA = normalizeText(a.fullName);
      const nameB = normalizeText(b.fullName);
      const sisA = normalizeText(a.sisCode);
      const sisB = normalizeText(b.sisCode);

      const startsA = nameA.startsWith(normalizedQuery) || sisA.startsWith(normalizedQuery);
      const startsB = nameB.startsWith(normalizedQuery) || sisB.startsWith(normalizedQuery);

      if (startsA && !startsB) return -1;
      if (!startsA && startsB) return 1;

      return 0;
    });
  }, [graduates, selectedStatus, searchTerm]);

  // Handlers reativos
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: StatusFilterOption) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  // Bug 3: Reseteo explícito de filtros y limpieza de estado guardado
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('TODOS');
    setCurrentPage(1);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(REPORTS_LIST_STATE_KEY);
      }
    } catch {
      // Ignorar errores de almacenamiento
    }
  };

  // Fatiamento estrito a 10 registros por página (HU 3)
  const paginatedGraduates = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGraduates.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredGraduates, currentPage]);

  useEffect(() => {
    if (loadingGraduates) return;

    const totalPages = Math.max(
      1,
      Math.ceil(filteredGraduates.length / ITEMS_PER_PAGE),
    );

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
      return;
    }

    if (!hasRestoredListState) return;

    const listState: ReportsListState = {
      searchTerm,
      selectedStatus,
      currentPage,
    };

    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          REPORTS_LIST_STATE_KEY,
          JSON.stringify(listState),
        );
      }
    } catch {
      // La vista sigue funcionando aunque el navegador no permita almacenamiento local.
    }
  }, [
    currentPage,
    filteredGraduates.length,
    hasRestoredListState,
    loadingGraduates,
    searchTerm,
    selectedStatus,
  ]);

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
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard de Indicadores
        </h1>
        <p className="text-sm text-gray-500">
          Padrón y reportería institucional de titulados
        </p>
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
            <KpiCard title="Mentores activos" value={indicators.activeMentors} />
          </div>
        )
      )}

      {/* Controles de Búsqueda, Filtro (HU 2) y Botón Único de Exportación (HU 4 + HU 5) */}
      <section className="flex flex-col gap-4 rounded-lg border border-[#C9C1B1] bg-[#EEE9DF] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <GraduatesSearch
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onReset={handleResetFilters}
          />
          <GraduatesStatusFilter
            selectedStatus={selectedStatus}
            onStatusChange={handleStatusChange}
          />

          <button
            type="button"
            onClick={handleResetFilters}
            title="Limpiar filtros"
            aria-label="Limpiar filtros"
            className="flex h-[50px] w-[50px] items-center justify-center rounded-md border border-[#C9C1B1] bg-white text-gray-600 transition-colors hover:bg-gray-100"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center self-end sm:self-auto">
          {/* Componente HU 4 orquestando la UI unificada a través de renderTrigger */}
          <GraduatesReportExport
            status={pdfExportStatus}
            onBackToListStart={() => setCurrentPage(1)}
            renderTrigger={({ exportPdf }) => (
              <div className="w-48">
                <GraduateCsvExport
                  totalRecords={filteredGraduates.length}
                  filters={{
                    status: selectedStatus,
                    search: searchTerm,
                  }}
                  onPdfExport={() => exportPdf(pdfExportStatus)}
                />
              </div>
            )}
          />
        </div>
      </section>

      {/* Tabla con Paginación o Estado Vacío (HU 1 + HU 3) */}
      {filteredGraduates.length === 0 ? (
        <EmptyState onRefresh={handleResetFilters} />
      ) : (
        <div className="space-y-2">
          <GraduatesTable
            graduates={paginatedGraduates}
            onViewReason={setSelectedGraduate}
            startIndex={(currentPage - 1) * ITEMS_PER_PAGE}
          />
          <Pagination
            currentPage={currentPage}
            totalItems={filteredGraduates.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modal de Detalles de la Observación (HU 3) */}
      {selectedGraduate && (
        <ObservationModal
          graduate={selectedGraduate}
          onClose={() => setSelectedGraduate(null)}
        />
      )}
    </main>
  );
}
