/** Requisitos de activación de HU 6.1. `egresado` significa titulado aprobado. */
export type ConditionId = 'egresado' | 'perfil';
export type Requirements = Record<ConditionId, boolean>;

export interface MentorState {
  isActive: boolean;
  requirements: Requirements;
}
