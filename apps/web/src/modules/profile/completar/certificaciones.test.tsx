import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormularioCertificaciones } from './certificaciones';

function llenarFormulario() {
  fireEvent.change(screen.getByLabelText('Nombre de certificación'), { target: { value: 'AWS Cloud Practitioner' } });
  fireEvent.change(screen.getByLabelText('Entidad emisora'), { target: { value: 'Amazon Web Services' } });
  fireEvent.change(screen.getByLabelText('Año'), { target: { value: '2023' } });
  fireEvent.change(screen.getByLabelText('Grado'), { target: { value: 'Profesional' } });
}

describe('FormularioCertificaciones', () => {
  it('muestra los 4 campos obligatorios', () => {
    render(<FormularioCertificaciones certificaciones={[]} onAgregar={jest.fn()} />);

    for (const etiqueta of ['Nombre de certificación', 'Entidad emisora', 'Año', 'Grado']) {
      expect(screen.getByLabelText(etiqueta)).toBeRequired();
    }
  });

  it('permite subir una foto o un documento como respaldo', () => {
    render(<FormularioCertificaciones certificaciones={[]} onAgregar={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Subir foto' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Subir documento' })).toBeInTheDocument();
    expect(screen.getByLabelText('Subir foto', { selector: 'input' })).toHaveAttribute('accept', 'image/jpeg');
    expect(screen.getByLabelText('Subir documento', { selector: 'input' })).toHaveAttribute('accept', 'image/jpeg');
  });

  it('envia la certificacion con su respaldo', () => {
    const onAgregar = jest.fn();
    render(<FormularioCertificaciones certificaciones={[]} onAgregar={onAgregar} />);
    llenarFormulario();
    const archivo = new File(['contenido'], 'certificado.jpg', { type: 'image/jpeg' });

    fireEvent.change(screen.getByLabelText('Subir documento', { selector: 'input' }), { target: { files: [archivo] } });
    expect(screen.getByText('certificado.jpg')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /agregar certificación/i }));

    expect(onAgregar).toHaveBeenCalledWith({
      nombre: 'AWS Cloud Practitioner',
      entidadEmisora: 'Amazon Web Services',
      anioEmision: '2023',
      grado: 'Profesional',
      respaldo: archivo,
    });
  });
});
