'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, Plus } from 'lucide-react'
import { useAcademicEducation } from './use-academic-education'
import type { AcademicEducation } from './types'
import { AcademicEducationCard } from './academic-education-card'
import { DeleteAcademicEducationModal } from './delete-academic-education-modal'
import { PROFILE_CRUMB, PageHeading } from './page-heading'

export function AcademicEducationList() {
  const { records, isLoading, error, remove } = useAcademicEducation()
  const [pendingDelete, setPendingDelete] = useState<AcademicEducation | null>(null)

  return (
    <>
      <PageHeading
        crumbs={[PROFILE_CRUMB, { label: 'Mi formación académica' }]}
        title="Mi formación académica"
        description="Registra tu formación para que las empresas conozcan tu trayectoria académica."
        action={
          <Link href="/perfil/formacion/agregar" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#ff5b1f] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#e95118]">
            <Plus className="size-4" aria-hidden="true" />
            Agregar formación
          </Link>
        }
      />
      <section aria-label="Formaciones académicas registradas" className="rounded-2xl border border-[#e9e8ed] bg-white p-4 shadow-sm sm:p-6">
        {isLoading ? (
          <div className="flex flex-col gap-3" aria-busy="true">
            {[0, 1].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl bg-[#f1f0f4]" />)}
          </div>
        ) : error ? (
          <p role="alert" className="py-10 text-center text-sm text-red-700">No se pudo cargar tu formación académica.</p>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-[#dce7ff] text-[#13213e]">
              <GraduationCap className="size-6" aria-hidden="true" />
            </span>
            <p className="font-medium text-[#101c35]">Aún no registraste formación académica</p>
            <p className="max-w-sm text-sm text-[#555b68]">Agrega tu bachillerato o carrera para completar tu perfil profesional.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {records.map((record) => <li key={record.idFormacion}><AcademicEducationCard record={record} onDelete={setPendingDelete} /></li>)}
          </ul>
        )}
      </section>
      <DeleteAcademicEducationModal
        record={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={(record) => remove(record.idFormacion)}
      />
    </>
  )
}