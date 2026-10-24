export type WorkCondition = 'works' | 'not-works';

export type WorkModality = 'presencial' | 'remoto' | 'hibrido';

/** Solo estos campos se guardan en el navegador. Salario e inserción NO (confidencialidad). */
export interface SurveyDraft {
  workCondition: WorkCondition;
  cargo?: string;
  empresa?: string;
  area?: string;
  modalidad?: WorkModality;
}