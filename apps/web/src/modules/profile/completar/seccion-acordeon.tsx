'use client';
import { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

type SeccionAcordeonProps = {
  numero: number;
  titulo: string;
  descripcion: string;
  cantidad: number;
  children?: React.ReactNode;
};

// Cabecera de sección según la v3 del Figma: número o check, título en mayúsculas y estado
export function SeccionAcordeon({ numero, titulo, descripcion, cantidad, children }: SeccionAcordeonProps) {
  const [abierta, setAbierta] = useState(false);
  const completa = cantidad > 0;

  let indicador = (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-umss-sand text-sm font-bold text-umss-navy">
      {numero}
    </span>
  );
  if (abierta) {
    indicador = (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-umss-terracotta text-sm font-bold text-white">
        {numero}
      </span>
    );
  } else if (completa) {
    indicador = (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D1E7DD] text-[#0F5132]">
        <Check className="h-4 w-4" aria-label="Sección completa" />
      </span>
    );
  }

  return (
    <section
      className={`rounded-2xl border bg-white transition-colors ${
        abierta ? 'border-umss-terracotta' : 'border-umss-ink/10'
      }`}
    >
      <button
        type="button"
        onClick={() => setAbierta(!abierta)}
        aria-expanded={abierta}
        title={descripcion}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left md:px-6 md:py-[18px]"
      >
        <span className="flex min-w-0 items-center gap-3">
          {indicador}
          <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
            <span className="text-base font-bold uppercase text-umss-navy">
              {abierta ? titulo : `${numero}. ${titulo}`}
            </span>
            <span className={`text-[13px] ${completa ? 'font-medium text-[#0F5132]' : 'text-umss-navy/60'}`}>
              {completa ? `(Completado · ${cantidad} ${cantidad === 1 ? 'registro' : 'registros'})` : '(Sin iniciar)'}
            </span>
          </span>
        </span>

        {abierta ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-umss-navy" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-umss-navy" aria-hidden="true" />
        )}
      </button>

      {abierta && <div className="border-t border-umss-sand/70 px-4 py-4 md:px-6 md:py-5">{children}</div>}
    </section>
  );
}
