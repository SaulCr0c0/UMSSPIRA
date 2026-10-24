import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { FormularioDescripcion, MAX_DESCRIPCION } from './descripcion-profesional';

describe('FormularioDescripcion (T6.2)', () => {
  it('precarga la descripción guardada y muestra el contador', () => {
    render(<FormularioDescripcion descripcion="Desarrolladora backend" onGuardar={jest.fn()} />);

    expect(screen.getByLabelText('Descripción profesional')).toHaveValue('Desarrolladora backend');
    expect(screen.getByText('22/5000 caracteres')).toBeInTheDocument();
  });

  it('actualiza el contador al escribir y no deja pasar de 5000 caracteres', () => {
    render(<FormularioDescripcion descripcion="" onGuardar={jest.fn()} />);
    const cuadro = screen.getByLabelText('Descripción profesional');

    fireEvent.change(cuadro, { target: { value: 'Hola' } });
    expect(screen.getByText('4/5000 caracteres')).toBeInTheDocument();
    expect(cuadro).toHaveAttribute('maxLength', String(MAX_DESCRIPCION));
  });

  it('Guardar envía el texto sin espacios al inicio ni al final', () => {
    const onGuardar = jest.fn();
    render(<FormularioDescripcion descripcion="" onGuardar={onGuardar} />);

    fireEvent.change(screen.getByLabelText('Descripción profesional'), {
      target: { value: '  Analista de datos  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onGuardar).toHaveBeenCalledWith('Analista de datos');
  });
});
