// apps/api/src/modules/chat/chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';

export interface RequestPayload {
  targetUserId: string;
  content: string;
  senderId?: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'], // 👈 PERMITIMOS EL PUERTO DEL FRONTEND
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  // @ts-expect-error - NestJS inyecta esta propiedad automáticamente
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Socket conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket desconectado: ${client.id}`);
  }

  @SubscribeMessage('chat:request')
  async handleChatRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RequestPayload,
  ) {
    try {
      let userId = client.data.userId || payload.senderId;

      if (!userId) {
        const fallbackUser = await this.chatService.getFirstUser();
        if (!fallbackUser) {throw new Error('No hay usuarios en la base de datos');}
        userId = fallbackUser.usuario_id;
      }

      const conversation = await this.chatService.findOrCreateDirectConversation(
        userId,
        payload.targetUserId,
        'ACEPTADO' // 👈 LO DEJAMOS ACEPTADO PARA PODER CHATEAR DIRECTO
      );

      await this.chatService.saveMessage({
        conversationId: conversation.id,
        senderId: userId,
        content: payload.content,
      });

      client.emit('chat:request_sent', { conversationId: conversation.id });
      
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error al enviar solicitud', error);
      client.emit('chat:request_error', { error: 'Error: ' + message });
    }
  }

  @SubscribeMessage('chat:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; content: string; senderId?: string },
  ) {
    try {
      let userId = client.data.userId || payload.senderId;
      if (!userId) {
        const fallbackUser = await this.chatService.getFirstUser();
        userId = fallbackUser?.usuario_id;
      }
      if (!userId) {throw new Error('No hay usuario válido');}

      const message = await this.chatService.saveMessage({
        conversationId: payload.conversationId,
        senderId: userId,
        content: payload.content,
      });
      
      client.emit('chat:message_sent', { messageId: message.id });
      client.to(`conversation_${payload.conversationId}`).emit('chat:new_message', message);
    } catch (error: unknown) {
      this.logger.error('Error al enviar mensaje', error);
      client.emit('chat:message_error', { error: 'Error interno' });
    }
  }
}