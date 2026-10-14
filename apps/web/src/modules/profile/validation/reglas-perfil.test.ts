import {
  MENSAJE_ANIO_EGRESO_FUTURO,
  MENSAJE_HASTA_ANTERIOR_A_DESDE,
  MENSAJE_RESPALDO_FORMATO,
  MENSAJE_RESPALDO_TAMANIO,
  TAMANIO_MAXIMO_RESPALDO,
  validarAnioEgreso,
  validarRangoFechas,
  validarRespaldo,
} from './reglas-perfil';

const anioActual = new Date().getFullYear();

// File con el tamaño indicado sin reservar esa memoria: size se sobrescribe
function archivo(nombre: string, tipo: string, tamanio = 1024): File {
  const file = new File(['contenido'], nombre, { type: tipo });
  Object.defineProperty(file, 'size', { value: tamanio });
  return file;
}

describe('validarAnioEgreso', () => {
  it('usa el texto del criterio', () => {
    expect(MENSAJE_ANIO_EGRESO_FUTURO).toBe('El año de egreso no puede ser posterior al año actual');
  });

  it('rechaza un año posterior al actual', () => {
    expect(validarAnioEgreso(String(anioActual + 1))).toBe(MENSAJE_ANIO_EGRESO_FUTURO);
  });

  it('acepta el año actual y años anteriores', () => {
    expect(validarAnioEgreso(String(anioActual))).toBeUndefined();
    expect(validarAnioEgreso('2018')).toBeUndefined();
  });

  it('no evalúa valores vacíos o sin 4 dígitos', () => {
    expect(validarAnioEgreso('')).toBeUndefined();
    expect(validarAnioEgreso('99999')).toBeUndefined();
  });
});

describe('validarRangoFechas', () => {
  it('usa el texto del criterio', () => {
    expect(MENSAJE_HASTA_ANTERIOR_A_DESDE).toBe("La fecha 'Hasta' no puede ser anterior a 'Desde'");
  });

  it('rechaza una fecha Hasta anterior a Desde (caso de QA)', () => {
    expect(validarRangoFechas('2023-08-01', '2022-03-01')).toBe(MENSAJE_HASTA_ANTERIOR_A_DESDE);
  });

  it('acepta una fecha Hasta igual o posterior a Desde', () => {
    expect(validarRangoFechas('2023-08-01', '2023-08-01')).toBeUndefined();
    expect(validarRangoFechas('2023-08-01', '2024-01-31')).toBeUndefined();
  });

  it('no valida el rango si falta alguna fecha (trabajo actual)', () => {
    expect(validarRangoFechas('2023-08-01', '')).toBeUndefined();
    expect(validarRangoFechas('', '2022-03-01')).toBeUndefined();
  });
});

describe('validarRespaldo', () => {
  it('usa los textos del criterio', () => {
    expect(MENSAJE_RESPALDO_FORMATO).toBe('Formato no permitido. Solo JPG');
    expect(MENSAJE_RESPALDO_TAMANIO).toBe('El archivo no puede superar 5 MB');
  });

  it('acepta un JPG de hasta 5 MB', () => {
    expect(validarRespaldo(archivo('certificado.jpg', 'image/jpeg'))).toBeUndefined();
    expect(validarRespaldo(archivo('certificado.JPEG', 'image/jpeg', TAMANIO_MAXIMO_RESPALDO))).toBeUndefined();
  });

  it('rechaza PDF y PNG por formato, aunque superen 5 MB (caso de QA)', () => {
    expect(validarRespaldo(archivo('certificado.pdf', 'application/pdf', 6 * 1024 * 1024))).toBe(MENSAJE_RESPALDO_FORMATO);
    expect(validarRespaldo(archivo('certificado.png', 'image/png'))).toBe(MENSAJE_RESPALDO_FORMATO);
  });

  it('rechaza un archivo con extensión cambiada', () => {
    expect(validarRespaldo(archivo('certificado.jpg', 'application/pdf'))).toBe(MENSAJE_RESPALDO_FORMATO);
    expect(validarRespaldo(archivo('certificado.pdf', 'image/jpeg'))).toBe(MENSAJE_RESPALDO_FORMATO);
  });

  it('rechaza un JPG de más de 5 MB', () => {
    expect(validarRespaldo(archivo('certificado.jpg', 'image/jpeg', 6 * 1024 * 1024))).toBe(MENSAJE_RESPALDO_TAMANIO);
  });
});
