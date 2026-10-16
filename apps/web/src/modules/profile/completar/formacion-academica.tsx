'use client';

import { useState } from 'react';
import { GraduationCap, Plus } from 'lucide-react';

const GRADOS = ['Técnico superior', 'Licenciatura', 'Maestría', 'Doctorado'];

export type FormacionAcademica = {
  institucion: string;
  titulo: string;
  anioEgreso: string;
  grado: string;
};

type FormacionAcademicaFormProps = {
  formaciones: FormacionAcademica[];
  onAgregar: (formacion: FormacionAcademica) => void;
};

const VACIO: FormacionAcademica = { institucion: '', titulo: '', anioEgreso: '', grado: '' };

const subtituloClase = 'text-xs font-bold uppercase tracking-wide text-[#2C3B4D]';
const labelClase = 'block text-xs font-semibold text-[#2C3B4D]';
const inputClase =
  'mt-1.5 h-11 w-full rounded-md border border-[#C9C1B1] bg-white px-3 text-sm text-[#2C3B4D] placeholder:text-[#2C3B4D]/40 focus:border-[#FFB162] focus:outline-none';

export function FormacionAcademicaForm({ formaciones, onAgregar }: FormacionAcademicaFormProps) {
  const [datos, setDatos] = useState<FormacionAcademica>(VACIO);

  function cambiar(campo: keyof FormacionAcademica, valor: string) {
    setDatos({ ...datos, [campo]: valor });
  }

  function agregar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    onAgregar({
      institucion: datos.institucion.trim(),
      titulo: datos.titulo.trim(),
      anioEgreso: datos.anioEgreso,
      grado: datos.grado,
    });
    setDatos(VACIO);
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

      <form onSubmit={agregar} className="mt-4 space-y-4">
        <div>
          <label htmlFor="institucion" className={labelClase}>Institución</label>
          <input
            id="institucion"
            type="text"
            required
            placeholder="Ej. Universidad Mayor de San Simón"
            value={datos.institucion}
            onChange={(e) => cambiar('institucion', e.target.value)}
            className={inputClase}
          />
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
            className={inputClase}
          />
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
              className={inputClase}
            />
          </div>

          <div>
            <label htmlFor="grado" className={labelClase}>Grado</label>
            <select
              id="grado"
              required
              value={datos.grado}
              onChange={(e) => cambiar('grado', e.target.value)}
              className={inputClase}
            >
              <option value="" disabled>Selecciona un grado</option>
              {GRADOS.map((grado) => (
                <option key={grado} value={grado}>{grado}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-[#2C3B4D] bg-white px-4 text-sm font-medium text-[#2C3B4D] hover:bg-[#EEE9DF]"
        >
          <Plus className="h-4 w-4" />
          Agregar formación
        </button>
      </form>
    </div>
  );
}
