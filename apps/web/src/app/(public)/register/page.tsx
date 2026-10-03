'use client';

import { useRegistrationStore, type RegistrationState } from '@/modules/registration/frontend/store';
import { ProgressSteps } from '@/shared/components/progress-steps';
import { RegistrationForm } from '@/modules/registration/frontend/components/registration-form';

export default function RegisterPage() {
  const step = useRegistrationStore((state: RegistrationState) => state.step);

  return (
    <div className="min-h-screen bg-palladian py-10 px-4 sm:px-6">
      <main className="mx-auto max-w-3xl">
        <ProgressSteps />

        {step === 'data' && <RegistrationForm />}

        {step === 'email' && (
          <div className="rounded-2xl border border-oatmeal bg-white p-8 text-center text-xs text-abyssal shadow-sm">
            <span className="inline-block rounded-md bg-palladian px-2.5 py-1 text-[11px] font-bold text-truffle-trouble uppercase mb-3">
              PASO 2 DE 3
            </span>
            <h2 className="text-xl font-bold mb-2">Verificación de Correo Electrónico (HU-02)</h2>
            <p className="text-abyssal/70">Módulo en desarrollo por el equipo encargado del envío OTP.</p>
          </div>
        )}
      </main>
    </div>
  );
}