import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApiError } from '@/shared/services/api-client';
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
    // La interfaz indica el formato y el tamaño permitidos (BUG-HU2-007)
    expect(screen.getByText('Solo JPG, máximo 5 MB')).toBeInTheDocument();
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

describe('FormularioCertificaciones · respaldo solo JPG de hasta 5 MB (BUG-HU2-004)', () => {
  const MB = 1024 * 1024;

  // File con el tamaño indicado sin reservar esa memoria: size se sobrescribe
  function archivo(nombre: string, tipo: string, tamanio = 1024): File {
    const file = new File(['contenido'], nombre, { type: tipo });
    Object.defineProperty(file, 'size', { value: tamanio });
    return file;
  }

  function adjuntar(file: File) {
    fireEvent.change(screen.getByLabelText('Subir documento', { selector: 'input' }), { target: { files: [file] } });
  }

  it('rechaza un PDF de 6 MB por formato y no lo adjunta (caso de QA)', () => {
    const onAgregar = jest.fn();
    render(<FormularioCertificaciones certificaciones={[]} onAgregar={onAgregar} />);
    llenarFormulario();

    adjuntar(archivo('certificado.pdf', 'application/pdf', 6 * MB));

    expect(screen.getByText('Formato no permitido. Solo JPG')).toHaveAttribute('id', 'error-respaldo');
    expect(screen.queryByText('certificado.pdf')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /agregar certificación/i }));
    expect(onAgregar.mock.calls[0][0].respaldo).toBeNull();
  });

  it('rechaza un JPG de más de 5 MB', () => {
    render(<FormularioCertificaciones certificaciones={[]} onAgregar={jest.fn()} />);

    adjuntar(archivo('certificado.jpg', 'image/jpeg', 6 * MB));

    expect(screen.getByText('El archivo no puede superar 5 MB')).toBeInTheDocument();
    expect(screen.queryByText('certificado.jpg')).not.toBeInTheDocument();
  });

  it('quita el error al adjuntar después un JPG válido', () => {
    render(<FormularioCertificaciones certificaciones={[]} onAgregar={jest.fn()} />);
    adjuntar(archivo('certificado.png', 'image/png'));

    adjuntar(archivo('certificado.jpg', 'image/jpeg', 5 * MB));

    expect(screen.queryByText('Formato no permitido. Solo JPG')).not.toBeInTheDocument();
    expect(screen.getByText('certificado.jpg')).toBeInTheDocument();
  });

  it('limpia el error al agregar la certificación', async () => {
    render(<FormularioCertificaciones certificaciones={[]} onAgregar={jest.fn()} />);
    llenarFormulario();
    adjuntar(archivo('certificado.pdf', 'application/pdf'));

    fireEvent.click(screen.getByRole('button', { name: /agregar certificación/i }));

    await waitFor(() =>
      expect(screen.queryByText('Formato no permitido. Solo JPG')).not.toBeInTheDocument(),
    );
  });
});

describe('FormularioCertificaciones · miniatura y quitar respaldo (T8.2)', () => {
  const crearUrl = jest.fn(() => 'blob:vista-previa');
  const revocarUrl = jest.fn();

  beforeEach(() => {
    crearUrl.mockClear();
    revocarUrl.mockClear();
    // jsdom no trae estas funciones del navegador
    Object.assign(URL, { createObjectURL: crearUrl, revokeObjectURL: revocarUrl });
  });

  function jpg(nombre = 'certificado.jpg', tamanio = 1536): File {
    const file = new File(['contenido'], nombre, { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: tamanio });
    return file;
  }

  function adjuntar(file: File) {
    fireEvent.change(screen.getByLabelText('Subir foto', { selector: 'input' }), { target: { files: [file] } });
  }

  it('muestra la miniatura, el nombre y el tamaño del respaldo', () => {
    render(<FormularioCertificaciones certificaciones={[]} onAgregar={jest.fn()} />);

    adjuntar(jpg());

    expect(screen.getByAltText('Vista previa del respaldo')).toHaveAttribute('src', 'blob:vista-previa');
    expect(screen.getByText('certificado.jpg')).toBeInTheDocument();
    expect(screen.getByText('1,5 KB')).toBeInTheDocument();
  });

  it('«Quitar» borra la vista previa y libera la memoria, las veces que sea', () => {
    render(<FormularioCertificaciones certificaciones={[]} onAgregar={jest.fn()} />);

    for (let i = 0; i < 3; i++) {
      adjuntar(jpg());
      fireEvent.click(screen.getByRole('button', { name: 'Quitar' }));
      expect(screen.queryByAltText('Vista previa del respaldo')).not.toBeInTheDocument();
      expect(screen.queryByText('certificado.jpg')).not.toBeInTheDocument();
    }
    expect(revocarUrl).toHaveBeenCalledTimes(3);
  });

  it('un archivo rechazado no muestra miniatura', () => {
    render(<FormularioCertificaciones certificaciones={[]} onAgregar={jest.fn()} />);

    adjuntar(new File(['x'], 'certificado.png', { type: 'image/png' }));

    expect(screen.queryByAltText('Vista previa del respaldo')).not.toBeInTheDocument();
    expect(screen.getByText('Formato no permitido. Solo JPG')).toBeInTheDocument();
  });
});

