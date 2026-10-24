import type { InterestArea, InterestConfiguration } from './mentor-interests';
import type { MentorAvailabilityStatus } from '../services/mentor-availability-api';

/** Public directory data only; contact and private profile fields are excluded. */
export interface DirectoryMentor {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  areas: { id: string; name: string }[];
  availability: MentorAvailabilityStatus | null;
  /** Cargo and company from the directory's public response, when provided. */
  profession?: string;
  interests?: { id: string; name: string; areaId: string }[];
}

export interface DirectoryPage {
  mentors: DirectoryMentor[];
  total: number;
  catalog: InterestArea[];
  interestsSupported: boolean;
}

export interface DirectoryQuery extends InterestConfiguration {
  offset: number;
  limit: number;
}

export const DIRECTORY_PAGE_SIZE = 6;
export const emptyDirectoryFilters = (): InterestConfiguration => ({ areaIds: [], topicIds: [] });

/** Catálogo oficial de áreas e intereses del Sprint 1 para el directorio de mentores (CA-01). */
export const SPRINT1_CATALOG: InterestArea[] = [
  {
    id: 'software',
    name: 'Desarrollo de Software',
    description: 'Frontend, backend y desarrollo de software.',
    topics: [
      { id: 'api', name: 'APIs REST' },
      { id: 'web', name: 'Desarrollo web' },
      { id: 'clean-code', name: 'Clean Code y patrones' },
      { id: 'testing', name: 'Pruebas automatizadas' },
    ],
  },
  {
    id: 'data',
    name: 'Bases de Datos',
    description: 'Diseño, modelado y optimización de bases de datos.',
    topics: [
      { id: 'sql', name: 'PostgreSQL y SQL' },
      { id: 'data-modeling', name: 'Modelado de datos' },
      { id: 'query-opt', name: 'Optimización de consultas' },
      { id: 'nosql', name: 'NoSQL' },
    ],
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'CI/CD, contenedores e infraestructura en la nube.',
    topics: [
      { id: 'docker', name: 'Docker y Contenedores' },
      { id: 'cicd', name: 'CI/CD Pipelines' },
      { id: 'cloud', name: 'Cloud Computing' },
      { id: 'infra', name: 'Infraestructura' },
    ],
  },
  {
    id: 'security',
    name: 'Ciberseguridad',
    description: 'Seguridad en aplicaciones y redes.',
    topics: [
      { id: 'sec-web', name: 'Seguridad web (OWASP)' },
      { id: 'sec-auth', name: 'Autenticación y Autorización' },
      { id: 'crypto', name: 'Criptografía' },
      { id: 'sec-audit', name: 'Auditoría de seguridad' },
    ],
  },
  {
    id: 'mobile',
    name: 'Desarrollo móvil',
    description: 'Aplicaciones nativas e híbridas para Android e iOS.',
    topics: [
      { id: 'react-native', name: 'React Native' },
      { id: 'flutter', name: 'Flutter' },
      { id: 'android', name: 'Android (Kotlin)' },
      { id: 'ios', name: 'iOS (Swift)' },
    ],
  },
  {
    id: 'architecture',
    name: 'Arquitectura y diseño de software',
    description: 'Patrones arquitectónicos y diseño de sistemas.',
    topics: [
      { id: 'microservices', name: 'Microservicios' },
      { id: 'patterns', name: 'Patrones de arquitectura' },
      { id: 'system-design', name: 'Diseño de sistemas escalables' },
      { id: 'ddd', name: 'Domain-Driven Design (DDD)' },
    ],
  },
];

export function mentorInitials(name: string): string {
  const words = name.trim().replace(/^(?:ing|lic|dra|dr|msc)\.?\s+/i, '').split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map(word => Array.from(word)[0]).join('').toLocaleUpperCase('es') || 'M';
}

/**
 * Filtra mentores según los criterios aplicados de áreas e intereses (CA-06, CA-07, Tarea 105).
 * - Dentro de áreas se aplica lógica OR (coincide con cualquiera de las áreas seleccionadas).
 * - Dentro de intereses se aplica lógica OR (coincide con cualquiera de los intereses seleccionados).
 * - Entre áreas e intereses se aplica lógica AND (debe coincidir con ambos grupos cuando ambos están activos).
 */
export function filterDirectory(mentors: DirectoryMentor[], filters: InterestConfiguration) {
  return mentors.filter(mentor => {
    const matchesArea = !filters.areaIds.length || mentor.areas.some(area =>
      filters.areaIds.includes(area.id) ||
      filters.areaIds.some(fId => {
        const sprintArea = SPRINT1_CATALOG.find(s => s.id === fId);
        return sprintArea && (sprintArea.name.trim().toLowerCase() === area.name.trim().toLowerCase() || area.id === sprintArea.id);
      }),
    );

    const matchesTopic = !filters.topicIds.length || (mentor.interests && mentor.interests.some(interest =>
      filters.topicIds.includes(interest.id) ||
      filters.topicIds.some(fId => {
        const allSprintTopics = SPRINT1_CATALOG.flatMap(a => a.topics);
        const sprintTopic = allSprintTopics.find(t => t.id === fId);
        return sprintTopic && (sprintTopic.name.trim().toLowerCase() === interest.name.trim().toLowerCase() || interest.id === sprintTopic.id);
      }),
    ));

    return Boolean(matchesArea && matchesTopic);
  });
}

/**
 * Fusiona el catálogo del backend con el catálogo oficial del Sprint 1 (CA-01).
 * Garantiza que las 6 áreas técnicas del Sprint 1 y sus tópicos estén siempre disponibles.
 */
export function mergeCatalog(backendCatalog: InterestArea[] = [], baseCatalog: InterestArea[] = SPRINT1_CATALOG): InterestArea[] {
  const result: InterestArea[] = baseCatalog.map(area => ({
    ...area,
    topics: area.topics.map(t => ({ ...t })),
  }));

  for (const area of backendCatalog) {
    const key = area.name.trim().toLowerCase();
    const existing = result.find(a => a.name.trim().toLowerCase() === key || a.id === area.id);
    if (existing) {
      existing.id = area.id;
      if (area.description) existing.description = area.description;
      for (const topic of area.topics) {
        const found = existing.topics.find(t => t.id === topic.id || t.name.trim().toLowerCase() === topic.name.trim().toLowerCase());
        if (found) {
          found.id = topic.id;
          found.name = topic.name;
        } else {
          existing.topics.push({ ...topic });
        }
      }
    } else {
      result.push({ ...area, topics: area.topics.map(t => ({ ...t })) });
    }
  }

  return result;
}

export function directoryCatalog(mentors: DirectoryMentor[]): InterestArea[] {
  const groups = new Map<string, InterestArea>();
  for (const mentor of mentors) {
    for (const area of mentor.areas) {
      if (!groups.has(area.id)) groups.set(area.id, { ...area, description: '', topics: [] });
    }
    for (const interest of mentor.interests ?? []) {
      const group = groups.get(interest.areaId);
      if (group && !group.topics.some(topic => topic.id === interest.id)) {
        group.topics.push({ id: interest.id, name: interest.name });
      }
    }
  }
  return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export function uniqueMentors(mentors: DirectoryMentor[]): DirectoryMentor[] {
  return Array.from(new Map(mentors.map(mentor => [mentor.id, mentor])).values());
}

/** Integration route for the public profile implemented by HU 6.9. */
export function mentorProfileHref(id: string) {
  return `/mentorship/mentors/${encodeURIComponent(id)}`;
}
