import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import AcademicEducationLayout from '@/app/(dashboard)/perfil/formacion/layout'
import DashboardLayout from '@/app/(dashboard)/layout'
import { AcademicEducationForm } from './academic-education-form'
import { AcademicEducationFormView } from './academic-education-form-view'
import { AcademicEducationList } from './academic-education-list'
import { DeleteAcademicEducationModal } from './delete-academic-education-modal'
import { toFormValues } from './form'
import {
  CURRENT_EGRESADO_ID,
  createAcademicEducation,
  deleteAcademicEducation,
  listAcademicEducation,
  updateAcademicEducation,
} from './service'
import type { AcademicEducation, AcademicEducationPayload, Carrera } from './types'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }))

const STORAGE_KEY = 'umsspira:academic-education'
const carreras: Carrera[] = [{ idCarrera: 'car-01', nombre: 'Ingeniería de Sistemas' }]
const record: AcademicEducation = {
  idFormacion: 'form-1', idEgresado: CURRENT_EGRESADO_ID,
  tipoFormacion: 'Carrera', idCarrera: 'car-01', titulo: 'Ingeniería de Sistemas',
  institucion: 'Universidad Mayor de San Simón', nivelAcademico: 'Licenciatura',
  estado: 'Titulado', anioInicio: 2020, anioFin: 2025,
}
const payload: AcademicEducationPayload = {
  idEgresado: CURRENT_EGRESADO_ID, tipoFormacion: 'Bachiller', idCarrera: null,
  titulo: 'Bachiller', institucion: 'Colegio San Simón', nivelAcademico: 'Técnico',
  estado: 'Cursando', anioInicio: 2024, anioFin: null,
}

const showModalDescriptor = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal')
const closeDescriptor = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close')

beforeAll(() => {
  // JSDOM no implementa el ciclo de apertura del dialog nativo.
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: { configurable: true, value(this: HTMLDialogElement) { this.setAttribute('open', '') } },
    close: { configurable: true, value(this: HTMLDialogElement) { this.removeAttribute('open') } },
  })
})

afterAll(() => {
  if (showModalDescriptor) Object.defineProperty(HTMLDialogElement.prototype, 'showModal', showModalDescriptor)
  else Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
  if (closeDescriptor) Object.defineProperty(HTMLDialogElement.prototype, 'close', closeDescriptor)
  else Reflect.deleteProperty(HTMLDialogElement.prototype, 'close')
})

beforeEach(() => {
  jest.restoreAllMocks()
  mockPush.mockClear()
  window.localStorage.clear()
})

function renderForm(onSubmit = jest.fn().mockResolvedValue(undefined)) {
  render(<AcademicEducationForm mode="edit" idEgresado={CURRENT_EGRESADO_ID} carreras={carreras} initialValues={toFormValues(record)} onSubmit={onSubmit} onCancel={jest.fn()} />)
  return onSubmit
}

describe('presentación de HU03', () => {
  it('muestra el emblema, Carlos Rojas y un solo encabezado/pie dentro del dashboard', () => {
    render(<DashboardLayout><AcademicEducationLayout><p>Contenido HU03</p></AcademicEducationLayout></DashboardLayout>)
    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getAllByRole('navigation', { name: 'Navegación principal' })).toHaveLength(1)
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
    expect(screen.getByRole('img', { name: 'Emblema de la UMSS' })).toHaveAttribute('src', '/hu03/umss-emblema.png')
    expect(screen.getByText('Carlos Rojas')).toBeInTheDocument()
    expect(screen.getByText('Egresado')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Perfil' })).toHaveAttribute('aria-current', 'page')
  })

  it('presenta contador, período, edición y aviso del listado', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([record]))
    render(<AcademicEducationList />)
    expect(await screen.findByText('1 registro activo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Editar Ingeniería de Sistemas' })).toHaveAttribute('href', '/perfil/formacion/form-1/editar')
    expect(screen.getByRole('link', { name: /Agregar formación/ })).toHaveAttribute('href', '/perfil/formacion/agregar')
    expect(screen.getByText('2020 – 2025')).toBeInTheDocument()
    expect(screen.getByText(/puede ser considerada en la compatibilidad/)).toBeInTheDocument()
  })

  it('conserva el listado vacío y contador cero', async () => {
    window.localStorage.setItem(STORAGE_KEY, '[]')
    render(<AcademicEducationList />)
    expect(await screen.findByText('Aún no registraste formación académica')).toBeInTheDocument()
    expect(screen.getByText('0 registros activos')).toBeInTheDocument()
  })

  it('muestra error de lectura sin presentar contador ni listado vacío', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'contenido inválido')
    render(<AcademicEducationList />)
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar tu formación académica.')
    expect(screen.queryByText(/registros activos/)).not.toBeInTheDocument()
    expect(screen.queryByText('Aún no registraste formación académica')).not.toBeInTheDocument()
  })
})

