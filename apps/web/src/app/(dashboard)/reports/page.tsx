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
 * - Bug 2: Elimina comas (`,`) para flexibilizar la búsqueda de nombres/apellidos.
 * - Bug 4: Normaliza espacios múltiples a un único espacio.
 */
function normalizeText(value: string): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/,/g, '')        // Bug 2: Remover comas
    .replace(/\s+/g, ' ')     // Bug 4: Sanitizar múltiples espacios seguidos
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
      window.localStorage.removeItem(REPORTS_LIST_STATE_KEY);
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
