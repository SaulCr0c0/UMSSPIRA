'use client';

import { useEffect, useState } from 'react';
import { Briefcase } from 'lucide-react';
import { PREFIJOS_EXPERIENCIA, erroresDelBackend } from '@/modules/profile/validation/errores-api';
import { MensajeError, claseCampo } from '@/modules/profile/validation/mensaje-error';
import { type ErroresFormulario, validarExperiencia } from '@/modules/profile/validation/reglas-perfil';
import { ApiError } from '@/shared/services/api-client';

export type Experiencia = {
  empresa: string;
  cargo: string;
  fechaInicio: string;
  fechaFin?: string;
};
type FormularioExperienciaProps = {
  experiencias:Experiencia[];
  // Guarda la experiencia (en la API); si falla, el formulario muestra el error y conserva los datos
  onAgregar: (experiencia: Experiencia) => Promise<void> | void;
  // Avisa al acordeón cuántos campos tienen errores sin corregir (contador del encabezado)
  onErroresChange?: (cantidad: number) => void;
};

type Datos = {
  empresa: string;
  cargo: string;
  fechaInicio: string;
  fechaFin: string;
};

const VACIO: Datos = { empresa: '', cargo: '', fechaInicio: '', fechaFin: '' };

const CAMPOS: { nombre: keyof Datos; etiqueta: string; tipo: 'text' | 'date'; ejemplo?: string }[] = [
  { nombre: 'empresa', etiqueta: 'Empresa', tipo: 'text', ejemplo: 'Ej. Jalasoft' },
  { nombre: 'cargo', etiqueta: 'Cargo', tipo: 'text', ejemplo: 'Ej. Desarrollador Frontend' },
  { nombre: 'fechaInicio', etiqueta: 'fecha inicio', tipo: 'date' },
  { nombre: 'fechaFin', etiqueta: 'fecha fin', tipo: 'date' },
];

function mostrarFecha(fecha: string) {
  const [anio, mes] = fecha.split('-');
  return `${mes}/${anio}`;
}

export function FormularioExperiencia({ experiencias, onAgregar, onErroresChange }: FormularioExperienciaProps) {
  const [datos, setDatos] = useState<Datos>(VACIO);
  const [trabajoActual, setTrabajoActual] = useState(false);
  const [errores, setErrores] = useState<ErroresFormulario<keyof Datos>>({});
  // Los errores se muestran desde el primer intento de agregar y se recalculan mientras se corrige
  const [intentado, setIntentado] = useState(false);
  // Error que devolvió el servidor al guardar (400, sin conexión...)
  const [errorServidor, setErrorServidor] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  const cantidadErrores = Object.keys(errores).length;
  useEffect(() => {
    onErroresChange?.(cantidadErrores);
  }, [cantidadErrores, onErroresChange]);

  function actualizar(nuevos: Datos, actual: boolean) {
    setDatos(nuevos);
    setTrabajoActual(actual);
    if (intentado) setErrores(validarExperiencia(nuevos, actual));
  }

  const ordenadas = [...experiencias].sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio));

  async function agregar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;
    const encontrados = validarExperiencia(datos, trabajoActual);
    setIntentado(true);
    setErrores(encontrados);
    setErrorServidor(undefined);
    if (Object.keys(encontrados).length > 0) return;

    const experiencia: Experiencia = {
      empresa: datos.empresa.trim(),
      cargo: datos.cargo.trim(),
      fechaInicio: datos.fechaInicio,
    };
    // Trabajo actual: la experiencia va sin fechaFin (ni siquiera vacía)
    if (!trabajoActual) experiencia.fechaFin = datos.fechaFin;

    setEnviando(true);
    try {
      await onAgregar(experiencia);
      setDatos(VACIO);
      setTrabajoActual(false);
      setIntentado(false);
    } catch (error) {
      // En cualquier error se conservan los datos del formulario
      if (error instanceof ApiError && error.statusCode === 400) {
        // 400: cada mensaje del backend va junto a su campo; los que no se reconocen quedan como error general
        const { porCampo, generales } = erroresDelBackend(error.mensajes, PREFIJOS_EXPERIENCIA);
        setErrores(porCampo);
        setErrorServidor(generales.length > 0 ? generales.join(' ') : undefined);
      } else {
        setErrorServidor(error instanceof ApiError ? error.message : 'No se pudo guardar la experiencia.');
      }
    } finally {
      setEnviando(false);
    }
  }
  return (
    <div className="flex flex-col gap-5">
        {experiencias.length > 0 && (
        <ul className="flex flex-col gap-2">
          {ordenadas.map((experiencia, indice) => (
            <li
              key={`${experiencia.empresa}-${indice}`}
              className="flex items-center gap-3 rounded-xl border border-[#C9C1B1]/70 bg-[#FAF8F4] px-4 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEE9DF]">
                <Briefcase className="h-4 w-4 text-[#2C3B4D]" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-[#1B2632]">{experiencia.cargo}</span>
                <span className="block text-xs text-[#2C3B4D]/70">
                  {experiencia.empresa} · {mostrarFecha(experiencia.fechaInicio)} - {' '}
                  {experiencia.fechaFin ? mostrarFecha(experiencia.fechaFin) : 'Actualidad'}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={agregar} noValidate className="flex flex-col gap-4">  
        <div className="grid gap-4 md:grid-cols-2">
        {CAMPOS.map((campo) => {
          const esFin = campo.nombre === 'fechaFin';
          const deshabilitado = esFin && trabajoActual;

      return (
          <label key={campo.nombre} className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-[#1B2632]">
              {campo.etiqueta} 
              {!deshabilitado && <span className="text-[#A35139]"> *</span>}
            </span>
            <input
              type={campo.tipo}
              value={datos[campo.nombre]}
              onChange={(e) => actualizar({ ...datos, [campo.nombre]: e.target.value }, trabajoActual)}
              placeholder={campo.ejemplo}
              disabled={deshabilitado}
              aria-invalid={Boolean(errores[campo.nombre])}
              aria-describedby={`error-${campo.nombre}`}
              className={claseCampo(
                'h-11 rounded-lg border border-[#C9C1B1] bg-[#EEE9DF] px-3 text-sm text-[#1B2632] outline-none placeholder:text-[#2C3B4D]/40 focus:border-2 focus:border-[#2C3B4D] focus:bg-white disabled:cursor-not-allowed disabled:opacity-50',
                errores[campo.nombre],
              )}
            />
            <MensajeError id={`error-${campo.nombre}`} mensaje={errores[campo.nombre]} />
          </label>
        );
      })}
      </div>
      <label className="flex items-center gap-2 text-sm text-[#1B2632]">
          <input
            type="checkbox"
            checked={trabajoActual}
            onChange={(e) => actualizar({ ...datos, fechaFin: '' }, e.target.checked)}
            className="h-4 w-4 accent-[#A35139]"
          />
          Actualmente trabajo aquí
        </label>

      <MensajeError id="error-servidor-experiencia" mensaje={errorServidor} />

      <div className="flex justify-end">
          <button
            type="submit"
            disabled={enviando}
            className="h-11 rounded-lg bg-[#FFB162] px-6 text-sm font-semibold text-[#1B2632] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando ? 'Guardando…' : 'Agregar experiencia'}
          </button>
        </div>
      </form>
  </div>  
  );
}