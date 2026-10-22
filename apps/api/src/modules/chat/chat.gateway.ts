import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

export interface RequestPayload {
  targetUserId: string;
  content: string;
  senderId?: string;
}

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Socket conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket desconectado: ${client.id}`);
  }

  @SubscribeMessage('chat:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; content: string; senderId: string },
  ) {
    try {
      const message = await this.chatService.saveMessage({
        conversationId: payload.conversationId,
        senderId: payload.senderId,
        content: payload.content,
      });

      client.emit('chat:message_sent', { messageId: message.id });
      client.to(`conversation_${payload.conversationId}`).emit('chat:new_message', message);
    } catch (error) {
      this.logger.error('Error al enviar mensaje', error);
      client.emit('chat:message_error', { error: 'Error interno' });
    }
  }
}