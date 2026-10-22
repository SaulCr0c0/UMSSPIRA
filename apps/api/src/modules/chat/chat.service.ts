// apps/api/src/modules/chat/chat.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getFirstUser() {
    return this.prisma.usuario.findFirst();
  }

  async findOrCreateDirectConversation(
    actorId: string,
    targetUserId: string,
    status: string = 'ACEPTADO',
  ) {
    if (!targetUserId) {
      throw new BadRequestException('targetUserId es requerido');
    }

    const target = await this.prisma.usuario.findUnique({
      where: { usuario_id: targetUserId },
    });
    if (!target) {
      throw new BadRequestException('El usuario destino no existe');
    }

    let finalActorId = actorId;
    let actor: { usuario_id: string } | null = null;

    if (finalActorId) {
      actor = await this.prisma.usuario.findUnique({
        where: { usuario_id: finalActorId },
      });
    }

    if (!actor || finalActorId === targetUserId) {
      const fallbackUser = await this.prisma.usuario.findFirst({
        where: { usuario_id: { not: targetUserId } },
      });
      if (!fallbackUser) {
        throw new BadRequestException('No hay otros usuarios en la BD');
      }
      finalActorId = fallbackUser.usuario_id;
    }

    const existing = await this.prisma.conversacion.findFirst({
      where: {
        tipo: 'directo',
        AND: [
          { participante_conversacion_registros: { some: { usuario_id: finalActorId } } },
          { participante_conversacion_registros: { some: { usuario_id: targetUserId } } },
        ],
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.conversacion.create({
      data: {
        tipo: 'directo',
        estado_conversacion: status,
        creado_por: finalActorId,
        participante_conversacion_registros: {
          create: [{ usuario_id: finalActorId }, { usuario_id: targetUserId }],
        },
      },
    });
  }
}