describe('interacción del formulario', () => {
  it('limpia la carrera al pasar a Bachiller y exige seleccionarla al volver', () => {
    renderForm()
    fireEvent.change(screen.getByLabelText(/Tipo de formación/), { target: { value: 'Bachiller' } })
    expect(screen.getByLabelText(/Carrera o programa/)).toBeDisabled()
    expect(screen.getByLabelText(/Carrera o programa/)).toHaveValue('Bachiller')
    fireEvent.change(screen.getByLabelText(/Tipo de formación/), { target: { value: 'Carrera' } })
    expect(screen.getByLabelText(/Carrera o programa/)).toBeEnabled()
    expect(screen.getByLabelText(/Carrera o programa/)).toHaveValue('')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(screen.getByLabelText(/Carrera o programa/)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/Carrera o programa/)).toHaveFocus()
  })

  it('guarda Bachiller con título automático e idCarrera null', async () => {
    const onSubmit = renderForm()
    fireEvent.change(screen.getByLabelText(/Tipo de formación/), { target: { value: 'Bachiller' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ titulo: 'Bachiller', idCarrera: null })))
  })

  it('limpia y deshabilita año final al cursar, y guarda null con estado Cursando', async () => {
    const onSubmit = renderForm()
    fireEvent.click(screen.getByLabelText('Actualmente cursando'))
    expect(screen.getByLabelText(/Año de finalización/)).toBeDisabled()
    expect(screen.getByLabelText(/Año de finalización/)).toHaveValue('')
    expect(screen.getByLabelText(/Estado/)).toHaveValue('Cursando')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ anioFin: null, estado: 'Cursando' })))
  })

  it('habilita año final al desmarcar o elegir un estado diferente', () => {
    renderForm()
    const checkbox = screen.getByLabelText('Actualmente cursando')
    fireEvent.click(checkbox)
    fireEvent.click(checkbox)
    expect(screen.getByLabelText(/Año de finalización/)).toBeEnabled()
    fireEvent.click(checkbox)
    fireEvent.change(screen.getByLabelText(/Estado/), { target: { value: 'Concluido' } })
    expect(checkbox).not.toBeChecked()
    expect(screen.getByLabelText(/Año de finalización/)).toBeEnabled()
  })

  it('impide guardar un año final anterior al inicio y asocia el error al campo', () => {
    const onSubmit = renderForm()
    const endYear = screen.getByLabelText(/Año de finalización/)
    fireEvent.change(endYear, { target: { value: '2019' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(endYear).toHaveFocus()
    expect(endYear).toHaveAttribute('aria-describedby', 'anioFin-error')
    expect(screen.getByRole('alert')).toHaveTextContent('no puede ser menor al año de inicio')
  })

  it('aplica los límites finales de institución y descripción', () => {
    renderForm()
    expect(screen.getByLabelText(/Institución educativa/)).toHaveAttribute('maxlength', '100')
    expect(screen.getByLabelText(/Descripción/)).toHaveAttribute('maxlength', '250')
  })

  it('muestra un fallo de guardado y permite reintentar', async () => {
    renderForm(jest.fn().mockRejectedValue(new Error('No se pudo guardar la formación.')))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo guardar la formación.')
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled()
  })
})

describe('rutas agregar y editar', () => {
  it('precarga un registro en curso, persiste la edición y vuelve al listado', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([{ ...record, estado: 'Cursando', anioFin: null }]))
    render(<AcademicEducationFormView mode="edit" idFormacion="form-1" />)
    const institution = await screen.findByLabelText(/Institución educativa/)
    expect(screen.getByLabelText('Actualmente cursando')).toBeChecked()
    expect(screen.getByLabelText(/Año de finalización/)).toBeDisabled()
    fireEvent.change(institution, { target: { value: ' UMSS actualizada ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/perfil/formacion'))
    expect(await listAcademicEducation(CURRENT_EGRESADO_ID)).toEqual([{ ...record, institucion: 'UMSS actualizada', estado: 'Cursando', anioFin: null }])
  })

  it('guarda desde agregar y retorna al listado', async () => {
    window.localStorage.setItem(STORAGE_KEY, '[]')
    render(<AcademicEducationFormView mode="create" />)
    fireEvent.change(await screen.findByLabelText(/Tipo de formación/), { target: { value: 'Bachiller' } })
    fireEvent.change(screen.getByLabelText(/Institución educativa/), { target: { value: 'Colegio San Simón' } })
    fireEvent.change(screen.getByLabelText(/Grado o nivel académico/), { target: { value: 'Técnico' } })
    fireEvent.change(screen.getByLabelText(/Estado/), { target: { value: 'Concluido' } })
    fireEvent.change(screen.getByLabelText(/Año de inicio/), { target: { value: '2020' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar formación' }))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/perfil/formacion'))
    expect(await listAcademicEducation(CURRENT_EGRESADO_ID)).toEqual([expect.objectContaining({ titulo: 'Bachiller', idCarrera: null, anioFin: null })])
  })

  it('cancelar vuelve al listado sin guardar cambios', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([record]))
    render(<AcademicEducationFormView mode="edit" idFormacion="form-1" />)
    fireEvent.change(await screen.findByLabelText(/Institución educativa/), { target: { value: 'Cambio descartado' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(mockPush).toHaveBeenCalledWith('/perfil/formacion')
    expect(await listAcademicEducation(CURRENT_EGRESADO_ID)).toEqual([record])
  })

  it('distingue un fallo de carga de un registro inexistente', async () => {
    window.localStorage.setItem(STORAGE_KEY, '{')
    render(<AcademicEducationFormView mode="edit" idFormacion="inexistente" />)
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los datos')
    expect(screen.queryByText('No encontramos esta formación académica.')).not.toBeInTheDocument()
  })

  it('muestra retorno al listado cuando el registro no existe', async () => {
    window.localStorage.setItem(STORAGE_KEY, '[]')
    render(<AcademicEducationFormView mode="edit" idFormacion="inexistente" />)
    expect(await screen.findByText('No encontramos esta formación académica.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a Mi formación académica' })).toHaveAttribute('href', '/perfil/formacion')
  })
})

describe('eliminación desde el listado', () => {
  it('no elimina al cancelar y actualiza el listado solo al confirmar', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([record]))
    render(<AcademicEducationList />)
    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Ingeniería de Sistemas' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await listAcademicEducation(CURRENT_EGRESADO_ID)).toEqual([record])
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Ingeniería de Sistemas' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }))
    expect(await screen.findByText('Aún no registraste formación académica')).toBeInTheDocument()
    expect(screen.getByText('0 registros activos')).toBeInTheDocument()
    expect(await listAcademicEducation(CURRENT_EGRESADO_ID)).toEqual([])
  })

  it('conserva el registro y permite reintentar cuando falla la escritura', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([record]))
    render(<AcademicEducationList />)
    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Ingeniería de Sistemas' }))
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Almacenamiento no disponible') })
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo eliminar la formación.')
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' })).toBeEnabled()
    expect(screen.getByRole('heading', { name: record.titulo })).toBeInTheDocument()
    expect(await listAcademicEducation(CURRENT_EGRESADO_ID)).toEqual([record])
  })

  it('bloquea confirmación/cierre durante la operación y evita envíos duplicados', async () => {
    let resolveDelete!: () => void
    const onConfirm = jest.fn(() => new Promise<void>((resolve) => { resolveDelete = resolve }))
    const onClose = jest.fn()
    render(<DeleteAcademicEducationModal record={record} onConfirm={onConfirm} onClose={onClose} />)
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }))
    expect(within(dialog).getByRole('button', { name: 'Eliminar' })).toBeDisabled()
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(within(dialog).getByRole('button', { name: 'Cerrar' })).toBeDisabled()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }))
    fireEvent(dialog, new Event('cancel', { bubbles: true, cancelable: true }))
    expect(onClose).not.toHaveBeenCalled()
    expect(onConfirm).toHaveBeenCalledTimes(1)
    await act(async () => { resolveDelete() })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it.each(['cancel', 'backdrop'])('cierra mediante %s sin eliminar', (action) => {
    const onConfirm = jest.fn()
    const onClose = jest.fn()
    render(<DeleteAcademicEducationModal record={record} onConfirm={onConfirm} onClose={onClose} />)
    const dialog = screen.getByRole('dialog')
    if (action === 'cancel') fireEvent(dialog, new Event('cancel', { bubbles: true, cancelable: true }))
    else fireEvent.click(dialog)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })
})

