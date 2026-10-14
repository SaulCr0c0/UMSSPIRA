import type { ProfileHeader } from '@/modules/profile/data/profile-data';
import type {
  CertificationRecord,
  EducationRecord,
  ExperienceRecord,
  ProfileRecords,
} from '@/modules/profile/types/profile-record';
import { formatExportDate } from '@/modules/profile/utils/profile-file-name';

export type ProfileJson = {
  idEgresado: string;
  fechaDescarga: string;
  nombre: string;
  carrera: string;
  promocion: number;
  educacion: { institucion: string; titulo: string; grado: string; anio: number | null }[];
  experienciaLaboral: { empresa: string; cargo: string; periodo: string }[];
  certificaciones: { nombre: string; entidad: string; anio: number | null; grado: string }[];
};

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function toYear(value: string | undefined): number | null {
  const match = value?.match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

/** "2021-01-04" -> "Ene 2021"; vacío -> "Presente". */
function formatMonthYear(date: string): string {
  if (!date) return 'Presente';
  const [year, month] = date.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** El perfil se puede exportar si al menos una sección tiene registros. */
export function hasProfileBlocks(records: ProfileRecords): boolean {
  return Object.values(records).some((section) => section.length > 0);
}

// Se arma desde los registros del perfil y no desde la línea de tiempo, que no trae todos los datos
export function buildProfileJson(header: ProfileHeader, records: ProfileRecords, date: Date): ProfileJson {
  return {
    idEgresado: header.id,
    fechaDescarga: formatExportDate(date),
    nombre: header.name,
    carrera: header.career,
    promocion: header.graduationYear,
    educacion: (records.education as EducationRecord[]).map((record) => ({
      institucion: record.institution,
      titulo: record.title,
      grado: record.degree,
      anio: toYear(record.graduationYear),
    })),
    experienciaLaboral: (records.experience as ExperienceRecord[]).map((record) => ({
      empresa: record.company,
      cargo: record.position,
      periodo: `${formatMonthYear(record.startDate)} – ${formatMonthYear(record.endDate)}`,
    })),
    certificaciones: (records.certification as CertificationRecord[]).map((record) => ({
      nombre: record.name,
      entidad: record.issuer,
      anio: toYear(record.issueYear),
      grado: record.degree,
    })),
  };
}
