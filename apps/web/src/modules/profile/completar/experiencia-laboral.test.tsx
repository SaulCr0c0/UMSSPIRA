import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormularioExperiencia } from './experiencia-laboral';

describe('FormularioExperiencia · validaciones', () => {
  it('muestra los errores de los campos obligatorios', () => {
    const onAgregar = jest.fn();
    render(<FormularioExperiencia experiencias={[]} onAgregar={onAgregar} />);

    fireEvent.click(screen.getByRole('button', { name: 'Agregar experiencia' }));

    expect(screen.getByText('La empresa es obligatoria.')).toBeInTheDocument();
    expect(screen.getByText('El cargo es obligatorio.')).toBeInTheDocument();
    expect(onAgregar).not.toHaveBeenCalled();
  });

  it('rechaza una fecha fin anterior a la fecha inicio', () => {
    const { container } = render(<FormularioExperiencia experiencias={[]} onAgregar={jest.fn()} />);
    const [inicio, fin] = Array.from(container.querySelectorAll('input[type="date"]'));
    fireEvent.change(screen.getByPlaceholderText('Ej. Jalasoft'), { target: { value: 'Jalasoft' } });
    fireEvent.change(screen.getByPlaceholderText('Ej. Desarrollador Frontend'), { target: { value: 'Dev' } });
    fireEvent.change(inicio, { target: { value: '2023-08-01' } });
    fireEvent.change(fin, { target: { value: '2022-03-01' } });

    fireEvent.click(screen.getByRole('button', { name: 'Agregar experiencia' }));

    expect(screen.getByText("La fecha 'Hasta' no puede ser anterior a 'Desde'")).toBeInTheDocument();
  });

  it('agrega como trabajo actual, sin fecha fin, al marcar "Actualmente trabajo aquí"', async () => {
    const onAgregar = jest.fn().mockResolvedValue(undefined);
    const { container } = render(<FormularioExperiencia experiencias={[]} onAgregar={onAgregar} />);
    const [inicio, fin] = Array.from(container.querySelectorAll('input[type="date"]'));
    fireEvent.change(screen.getByPlaceholderText('Ej. Jalasoft'), { target: { value: 'Jalasoft' } });
    fireEvent.change(screen.getByPlaceholderText('Ej. Desarrollador Frontend'), { target: { value: 'Dev' } });
    fireEvent.change(inicio, { target: { value: '2023-08-01' } });
    // La fecha fin escrita antes de marcar la casilla no debe guardarse
    fireEvent.change(fin, { target: { value: '2024-01-01' } });

    fireEvent.click(screen.getByLabelText('Actualmente trabajo aquí'));
    fireEvent.click(screen.getByRole('button', { name: 'Agregar experiencia' }));

    expect(onAgregar).toHaveBeenCalledTimes(1);
    expect(onAgregar.mock.calls[0][0]).toEqual({ empresa: 'Jalasoft', cargo: 'Dev', fechaInicio: '2023-08-01' });
    expect(onAgregar.mock.calls[0][0]).not.toHaveProperty('fechaFin');
    await waitFor(() => expect(screen.getByPlaceholderText('Ej. Jalasoft')).toHaveValue(''));
  });
});