describe('persistencia local de HU03', () => {
  it('conserva altas, ediciones y eliminaciones al cargar nuevamente el módulo', async () => {
    window.localStorage.setItem(STORAGE_KEY, '[]')
    const created = await createAcademicEducation(payload)
    await updateAcademicEducation(created.idFormacion, { ...payload, institucion: 'Colegio actualizado' })
    let reloaded!: typeof import('./service')
    jest.isolateModules(() => { reloaded = require('./service') })
    expect(await reloaded.listAcademicEducation(CURRENT_EGRESADO_ID)).toEqual([{ ...created, institucion: 'Colegio actualizado' }])
    await reloaded.deleteAcademicEducation(created.idFormacion)
    expect(await listAcademicEducation(CURRENT_EGRESADO_ID)).toEqual([])
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('[]')
  })

  it('crea datos iniciales solo si no existe almacenamiento', async () => {
    expect(await listAcademicEducation(CURRENT_EGRESADO_ID)).toHaveLength(2)
    window.localStorage.setItem(STORAGE_KEY, '[]')
    expect(await listAcademicEducation(CURRENT_EGRESADO_ID)).toEqual([])
  })

  it.each(['{', '{}', '[null]', '[{}]'])('informa datos corruptos sin sobrescribirlos: %s', async (stored) => {
    window.localStorage.setItem(STORAGE_KEY, stored)
    await expect(listAcademicEducation(CURRENT_EGRESADO_ID)).rejects.toThrow('No se pudo leer la formación académica guardada.')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(stored)
  })

  it('informa fallo de lectura del almacenamiento', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Acceso denegado') })
    await expect(listAcademicEducation(CURRENT_EGRESADO_ID)).rejects.toThrow('No se pudo leer la formación académica guardada.')
  })

  it('informa fallo de escritura sin perder los registros previos', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([record]))
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Cuota excedida') })
    await expect(createAcademicEducation(payload)).rejects.toThrow('No se pudo guardar la formación académica.')
    await expect(updateAcademicEducation(record.idFormacion, payload)).rejects.toThrow('No se pudo guardar la formación académica.')
    await expect(deleteAcademicEducation(record.idFormacion)).rejects.toThrow('No se pudo guardar la formación académica.')
    expect(await listAcademicEducation(CURRENT_EGRESADO_ID)).toEqual([record])
  })

  it('impide editar un registro inexistente y filtra por egresado', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([record, { ...record, idFormacion: 'otra-formacion', idEgresado: 'otro-egresado' }]))
    await expect(updateAcademicEducation('inexistente', payload)).rejects.toThrow('La formación académica no existe.')
    expect(await listAcademicEducation(CURRENT_EGRESADO_ID)).toEqual([record])
  })
})
