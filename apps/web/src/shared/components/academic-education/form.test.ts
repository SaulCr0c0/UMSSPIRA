import {
  EMPTY_FORM_VALUES,
  MESSAGES,
  formatPeriod,
  hasErrors,
  toFormValues,
  toPayload,
  validateAcademicEducation,
} from './form'
import type { AcademicEducation, AcademicEducationFormValues, Carrera } from './types'

const carreras: Carrera[] = [{ idCarrera: 'car-01', nombre: 'Ingeniería de Sistemas' }]
const validValues: AcademicEducationFormValues = {
  ...EMPTY_FORM_VALUES,
  tipoFormacion: 'Carrera',
  institucion: 'Universidad Mayor de San Simón',
  idCarrera: 'car-01',
  nivelAcademico: 'Licenciatura',
  estado: 'Titulado',
  anioInicio: '2020',
  anioFin: '2025',
}

describe('validaciones de formación académica', () => {
  it('identifica todos los campos obligatorios sin exigir año final ni descripción', () => {
    expect(validateAcademicEducation(EMPTY_FORM_VALUES)).toEqual({
      tipoFormacion: MESSAGES.required,
      institucion: MESSAGES.required,
      nivelAcademico: MESSAGES.required,
      estado: MESSAGES.required,
      anioInicio: MESSAGES.required,
    })
    expect(hasErrors(validateAcademicEducation(validValues))).toBe(false)
  })

  it('exige carrera solamente para el tipo Carrera', () => {
    expect(validateAcademicEducation({ ...validValues, idCarrera: '' }).idCarrera).toBe(MESSAGES.required)
    expect(validateAcademicEducation({ ...validValues, tipoFormacion: 'Bachiller', idCarrera: '' })).toEqual({})
  })

  it.each([
    ['institucion', 100, MESSAGES.institutionLength],
    ['descripcion', 250, MESSAGES.descriptionLength],
  ] as const)('valida el límite de %s también fuera del control HTML', (field, limit, message) => {
    expect(validateAcademicEducation({ ...validValues, [field]: 'a'.repeat(limit) })).toEqual({})
    expect(validateAcademicEducation({ ...validValues, [field]: 'a'.repeat(limit + 1) })[field]).toBe(message)
  })

  it('rechaza instituciones vacías después de quitar espacios', () => {
    expect(validateAcademicEducation({ ...validValues, institucion: '   ' }).institucion).toBe(MESSAGES.required)
  })

  it.each(['<', '>', '/', ';'])('rechaza el carácter %s en institución y descripción', (character) => {
    expect(validateAcademicEducation({ ...validValues, institucion: `UMSS${character}` }).institucion).toBe(MESSAGES.unsafeChars)
    expect(validateAcademicEducation({ ...validValues, descripcion: `Logro${character}` }).descripcion).toBe(MESSAGES.unsafeChars)
  })

  it.each(['20', '20255', '20a5'])('rechaza el año con formato %s', (year) => {
    const errors = validateAcademicEducation({ ...validValues, anioInicio: year, anioFin: year })
    expect(errors.anioInicio).toBe(MESSAGES.yearFormat)
    expect(errors.anioFin).toBe(MESSAGES.yearFormat)
  })

  it('rechaza año final anterior al inicial y acepta años iguales', () => {
    expect(validateAcademicEducation({ ...validValues, anioFin: '2019' }).anioFin).toBe(MESSAGES.endBeforeStart)
    expect(validateAcademicEducation({ ...validValues, anioFin: '2020' })).toEqual({})
  })

  it('permite omitir año final e ignora su contenido al estar cursando', () => {
    expect(validateAcademicEducation({ ...validValues, anioFin: '' })).toEqual({})
    expect(validateAcademicEducation({ ...validValues, actualmenteCursando: true, anioFin: '19' })).toEqual({})
  })
})

describe('conversión de formulario y payload', () => {
  it('construye Bachiller sin conservar una carrera anterior', () => {
    expect(toPayload({ ...validValues, tipoFormacion: 'Bachiller' }, 'egresado-demo', carreras)).toMatchObject({
      tipoFormacion: 'Bachiller', idCarrera: null, titulo: 'Bachiller',
    })
  })

  it('deriva el título de la carrera seleccionada', () => {
    expect(toPayload(validValues, 'egresado-demo', carreras)).toMatchObject({
      idEgresado: 'egresado-demo', idCarrera: 'car-01', titulo: 'Ingeniería de Sistemas', anioInicio: 2020, anioFin: 2025,
    })
  })

  it('rechaza tipo vacío y carrera ajena al catálogo', () => {
    expect(() => toPayload({ ...validValues, tipoFormacion: '' }, 'egresado-demo', carreras)).toThrow('Selecciona un tipo de formación válido.')
    expect(() => toPayload({ ...validValues, idCarrera: 'inexistente' }, 'egresado-demo', carreras)).toThrow('Selecciona una carrera válida.')
  })

  it('envía null y Cursando aunque quedara un año final o estado anterior', () => {
    expect(toPayload({ ...validValues, actualmenteCursando: true }, 'egresado-demo', carreras)).toMatchObject({
      anioFin: null, estado: 'Cursando',
    })
  })

  it('envía null si no hay año final y limpia espacios en los textos', () => {
    const payload = toPayload({ ...validValues, anioFin: ' ', institucion: ' UMSS ', descripcion: ' Logro académico ' }, 'egresado-demo', carreras)
    expect(payload).toMatchObject({ anioFin: null, institucion: 'UMSS', descripcion: 'Logro académico' })
    expect(toPayload({ ...validValues, descripcion: ' ' }, 'egresado-demo', carreras)).not.toHaveProperty('descripcion')
  })

  it('restaura Actualmente cursando al editar y preserva un año final concreto', () => {
    const record: AcademicEducation = { ...toPayload(validValues, 'egresado-demo', carreras), idFormacion: 'form-1' }
    expect(toFormValues({ ...record, estado: 'Cursando', anioFin: null })).toMatchObject({ actualmenteCursando: true, anioFin: '' })
    expect(toFormValues(record)).toMatchObject({ actualmenteCursando: false, anioFin: '2025' })
    expect(toFormValues({ ...record, anioFin: null })).toMatchObject({ actualmenteCursando: false, anioFin: '' })
  })

  it.each([
    [2025, 'Titulado', '2020 – 2025'],
    [null, 'Cursando', '2020 – Actualidad'],
    [null, 'Concluido', '2020'],
  ])('presenta correctamente el período %s / %s', (anioFin, estado, expected) => {
    expect(formatPeriod({ anioInicio: 2020, anioFin, estado })).toBe(expected)
  })
})
