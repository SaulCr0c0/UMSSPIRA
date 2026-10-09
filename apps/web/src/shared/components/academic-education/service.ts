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

const INITIAL_RECORDS: AcademicEducation[] = [
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

const STORAGE_KEY = 'umsspira:academic-education'
let records = INITIAL_RECORDS

function isAcademicEducation(value: unknown): value is AcademicEducation {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return (
    typeof record.idFormacion === 'string' &&
    typeof record.idEgresado === 'string' &&
    (record.idCarrera === null || typeof record.idCarrera === 'string') &&
    (record.tipoFormacion === 'Bachiller' || record.tipoFormacion === 'Carrera') &&
    typeof record.institucion === 'string' &&
    typeof record.titulo === 'string' &&
    typeof record.nivelAcademico === 'string' &&
    typeof record.estado === 'string' &&
    typeof record.anioInicio === 'number' &&
    (record.anioFin === null || typeof record.anioFin === 'number') &&
    (record.descripcion === undefined || typeof record.descripcion === 'string')
  )
}

function readRecords(): AcademicEducation[] {
  if (typeof window === 'undefined') return records

  let stored: string | null
  try {
    stored = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    throw new Error('No se pudo leer la formación académica guardada.')
  }
  if (stored === null) {
    writeRecords(INITIAL_RECORDS)
    return INITIAL_RECORDS
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(stored)
  } catch {
    throw new Error('No se pudo leer la formación académica guardada.')
  }
  if (!Array.isArray(parsed) || !parsed.every(isAcademicEducation)) {
    throw new Error('No se pudo leer la formación académica guardada.')
  }
  return parsed
}

function writeRecords(nextRecords: AcademicEducation[]): void {
  if (typeof window === 'undefined') {
    records = nextRecords
    return
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords))
  } catch {
    throw new Error('No se pudo guardar la formación académica. Inténtalo nuevamente.')
  }
}

export async function listCarreras(): Promise<Carrera[]> {
  return carreras
}

export async function listAcademicEducation(idEgresado: string): Promise<AcademicEducation[]> {
  return readRecords().filter((record) => record.idEgresado === idEgresado)
}

export async function createAcademicEducation(
  payload: AcademicEducationPayload,
): Promise<AcademicEducation> {
  const created = { ...payload, idFormacion: crypto.randomUUID() }
  writeRecords([...readRecords(), created])
  return created
}

export async function updateAcademicEducation(
  idFormacion: string,
  payload: AcademicEducationPayload,
): Promise<AcademicEducation> {
  const records = readRecords()
  if (!records.some((record) => record.idFormacion === idFormacion)) {
    throw new Error('La formación académica no existe.')
  }
  const updated = { ...payload, idFormacion }
  writeRecords(records.map((record) => (record.idFormacion === idFormacion ? updated : record)))
  return updated
}

export async function deleteAcademicEducation(idFormacion: string): Promise<void> {
  writeRecords(readRecords().filter((record) => record.idFormacion !== idFormacion))
}
