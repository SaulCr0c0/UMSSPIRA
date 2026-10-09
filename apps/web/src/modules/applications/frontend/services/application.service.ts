// Servicio de solicitudes del backoffice (HU-04)
import { TOKEN_COOKIE } from "../../../auth/frontend/services/route-access";

export type ApplicationStatus = "pendiente" | "observado" | "aprobado" | "rechazado";

export interface Application {
  id: string;
  code: string; // EGR-2025-004812
  fullName: string;
  email: string;
  ci: string;
  issuedIn: string; // código de departamento: LP, CB, SC...
  sisCode: string;
  career: string;
  status: ApplicationStatus;
  submittedAt: string; // fecha ISO
}

export interface ApplicationsQuery {
  page: number;
  career: string; // "" = todas
  status: "" | ApplicationStatus; // "" = todos
  search: string;
}

export interface ApplicationsPage {
  items: Application[];
  total: number;
}

export const PAGE_SIZE = 15; // CA-04.1
export const OVERDUE_HOURS = 48; // CA-04.1

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pendiente: "Pendiente de validación",
  observado: "Observado",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
};

export const DEPARTMENT_LABELS: Record<string, string> = {
  CB: "Cbba.",
  SC: "SCZ",
  LP: "LP",
  OR: "OR",
  PT: "PT",
  TJ: "TJ",
  CH: "CH",
  BE: "BE",
  PD: "PD",
};

// Hoy existe una sola carrera (HU-01); provisional hasta que la API entregue el catálogo
export const CAREER_OPTIONS = ["Ingeniería de Sistemas"];

// "Ingeniería de Sistemas" -> "Ing. de Sistemas"
export function shortCareer(career: string): string {
  return career.replace(/^Ingeniería de /, "Ing. de ");
}

export function hoursSince(iso: string, now: number = Date.now()): number {
  return (now - new Date(iso).getTime()) / 3_600_000;
}

// Solo una solicitud pendiente puede estar vencida (CA-04.1)
export function isOverdue(application: Application, now: number = Date.now()): boolean {
  return application.status === "pendiente" && hoursSince(application.submittedAt, now) > OVERDUE_HOURS;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

function readToken(): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie.split("; ").find((cookie) => cookie.startsWith(`${TOKEN_COOKIE}=`));
  return entry ? decodeURIComponent(entry.slice(TOKEN_COOKIE.length + 1)) : null;
}

// Contrato provisional, por confirmar con el backend:
//   GET /api/applications?page=&pageSize=&career=&status=&search=
//   Respuesta: { data: { items: Application[], total: number } }
//   La API ordena (pendientes primero, de la más antigua a la más reciente) y pagina (CA-04.1)
export async function fetchApplications(query: ApplicationsQuery): Promise<ApplicationsPage> {
  const params = new URLSearchParams({ page: String(query.page), pageSize: String(PAGE_SIZE) });
  if (query.career) params.set("career", query.career);
  if (query.status) params.set("status", query.status);
  if (query.search.trim()) params.set("search", query.search.trim());

  const token = readToken();
  const response = await fetch(`${API_URL}/api/applications?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error(`No se pudo cargar el listado (${response.status})`);
  }

  const json = (await response.json()) as { data: ApplicationsPage };
  return json.data;
}