import type { Metadata } from 'next'
import { AcademicEducationFormView } from '@/shared/components/academic-education/academic-education-form-view'

export const metadata: Metadata = { title: 'Editar formación académica · UMSS Vinculación Laboral' }

export default function EditAcademicEducationPage({ params }: { params: { id: string } }) {
  return <AcademicEducationFormView mode="edit" idFormacion={params.id} />
}