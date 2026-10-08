// Servicio de solicitudes del backoffice (HU-04)

export type ApplicationStatus = "pendiente" | "observado" | "aprobado" | "rechazado";
export type AgeFilter = "" | "within48" | "over48";
export type DocumentType = "diploma" | "titulo" | "certificado";
export type SlaTone = "overdue" | "warning" | "ok" | "paused" | "closed";

export interface Application {
  id: string;
  code: string; // EGR-2025-004812
  fullName: string;
  ci: string;
  issuedIn: string; // código de departamento: LP, CB, SC...
  sisCode: string;
  career: string;
  documentType: DocumentType;
  status: ApplicationStatus;
  submittedAt: string; // fecha ISO
}

export interface ApplicationsQuery {
  page: number;
  pageSize: number;
  career: string; // "" = todas
  status: "" | ApplicationStatus; // "" = todos
  age: AgeFilter;
  search: string;
}

export interface ApplicationsPage {
  items: Application[];
  total: number;
}

export interface SlaInfo {
  tone: SlaTone;
  label: string;
  progress: number; // 0 a 1
}

export const PAGE_SIZE_OPTIONS = [10, 15]; // CA-04.1: máximo 15 filas
export const DEFAULT_PAGE_SIZE = 10;
export const OVERDUE_HOURS = 48; // CA-04.1
export const WARNING_HOURS = 36;

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pendiente: "Pendiente de validación",
  observado: "Observado",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
};

export const AGE_LABELS = { within48: "< 48h", over48: "> 48h Vencido" };

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  diploma: "Diploma Académico",
  titulo: "Título en Prov. Nal.",
  certificado: "Certificado de Egreso",
};

export const DEPARTMENT_NAMES: Record<string, string> = {
  LP: "La Paz",
  CB: "Cochabamba",
  SC: "Santa Cruz",
  OR: "Oruro",
  PT: "Potosí",
  TJ: "Tarija",
  CH: "Chuquisaca",
  BE: "Beni",
  PD: "Pando",
};

// Provisional: reemplazar por el catálogo que entregue la API
export const CAREER_OPTIONS = ["Ingeniería de Sistemas", "Ingeniería Informática"];

// "Ingeniería de Sistemas" -> "Sistemas"
export function shortCareer(career: string): string {
  return career.replace(/^Ingeniería( de)? /, "");
}

export function hoursSince(iso: string, now: number = Date.now()): number {
  return (now - new Date(iso).getTime()) / 3_600_000;
}

// Solo una solicitud pendiente puede estar vencida (CA-04.1)
export function isOverdue(application: Application, now: number = Date.now()): boolean {
  return application.status === "pendiente" && hoursSince(application.submittedAt, now) > OVERDUE_HOURS;
}

// Etiqueta pequeña bajo el código del expediente
export function getMarkerLabel(application: Application, now: number = Date.now()): string {
  switch (application.status) {
    case "pendiente":
      return isOverdue(application, now) ? "PRIORIDAD ALTA" : "NORMAL";
    case "observado":
      return "SUBSANACIÓN";
    case "aprobado":
      return "EMITIDO";
    case "rechazado":
      return "DENEGADO";
  }
}

// Columna "Antigüedad & SLA"
export function getSla(application: Application, now: number = Date.now()): SlaInfo {
  const exact = hoursSince(application.submittedAt, now);
  const hours = Math.floor(exact);
  const progress = Math.min(exact / OVERDUE_HOURS, 1);

  if (application.status === "aprobado" || application.status === "rechazado") {
    return { tone: "closed", label: "Finalizado • Cierre", progress: 1 };
  }
  if (application.status === "observado") {
    return { tone: "paused", label: `${hours} hrs • Pausado`, progress };
  }
  if (exact > OVERDUE_HOURS) {
    return { tone: "overdue", label: `${hours} hrs • VENCIDO`, progress: 1 };
  }
  if (exact >= WARNING_HOURS) {
    return { tone: "warning", label: `${hours} hrs • En curso`, progress };
  }
  return { tone: "ok", label: `${hours} hrs • A tiempo`, progress };
}

