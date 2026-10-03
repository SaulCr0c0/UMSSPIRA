'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegistrationStore, type RegistrationState } from '../store';
import { personalDataSchema, type PersonalDataValues, EXPEDITION_DEPARTMENTS } from '../validation/personal-data.schema';
import { createRegistrationSession, fetchCareers, type Career } from '../services/registration.service';

export function RegistrationForm() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const setSessionToken = useRegistrationStore((state: RegistrationState) => state.setSessionToken);
  const setPersonalData = useRegistrationStore((state: RegistrationState) => state.setPersonalData);
  const setStep = useRegistrationStore((state: RegistrationState) => state.setStep);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(personalDataSchema),
    defaultValues: {
      nombres: '',
      apellidos: '',
      ci: '',
      complementoCi: '',
      expedidoEn: '' as 'CB',
      correo: '',
      telefono: '',
      carreraId: '',
      anioEgreso: new Date().getFullYear(),
      codigoSis: '',
    },
  });

  useEffect(() => {
    fetchCareers().then(setCareers);
  }, []);

  async function onSubmit(values: PersonalDataValues) {
    setServerError(null);
    const result = await createRegistrationSession(values);

    if (!result.ok) {
      if (result.message.includes('correo')) {
        setError('correo', { message: result.message });
      } else if (result.message.includes('SIS')) {
        setError('codigoSis', { message: result.message });
      } else {
        setServerError(result.message);
      }
      return;
    }

    setPersonalData(values);
    setSessionToken(result.sessionToken);
    setStep('email');
  }

  return (
    <div className="rounded-2xl border border-oatmeal bg-white p-6 shadow-sm sm:p-8">
      {/* Encabezado */}
      <div className="mb-6">
        <span className="inline-block rounded-md bg-palladian px-2.5 py-1 text-[11px] font-bold text-truffle-trouble uppercase">
          PASO 1 DE 3
        </span>
        <h1 className="mt-2 text-2xl font-bold text-abyssal sm:text-3xl">
          Registro de Titulado e Información Personal
        </h1>
        <p className="mt-1 text-xs text-abyssal/70">
          Complete todos los campos obligatorios para iniciar el proceso de validación institucional.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 rounded-lg border border-truffle-trouble/30 bg-truffle-trouble/10 p-3 text-xs font-semibold text-truffle-trouble">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Sección 1: Datos de Identidad */}
        <div>
          <h2 className="mb-3 text-sm font-bold text-abyssal border-b border-oatmeal/40 pb-1">
            Datos de Identidad <span className="text-xs font-normal text-abyssal/50">(Como figura en su C.I.)</span>
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-abyssal mb-1">
                Nombres <span className="text-truffle-trouble">*</span>
              </label>
              <input
                {...register('nombres')}
                className={`w-full rounded-lg border bg-palladian p-2.5 text-xs font-medium text-abyssal outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-fantastic ${
                  errors.nombres ? 'border-2 border-truffle-trouble' : 'border-oatmeal'
                }`}
              />
              {errors.nombres && <p className="mt-1 text-[11px] text-truffle-trouble">{errors.nombres.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-abyssal mb-1">
                Apellidos <span className="text-truffle-trouble">*</span>
              </label>
              <input
                {...register('apellidos')}
                className={`w-full rounded-lg border bg-palladian p-2.5 text-xs font-medium text-abyssal outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-fantastic ${
                  errors.apellidos ? 'border-2 border-truffle-trouble' : 'border-oatmeal'
                }`}
              />
              {errors.apellidos && <p className="mt-1 text-[11px] text-truffle-trouble">{errors.apellidos.message}</p>}
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-abyssal mb-1">
                Cédula de Identidad (C.I.) <span className="text-truffle-trouble">*</span>
              </label>
              <input
                {...register('ci')}
                className={`w-full rounded-lg border bg-palladian p-2.5 text-xs font-medium text-abyssal outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-fantastic ${
                  errors.ci ? 'border-2 border-truffle-trouble' : 'border-oatmeal'
                }`}
              />
              {errors.ci && <p className="mt-1 text-[11px] text-truffle-trouble">{errors.ci.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-abyssal mb-1">Complemento (Opcional)</label>
              <input
                {...register('complementoCi')}
                placeholder="Ej. 1A"
                className="w-full rounded-lg border border-oatmeal bg-palladian p-2.5 text-xs font-medium text-abyssal outline-none focus:bg-white focus:ring-2 focus:ring-blue-fantastic"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-abyssal mb-1">
                Expedido en <span className="text-truffle-trouble">*</span>
              </label>
              <select
                {...register('expedidoEn')}
                className={`w-full rounded-lg border bg-palladian p-2.5 text-xs font-medium text-abyssal outline-none transition-all focus:bg-white ${
                  errors.expedidoEn ? 'border-2 border-truffle-trouble' : 'border-oatmeal'
                }`}
              >
                <option value="">Selecciona...</option>
                {EXPEDITION_DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.expedidoEn && <p className="mt-1 text-[11px] text-truffle-trouble">{errors.expedidoEn.message}</p>}
            </div>
          </div>
        </div>

        {/* Sección 2: Contacto Directo */}
        <div>
          <h2 className="mb-3 text-sm font-bold text-abyssal border-b border-oatmeal/40 pb-1">Contacto Directo</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-abyssal mb-1">
                Correo Electrónico <span className="text-truffle-trouble">*</span>
              </label>
              <input
                type="email"
                {...register('correo')}
                className={`w-full rounded-lg border bg-palladian p-2.5 text-xs font-medium text-abyssal outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-fantastic ${
                  errors.correo ? 'border-2 border-truffle-trouble' : 'border-oatmeal'
                }`}
              />
              {errors.correo && <p className="mt-1 text-[11px] text-truffle-trouble">{errors.correo.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-abyssal mb-1">
                Teléfono Celular / WhatsApp <span className="text-truffle-trouble">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-oatmeal bg-palladian p-2.5 text-xs font-bold text-abyssal">
                  +591
                </span>
                <input
                  {...register('telefono')}
                  maxLength={8}
                  className={`w-full rounded-lg border bg-palladian p-2.5 text-xs font-medium text-abyssal outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-fantastic ${
                    errors.telefono ? 'border-2 border-truffle-trouble' : 'border-oatmeal'
                  }`}
                />
              </div>
              {errors.telefono && <p className="mt-1 text-[11px] text-truffle-trouble">{errors.telefono.message}</p>}
            </div>
          </div>
        </div>

        {/* Sección 3: Información Académica */}
        <div>
          <h2 className="mb-3 text-sm font-bold text-abyssal border-b border-oatmeal/40 pb-1">Información Académica</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-abyssal mb-1">
                Carrera / Programa Académico <span className="text-truffle-trouble">*</span>
              </label>
              <select
                {...register('carreraId')}
                className={`w-full rounded-lg border bg-palladian p-2.5 text-xs font-medium text-abyssal outline-none transition-all focus:bg-white ${
                  errors.carreraId ? 'border-2 border-truffle-trouble' : 'border-oatmeal'
                }`}
              >
                <option value="">Selecciona tu carrera...</option>
                {careers.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              {errors.carreraId && <p className="mt-1 text-[11px] text-truffle-trouble">{errors.carreraId.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-abyssal mb-1">
                Año de Egreso <span className="text-truffle-trouble">*</span>
              </label>
              <input
                type="number"
                {...register('anioEgreso')}
                className={`w-full rounded-lg border bg-palladian p-2.5 text-xs font-medium text-abyssal outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-fantastic ${
                  errors.anioEgreso ? 'border-2 border-truffle-trouble' : 'border-oatmeal'
                }`}
              />
              {errors.anioEgreso && <p className="mt-1 text-[11px] text-truffle-trouble">{errors.anioEgreso.message}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-abyssal mb-1">
              Código SIS Universitario <span className="text-truffle-trouble">*</span>
            </label>
            <input
              {...register('codigoSis')}
              className={`w-full rounded-lg border bg-palladian p-2.5 text-xs font-medium text-abyssal outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-fantastic ${
                errors.codigoSis ? 'border-2 border-truffle-trouble' : 'border-oatmeal'
              }`}
            />
            {errors.codigoSis && <p className="mt-1 text-[11px] text-truffle-trouble">{errors.codigoSis.message}</p>}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-oatmeal/40 pt-6">
          <button
            type="button"
            className="rounded-lg border border-oatmeal bg-palladian px-6 py-2.5 text-xs font-bold text-abyssal hover:bg-oatmeal/30"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-burning-flame px-8 py-2.5 text-xs font-bold text-abyssal shadow-sm hover:brightness-105 disabled:opacity-50"
          >
            {isSubmitting ? 'VERIFICANDO...' : 'CONTINUAR →'}
          </button>
        </div>
      </form>
    </div>
  );
}