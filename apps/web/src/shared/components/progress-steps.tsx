'use client';

import { useRegistrationStore, type RegistrationState, type RegistrationStep } from '@/modules/registration/frontend/store';

const STEPS: { key: RegistrationStep; stepNum: string; label: string }[] = [
  { key: 'data', stepNum: 'PASO 1', label: 'Datos Personales' },
  { key: 'email', stepNum: 'PASO 2', label: 'Verificación de correo' },
  { key: 'document', stepNum: 'PASO 3', label: 'Carga de Requisitos' },
];

export function ProgressSteps() {
  const currentStep = useRegistrationStore((state: RegistrationState) => state.step);

  return (
    <div className="mb-8 rounded-2xl border border-oatmeal/60 bg-palladian/50 p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STEPS.map(({ key, stepNum, label }, index) => {
          const isActive = key === currentStep;
          return (
            <div
              key={key}
              className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                isActive ? 'bg-white shadow-sm' : 'opacity-70'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  isActive ? 'bg-burning-flame text-abyssal' : 'bg-abyssal text-white'
                }`}
              >
                {index + 1}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-wider text-truffle-trouble uppercase">
                  {stepNum} {isActive && '• En curso'}
                </span>
                <span className="text-xs font-semibold text-abyssal">{label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}