import {
  ESTADO_CURSANDO,
  TITULO_BACHILLER,
  type AcademicEducation,
  type AcademicEducationFormErrors,
  type AcademicEducationFormValues,
  type AcademicEducationPayload,
  type Carrera,
  type TipoFormacion,
} from './types'

export const EMPTY_FORM_VALUES: AcademicEducationFormValues = {
  tipoFormacion: '',
  institucion: '',
  idCarrera: '',
  nivelAcademico: '',
  estado: '',
  anioInicio: '',
  anioFin: '',
  actualmenteCursando: false,
  descripcion: '',
}

const UNSAFE_CHARS = /[<>/;]/
const YEAR_FORMAT = /^\d{4}$/

export function toFormValues(record: AcademicEducation): AcademicEducationFormValues {
  const actualmenteCursando = record.estado === ESTADO_CURSANDO && record.anioFin === null
  return {
    tipoFormacion: record.tipoFormacion,
    institucion: record.institucion,
    idCarrera: record.idCarrera ?? '',
    nivelAcademico: record.nivelAcademico,
    estado: record.estado,
    anioInicio: String(record.anioInicio),
    anioFin: record.anioFin === null ? '' : String(record.anioFin),
    actualmenteCursando,
    descripcion: record.descripcion ?? '',
  }
}

export function validateAcademicEducation(
  values: AcademicEducationFormValues,
): AcademicEducationFormErrors {
  const errors: AcademicEducationFormErrors = {}
  const requiredMessage = 'Este campo es obligatorio.'

  if (!values.tipoFormacion) errors.tipoFormacion = requiredMessage
  const institucion = values.institucion.trim()
  if (!institucion) errors.institucion = requiredMessage
  else if (UNSAFE_CHARS.test(institucion)) errors.institucion = 'El campo contiene caracteres no permitidos.'
  if (values.tipoFormacion === 'Carrera' && !values.idCarrera) errors.idCarrera = requiredMessage
  if (!values.nivelAcademico) errors.nivelAcademico = requiredMessage
  if (!values.estado) errors.estado = requiredMessage

  const anioInicio = values.anioInicio.trim()
  if (!anioInicio) errors.anioInicio = requiredMessage
  else if (!YEAR_FORMAT.test(anioInicio)) errors.anioInicio = 'Ingresa un año válido de 4 dígitos (AAAA).'

  const anioFin = values.anioFin.trim()
  if (!values.actualmenteCursando && anioFin) {
    if (!YEAR_FORMAT.test(anioFin)) errors.anioFin = 'Ingresa un año válido de 4 dígitos (AAAA).'
    else if (!errors.anioInicio && Number(anioFin) < Number(anioInicio)) {
      errors.anioFin = 'El año de finalización no puede ser menor al año de inicio.'
    }
  }
  if (UNSAFE_CHARS.test(values.descripcion)) {
    errors.descripcion = 'El campo contiene caracteres no permitidos.'
  }
  return errors
}

export function hasErrors(errors: AcademicEducationFormErrors) {
  return Object.keys(errors).length > 0
}

export function toPayload(
  values: AcademicEducationFormValues,
  idEgresado: string,
  carreras: Carrera[],
): AcademicEducationPayload {
  const tipoFormacion = values.tipoFormacion as TipoFormacion
  const isCarrera = tipoFormacion === 'Carrera'
  const carrera = isCarrera ? carreras.find((item) => item.idCarrera === values.idCarrera) : undefined
  const anioFin = values.anioFin.trim()
  const descripcion = values.descripcion.trim()

  return {
    idEgresado,
    idCarrera: isCarrera ? values.idCarrera : null,
    tipoFormacion,
    institucion: values.institucion.trim(),
    titulo: isCarrera ? carrera?.nombre ?? '' : TITULO_BACHILLER,
    nivelAcademico: values.nivelAcademico,
    estado: values.actualmenteCursando ? ESTADO_CURSANDO : values.estado,
    anioInicio: Number(values.anioInicio),
    anioFin: values.actualmenteCursando || !anioFin ? null : Number(anioFin),
    ...(descripcion ? { descripcion } : {}),
  }
}

export function formatPeriod(record: Pick<AcademicEducation, 'anioInicio' | 'anioFin' | 'estado'>) {
  if (record.anioFin !== null) return `${record.anioInicio} – ${record.anioFin}`
  return record.estado === ESTADO_CURSANDO
    ? `${record.anioInicio} – Actualidad`
    : `${record.anioInicio}`
}