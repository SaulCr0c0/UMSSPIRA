"use client";

import { useState } from "react";
import {
  ApplicationDetail,
  MOCK_APPLICATION,
  OVERDUE_HOURS,
  STATUS_LABEL,
  hoursSince,
} from "./application-detail";
import { ApproveDialog } from "./approve-dialog";
import { ObserveDialog } from "./observe-dialog";
import { RejectDialog } from "./reject-dialog";
import { btnAccent, btnDanger, btnSecondary } from "./review-ui";

type Props = {
  open: boolean;
  applicationId: string | null;
  onClose: () => void;
  onReviewed?: () => void; // para refrescar la tabla después del dictamen
};

type ActiveDialog = "approve" | "observe" | "reject" | null;

export function ApplicationDrawer({
  open,
  applicationId,
  onClose,
  onReviewed,
}: Props) {
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);

  if (!open || !applicationId) return null;

  // TODO(fase 2): traer la solicitud real por applicationId
  // (incluye la URL firmada de 5 min del documento)
  const application = { ...MOCK_APPLICATION, id: applicationId };

  const canReview = application.status === "PENDING";
  const overdue = hoursSince(application.submittedAt) > OVERDUE_HOURS;
  const applicantName = `${application.firstName} ${application.lastName}`;

  function handleReviewed() {
    setActiveDialog(null);
    onReviewed?.();
    onClose();
  }

  // Props comunes de los tres modales de dictamen
  const dialogProps = {
    applicationId: application.id,
    expedienteCode: application.code,
    applicantName,
    onClose: () => setActiveDialog(null),
    onSuccess: handleReviewed,
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[#1B2632]/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="fixed right-0 top-0 z-40 flex h-full w-full max-w-6xl flex-col bg-[#EEE9DF] shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Encabezado */}
        <header className="flex items-start justify-between gap-4 border-b border-[#C9C1B1] bg-white px-6 py-4">
          <div className="space-y-1">
            <button
              type="button"
              onClick={onClose}
              className="text-[14px] font-semibold text-[#A35139]"
            >
              ← Volver a la bandeja
            </button>
            <h2
              id="drawer-title"
              className="text-[24px] font-semibold leading-8 text-[#1B2632]"
            >
              EXPEDIENTE: {application.code}
            </h2>
            <p className="flex flex-wrap items-center gap-2 text-[14px] font-medium leading-5 text-[#2C3B4D]">
              Revisión de grado y título
              <span className="rounded-full border border-[#C9C1B1] bg-[#EEE9DF] px-3 py-0.5 text-[12px] font-semibold text-[#1B2632]">
                {STATUS_LABEL[application.status]}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded px-2 text-[24px] leading-none text-[#2C3B4D] hover:bg-[#EEE9DF]"
          >
            ×
          </button>
        </header>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          <ApplicationDetail application={application} />
        </div>

        {/* Barra inferior: ID, prioridad y acciones */}
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[#C9C1B1] bg-white px-6 py-4">
          <p className="text-[13px] font-medium leading-5 text-[#2C3B4D]">
            Expediente ID:{" "}
            <strong className="text-[#1B2632]">#{application.code}</strong>
            {overdue && (
              <span className="ml-2 font-semibold text-[#A35139]">
                • Prioridad: Urgente (&gt;{OVERDUE_HOURS}h)
              </span>
            )}
          </p>

          {canReview && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveDialog("reject")}
                className={btnDanger}
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => setActiveDialog("observe")}
                className={btnSecondary}
              >
                Observar
              </button>
              <button
                type="button"
                onClick={() => setActiveDialog("approve")}
                className={btnAccent}
              >
                Aprobar
              </button>
            </div>
          )}
        </footer>
      </aside>

      <ApproveDialog open={activeDialog === "approve"} {...dialogProps} />
      <ObserveDialog open={activeDialog === "observe"} {...dialogProps} />
      <RejectDialog open={activeDialog === "reject"} {...dialogProps} />
    </>
  );
}