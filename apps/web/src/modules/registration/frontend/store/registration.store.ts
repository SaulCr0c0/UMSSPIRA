import { create } from 'zustand';

export type RegistrationStep = 'data' | 'email' | 'document' | 'confirmation';

export interface PersonalData {
  nombres: string;
  apellidos: string;
  ci: string;
  complementoCi: string;
  expedidoEn: string;
  correo: string;
  telefono: string;
  carreraId: string;
  anioEgreso: number;
  codigoSis: string;
}

export interface ConfirmationInfo {
  estado: string;
  fechaEnvio: string;
  nombreCompleto: string;
  ci: string;
  correoEnmascarado: string;
  plazoHoras: number;
}

export interface RegistrationState {
  step: RegistrationStep;
  sessionToken: string | null;
  personalData: PersonalData | null;
  confirmation: ConfirmationInfo | null;
  setStep: (step: RegistrationStep) => void;
  setSessionToken: (token: string) => void;
  setPersonalData: (data: PersonalData) => void;
  setConfirmation: (confirmation: ConfirmationInfo) => void;
  reset: () => void;
}

export const useRegistrationStore = create<RegistrationState>((set) => ({
  step: 'data',
  sessionToken: null,
  personalData: null,
  confirmation: null,
  setStep: (step: RegistrationStep) => set({ step }),
  setSessionToken: (sessionToken: string) => set({ sessionToken }),
  setPersonalData: (personalData: PersonalData) => set({ personalData }),
  setConfirmation: (confirmation: ConfirmationInfo) => set({ confirmation }),
  reset: () => set({ step: 'data', sessionToken: null, personalData: null, confirmation: null }),
}));