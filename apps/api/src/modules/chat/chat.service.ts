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

  async getUserConversations() {
    const firstUser = await this.prisma.usuario.findFirst();
    if (!firstUser) {
      return [];
    }

    const conversations = await this.prisma.conversacion.findMany({
      where: {
        participante_conversacion_registros: {
          some: { usuario_id: firstUser.usuario_id },
        },
      },
      include: {
        participante_conversacion_registros: { include: { usuario: true } },
        mensaje_registros: { orderBy: { fecha_mensaje: 'desc' } },
      },
      orderBy: { fecha_actualizacion: 'desc' },
    });

    return conversations.map((conv) => {
      const otherParticipant = conv.participante_conversacion_registros.find(
        (p) => p.usuario_id !== firstUser.usuario_id,
      );

      const unreadCount = conv.mensaje_registros.filter(
        (m) => m.emisor_id !== firstUser.usuario_id && m.estado_envio !== 'leido',
      ).length;

      return {
        id: conv.id,
        updatedAt: conv.fecha_actualizacion,
        unreadCount,
        isUnread: unreadCount > 0,
        estado: conv.estado_conversacion || 'ACEPTADO',
        otherUser: {
          id: otherParticipant?.usuario?.usuario_id || 'unknown',
          name: otherParticipant?.usuario?.nombre || 'Usuario',
          role: otherParticipant?.usuario?.rol || 'Desconocido',
        },
      };
    });
  }

  async getAvailableUsersToChat() {
    return this.prisma.usuario.findMany({
      take: 100,
      select: { usuario_id: true, nombre: true, rol: true, correo: true },
    });
  }

  async getMessages(conversationId: string) {
    return this.prisma.mensaje.findMany({
      where: { id_conversacion: conversationId },
      orderBy: { fecha_mensaje: 'asc' },
    });
  }

  async markAsRead(conversationId: string) {
    return this.prisma.mensaje.updateMany({
      where: { id_conversacion: conversationId, estado_envio: { not: 'leido' } },
      data: { estado_envio: 'leido' },
    });
  }
}