"use client";

import { useState } from "react";

export type ReviewDecision = "APPROVED" | "OBSERVED" | "REJECTED";

export type ReviewPayload = {
  decision: ReviewDecision;
  category?: string; // obligatoria si OBSERVED o REJECTED (causal)
  note?: string; // mínimo 10 caracteres si OBSERVED o REJECTED
  notifyDean?: boolean; // checkbox del diseño de Observar
};

export const MIN_NOTE_LENGTH = 10;
export const MAX_NOTE_LENGTH = 500;

// TODO: confirmar las listas reales con el equipo
export const OBSERVATION_CATEGORIES = [
  "Documento ilegible",
  "Documento incompleto",
  "Datos incorrectos",
  "Documento vencido",
  "Otro",
];

export const REJECTION_CAUSES = [
  "Documentación falsa o adulterada",
  "No cumple los requisitos de egreso",
  "Identidad no verificada en SEGIP",
  "Trámite duplicado",
  "Otro",
];

type Options = {
  applicationId: string;
  onSuccess?: () => void;
};

export function useReview({ applicationId, onSuccess }: Options) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitReview(payload: ReviewPayload) {
    setIsLoading(true);
    setError(null);

    try {
      // TODO(fase 2): reemplazar este bloque por el fetch real a
      // POST /applications/:id/review
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log("Dictamen simulado:", { applicationId, ...payload });

      onSuccess?.();
      return true;
    } catch {
      setError("No se pudo registrar el dictamen. Intenta de nuevo.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { submitReview, isLoading, error };
}