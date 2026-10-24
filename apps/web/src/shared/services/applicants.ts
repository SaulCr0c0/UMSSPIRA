import { Applicant } from "../types/applicant";

// Datos de prueba con los colores e información solicitada
const MOCK_APPLICANTS: Applicant[] = [
  {
    id: "app-1",
    name: "Carlos Rojas",
    email: "carlos.rojas@email.com",
    location: "Cochabamba, Bolivia",
    experienceLevel: "Senior",
    status: "Postulado",
    matchPercentage: 92,
    skills: [
      { skill: "Node.js", percentage: 100 },
      { skill: "TypeScript", percentage: 90 },
      { skill: "REST API", percentage: 80 },
      { skill: "PostgreSQL", percentage: 80 },
      { skill: "Docker", percentage: 70 },
      { skill: "AWS", percentage: 60 },
    ],
  },
  {
    id: "app-2",
    name: "María López",
    email: "maria.lopez@email.com",
    location: "Cochabamba, Bolivia",
    experienceLevel: "Mid-Level",
    status: "En revisión",
    matchPercentage: 85,
    skills: [
      { skill: "Python", percentage: 95 },
      { skill: "FastAPI", percentage: 90 },
      { skill: "PostgreSQL", percentage: 80 },
      { skill: "Docker", percentage: 75 },
    ],
  },
  {
    id: "app-3",
    name: "Carlos Fernández",
    email: "carlos.fernandez@email.com",
    location: "Quillacollo, Cochabamba",
    experienceLevel: "Junior",
    status: "Postulado",
    matchPercentage: 68,
    skills: [
      { skill: "Python", percentage: 70 },
      { skill: "Django", percentage: 65 },
      { skill: "REST API", percentage: 70 },
      { skill: "PostgreSQL", percentage: 60 },
    ],
  },
  {
    id: "app-4",
    name: "Andrea Rojas",
    email: "andrea.rojas@email.com",
    location: "Cochabamba, Bolivia",
    experienceLevel: "Junior",
    status: "Descartado",
    matchPercentage: 45,
    skills: [
      { skill: "HTML/CSS", percentage: 80 },
      { skill: "JavaScript", percentage: 50 },
      { skill: "Python", percentage: 40 },
    ],
  },
];

export async function getApplicantsByVacancy(vacancyId: string): Promise<Applicant[]> {
  // Simulación de retraso de red
  await new Promise((resolve) => setTimeout(resolve, 250));

  /* 
    EN EL FUTURO: Aquí harás el fetch a tu API / motor de matching:
    
    const response = await fetch(`/api/v1/vacancies/${vacancyId}/applicants`);
    return await response.json();
  */

  return MOCK_APPLICANTS;
}