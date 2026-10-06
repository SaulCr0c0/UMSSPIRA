import type { AcademicEducation, AcademicEducationPayload, Carrera } from './types'

export const CURRENT_EGRESADO_ID = 'egresado-demo'

const carreras: Carrera[] = [
  { idCarrera: 'car-01', nombre: 'Ingeniería de Sistemas' },
  { idCarrera: 'car-02', nombre: 'Ingeniería Informática' },
  { idCarrera: 'car-03', nombre: 'Ingeniería Civil' },
  { idCarrera: 'car-04', nombre: 'Ingeniería Industrial' },
  { idCarrera: 'car-05', nombre: 'Ingeniería Electrónica' },
  { idCarrera: 'car-06', nombre: 'Administración de Empresas' },
  { idCarrera: 'car-07', nombre: 'Contaduría Pública' },
  { idCarrera: 'car-08', nombre: 'Economía' },
  { idCarrera: 'car-09', nombre: 'Derecho' },
  { idCarrera: 'car-10', nombre: 'Psicología' },
  { idCarrera: 'car-11', nombre: 'Arquitectura' },
  { idCarrera: 'car-12', nombre: 'Diplomado en Desarrollo de Software' },
]

let records: AcademicEducation[] = [
  {
    idFormacion: 'form-1',
    idEgresado: CURRENT_EGRESADO_ID,
    idCarrera: 'car-01',
    tipoFormacion: 'Carrera',
    institucion: 'Universidad Mayor de San Simón',
    titulo: 'Ingeniería de Sistemas',
    nivelAcademico: 'Licenciatura',
    estado: 'Titulado',
    anioInicio: 2020,
    anioFin: 2025,
    descripcion: 'Formación profesional en Ingeniería de Sistemas.',
  },
  {
    idFormacion: 'form-2',
    idEgresado: CURRENT_EGRESADO_ID,
    idCarrera: 'car-12',
    tipoFormacion: 'Carrera',
    institucion: 'Universidad Mayor de San Simón',
    titulo: 'Diplomado en Desarrollo de Software',
    nivelAcademico: 'Diplomado',
    estado: 'Concluido',
    anioInicio: 2025,
    anioFin: 2026,
  },
]

export async function listCarreras(): Promise<Carrera[]> {
  return carreras
}

export async function listAcademicEducation(idEgresado: string): Promise<AcademicEducation[]> {
  return records.filter((record) => record.idEgresado === idEgresado)
}

export async function createAcademicEducation(
  payload: AcademicEducationPayload,
): Promise<AcademicEducation> {
  const created = { ...payload, idFormacion: crypto.randomUUID() }
  records = [...records, created]
  return created
}

export async function updateAcademicEducation(
  idFormacion: string,
  payload: AcademicEducationPayload,
): Promise<AcademicEducation> {
  if (!records.some((record) => record.idFormacion === idFormacion)) {
    throw new Error('La formación académica no existe.')
  }
  const updated = { ...payload, idFormacion }
  records = records.map((record) => (record.idFormacion === idFormacion ? updated : record))
  return updated
}

export async function deleteAcademicEducation(idFormacion: string): Promise<void> {
  records = records.filter((record) => record.idFormacion !== idFormacion)
}