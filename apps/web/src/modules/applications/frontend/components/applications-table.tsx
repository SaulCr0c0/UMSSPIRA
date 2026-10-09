"use client";

import type { KeyboardEvent } from "react";
import {
  STATUS_LABELS,
  hoursSince,
  isOverdue,
  type Application,
  type ApplicationStatus,
} from "../services";
import type { ApplicationsLoadStatus } from "../store";
import { Badge, type RequestStatus } from "../../../../shared/components/badge";

interface ApplicationsTableProps {
  items: Application[];
  total: number;
  page: number;
  pageSize: number;
  status: ApplicationsLoadStatus;
  error: string | null;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
  onSelect?: (application: Application) => void; // CA-04.3: abre el expediente
}

// El badge compartido usa "pending"...; la bandeja usa los valores de shared-types
const BADGE_VARIANT: Record<ApplicationStatus, RequestStatus> = {
  PENDING: "pending",
  OBSERVED: "observed",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Abreviaturas del lugar de expedición, como en el Figma
const DEPARTMENT_ABBR: Record<string, string> = { CB: "Cbba.", SC: "SCZ" };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
}

// "Ingeniería de Sistemas" -> "Ing. de Sistemas"
function abbreviateCareer(career: string): string {
  return career.replace(/^Ingeniería/, "Ing.");
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

const headerCell = "px-4 py-3 text-left text-xs font-semibold text-white";
const bodyCell = "px-4 py-3 align-middle text-sm text-abyssal-blue";

export function ApplicationsTable({
  items,
  total,
  page,
  pageSize,
  status,
  error,
  onPageChange,
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
      <p role="alert" className="m-4 rounded-lg bg-truffle-trouble/10 px-4 py-3 text-sm text-truffle-trouble">
        {error}
      </p>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto" aria-busy={isLoading}>
        <table className="w-full min-w-[900px] border-collapse">
          <thead className="bg-blue-fantastic">
            <tr>
              <th className={`${headerCell} pl-6`}>Código</th>
              <th className={headerCell}>Egresado / Correo</th>
              <th className={headerCell}>C.I. / Expedido</th>
              <th className={headerCell}>Carrera</th>
              <th className={headerCell}>Código SIS</th>
              <th className={headerCell}>Antigüedad / Envío</th>
              <th className={headerCell}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((application) => {
              const overdue = isOverdue(application);
              const hours = Math.floor(hoursSince(application.submittedAt));
              return (
                <tr
                  key={application.id}
                  tabIndex={onSelect ? 0 : undefined}
                  onClick={() => onSelect?.(application)}
                  onKeyDown={(event) => handleKeyDown(event, application)}
                  className={`border-t border-oatmeal/40 even:bg-palladian/40 ${
                    onSelect ? "cursor-pointer hover:bg-palladian" : ""
                  }`}
                >
                  <td
                    className={`${bodyCell} border-l-4 pl-5 ${
                      overdue ? "border-l-truffle-trouble" : "border-l-transparent"
                    }`}
                  >
                    <span className="font-mono text-xs font-bold">{application.code}</span>
                  </td>
                  <td className={bodyCell}>
                    <p className="font-semibold">{application.fullName}</p>
                    <p className="text-xs text-gray-500">{application.email}</p>
                  </td>
                  <td className={bodyCell}>
                    <span className="font-semibold">{application.ci}</span>{" "}
                    <span className="text-xs text-gray-500">
                      {DEPARTMENT_ABBR[application.issuedIn] ?? application.issuedIn}
                    </span>
                  </td>
                  <td className={bodyCell}>{abbreviateCareer(application.career)}</td>
                  <td className={bodyCell}>
                    <span className="font-mono text-xs">{application.sisCode}</span>
                  </td>
                  <td className={bodyCell}>
                    {overdue && <Badge variant="alert">Alerta &gt;48h</Badge>}
                    <p className="mt-1 text-xs text-gray-600">
                      {hours} hrs ({formatDate(application.submittedAt)})
                    </p>
                  </td>
                  <td className={bodyCell}>
                    <Badge variant={BADGE_VARIANT[application.status]}>{STATUS_LABELS[application.status]}</Badge>
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

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-oatmeal/40 px-6 py-4 text-sm text-abyssal-blue">
        <p>{total === 0 ? "Sin resultados" : `Mostrando ${from}-${to} de ${total} solicitudes`}</p>

        <nav aria-label="Paginación" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
            className="rounded-lg border border-oatmeal/60 px-3 py-1.5 font-medium disabled:opacity-40"
          >
            ‹ Anterior
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
                className={`min-w-[2rem] rounded-lg border px-2 py-1.5 font-semibold ${
                  item === page
                    ? "border-abyssal-blue bg-abyssal-blue text-white"
                    : "border-oatmeal/60 text-abyssal-blue hover:bg-palladian"
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
            className="rounded-lg border border-oatmeal/60 px-3 py-1.5 font-medium disabled:opacity-40"
          >
            Siguiente ›
          </button>
        </nav>
      </div>
    </div>
  );
}