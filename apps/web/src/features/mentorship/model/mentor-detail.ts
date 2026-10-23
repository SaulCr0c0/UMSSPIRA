import { z } from 'zod';
import { mentorInitials } from './mentor-directory';

export type MentorDetailAvailability = 'AVAILABLE' | 'PAUSED' | 'UNAVAILABLE';

export interface MentorSlotDay {
  date: string;
  dayLabel: string;
  times: string[];
}

export interface MentorInterestGroup {
  area: string;
  items: string[];
}

/**
 * Public mentor profile detail contract.
 * Strictly excludes private attributes (email, phone, internal identifiers).
 */
export interface MentorDetailProfile {
  id: string;
  fullName: string;
  photoUrl: string | null;
  jobTitle?: string | null;
  company?: string | null;
  summary?: string | null;
  about?: string | null;
  experience?: string | null;
  relevantInfo?: string | null;
  technicalAreas: string[];
  interests: MentorInterestGroup[];
  availability: MentorDetailAvailability;
  weekLabel?: string;
  slots: MentorSlotDay[];
}

export const mentorDetailSlotDaySchema = z.object({
  date: z.string(),
  dayLabel: z.string(),
  times: z.array(z.string()),
});

export const mentorDetailInterestGroupSchema = z.object({
  area: z.string(),
  items: z.array(z.string()),
});

export const mentorDetailProfileSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().min(1),
  photoUrl: z.string().nullable().default(null),
  jobTitle: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  about: z.string().nullable().optional(),
  experience: z.string().nullable().optional(),
  relevantInfo: z.string().nullable().optional(),
  technicalAreas: z.array(z.string()).default([]),
  interests: z.array(mentorDetailInterestGroupSchema).default([]),
  availability: z.enum(['AVAILABLE', 'PAUSED', 'UNAVAILABLE']),
  weekLabel: z.string().optional(),
  slots: z.array(mentorDetailSlotDaySchema).default([]),
});

export { mentorInitials };

