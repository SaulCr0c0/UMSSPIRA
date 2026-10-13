'use client';

import { useState } from 'react';
import { Briefcase } from 'lucide-react';

export type Experiencia = {
  empresa: string;
  cargo: string;
  fechaInicio: string;
  fechaFin?: string;
};
type FormularioExperienciaProps = {
  experiencias:Experiencia[];
  onAgregar: (experiencia: Experiencia) => void;
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

export function FormularioExperiencia({experiencias, onAgregar }: FormularioExperienciaProps) {
  const [datos, setDatos] = useState<Datos>(VACIO);
  const [trabajoActual, setTrabajoActual] = useState(false);
  const completo = CAMPOS.every((campo) => (campo.nombre === 'fechaFin' && trabajoActual) || datos[campo.nombre].trim() !== '',
  );

  const ordenadas = [...experiencias].sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio));

  function agregar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!completo) return;
    onAgregar({
      empresa: datos.empresa.trim(),
      cargo: datos.cargo.trim(),
      fechaInicio: datos.fechaInicio,
      fechaFin: trabajoActual ? undefined : datos.fechaFin,
    });
    setDatos(VACIO);
    setTrabajoActual(false);
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
      <form onSubmit={agregar} className="flex flex-col gap-4">  
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
              onChange={(e) => setDatos({ ...datos, [campo.nombre]: e.target.value })}
              placeholder={campo.ejemplo}
              disabled={deshabilitado}
              className="h-11 rounded-lg border border-[#C9C1B1] bg-[#EEE9DF] px-3 text-sm text-[#1B2632] outline-none placeholder:text-[#2C3B4D]/40 focus:border-2 focus:border-[#2C3B4D] focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>
        );
      })}
      </div>
      <label className="flex items-center gap-2 text-sm text-[#1B2632]">
          <input
            type="checkbox"
            checked={trabajoActual}
            onChange={(e) => {
              setTrabajoActual(e.target.checked);
              setDatos({ ...datos, fechaFin: '' });
            }}
            className="h-4 w-4 accent-[#A35139]"
          />
          Actualmente trabajo aquí
        </label>

      <div className="flex justify-end">
          <button
            type="submit"
            disabled={!completo}
            className="h-11 rounded-lg bg-[#FFB162] px-6 text-sm font-semibold text-[#1B2632] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Agregar experiencia
          </button>
        </div>
      </form>
  </div>  
  );
}