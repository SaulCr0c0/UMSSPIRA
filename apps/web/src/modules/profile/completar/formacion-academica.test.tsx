import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormacionAcademicaForm } from './formacion-academica';

const anioActual = new Date().getFullYear();

function llenarFormulario() {
  fireEvent.change(screen.getByLabelText('Institución'), { target: { value: '  UMSS  ' } });
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Ingeniería de Sistemas' } });
  fireEvent.change(screen.getByLabelText('Año de egreso'), { target: { value: '20a22' } });
  fireEvent.change(screen.getByLabelText('Grado'), { target: { value: 'Licenciatura' } });
}

describe('FormacionAcademicaForm', () => {
  it('muestra los 4 campos obligatorios', () => {
    render(<FormacionAcademicaForm formaciones={[]} onAgregar={jest.fn()} />);

    for (const etiqueta of ['Institución', 'Título', 'Año de egreso', 'Grado']) {
      expect(screen.getByLabelText(etiqueta)).toBeRequired();
    }
  });

  it('acepta solo numeros en el año de egreso', () => {
    render(<FormacionAcademicaForm formaciones={[]} onAgregar={jest.fn()} />);
    llenarFormulario();

    expect(screen.getByLabelText('Año de egreso')).toHaveValue('2022');
  });

  it('envia el registro y limpia el formulario', () => {
    const onAgregar = jest.fn();
    render(<FormacionAcademicaForm formaciones={[]} onAgregar={onAgregar} />);
    llenarFormulario();

    fireEvent.click(screen.getByRole('button', { name: /agregar formación/i }));

    expect(onAgregar).toHaveBeenCalledWith({
      institucion: 'UMSS',
      titulo: 'Ingeniería de Sistemas',
      anioEgreso: '2022',
      grado: 'Licenciatura',
    });
    expect(screen.getByLabelText('Institución')).toHaveValue('');
  });

  it('lista las formaciones registradas', () => {
    render(
      <FormacionAcademicaForm
        formaciones={[{ institucion: 'UMSS', titulo: 'Ingeniería de Sistemas', anioEgreso: '2022', grado: 'Licenciatura' }]}
        onAgregar={jest.fn()}
      />,
    );

    expect(screen.getByText('Formación registrada')).toBeInTheDocument();
    expect(screen.getByText('Ingeniería de Sistemas')).toBeInTheDocument();
  });
});

describe('FormacionAcademicaForm · año de egreso (BUG-HU2-001)', () => {
  it('muestra el error junto al campo y no agrega una formación con año posterior al actual', () => {
    const onAgregar = jest.fn();
    render(<FormacionAcademicaForm formaciones={[]} onAgregar={onAgregar} />);
    llenarFormulario();
    fireEvent.change(screen.getByLabelText('Año de egreso'), { target: { value: String(anioActual + 1) } });

    fireEvent.click(screen.getByRole('button', { name: /agregar formación/i }));

    const mensaje = screen.getByText('El año de egreso no puede ser posterior al año actual');
    expect(mensaje).toHaveAttribute('id', 'error-anioEgreso');
    expect(screen.getByLabelText('Año de egreso')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Año de egreso')).toHaveValue(String(anioActual + 1));
    expect(onAgregar).not.toHaveBeenCalled();
  });

  it('acepta el año actual', () => {
    const onAgregar = jest.fn();
    render(<FormacionAcademicaForm formaciones={[]} onAgregar={onAgregar} />);
    llenarFormulario();
    fireEvent.change(screen.getByLabelText('Año de egreso'), { target: { value: String(anioActual) } });

    fireEvent.click(screen.getByRole('button', { name: /agregar formación/i }));

    expect(onAgregar).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('quita el error al corregir el año', () => {
    render(<FormacionAcademicaForm formaciones={[]} onAgregar={jest.fn()} />);
    llenarFormulario();
    fireEvent.change(screen.getByLabelText('Año de egreso'), { target: { value: String(anioActual + 1) } });
    fireEvent.click(screen.getByRole('button', { name: /agregar formación/i }));

    fireEvent.change(screen.getByLabelText('Año de egreso'), { target: { value: '2018' } });

    expect(screen.queryByText('El año de egreso no puede ser posterior al año actual')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Año de egreso')).toHaveAttribute('aria-invalid', 'false');
  });
});
