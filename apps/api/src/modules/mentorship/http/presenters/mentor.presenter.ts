import type {
  DirectoryCatalogGroup,
  DirectoryMentor,
  InterestCatalogGroup,
  Mentor,
  MentorAreas,
  MentorAvailability,
  MentorDetail,
  MentorInterest,
} from '../../domain/entities/mentor';

const day = (date: Date | null) => date?.toISOString().slice(0, 10) ?? null;

export function presentMentor(mentor: Mentor) {
  return {
    id: mentor.id,
    experiencia: mentor.experience,
    esta_activo: mentor.active,
    anios_exp: mentor.experienceYears,
    fecha_creacion: day(mentor.createdAt),
    fecha_actualizacion: day(mentor.updatedAt),
  };
}

export function presentMentorInformation(mentor: Mentor | null) {
  return !mentor || (!mentor.description && !mentor.experience)
    ? { exists: false, profile: null }
    : {
        exists: true,
        profile: {
          descripcion: mentor.description,
          experiencia: mentor.experience,
          informacion_relevante: mentor.relevantInformation,
          foto_perfil: mentor.photoUrl,
          anios_exp: mentor.experienceYears,
          fecha_actualizacion: day(mentor.updatedAt),
        },
      };
}

export function presentDirectory(entry: DirectoryMentor) {
  return {
    ...presentMentor(entry.mentor),
    nombre: entry.mentor.graduateName,
    descripcion: entry.mentor.description,
    foto_perfil: entry.mentor.photoUrl,
    areas: entry.areas.map((area) => ({ id: area.id, nombre: area.name })),
    cargo: entry.cargo,
    empresa: entry.empresa,
    intereses: entry.interests.map((interest) => ({
      id: interest.id,
      nombre: interest.name,
      area: { id: interest.area.id, nombre: interest.area.name },
    })),
    availabilityStatus: entry.availability,
  };
}

export function presentDirectoryCatalog(catalog: DirectoryCatalogGroup[]) {
  return catalog.map((group) => ({
    area: { id: group.area.id, nombre: group.area.name },
    intereses: group.interests.map((interest) => ({ id: interest.id, nombre: interest.name })),
  }));
}

export function presentInterest(interest: MentorInterest) {
  return {
    id: interest.id,
    nombre: interest.name,
    area: { id: interest.area.id, nombre: interest.area.name },
  };
}

export function presentMentorAreas(state: MentorAreas) {
  return {
    areas: state.catalog.map((area) => ({ id: area.id, nombre: area.name, descripcion: null })),
    selectedIds: state.selectedIds,
    intereses: state.interests.map((interest) => ({
      id_area: interest.area.id,
      nombre: interest.name,
    })),
  };
}

export function presentInterestCatalog(groups: InterestCatalogGroup[]) {
  return groups.map((group) => ({
    area: { id: group.area.id, nombre: group.area.name },
    intereses: group.interests.map((interest) => ({
      ...presentInterest(interest),
      seleccionado: interest.selected,
    })),
  }));
}

export function presentAvailability(state: MentorAvailability) {
  return { availabilityStatus: state.status, fecha_actualizacion: day(state.updatedAt) };
}

export function presentMentorDetail(detail: MentorDetail) {
  return {
    id: detail.mentor.id,
    nombre: detail.mentor.graduateName,
    descripcion: detail.mentor.description,
    experiencia: detail.mentor.experience,
    informacion_relevante: detail.mentor.relevantInformation,
    anios_exp: detail.mentor.experienceYears,
    foto_perfil: detail.mentor.photoUrl,
    cargo: detail.position,
    empresa: detail.company,
    areas: detail.areas.map((area) => ({ id: area.id, nombre: area.name })),
    intereses: detail.interests.map(presentInterest),
    availabilityStatus: detail.availability,
    puedeSolicitar: detail.canRequest,
    horarios: detail.schedules.map((schedule) => ({
      dia_semana: schedule.weekday,
      hora_inicio: schedule.start,
      hora_fin: schedule.end,
    })),
    fecha_actualizacion: day(detail.mentor.updatedAt),
  };
}