export function formatProfession(jobTitle?: string | null, company?: string | null): string | null {
  const parts = [jobTitle?.trim(), company?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(' | ') : null;
}

export function availabilityBadgeConfig(availability: MentorDetailAvailability): {
  label: string;
  className: string;
} {
  switch (availability) {
    case 'AVAILABLE':
      return { label: 'Disponible', className: 'mentor-detail-badge-available' };
    case 'PAUSED':
      return { label: 'Disponibilidad pausada', className: 'mentor-detail-badge-paused' };
    case 'UNAVAILABLE':
      return { label: 'No disponible', className: 'mentor-detail-badge-unavailable' };
  }
}

/** Mock week slots matching mockups (week 19-25 oct) */
export const defaultMockSlots: MentorSlotDay[] = [
  { date: '2026-10-19', dayLabel: 'lunes 19 oct', times: ['09:00', '11:00', '16:00', '18:00'] },
  { date: '2026-10-20', dayLabel: 'martes 20 oct', times: ['10:00', '16:00', '17:00'] },
  { date: '2026-10-21', dayLabel: 'miércoles 21 oct', times: ['10:00', '11:00', '15:00', '18:00'] },
  { date: '2026-10-22', dayLabel: 'jueves 22 oct', times: ['09:00', '10:00', '15:00', '18:00'] },
  { date: '2026-10-23', dayLabel: 'viernes 23 oct', times: ['09:00', '11:00', '16:00', '17:00', '18:00'] },
  { date: '2026-10-24', dayLabel: 'sábado 24 oct', times: ['09:00', '10:00', '15:00', '17:00', '18:00'] },
];

export const mockMentorsList: MentorDetailProfile[] = [
  {
    id: 'carlos-vargas',
    fullName: 'Carlos Vargas',
    photoUrl: null,
    jobTitle: 'Arquitecto de Software',
    company: 'Jalasoft',
    summary: 'Diseño plataformas distribuidas y oriento sobre arquitectura limpia, microservicios y carrera técnica.',
    about: 'Ingeniero de Sistemas (UMSS, 2011). Más de 12 años construyendo productos de software para clientes de Estados Unidos y Europa. Disfruto ayudar a estudiantes a pasar de "funciona" a "está bien diseñado".',
    experience: 'Arquitecto de Software en Jalasoft desde 2018. Antes, desarrollador senior Java en Digital Harbor. Docente invitado de Arquitectura de Software en la FCyT.',
    relevantInfo: 'Disponible para mentorías enfocadas en arquitectura y buenas prácticas.',
    technicalAreas: ['Desarrollo de Software', 'DevOps'],
    interests: [
      {
        area: 'Desarrollo de Software',
        items: ['Arquitectura de software', 'Patrones de diseño', 'Java / Spring Boot'],
      },
      {
        area: 'DevOps',
        items: ['CI/CD'],
      },
    ],
    availability: 'AVAILABLE',
    weekLabel: 'Semana del 19 al 25 oct · sesiones de 1 hora',
    slots: defaultMockSlots,
  },
  {
    id: 'luis-fernandez',
    fullName: 'Luis Fernández Rojas',
    photoUrl: null,
    jobTitle: 'Ingeniero de Redes',
    company: 'ENTEL',
    summary: 'Infraestructura de telecomunicaciones a escala nacional. Certificaciones Cisco y seguridad perimetral.',
    about: 'Ingeniero Electrónico (UMSS). Responsable de diseño de red troncal y seguridad perimetral en la regional Cochabamba.',
    experience: 'Ingeniero de Redes senior en ENTEL desde 2015. Instructor certificado Cisco Networking Academy.',
    relevantInfo: null,
    technicalAreas: ['Redes de Computadoras', 'Ciberseguridad'],
    interests: [
      {
        area: 'Ciberseguridad',
        items: ['Pentesting'],
      },
      {
        area: 'Redes de Computadoras',
        items: ['Cisco / CCNA', 'Administración de servidores'],
      },
    ],
    availability: 'UNAVAILABLE',
    weekLabel: 'Semana del 19 al 25 oct · sesiones de 1 hora',
    slots: [],
  },
  {
    id: 'rodrigo-salazar',
    fullName: 'Rodrigo Salazar Torrico',
    photoUrl: null,
    jobTitle: 'Ingeniero de Datos',
    company: 'Tigo Bolivia',
    summary: 'Pipelines de datos y data warehouses. Talento en SQL y optimización de consultas.',
    about: 'Ingeniero de Sistemas (UMSS). Construyo plataformas de datos para analítica comercial.',
    experience: 'Ingeniero de Datos en Tigo Bolivia desde 2020.',
    relevantInfo: null,
    technicalAreas: ['Bases de Datos', 'Ciencia de Datos'],
    interests: [
      {
        area: 'Bases de Datos',
        items: ['PostgreSQL', 'Optimización de consultas'],
      },
      {
        area: 'Ciencia de Datos',
        items: ['Python para análisis'],
      },
    ],
    availability: 'PAUSED',
    weekLabel: 'Semana del 19 al 25 oct · sesiones de 1 hora',
    slots: [],
  },
  {
    id: 'gabriela-terrazas',
    fullName: 'Gabriela Terrazas',
    photoUrl: null,
    jobTitle: 'Scrum Master',
    company: 'Unifranz Tech',
    summary: 'Agilidad, estimación y facilitación de equipos para proyectos de grado en equipo.',
    about: null, // Perfil sin información
    experience: null, // Perfil sin información
    relevantInfo: null,
    technicalAreas: ['Gestión de Proyectos TI'],
    interests: [
      {
        area: 'Gestión de Proyectos TI',
        items: ['Scrum', 'Liderazgo de equipos', 'Estimación'],
      },
    ],
    availability: 'AVAILABLE',
    weekLabel: 'Semana del 19 al 25 oct · sesiones de 1 hora',
    slots: defaultMockSlots,
  },
  {
    id: 'paola',
    fullName: 'Paola Méndez Arce',
    photoUrl: null,
    jobTitle: 'Analista de Ciberseguridad',
    company: 'Empresa de prueba',
    summary: 'Orientación en seguridad de aplicaciones y gestión de identidades.',
    about: 'Especialista en seguridad defensiva y auditoría de código.',
    experience: 'Más de 5 años auditando sistemas web y nubes híbridas.',
    relevantInfo: null,
    technicalAreas: ['Ciberseguridad'],
    interests: [
      {
        area: 'Ciberseguridad',
        items: ['Seguridad web', 'Gestión de identidades', 'Pentesting'],
      },
    ],
    availability: 'AVAILABLE',
    weekLabel: 'Semana del 19 al 25 oct · sesiones de 1 hora',
    slots: defaultMockSlots,
  },
];
