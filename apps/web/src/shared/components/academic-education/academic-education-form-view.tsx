'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAcademicEducation, useCarreras } from './use-academic-education'
import { toFormValues } from './form'
import type { AcademicEducationFormMode } from './types'
import { AcademicEducationForm } from './academic-education-form'
import { EDUCATION_CRUMB, PROFILE_CRUMB, PageHeading } from './page-heading'

const LIST_PATH = '/perfil/formacion'

export function AcademicEducationFormView({
  mode,
  idFormacion,
}: {
  mode: AcademicEducationFormMode
  idFormacion?: string
}) {
  const router = useRouter()
  const { idEgresado, records, isLoading, create, update } = useAcademicEducation()
  const { carreras, isLoading: carrerasLoading } = useCarreras()
  const isEdit = mode === 'edit'
  const record = isEdit ? records.find((item) => item.idFormacion === idFormacion) : undefined

  const heading = (
    <PageHeading
      crumbs={[PROFILE_CRUMB, EDUCATION_CRUMB, { label: isEdit ? 'Editar' : 'Agregar' }]}
      title={isEdit ? 'Editar formación académica' : 'Agregar formación académica'}
      description={isEdit ? 'Actualiza la información de tu formación académica.' : 'Completa los datos de tu formación. Los campos marcados con * son obligatorios.'}
    />
  )

  if (isLoading || carrerasLoading) {
    return <>{heading}<div className="h-[36rem] animate-pulse rounded-2xl bg-[#f1f0f4]" aria-busy="true" /></>
  }

  if (isEdit && !record) {
    return (
      <>
        {heading}
        <div className="rounded-2xl border border-[#e9e8ed] bg-white p-10 text-center shadow-sm">
          <p className="font-medium text-[#101c35]">No encontramos esta formación académica.</p>
          <Link href={LIST_PATH} className="mt-3 inline-block text-sm font-medium text-[#e95118] hover:underline">Volver a Mi formación académica</Link>
        </div>
      </>
    )
  }

  return (
    <>
      {heading}
      <AcademicEducationForm
        key={record?.idFormacion ?? 'new'}
        mode={mode}
        idEgresado={idEgresado}
        carreras={carreras}
        initialValues={record ? toFormValues(record) : undefined}
        onCancel={() => router.push(LIST_PATH)}
        onSubmit={async (payload) => {
          if (record) await update(record.idFormacion, payload)
          else await create(payload)
          router.push(LIST_PATH)
        }}
      />
    </>
  )
}