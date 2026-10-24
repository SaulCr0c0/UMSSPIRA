'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ActivateOtpStep, ActivatePasswordStep } from '@/modules/activation';

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

  // CA-06.3: Solo accesible tras validar OTP con pase firmado emitido por el servidor
  if (step === 'password' && activationToken) {
    return (
      <ActivatePasswordStep
        applicationId={applicationId}
        activationToken={activationToken}
        onBackToOtp={() => setStep('otp')}
      />
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
