'use client';

import { useState } from 'react';
import { GraduationCap, Plus } from 'lucide-react';

const GRADOS = ['Licenciatura', 'Maestría', 'Doctorado'];

export type FormacionAcademica = {
  institucion: string;
  titulo: string;
  anioEgreso: string;
  grado: string;
};

const VACIO: FormacionAcademica = { institucion: '', titulo: '', anioEgreso: '', grado: '' };

type FormacionAcademicaFormProps = {
  onAgregar?: (registro: FormacionAcademica) => void;
};

const subtituloClase = 'text-xs font-bold uppercase tracking-wide text-[#2C3B4D]';
const labelClase = 'block text-xs font-semibold text-[#2C3B4D]';
const inputClase =
  'mt-1.5 w-full rounded-md border border-[#C9C1B1] bg-white px-3 py-2.5 text-sm text-[#2C3B4D] placeholder:text-[#2C3B4D]/40 focus:border-[#FFB162] focus:outline-none';

export function FormacionAcademicaForm({ onAgregar }: FormacionAcademicaFormProps) {
  const [form, setForm] = useState<FormacionAcademica>(VACIO);
  const [registros, setRegistros] = useState<FormacionAcademica[]>([]);

  function cambiar(campo: keyof FormacionAcademica, valor: string) {
    setForm({ ...form, [campo]: valor });
  }

  function agregar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRegistros([...registros, form]);
    onAgregar?.(form);
    setForm(VACIO);
  }

  return (
    <div>
      {registros.length > 0 && (
        <div className="mb-5 border-b border-[#C9C1B1]/70 pb-5">
          <p className={subtituloClase}>Formación registrada</p>
          <ul className="mt-3 space-y-2">
            {registros.map((r, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-lg border border-[#C9C1B1]/70 bg-[#EEE9DF] px-3 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#1B2632]">
                  <GraduationCap className="h-4 w-4 text-[#FFB162]" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-[#2C3B4D]">{r.titulo}</span>
                  <span className="block text-xs text-[#2C3B4D]/70">
                    {r.institucion} • {r.anioEgreso} • {r.grado}
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
            value={form.institucion}
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
            value={form.titulo}
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
              maxLength={4}
              pattern="\d{4}"
              title="Ingresa un año de 4 dígitos"
              placeholder="AAAA"
              value={form.anioEgreso}
              onChange={(e) => cambiar('anioEgreso', e.target.value.replace(/\D/g, ''))}
              className={inputClase}
            />
          </div>

          <div>
            <label htmlFor="grado" className={labelClase}>Grado</label>
            <select
              id="grado"
              required
              value={form.grado}
              onChange={(e) => cambiar('grado', e.target.value)}
              className={inputClase}
            >
              <option value="" disabled>Selecciona un grado</option>
              {GRADOS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md border border-[#2C3B4D] bg-white px-4 py-2 text-sm font-medium text-[#2C3B4D] hover:bg-[#EEE9DF]"
        >
          <Plus className="h-4 w-4" />
          Agregar formación
        </button>
      </form>
    </div>
  );
}
