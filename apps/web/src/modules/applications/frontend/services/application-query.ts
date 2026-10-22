// Estado de la bandeja en la dirección web (HU-08, T-08.3):
// página, tamaño, búsqueda, carrera y estado. Funciones puras, sin dependencias de React.
import type { BoardStatus } from "./applications-board.service";

export const PAGE_SIZE_OPTIONS = [10, 15, 25, 50] as const;
export const DEFAULT_PAGE_SIZE = 15;

const STATUS_VALUES: readonly BoardStatus[] = ["PENDING", "OBSERVED", "APPROVED", "REJECTED"];

export interface ApplicationsUrlState {
  page: number;
  pageSize: number;
  search: string;
  career: string;
  status: "" | BoardStatus;
}

export const EMPTY_URL_STATE: ApplicationsUrlState = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  search: "",
  career: "",
  status: "",
};

// Sirve tanto para URLSearchParams como para los parámetros de Next
type ParamsReader = { get(name: string): string | null };

function toPositiveInt(value: string | null, fallback: number): number {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 ? number : fallback;
}

// Lee la dirección web; los valores inválidos vuelven al valor por defecto
export function parseApplicationsUrl(params: ParamsReader): ApplicationsUrlState {
  const size = toPositiveInt(params.get("size"), DEFAULT_PAGE_SIZE);
  const status = params.get("status") ?? "";

  return {
    page: toPositiveInt(params.get("page"), 1),
    pageSize: (PAGE_SIZE_OPTIONS as readonly number[]).includes(size) ? size : DEFAULT_PAGE_SIZE,
    search: (params.get("q") ?? "").trim(),
    career: params.get("career") ?? "",
    status: (STATUS_VALUES as readonly string[]).includes(status) ? (status as BoardStatus) : "",
  };
}

// Escribe la dirección web; no incluye los valores por defecto para mantenerla corta
export function toApplicationsParams(state: ApplicationsUrlState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.page > 1) params.set("page", String(state.page));
  if (state.pageSize !== DEFAULT_PAGE_SIZE) params.set("size", String(state.pageSize));
  if (state.search) params.set("q", state.search);
  if (state.career) params.set("career", state.career);
  if (state.status) params.set("status", state.status);
  return params;
}

// CA-08.2: al cambiar la cantidad por página se vuelve a la primera página
export function changePageSize(state: ApplicationsUrlState, pageSize: number): ApplicationsUrlState {
  return { ...state, pageSize, page: 1 };
}

// CA-08.3: al cambiar búsqueda o filtros se vuelve a la primera página y los demás se conservan
export function changeFilters(
  state: ApplicationsUrlState,
  patch: Partial<Pick<ApplicationsUrlState, "search" | "career" | "status">>,
): ApplicationsUrlState {
  return { ...state, ...patch, page: 1 };
}

// CA-08.3: al cambiar de página se conservan filtros, búsqueda y tamaño
export function changePage(state: ApplicationsUrlState, page: number): ApplicationsUrlState {
  return { ...state, page: Math.max(1, page) };
}

export function totalPagesFor(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

// Si el enlace trae una página que ya no existe, se usa la última
export function clampPage(state: ApplicationsUrlState, total: number): ApplicationsUrlState {
  const lastPage = totalPagesFor(total, state.pageSize);
  return state.page > lastPage ? { ...state, page: lastPage } : state;
}