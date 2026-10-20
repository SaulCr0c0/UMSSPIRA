import type { Prisma, PrismaClient } from '../../src/generated/prisma/client';

// Backoffice documental: añadir datos con UUID fijos y referencias a registros ya cargados.
export const tiposArchivo: Array<Prisma.TipoArchivoCreateManyInput & { id: string }> = [];
export const detalles: Array<Prisma.DetalleSolicitudCreateManyInput & { id: string }> = [];
export const documentos: Array<Prisma.DocumentoRespaldoCreateManyInput & { id: string }> = [];
export const solicitudes: Array<Prisma.SolicitudCreateManyInput & { id: string }> = [];

export async function seedEpic1(prisma: PrismaClient): Promise<void> {
  if (tiposArchivo.length > 0) {
    await prisma.tipoArchivo.createMany({ data: tiposArchivo, skipDuplicates: true });
  }
  if (detalles.length > 0) {
    await prisma.detalleSolicitud.createMany({ data: detalles, skipDuplicates: true });
  }
  if (documentos.length > 0) {
    await prisma.documentoRespaldo.createMany({ data: documentos, skipDuplicates: true });
  }
  if (solicitudes.length > 0) {
    await prisma.solicitud.createMany({ data: solicitudes, skipDuplicates: true });
  }
}
