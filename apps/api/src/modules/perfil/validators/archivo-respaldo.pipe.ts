import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

export const TAMANIO_MAXIMO_BYTES = 5 * 1024 * 1024; 

// Los primeros bytes de cada formato (así no basta con cambiar la extensión)
const FIRMAS: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
};

const EXTENSIONES = ['.jpg', '.jpeg', '.png', '.pdf'];

// Valida el archivo de respaldo de una certificación (opcional: sin archivo = "Sin respaldo")
@Injectable()
export class ArchivoRespaldoPipe implements PipeTransform {
  transform(archivo?: Express.Multer.File) {
    if (!archivo) return archivo;

    const firma = FIRMAS[archivo.mimetype];
    const extensionValida = EXTENSIONES.some((ext) =>
      archivo.originalname.toLowerCase().endsWith(ext),
    );
    const contenidoValido =
      !!firma && !!archivo.buffer && firma.every((byte, i) => archivo.buffer[i] === byte);

    if (!firma || !extensionValida || !contenidoValido) {
      throw new BadRequestException('Formato no permitido. Solo JPG, PNG o PDF');
    }
    if (archivo.size > TAMANIO_MAXIMO_BYTES) {
      throw new BadRequestException('El archivo no puede superar 5 MB');
    }
    return archivo;
  }
}