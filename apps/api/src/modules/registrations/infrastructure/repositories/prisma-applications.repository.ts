import { Injectable } from '@nestjs/common';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import type { Prisma } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { BusinessRuleError } from '../../../../shared/errors/business-rule-error';
import type { ActorContext } from '../../../../shared/security/contexts/actor-context';
import type { ApplicationsRepository } from '../../application/ports/applications-repository.port';
import type {
  ApplicationQuery,
  ReviewInput,
} from '../../application/contracts/registration-inputs';
import type { ApplicationMetrics } from '../../domain/entities/application';
import { toApplication } from '../translators/application.translator';
import { applicationInclude, toRegistrationFile } from '../translators/registration.translator';

export function scopedApplication(actor: ActorContext, id?: string): Prisma.SolicitudWhereInput {
  return {
    ...(id ? { id } : {}),
    detalle_solicitud: { is: { id_carrera: { in: actor.scopes.careerIds } } },
  };
}

function boliviaDayRange(now: Date): { start: Date; end: Date } {
  const dateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((part) => part.type === type)?.value ?? '';
  const day = `${value('year')}-${value('month')}-${value('day')}`;
  const start = new Date(`${day}T00:00:00-04:00`);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

function boliviaDateStart(date: string): Date {
  return new Date(`${date}T00:00:00-04:00`);
}

@Injectable()
export class PrismaApplicationsRepository implements ApplicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async renewActivation(
    actor: ActorContext,
    id: string,
    hash: string,
    encryptedMail: string,
  ): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM solicitud WHERE id = ${id}::uuid FOR UPDATE`;
        const row = await tx.solicitud.findFirst({ where: scopedApplication(actor, id) });
        if (!row) {
          throw new BusinessRuleError(
            'missing',
            'APPLICATION_NOT_FOUND',
            'La solicitud no existe o no está a tu cargo',
          );
        }
        if (row.estado !== 'APPROVED' || row.activada_en) {
          throw new BusinessRuleError(
            'conflict',
            'ACTIVATION_NOT_ALLOWED',
            'Solo se reenvía la activación de una solicitud aprobada sin cuenta activa',
          );
        }
        await tx.solicitud.update({
          where: { id },
          data: {
            activacion_hash: hash,
            activacion_expira_en: new Date(Date.now() + 86400000),
            activacion_intentos: 0,
          },
        });
        await tx.correoPendiente.create({
          data: { contenido: encryptedMail, expira_en: new Date(Date.now() + 86400000) },
        });
      },
      { timeout: 15000 },
    );
  }

  async list(actor: ActorContext, query: ApplicationQuery) {
    const detailFilters: Prisma.DetalleSolicitudWhereInput[] = [];
    if (query.career) {
      detailFilters.push({
        carrera: { is: { nombre: { contains: query.career, mode: 'insensitive' } } },
      });
    }
    if (query.search) {
      const search = query.search;
      detailFilters.push({
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { apellido: { contains: search, mode: 'insensitive' } },
          { ci: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
          ...(/^\d{6,9}$/.test(search) ? [{ cod_sis: search }] : []),
        ],
      });
    }
    const overdue: Prisma.SolicitudWhereInput = {
      estado: 'PENDING',
      fecha_creacion: { lt: new Date(Date.now() - 48 * 3600000) },
    };
    const where: Prisma.SolicitudWhereInput = {
      AND: [
        scopedApplication(actor),
        ...(query.status ? [{ estado: query.status }] : []),
        ...(detailFilters.length ? [{ detalle_solicitud: { is: { AND: detailFilters } } }] : []),
        ...((query.fromDate || query.toDate)
          ? [{
              fecha_creacion: {
                ...(query.fromDate ? { gte: boliviaDateStart(query.fromDate) } : {}),
                ...(query.toDate
                  ? { lt: new Date(boliviaDateStart(query.toDate).getTime() + 24 * 60 * 60 * 1000) }
                  : {}),
              },
            }]
          : []),
        ...(query.age === 'over48'
          ? [overdue]
          : query.age === 'within48'
            ? [{ NOT: overdue }]
            : []),
      ],
    };
    // Primero pendientes antiguos; luego expedientes dictaminados recientes.
    const [total, pending] = await this.prisma.$transaction([
      this.prisma.solicitud.count({ where }),
      this.prisma.solicitud.count({ where: { AND: [where, { estado: 'PENDING' }] } }),
    ]);
    const offset = (query.page - 1) * query.pageSize;
    const pendingRows =
      offset < pending
        ? await this.prisma.solicitud.findMany({
            where: { AND: [where, { estado: 'PENDING' }] },
            include: applicationInclude,
            orderBy: [{ fecha_creacion: 'asc' }, { id: 'asc' }],
            skip: offset,
            take: query.pageSize,
          })
        : [];
    const remaining = query.pageSize - pendingRows.length;
    const otherRows =
      remaining > 0
        ? await this.prisma.solicitud.findMany({
            where: { AND: [where, { estado: { not: 'PENDING' } }] },
            include: applicationInclude,
            orderBy: [{ fecha_creacion: 'desc' }, { id: 'asc' }],
            skip: Math.max(0, offset - pending),
            take: remaining,
          })
        : [];
    return {
      items: [...pendingRows, ...otherRows].map(toApplication),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async metrics(actor: ActorContext): Promise<ApplicationMetrics> {
    const now = new Date();
    const { start, end } = boliviaDayRange(now);
    const scope = scopedApplication(actor);
    const [receivedToday, pending, urgent, resolvedToday] = await this.prisma.$transaction([
      this.prisma.solicitud.count({
        where: { AND: [scope, { fecha_creacion: { gte: start, lt: end } }] },
      }),
      this.prisma.solicitud.count({ where: { AND: [scope, { estado: 'PENDING' }] } }),
      this.prisma.solicitud.count({
        where: {
          AND: [
            scope,
            { estado: 'PENDING' },
            { fecha_creacion: { lt: new Date(now.getTime() - 48 * 60 * 60 * 1000) } },
          ],
        },
      }),
      this.prisma.solicitud.count({
        where: { AND: [scope, { fecha_resolucion: { gte: start, lt: end } }] },
      }),
    ]);
    return { receivedToday, pending, urgent, resolvedToday };
  }

  async find(actor: ActorContext, id: string) {
    const row = await this.prisma.solicitud.findFirst({
      where: scopedApplication(actor, id),
      include: applicationInclude,
    });
    if (!row) {
      throw new BusinessRuleError(
        'missing',
        'APPLICATION_NOT_FOUND',
        'La solicitud no existe o no está a tu cargo',
      );
    }
    return toApplication(row);
  }

  async document(actor: ActorContext, id: string) {
    const row = await this.prisma.archivoRegistro.findFirst({
      where: { borrador: { solicitud: { is: scopedApplication(actor, id) } } },
    });
    if (!row) {
      throw new BusinessRuleError('missing', 'DOCUMENT_NOT_FOUND', 'No se encontró el respaldo');
    }
    return toRegistrationFile(row);
  }

  async review(
    actor: ActorContext,
    id: string,
    input: ReviewInput,
    activationHash: string | null,
    encryptedMail: string,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM solicitud WHERE id = ${id}::uuid FOR UPDATE`;
        const row = await tx.solicitud.findFirst({
          where: scopedApplication(actor, id),
          select: { estado: true, id_documento_respaldo: true },
        });
        if (!row) {
          throw new BusinessRuleError(
            'missing',
            'APPLICATION_NOT_FOUND',
            'La solicitud no existe o no está a tu cargo',
          );
        }
        if (row.estado !== 'PENDING') {
          throw new BusinessRuleError(
            'conflict',
            'APPLICATION_ALREADY_REVIEWED',
            'La solicitud ya fue dictaminada',
          );
        }
        const approved = input.decision === 'APPROVED';
        const now = new Date();
        const category = approved ? null : input.category!;
        const note = approved ? null : input.note!;
        const review = await tx.dictamen.create({
          data: {
            id_solicitud: id,
            revisor_id: actor.id,
            decision: input.decision,
            categoria: category,
            justificacion: note,
            fecha_creacion: now,
            subsanada: false,
          },
        });
        await tx.solicitud.update({
          where: { id },
          data: {
            estado: input.decision,
            fecha_resolucion: now,
            activacion_hash: activationHash,
            activacion_expira_en: approved ? new Date(Date.now() + 86400000) : null,
          },
        });
        if (row.id_documento_respaldo) {
          await tx.documentoRespaldo.update({
            where: { id: row.id_documento_respaldo },
            data: { es_valido: approved },
          });
        }
        await tx.correoPendiente.create({
          data: { contenido: encryptedMail, expira_en: new Date(Date.now() + 86400000) },
        });
        return {
          id: review.id,
          applicationId: id,
          decision: input.decision,
          status: input.decision,
          category,
          note,
          reviewedBy: actor.id,
          reviewedAt: now.toISOString(),
          notificationStatus: 'QUEUED' as const,
        };
      },
      { timeout: 15000 },
    );
  }

  async activate(id: string, codeHash: string, passwordHash: string): Promise<string> {
    return this.prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM solicitud WHERE id = ${id}::uuid FOR UPDATE`;
        const row = await tx.solicitud.findUnique({
          where: { id },
          include: { detalle_solicitud: true },
        });
        if (!row || row.estado !== 'APPROVED' || row.activada_en || !row.activacion_hash) {
          return 'invalid';
        }
        if (!row.activacion_expira_en || row.activacion_expira_en.getTime() <= Date.now()) {
          return 'expired';
        }
        if (row.activacion_intentos >= 5) {
          return 'locked';
        }
        if (!timingSafeEqual(Buffer.from(row.activacion_hash), Buffer.from(codeHash))) {
          await tx.solicitud.update({
            where: { id },
            data: { activacion_intentos: { increment: 1 } },
          });
          return 'invalid';
        }
        const detail = row.detalle_solicitud!;
        const role = await tx.rolAcceso.findUnique({ where: { codigo: 'titulado' } });
        if (!role?.habilitado) {
          throw new BusinessRuleError(
            'conflict',
            'ROLE_UNAVAILABLE',
            'El rol titulado no está habilitado; revisa el catálogo de permisos',
          );
        }
        const user = await tx.usuario.create({
          data: {
            nombre: [detail.nombre, detail.apellido].filter(Boolean).join(' '),
            correo: detail.email!,
            rol: 'titulado',
            estado: 'ACTIVO',
            usuario_id: randomUUID(),
            cuenta_acceso: { create: { password_hash: passwordHash } },
          },
        });
        await tx.titulado.create({
          data: {
            id_usuario: user.usuario_id,
            id_carrera: detail.id_carrera,
            nombre: detail.nombre,
            apellido: detail.apellido,
            ci: detail.ci,
            extension_ci: detail.extension_ci,
            cod_sis: detail.cod_sis,
            anio_ingreso: detail.fecha_ingreso?.getUTCFullYear(),
          },
        });
        await tx.usuarioSolicitud.create({
          data: {
            id_usuario: user.usuario_id,
            id_solicitud: id,
            detalle_solicitud_id: detail.id,
          },
        });
        await tx.solicitud.update({
          where: { id },
          data: {
            activada_en: new Date(),
            activacion_hash: null,
            activacion_intentos: { increment: 1 },
          },
        });
        return 'activated';
      },
      { timeout: 20000 },
    );
  }
}
