import type { Metadata } from 'next'
import { AcademicEducationFormView } from '@/shared/components/academic-education/academic-education-form-view'

export const metadata: Metadata = { title: 'Agregar formación académica · UMSS Vinculación Laboral' }

export default function AddAcademicEducationPage() {
  return <AcademicEducationFormView mode="create" />
}