describe('FormularioCertificaciones · guardado (T8.4)', () => {
  function jpg(): File {
    return new File(['contenido'], 'certificado.jpg', { type: 'image/jpeg' });
  }

  it('muestra Guardando… con el avance y limpia el formulario al terminar', async () => {
    let terminar!: () => void;
    const onAgregar = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          terminar = resolve;
        }),
    );
    render(<FormularioCertificaciones certificaciones={[]} onAgregar={onAgregar} progreso={40} />);
    llenarFormulario();

    fireEvent.click(screen.getByRole('button', { name: /agregar certificación/i }));

    expect(await screen.findByRole('button', { name: /guardando/i })).toBeDisabled();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');

    terminar();
    await waitFor(() => expect(screen.getByLabelText('Nombre de certificación')).toHaveValue(''));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('si falla con ApiError muestra el mensaje y conserva lo escrito y la foto', async () => {
    const onAgregar = jest.fn().mockRejectedValue(new ApiError(0, 'No fue posible conectar con el servidor'));
    render(<FormularioCertificaciones certificaciones={[]} onAgregar={onAgregar} />);
    llenarFormulario();
    fireEvent.change(screen.getByLabelText('Subir foto', { selector: 'input' }), { target: { files: [jpg()] } });

    fireEvent.click(screen.getByRole('button', { name: /agregar certificación/i }));

    expect(
      await screen.findByText('No se pudo guardar la certificación. No fue posible conectar con el servidor'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre de certificación')).toHaveValue('AWS Cloud Practitioner');
    expect(screen.getByText('certificado.jpg')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /agregar certificación/i })).toBeEnabled();
  });
});

describe('FormularioCertificaciones · reintentar (T8.6)', () => {
  it('«Reintentar» reenvía lo mismo, conserva la foto y limpia al lograrlo', async () => {
    const onAgregar = jest
      .fn()
      .mockRejectedValueOnce(new ApiError(0, 'No fue posible conectar con el servidor'))
      .mockResolvedValueOnce(undefined);
    render(<FormularioCertificaciones certificaciones={[]} onAgregar={onAgregar} />);
    llenarFormulario();
    const foto = new File(['contenido'], 'certificado.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('Subir foto', { selector: 'input' }), { target: { files: [foto] } });
    fireEvent.click(screen.getByRole('button', { name: /agregar certificación/i }));

    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }));

    await waitFor(() => expect(onAgregar).toHaveBeenCalledTimes(2));
    expect(onAgregar.mock.calls[1][0]).toMatchObject({ nombre: 'AWS Cloud Practitioner', respaldo: foto });
    await waitFor(() => expect(screen.getByLabelText('Nombre de certificación')).toHaveValue(''));
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
    expect(screen.queryByText(/No se pudo guardar/)).not.toBeInTheDocument();
  });

  it('no muestra «Reintentar» si no hubo error', () => {
    render(<FormularioCertificaciones certificaciones={[]} onAgregar={jest.fn()} />);
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });
});
