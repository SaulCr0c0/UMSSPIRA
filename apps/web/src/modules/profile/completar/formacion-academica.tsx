'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Plus } from 'lucide-react';
import { PREFIJOS_FORMACION, erroresDelBackend } from '@/modules/profile/validation/errores-api';
import { MensajeError, claseCampo } from '@/modules/profile/validation/mensaje-error';
import { type ErroresFormulario, validarFormacion } from '@/modules/profile/validation/reglas-perfil';
import { ApiError } from '@/shared/services/api-client';

const GRADOS = ['Técnico superior', 'Licenciatura', 'Maestría', 'Doctorado'];

export type FormacionAcademica = {
  institucion: string;
  titulo: string;
  anioEgreso: string;
  grado: string;
};

type FormacionAcademicaFormProps = {
  formaciones: FormacionAcademica[];
  // Guarda la formación (en la API); si falla, el formulario muestra el error y conserva los datos
  onAgregar: (formacion: FormacionAcademica) => Promise<void> | void;
  // Avisa al acordeón cuántos campos tienen errores sin corregir (contador del encabezado)
  onErroresChange?: (cantidad: number) => void;
};

const VACIO: FormacionAcademica = { institucion: '', titulo: '', anioEgreso: '', grado: '' };

const subtituloClase = 'text-xs font-bold uppercase tracking-wide text-[#2C3B4D]';
const labelClase = 'block text-xs font-semibold text-[#2C3B4D]';
const inputClase =
  'mt-1.5 h-11 w-full rounded-md border border-[#C9C1B1] bg-white px-3 text-sm text-[#2C3B4D] placeholder:text-[#2C3B4D]/40 focus:border-[#FFB162] focus:outline-none';

export function FormacionAcademicaForm({ formaciones, onAgregar, onErroresChange }: FormacionAcademicaFormProps) {
  const [datos, setDatos] = useState<FormacionAcademica>(VACIO);
  const [errores, setErrores] = useState<ErroresFormulario<keyof FormacionAcademica>>({});
  // Los errores se muestran desde el primer intento de agregar y se recalculan mientras se corrige
  const [intentado, setIntentado] = useState(false);
  // Error que devolvió el servidor al guardar (409 duplicada, 400, sin conexión...)
  const [errorServidor, setErrorServidor] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  const cantidadErrores = Object.keys(errores).length;
  useEffect(() => {
    onErroresChange?.(cantidadErrores);
  }, [cantidadErrores, onErroresChange]);

  function cambiar(campo: keyof FormacionAcademica, valor: string) {
    const nuevos = { ...datos, [campo]: valor };
    setDatos(nuevos);
    if (intentado) setErrores(validarFormacion(nuevos));
  }

  async function agregar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;
    const encontrados = validarFormacion(datos);
    setIntentado(true);
    setErrores(encontrados);
    setErrorServidor(undefined);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await onAgregar({
        institucion: datos.institucion.trim(),
        titulo: datos.titulo.trim(),
        anioEgreso: datos.anioEgreso,
        grado: datos.grado,
      });
      setDatos(VACIO);
      setIntentado(false);
    } catch (error) {
      // En cualquier error se conservan los datos del formulario
      if (error instanceof ApiError && error.statusCode === 400) {
        // 400: cada mensaje del backend va junto a su campo; los que no se reconocen quedan como error general
        const { porCampo, generales } = erroresDelBackend(error.mensajes, PREFIJOS_FORMACION);
        setErrores(porCampo);
        setErrorServidor(generales.length > 0 ? generales.join(' ') : undefined);
      } else {
        // 409: ya registrada; también sin conexión u otros errores del servidor
        setErrorServidor(error instanceof ApiError ? error.message : 'No se pudo guardar la formación.');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      {formaciones.length > 0 && (
        <div className="mb-5 border-b border-[#C9C1B1]/70 pb-5">
          <p className={subtituloClase}>Formación registrada</p>
          <ul className="mt-3 space-y-2">
            {formaciones.map((formacion, indice) => (
              <li
                key={`${formacion.titulo}-${indice}`}
                className="flex items-center gap-3 rounded-lg border border-[#C9C1B1]/70 bg-[#EEE9DF] px-3 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#1B2632]">
                  <GraduationCap className="h-4 w-4 text-[#FFB162]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[#2C3B4D]">
                    {formacion.titulo}
                  </span>
                  <span className="block truncate text-xs text-[#2C3B4D]/70">
                    {formacion.institucion} • {formacion.anioEgreso} • {formacion.grado}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className={subtituloClase}>Agregar nueva formación</p>

      <form onSubmit={agregar} noValidate className="mt-4 space-y-4">
        <div>
          <label htmlFor="institucion" className={labelClase}>Institución</label>
          <input
            id="institucion"
            type="text"
            required
            placeholder="Ej. Universidad Mayor de San Simón"
            value={datos.institucion}
            onChange={(e) => cambiar('institucion', e.target.value)}
            aria-invalid={Boolean(errores.institucion)}
            aria-describedby="error-institucion"
            className={claseCampo(inputClase, errores.institucion)}
          />
          <MensajeError id="error-institucion" mensaje={errores.institucion} />
        </div>

        <div>
          <label htmlFor="titulo" className={labelClase}>Título</label>
          <input
            id="titulo"
            type="text"
            required
            placeholder="Ej. Ingeniería de Sistemas"
            value={datos.titulo}
            onChange={(e) => cambiar('titulo', e.target.value)}
            aria-invalid={Boolean(errores.titulo)}
            aria-describedby="error-titulo"
            className={claseCampo(inputClase, errores.titulo)}
          />
          <MensajeError id="error-titulo" mensaje={errores.titulo} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="anioEgreso" className={labelClase}>Año de egreso</label>
            <input
              id="anioEgreso"
              type="text"
              inputMode="numeric"
              required
              minLength={4}
              maxLength={4}
              pattern="\d{4}"
              title="Ingresa un año de 4 dígitos"
              placeholder="AAAA"
              value={datos.anioEgreso}
              onChange={(e) => cambiar('anioEgreso', e.target.value.replace(/\D/g, ''))}
              aria-invalid={Boolean(errores.anioEgreso)}
              aria-describedby="error-anioEgreso"
              className={claseCampo(inputClase, errores.anioEgreso)}
            />
            <MensajeError id="error-anioEgreso" mensaje={errores.anioEgreso} />
          </div>

          <div>
            <label htmlFor="grado" className={labelClase}>Grado</label>
            <select
              id="grado"
              required
              value={datos.grado}
              onChange={(e) => cambiar('grado', e.target.value)}
              aria-invalid={Boolean(errores.grado)}
              aria-describedby="error-grado"
              className={claseCampo(inputClase, errores.grado)}
            >
              <option value="" disabled>Selecciona un grado</option>
              {GRADOS.map((grado) => (
                <option key={grado} value={grado}>{grado}</option>
              ))}
            </select>
            <MensajeError id="error-grado" mensaje={errores.grado} />
          </div>
        </div>

        <MensajeError id="error-servidor-formacion" mensaje={errorServidor} />

        <button
          type="submit"
          disabled={enviando}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-[#2C3B4D] bg-white px-4 text-sm font-medium text-[#2C3B4D] hover:bg-[#EEE9DF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {enviando ? 'Guardando…' : 'Agregar formación'}
        </button>
      </form>
    </div>
  );
}
