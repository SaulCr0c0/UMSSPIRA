import type { ProfileRecords } from '@/modules/profile/types/profile-record';

// Mismos nombres que las secciones de Completar perfil; también es el valor de ?seccion= (T6.6)
export type CompletenessSectionId =
  | 'formacion-academica'
  | 'experiencia-laboral'
  | 'certificaciones'
  | 'descripcion-profesional';

export type CompletenessSection = {
  id: CompletenessSectionId;
  label: string;
  complete: boolean;
};

export type ProfileCompleteness = {
  // 0 a 100; cada una de las 4 secciones vale lo mismo
  percentage: number;
  sections: CompletenessSection[];
  missing: CompletenessSection[];
};

// Completitud del perfil (HU-06): Formación, Experiencia y Certificaciones cuentan con al menos un
// registro; la descripción, si tiene texto
export function profileCompleteness(records: ProfileRecords, description: string): ProfileCompleteness {
  const sections: CompletenessSection[] = [
    { id: 'formacion-academica', label: 'Formación', complete: records.education.length > 0 },
    { id: 'experiencia-laboral', label: 'Experiencia', complete: records.experience.length > 0 },
    { id: 'certificaciones', label: 'Certificaciones', complete: records.certification.length > 0 },
    { id: 'descripcion-profesional', label: 'Descripción', complete: description.trim().length > 0 },
  ];
  const completas = sections.filter((section) => section.complete).length;
  return {
    percentage: Math.round((completas / sections.length) * 100),
    sections,
    missing: sections.filter((section) => !section.complete),
  };
}
