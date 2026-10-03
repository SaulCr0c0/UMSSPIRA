import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormacionAcademicaForm } from './formacion-academica';

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
