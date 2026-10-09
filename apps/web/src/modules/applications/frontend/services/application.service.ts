// Servicio de solicitudes del backoffice (HU-04)

import type { ApplicationStatus } from "@umsspira/shared-types";

export type { ApplicationStatus };
export type DocumentType = "diploma" | "titulo" | "certificado";
export type SlaTone = "overdue" | "warning" | "ok" | "paused" | "closed";

export interface Application {
  id: string;
  code: string; // EGR-2025-004812
  fullName: string;
  email: string;
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

export const DEFAULT_PAGE_SIZE = 15; // CA-04.1: máximo 15 filas
export const OVERDUE_HOURS = 48; // CA-04.1
export const WARNING_HOURS = 36;

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "Pendiente de validación",
  OBSERVED: "Observado",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
};

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

// Provisional: reemplazar por el catálogo de carreras que entregue la API
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
  return application.status === "PENDING" && hoursSince(application.submittedAt, now) > OVERDUE_HOURS;
}

// Etiqueta pequeña bajo el código del expediente
export function getMarkerLabel(application: Application, now: number = Date.now()): string {
  switch (application.status) {
    case "PENDING":
      return isOverdue(application, now) ? "PRIORIDAD ALTA" : "NORMAL";
    case "OBSERVED":
      return "SUBSANACIÓN";
    case "APPROVED":
      return "EMITIDO";
    case "REJECTED":
      return "DENEGADO";
  }
}

// Indicador de antigüedad y SLA
export function getSla(application: Application, now: number = Date.now()): SlaInfo {
  const exact = hoursSince(application.submittedAt, now);
  const hours = Math.floor(exact);
  const progress = Math.min(exact / OVERDUE_HOURS, 1);

  if (application.status === "APPROVED" || application.status === "REJECTED") {
    return { tone: "closed", label: "Finalizado • Cierre", progress: 1 };
  }
  if (application.status === "OBSERVED") {
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

// TODO(requestsApi): reemplazar por la llamada a GET /api/applications
// (página, carrera, estado y búsqueda). Hasta que el endpoint exista se devuelve
// una lista vacía: es preferible no mostrar nada que mostrar datos falsos.
export async function fetchApplications(_query: ApplicationsQuery): Promise<ApplicationsPage> {
  return { items: [], total: 0 };
}