// ---- Datos de prueba (se eliminan cuando exista requestsApi) ----
const FIRST_NAMES = ["Alejandro", "Valeria", "Carlos", "Mariana", "Jorge", "Lucía", "Diego", "Paola", "Marco", "Rosa"];
const LAST_NAMES = [
  "Rojas Torrico",
  "Gonzales Mercado",
  "Paredes Claure",
  "Bustamante Paz",
  "Morales Villarroel",
  "Quispe Mamani",
];
const DEPARTMENTS = ["CB", "LP", "SC", "OR", "PT", "TJ", "CH"];
const DOCUMENT_TYPES: DocumentType[] = ["diploma", "titulo", "certificado"];
const STATUSES: ApplicationStatus[] = ["pendiente", "pendiente", "observado", "aprobado", "rechazado", "pendiente"];

const MOCK_APPLICATIONS: Application[] = Array.from({ length: 142 }, (_, index) => {
  const hoursAgo = ((index * 7 + 3) % 120) + 1;
  return {
    id: `mock-${index + 1}`,
    code: `EGR-2025-${String(4812 - index).padStart(6, "0")}`,
    fullName: `${FIRST_NAMES[index % FIRST_NAMES.length]} ${LAST_NAMES[index % LAST_NAMES.length]}`,
    ci: String(4_000_000 + index * 13_791),
    issuedIn: DEPARTMENTS[index % DEPARTMENTS.length],
    sisCode: String(201_600_000 + index * 97),
    career: CAREER_OPTIONS[index % CAREER_OPTIONS.length],
    documentType: DOCUMENT_TYPES[(index * 5) % DOCUMENT_TYPES.length],
    status: STATUSES[index % STATUSES.length],
    submittedAt: new Date(Date.now() - hoursAgo * 3_600_000).toISOString(),
  };
});

// Orden de CA-04.1: pendientes primero, de la más antigua a la más reciente;
// el resto después, de la más reciente a la más antigua
function sortApplications(items: Application[]): Application[] {
  return [...items].sort((a, b) => {
    const aPending = a.status === "pendiente";
    const bPending = b.status === "pendiente";
    if (aPending !== bPending) return aPending ? -1 : 1;
    const diff = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    return aPending ? diff : -diff;
  });
}

function matchesAge(application: Application, age: AgeFilter, now: number): boolean {
  if (age === "over48") return isOverdue(application, now);
  if (age === "within48") return hoursSince(application.submittedAt, now) <= OVERDUE_HOURS;
  return true;
}

async function fetchApplicationsMock(query: ApplicationsQuery): Promise<ApplicationsPage> {
  await new Promise((resolve) => setTimeout(resolve, 80));

  const now = Date.now();
  const text = query.search.trim().toLowerCase();
  const filtered = MOCK_APPLICATIONS.filter((application) => {
    if (query.career && application.career !== query.career) return false;
    if (query.status && application.status !== query.status) return false;
    if (!matchesAge(application, query.age, now)) return false;
    if (text) {
      const haystack = `${application.code} ${application.fullName} ${application.ci} ${application.sisCode}`.toLowerCase();
      if (!haystack.includes(text)) return false;
    }
    return true;
  });

  const sorted = sortApplications(filtered);
  const start = (query.page - 1) * query.pageSize;
  return { items: sorted.slice(start, start + query.pageSize), total: sorted.length };
}

// Cuando la API esté lista, agregar aquí la llamada real y quitar el mock
export function fetchApplications(query: ApplicationsQuery): Promise<ApplicationsPage> {
  return fetchApplicationsMock(query);


}
// ---- Resumen del tablero (datos de prueba; la API real lo entregará) ----
export interface ApplicationsSummary {
  pending: number;
  observed: number;
  approvedToday: number;
  critical: number;
  slaCompliance: number; // porcentaje de expedientes que no están vencidos
}

export async function fetchSummary(): Promise<ApplicationsSummary> {
  await new Promise((resolve) => setTimeout(resolve, 80));

  const now = Date.now();
  const critical = MOCK_APPLICATIONS.filter((application) => isOverdue(application, now)).length;

  return {
    pending: MOCK_APPLICATIONS.filter((application) => application.status === "pendiente").length,
    observed: MOCK_APPLICATIONS.filter((application) => application.status === "observado").length,
    approvedToday: MOCK_APPLICATIONS.filter(
      (application) => application.status === "aprobado" && hoursSince(application.submittedAt, now) <= 24,
    ).length,
    critical,
    slaCompliance: Math.round((1 - critical / MOCK_APPLICATIONS.length) * 1000) / 10,
  };
}