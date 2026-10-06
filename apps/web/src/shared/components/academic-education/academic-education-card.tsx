import Link from 'next/link'
import { Calendar, GraduationCap, Pencil, Trash2 } from 'lucide-react'
import { formatPeriod } from './form'
import type { AcademicEducation } from './types'

export function AcademicEducationCard({
  record,
  onDelete,
}: {
  record: AcademicEducation
  onDelete: (record: AcademicEducation) => void
}) {
  return (
    <article className="flex items-start gap-4 rounded-xl border border-[#e9e8ed] bg-white p-5 transition-shadow hover:shadow-sm">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#dce7ff] text-[#13213e]">
        <GraduationCap className="size-5" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="text-base font-semibold text-[#101c35]">{record.titulo}</h3>
        <p className="text-sm font-medium text-[#263958]">{record.nivelAcademico} · {record.estado}</p>
        <p className="text-sm text-[#555b68]">{record.institucion}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-[#737987]">
          <Calendar className="size-3.5" aria-hidden="true" />
          {formatPeriod(record)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Link
          href={`/perfil/formacion/${record.idFormacion}/editar`}
          className="inline-flex size-9 items-center justify-center rounded-md text-[#626978] transition-colors hover:bg-[#dce7ff] hover:text-[#13213e]"
          aria-label={`Editar ${record.titulo}`}
          title="Editar formación"
        >
          <Pencil className="size-4" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(record)}
          className="inline-flex size-9 items-center justify-center rounded-md text-[#626978] transition-colors hover:bg-[#f0eff2] hover:text-[#101c35]"
          aria-label={`Eliminar ${record.titulo}`}
          title="Eliminar formación"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}