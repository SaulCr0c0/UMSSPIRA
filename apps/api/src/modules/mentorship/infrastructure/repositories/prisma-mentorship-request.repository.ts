import { Injectable } from '@nestjs/common';
import { BusinessRuleError } from '../../../../shared/errors/business-rule-error';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { CreateMentorshipRequestInput } from '../../application/contracts/create-mentorship-request.input';
import type { MentorshipRequestRepository } from '../../application/ports/mentorship-request-repository.port';
import type { MentorshipRequest } from '../../domain/entities/mentorship-request';
import { canReceiveMentorship } from '../../domain/policies/mentor.policy';
import { toAvailability } from '../translators/mentor.translator';
import { availabilityOrder, lockGraduate } from './mentor-transaction';

const toDatabaseDate = (date: string) => new Date(`${date}T00:00:00.000Z`);
const toDatabaseTime = (time: string) => new Date(`1970-01-01T${time}:00.000Z`);

@Injectable()
export class PrismaMentorshipRequestRepository implements MentorshipRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    input: CreateMentorshipRequestInput,
    now: Date,
  ): Promise<MentorshipRequest> {
    return this.prisma.$transaction(
      async (tx) => {
        const requester = await lockGraduate(tx, userId);
        const initialMentor = await tx.mentor.findUnique({
          where: { id: input.mentorId },
          select: { id: true, id_titulado: true },
        });
        if (!initialMentor) {
          throw new BusinessRuleError('missing', 'MENTOR_NOT_FOUND', 'El mentor no existe');
        }
        if (initialMentor.id_titulado === requester.id) {
          throw new BusinessRuleError(
            'invalid',
            'MENTORSHIP_REQUEST_SELF',
            'No puedes solicitar una mentoría contigo mismo',
          );
        }

        await tx.$queryRaw`SELECT id FROM mentor WHERE id = ${initialMentor.id}::uuid FOR UPDATE`;
        const mentor = await tx.mentor.findUnique({
          where: { id: initialMentor.id },
          select: {
            id: true,
            esta_activo: true,
            titulado: {
              select: { usuario: { select: { estado: true, rol: true } } },
            },
          },
        });
        if (!mentor) {
          throw new BusinessRuleError('missing', 'MENTOR_NOT_FOUND', 'El mentor no existe');
        }
        const mentorUser = mentor.titulado.usuario;
        if (
          mentor.esta_activo !== true ||
          mentorUser?.estado !== 'ACTIVO' ||
          mentorUser.rol !== 'titulado'
        ) {
          throw new BusinessRuleError(
            'forbidden',
            'MENTOR_NOT_AVAILABLE',
            'El mentor no está habilitado para recibir solicitudes',
          );
        }

        const availability = await tx.disponibilidadMentor.findFirst({
          where: { id_mentor: mentor.id },
          orderBy: availabilityOrder,
          select: { estado: true, fecha_actualizacion: true, hora_inicio: true, hora_fin: true },
        });
        if (!canReceiveMentorship(mentor.esta_activo, toAvailability(availability).status)) {
          throw new BusinessRuleError(
            'forbidden',
            'MENTOR_NOT_AVAILABLE',
            'El mentor no está habilitado para recibir solicitudes',
          );
        }

        const date = toDatabaseDate(input.date);
        const startTime = toDatabaseTime(input.startTime);
        const endTime = toDatabaseTime(input.endTime);
        const space = await tx.espacioDisponibleMentor.findFirst({
          where: {
            id_mentor: mentor.id,
            dia_semana: date.getUTCDay(),
            esta_activo: true,
            horario_inicio: { lte: startTime },
            horario_fin: { gte: endTime },
          },
          select: { id: true },
        });
        const hasAvailabilityWindow =
          availability?.hora_inicio == null ||
          availability.hora_fin == null ||
          (startTime >= availability.hora_inicio && endTime <= availability.hora_fin);
        if (!space || !hasAvailabilityWindow) {
          throw new BusinessRuleError(
            'conflict',
            'MENTOR_SLOT_UNAVAILABLE',
            'El horario seleccionado ya no está disponible',
          );
        }

        const conflict = await tx.mentoriaSolicitud.findFirst({
          where: {
            id_mentor: mentor.id,
            solicitud_fecha: date,
            estado: { in: ['PENDIENTE', 'ACEPTADO'] },
            solicitud_inicio: { lt: endTime },
            solicitud_fin: { gt: startTime },
          },
          select: { id: true },
        });
        if (conflict) {
          throw new BusinessRuleError(
            'conflict',
            'MENTOR_SLOT_UNAVAILABLE',
            'El horario seleccionado ya no está disponible',
          );
        }

        const row = await tx.mentoriaSolicitud.create({
          data: {
            id_mentor: mentor.id,
            id_usuario: userId,
            solicitud_fecha: date,
            solicitud_inicio: startTime,
            solicitud_fin: endTime,
            mensaje: input.message ?? null,
            estado: 'PENDIENTE',
            fecha_creacion: now,
            fecha_actualizacion: now,
          },
        });
        return {
          id: row.id,
          mentorId: mentor.id,
          requesterId: userId,
          date,
          startTime,
          endTime,
          message: row.mensaje,
          status: 'PENDIENTE',
          createdAt: row.fecha_creacion,
        };
      },
      { timeout: 15000 },
    );
  }
}
