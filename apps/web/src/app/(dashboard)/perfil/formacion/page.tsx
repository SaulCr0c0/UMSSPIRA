import type { Metadata } from 'next'
import { AcademicEducationList } from '@/shared/components/academic-education/academic-education-list'

export const metadata: Metadata = { title: 'Mi formación académica · UMSS Vinculación Laboral' }

export default function AcademicEducationPage() {
  return <AcademicEducationList />
}