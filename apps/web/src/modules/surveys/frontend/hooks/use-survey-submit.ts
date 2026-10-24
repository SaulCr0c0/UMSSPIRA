'use client';

import { useCallback, useRef, useState } from 'react';
import {
  submitSurvey,
  SURVEY_SENT_MESSAGE,
  SURVEY_SEND_ERROR_MESSAGE,
  type SurveySubmitInput,
} from '../services/surveys.service';

export type SurveySubmitStatus = 'idle' | 'success' | 'error';

/**
 * T3.4 — El hook NO administra ni limpia las respuestas del formulario:
 * el dueño del estado será T1.2. Un fallo permite reintentar con los mismos
 * datos. El manejo explícito de banner offline corresponde a T3.6.
 */
export function useSurveySubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<SurveySubmitStatus>('idle');
  const inFlight = useRef(false);

  const submit = useCallback(async (values: SurveySubmitInput): Promise<boolean> => {
    // Ref inmediata para impedir doble envío incluso entre dos clicks del mismo render.
    if (inFlight.current) return false;
    inFlight.current = true;
    setIsSubmitting(true);
    setStatus('idle');
    try {
      await submitSurvey(values);
      setStatus('success');
      return true;
    } catch {
      setStatus('error');
      return false;
    } finally {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  }, []);

  /** Consumir cuando el usuario modifica respuestas; no toca el formulario. */
  const resetFeedback = useCallback(() => setStatus('idle'), []);

  return {
    isSubmitting,
    status,
    message: status === 'success'
      ? SURVEY_SENT_MESSAGE
      : status === 'error' ? SURVEY_SEND_ERROR_MESSAGE : null,
    submit,
    resetFeedback,
  };
}
