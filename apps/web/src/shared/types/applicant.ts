export type ApplicantStatus = "Postulado" | "En revisión" | "Entrevistado" | "Descartado";
export type ExperienceLevel = "Junior" | "Mid-Level" | "Senior";

export interface SkillMatch {
  skill: string;
  percentage: number;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  location: string;
  experienceLevel: ExperienceLevel;
  status: ApplicantStatus;
  matchPercentage: number;
  skills: SkillMatch[];
}