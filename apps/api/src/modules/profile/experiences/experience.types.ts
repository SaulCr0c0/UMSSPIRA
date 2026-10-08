// Contrato que conecta formulario, listado, detalle y edición con la tabla
// experiencia_laboral, cuyos datos quedan disponibles para la futura HU de matching.
export interface ExperienceInput {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  employmentType: string;
  description: string;
}

// Forma común que el API devuelve a las cuatro pantallas de experiencia.
export interface WorkExperience extends ExperienceInput {
  id: string;
}
