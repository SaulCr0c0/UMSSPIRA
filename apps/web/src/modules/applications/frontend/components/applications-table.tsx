"use client";

import type { KeyboardEvent } from "react";
import {
  DEPARTMENT_NAMES,
  DOCUMENT_LABELS,
  PAGE_SIZE_OPTIONS,
  getMarkerLabel,
  getSla,
  isOverdue,
  shortCareer,
  type Application,
  type SlaTone,
} from "../services";
import type { ApplicationsLoadStatus } from "../store";

interface ApplicationsTableProps {
  items: Application[];
  total: number;
  page: number;
  pageSize: number;
  status: ApplicationsLoadStatus;
  error: string | null;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onClearFilters: () => void;
  onSelect?: (application: Application) => void; // CA-04.3: abre el expediente (lo conecta reviewModals)
}

const SLA_STYLES: Record<SlaTone, { bar: string; text: string }> = {
  overdue: { bar: "bg-red-600", text: "text-red-600" },
  warning: { bar: "bg-amber-500", text: "text-amber-700" },
  ok: { bar: "bg-green-600", text: "text-green-800" },
  paused: { bar: "bg-gray-400", text: "text-gray-600" },
  closed: { bar: "bg-gray-400", text: "text-gray-600" },
};

function markerStyle(application: Application, overdue: boolean): { bar: string; text: string } {
  if (application.status === "rechazado" || overdue) return { bar: "bg-red-600", text: "text-red-600" };
  if (application.status === "aprobado") return { bar: "bg-green-600", text: "text-green-800" };
  return { bar: "bg-amber-500", text: "text-amber-700" };
}

const AVATAR_COLORS = ["bg-truffle-trouble", "bg-abyssal-blue", "bg-green-800", "bg-amber-700", "bg-purple-800"];

function Avatar({ name }: { name: string }) {
  const [first = "", second = ""] = name.split(" ");
  const initials = `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
  const color = AVATAR_COLORS[name.length % AVATAR_COLORS.length];
  return (
    <span
      aria-hidden="true"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${color}`}
    >
      {initials}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

// Números de página con puntos suspensivos: 1 2 3 ... 15
function getPageItems(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = Array.from(wanted)
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) result.push("ellipsis");
    result.push(value);
  });
  return result;
}

const headerCell = "px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500";
const bodyCell = "px-4 py-3 align-middle text-sm text-abyssal-blue";

export function ApplicationsTable({
  items,
  total,
  page,
  pageSize,
  status,
  error,
  onPageChange,
  onPageSizeChange,
  onClearFilters,
  onSelect,
}: ApplicationsTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const isLoading = status === "loading" || status === "idle";

  function handleKeyDown(event: KeyboardEvent<HTMLTableRowElement>, application: Application) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.(application);
    }
  }

  if (status === "error") {
    return (
      <p role="alert" className="rounded-lg bg-truffle-trouble/10 px-4 py-3 text-sm text-truffle-trouble">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-bold text-abyssal-blue">Expedientes Registrados</h2>
          <span className="rounded-full bg-palladian px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-abyssal-blue">
            {total} total
          </span>
        </div>
        <ul className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
          <li className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-600" />
            Vencido &gt; 48h
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Próximas a vencer
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-600" />
            Auditado
          </li>
        </ul>
      </div>

      <p className="text-xs text-gray-600">
        Orden: solicitudes pendientes primero, de la más antigua a la más reciente.
      </p>

      <div className="overflow-x-auto rounded-xl border border-gray-200" aria-busy={isLoading}>
        <table className="w-full min-w-[900px] border-collapse">
          <thead className="bg-palladian/60">
            <tr>
              <th className={headerCell}>Código</th>
              <th className={headerCell}>Egresado / Postulante</th>
              <th className={headerCell}>C.I. &amp; Expedido</th>
              <th className={headerCell}>Tipo documento</th>
              <th className={headerCell}>Fecha envío</th>
              <th className={headerCell}>Antigüedad &amp; SLA</th>
            </tr>
          </thead>
          <tbody>
            {items.map((application) => {
              const overdue = isOverdue(application);
              const marker = markerStyle(application, overdue);
              const sla = getSla(application);
              const slaStyle = SLA_STYLES[sla.tone];
              return (
                <tr
                  key={application.id}
                  tabIndex={onSelect ? 0 : undefined}
                  onClick={() => onSelect?.(application)}
                  onKeyDown={(event) => handleKeyDown(event, application)}
                  className={`border-t border-gray-100 ${onSelect ? "cursor-pointer hover:bg-palladian/60" : ""}`}
                >
                  <td className={bodyCell}>
                    <div className="flex items-stretch gap-3">
                      <span className={`w-1 rounded-full ${marker.bar}`} aria-hidden="true" />
                      <div>
                        <p className="font-bold">{application.code}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wide ${marker.text}`}>
                          {getMarkerLabel(application)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={bodyCell}>
                    <div className="flex items-center gap-3">
                      <Avatar name={application.fullName} />
                      <div>
                        <p className="font-semibold">{application.fullName}</p>
                        <p className="text-xs text-gray-500">
                          SIS: {application.sisCode} • {shortCareer(application.career)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={bodyCell}>
                    <p className="font-semibold">{application.ci}</p>
                    <p className="text-xs text-gray-500">
                      {DEPARTMENT_NAMES[application.issuedIn] ?? application.issuedIn}
                    </p>
                  </td>
                  <td className={bodyCell}>{DOCUMENT_LABELS[application.documentType]}</td>
                  <td className={bodyCell}>
                    <p className="font-semibold">{formatDate(application.submittedAt)}</p>
                    <p className="text-xs text-gray-500">{formatTime(application.submittedAt)}</p>
                  </td>
                  <td className={`${bodyCell} min-w-[160px]`}>
                    <p className={`text-xs font-bold ${slaStyle.text}`}>{sla.label}</p>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-200" aria-hidden="true">
                      <div
                        className={`h-1.5 rounded-full ${slaStyle.bar}`}
                        style={{ width: `${Math.round(sla.progress * 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {isLoading && items.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-gray-500">Cargando solicitudes...</p>
        )}

        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <p className="text-sm text-gray-600">No hay solicitudes que coincidan con tu búsqueda.</p>
            <button
              type="button"
              onClick={onClearFilters}
              className="text-sm font-semibold text-truffle-trouble hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-abyssal-blue">
        <p>{total === 0 ? "Sin resultados" : `Mostrando ${from}-${to} de ${total} solicitudes registradas`}</p>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
            Por pág:
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="rounded-lg bg-palladian px-2 py-1.5 text-sm font-semibold normal-case text-abyssal-blue"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <nav aria-label="Paginación" className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              aria-label="Página anterior"
              className="rounded-lg px-3 py-1.5 font-semibold disabled:opacity-40"
            >
              ‹
            </button>
            {getPageItems(page, totalPages).map((item, index) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPageChange(item)}
                  aria-current={item === page ? "page" : undefined}
                  className={`min-w-[2rem] rounded-lg px-2 py-1.5 font-semibold ${
                    item === page ? "bg-abyssal-blue text-white" : "text-abyssal-blue hover:bg-palladian"
                  }`}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              aria-label="Página siguiente"
              className="rounded-lg px-3 py-1.5 font-semibold disabled:opacity-40"
            >
              ›
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}