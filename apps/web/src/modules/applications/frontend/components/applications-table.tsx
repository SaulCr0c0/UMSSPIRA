"use client";

import type { KeyboardEvent } from "react";
import {
  DEPARTMENT_LABELS,
  OVERDUE_HOURS,
  PAGE_SIZE,
  STATUS_LABELS,
  hoursSince,
  isOverdue,
  shortCareer,
  type Application,
  type ApplicationStatus,
} from "../services";
import type { ApplicationsLoadStatus } from "../store";

interface ApplicationsTableProps {
  items: Application[];
  total: number;
  page: number;
  status: ApplicationsLoadStatus;
  error: string | null;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
  onSelect?: (application: Application) => void; // CA-04.3: abre el expediente
}

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  pendiente: "bg-oatmeal text-abyssal-blue",
  observado: "bg-burning-flame text-abyssal-blue",
  aprobado: "bg-green-700 text-white",
  rechazado: "bg-truffle-trouble text-white",
};

function StatusPill({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`inline-block rounded px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function ClockIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

// "18 mar 2025" -> "18 Mar 2025"
function formatShortDate(iso: string): string {
  const text = new Date(iso).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return text.replace(/\./g, "").replace(/ ([a-záéíóú])/i, (_, letter: string) => ` ${letter.toUpperCase()}`);
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
const pageButton =
  "rounded-lg border border-oatmeal px-3 py-1.5 text-sm font-semibold text-abyssal-blue hover:bg-palladian disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

export function ApplicationsTable({
  items,
  total,
  page,
  status,
  error,
  onPageChange,
  onClearFilters,
  onSelect,
}: ApplicationsTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
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
    <div className="overflow-hidden rounded-xl border border-oatmeal bg-white">
      <div className="overflow-x-auto" aria-busy={isLoading}>
        <table className="w-full min-w-[900px] border-collapse">
          <thead className="bg-blue-fantastic">
            <tr>
              <th className={`${headerCell} pl-5`}>Código</th>
              <th className={headerCell}>Egresado / Correo</th>
              <th className={headerCell}>C.I. / Expedido</th>
              <th className={headerCell}>Carrera</th>
              <th className={headerCell}>Código SIS</th>
              <th className={headerCell}>
                Antigüedad / Envío{" "}
                <span title="Pendientes primero, de la más antigua a la más reciente" aria-hidden="true">
                  ↑
                </span>
              </th>
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
                  className={`border-t border-gray-100 ${
                    onSelect ? "cursor-pointer hover:bg-palladian/60" : ""
                  } ${overdue ? "bg-truffle-trouble/5" : ""}`}
                >
                  <td
                    className={`${bodyCell} w-36 border-l-4 text-xs font-bold ${
                      overdue ? "border-truffle-trouble" : "border-transparent"
                    }`}
                  >
                    {application.code}
                  </td>
                  <td className={bodyCell}>
                    <p className="font-semibold">{application.fullName}</p>
                    <p className="text-xs text-gray-500">{application.email}</p>
                  </td>
                  <td className={bodyCell}>
                    {application.ci}{" "}
                    <span className="text-xs text-gray-500">
                      {DEPARTMENT_LABELS[application.issuedIn] ?? application.issuedIn}
                    </span>
                  </td>
                  <td className={bodyCell}>{shortCareer(application.career)}</td>
                  <td className={`${bodyCell} font-semibold`}>{application.sisCode}</td>
                  <td className={bodyCell}>
                    {overdue && (
                      <span className="mb-1 inline-flex items-center gap-1 rounded bg-truffle-trouble px-2 py-0.5 text-[11px] font-semibold text-white">
                        <ClockIcon />
                        {`Alerta >${OVERDUE_HOURS}h`}
                      </span>
                    )}
                    <p className="text-xs text-gray-600">{`${hours} hrs (${formatShortDate(
                      application.submittedAt,
                    )})`}</p>
                  </td>
                  <td className={bodyCell}>
                    <StatusPill status={application.status} />
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

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 text-sm text-abyssal-blue">
        <p>{total === 0 ? "Sin resultados" : `Mostrando ${from}-${to} de ${total} solicitudes`}</p>

        <nav aria-label="Paginación" className="flex items-center gap-2">
          <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className={pageButton}>
            Anterior
          </button>
          {getPageItems(page, totalPages).map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-1 text-gray-500">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? "page" : undefined}
                className={`min-w-[2.25rem] rounded-lg border px-2 py-1.5 text-sm font-semibold ${
                  item === page
                    ? "border-abyssal-blue bg-abyssal-blue text-white"
                    : "border-oatmeal text-abyssal-blue hover:bg-palladian"
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
            className={pageButton}
          >
            Siguiente
          </button>
        </nav>
      </div>
    </div>
  );
}