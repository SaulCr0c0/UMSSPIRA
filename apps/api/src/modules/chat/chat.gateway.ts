// apps/api/src/modules/chat/chat.gateway.ts
import { Logger, Inject } from '@nestjs/common';
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
import {
  AUTHENTICATOR,
  type Authenticator,
} from '../../shared/security/ports/authenticator.port';
import { ACCESS_COOKIE } from '../../shared/http/auth/cookies/request-cookies';
import { ChatService } from './chat.service';

export interface RequestPayload {
  targetUserId: string;
  content: string;
  senderId?: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    @Inject(AUTHENTICATOR) private readonly auth: Authenticator,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    this.logger.log(`Intento de conexión: ${client.id}`);

    try {
      const token = this.extractToken(client);
      if (!token) {
        this.reject(client, 'Sin token');
        return;
      }

      const context = await this.auth.execute(token);
      const userId = context.actor?.id;
      if (!userId) {
        this.reject(client, 'Token sin usuario');
        return;
      }

      client.data.userId = userId;
      client.join(`user_${userId}`);
      client.emit('chat:ready');
      this.logger.log(`Socket conectado: ${client.id} (Usuario: ${userId})`);
    } catch {
      this.reject(client, 'Token inválido');
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Socket desconectado: ${client.id}`);
  }

  @SubscribeMessage('chat:request')
  async handleChatRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RequestPayload,
  ): Promise<void> {
    try {
      const userId = client.data.userId ?? payload.senderId;
      if (!userId) {throw new Error('Sesión sin usuario');}

      const conversation = await this.chatService.findOrCreateDirectConversation(
        userId,
        payload.targetUserId,
        'ACEPTADO',
      );

      await this.chatService.saveMessage({
        conversationId: conversation.id,
        senderId: userId,
        content: payload.content,
      });

      client.emit('chat:request_sent', { conversationId: conversation.id });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error al enviar solicitud', error);
      client.emit('chat:request_error', { error: `Error: ${message}` });
    }
  }

  @SubscribeMessage('chat:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { conversationId: string; content: string; senderId?: string },
  ): Promise<void> {
    try {
      const userId = client.data.userId ?? payload.senderId;
      if (!userId) {throw new Error('Sesión sin usuario');}

      const message = await this.chatService.saveMessage({
        conversationId: payload.conversationId,
        senderId: userId,
        content: payload.content,
      });

      client.emit('chat:message_sent', { messageId: message.id });
      client
        .to(`conversation_${payload.conversationId}`)
        .emit('chat:new_message', message);
    } catch (error: unknown) {
      this.logger.error('Error al enviar mensaje', error);
      client.emit('chat:message_error', { error: 'Error interno' });
    }
  }

  private extractToken(client: Socket): string | undefined {
    let token = client.handshake.auth?.token as string | undefined;

    if (!token) {
      const raw = client.handshake.headers.cookie
        ?.split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${ACCESS_COOKIE}=`))
        ?.slice(ACCESS_COOKIE.length + 1);

      if (raw) {
        try {
          token = decodeURIComponent(raw);
        } catch {
          token = undefined;
        }
      }
    }

    return token;
  }

  private reject(client: Socket, reason: string): void {
    this.logger.warn(`Conexión rechazada: ${reason} (${client.id})`);
    client.emit('chat:unauthorized');
    client.disconnect(true);
  }
}