import type { ProfileHeader, TimelineSection } from '@/modules/profile/data/profile-data';
import { formatExportDate } from '@/modules/profile/utils/profile-file-name';

export type ProfileJson = {
  idEgresado: string;
  fechaDescarga: string;
  nombre: string;
  carrera: string;
  promocion: number;
  educacion: { institucion: string; titulo: string; anio: number | null }[];
  experienciaLaboral: { empresa: string; cargo: string; periodo: string }[];
  certificaciones: { nombre: string; entidad: string; anio: number | null; grado: string }[];
};

const SECTION_EDUCATION = 'EDUCACIÓN';
const SECTION_EXPERIENCE = 'EXPERIENCIA LABORAL';
const SECTION_CERTIFICATIONS = 'CERTIFICACIONES';

function toYear(value: string | undefined): number | null {
  const match = value?.match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

function itemsOf(sections: TimelineSection[], title: string) {
  return sections.find((section) => section.title === title)?.items ?? [];
}

/** El perfil se puede exportar si al menos un bloque tiene registros. */
export function hasProfileBlocks(sections: TimelineSection[]): boolean {
  return sections.some((section) => section.items.length > 0);
}

export function buildProfileJson(
  header: ProfileHeader,
  sections: TimelineSection[],
  date: Date,
): ProfileJson {
  return {
    idEgresado: header.id,
    fechaDescarga: formatExportDate(date),
    nombre: header.name,
    carrera: header.career,
    promocion: header.graduationYear,
    educacion: itemsOf(sections, SECTION_EDUCATION).map((item) => ({
      institucion: item.title,
      titulo: item.subtitle,
      anio: toYear(item.date),
    })),
    experienciaLaboral: itemsOf(sections, SECTION_EXPERIENCE).map((item) => ({
      empresa: item.title,
      cargo: item.subtitle,
      periodo: item.date ?? '',
    })),
    certificaciones: itemsOf(sections, SECTION_CERTIFICATIONS).map((item) => {
      // El subtítulo viene como "Entidad · Año"
      const [entidad = '', anio] = item.subtitle.split('·').map((part) => part.trim());
      return {
        nombre: item.title,
        entidad,
        anio: toYear(anio),
        grado: item.detail?.replace(/^Grado:\s*/, '') ?? '',
      };
    }),
  };
}
