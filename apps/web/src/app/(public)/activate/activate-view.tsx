'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ActivateOtpStep } from '@/modules/activation/frontend/components/activate-otp-step';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';

export function ActivateView() {
  const searchParams = useSearchParams();
  const applicationId =
    searchParams.get('applicationId') ||
    searchParams.get('id') ||
    searchParams.get('solicitud') ||
    '';
  const emailParam = searchParams.get('email') || '';

  const [step, setStep] = useState<'otp' | 'password'>('otp');
  const [activationToken, setActivationToken] = useState<string | null>(null);

  const handleOtpSuccess = (token: string) => {
    setActivationToken(token);
    setStep('password');
  };

  if (step === 'password') {
    return (
      <div className="w-full max-w-xl rounded-2xl border border-oatmeal/70 bg-white p-6 shadow-xl shadow-abyssal-blue/5 sm:p-10">
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 w-fit">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Paso 1 Completado con Éxito</span>
        </div>

        <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-abyssal-blue sm:text-3xl">
          Crea tu nueva contraseña
        </h2>
        <p className="mt-2 text-sm text-abyssal-blue/75">
          El código OTP ha sido validado correctamente. En el siguiente paso definirás tu contraseña
          para activar de forma definitiva tu cuenta institucional.
        </p>

        <div className="mt-6 rounded-xl border border-oatmeal/60 bg-[#F5F2EA]/60 p-4 text-xs text-abyssal-blue/80 flex items-start gap-2.5">
          <Lock className="h-4 w-4 text-burning-flame shrink-0 mt-0.5" />
          <span>
            Pase de activación firmado emitido temporalmente. Esta vista será completada en la tarea
            T-06.4.
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-burning-flame px-4 py-3.5 text-sm font-bold text-abyssal-blue shadow-sm hover:brightness-95 transition-all"
          >
            <span>Continuar al Login</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ActivateOtpStep
      applicationId={applicationId}
      email={emailParam}
      onSuccess={handleOtpSuccess}
    />
  );
}
