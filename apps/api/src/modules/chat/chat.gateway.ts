import { Inject, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AUTHENTICATOR, type Authenticator } from '../../shared/security/ports/authenticator.port';
import { ACCESS_COOKIE } from '../../shared/http/auth/cookies/request-cookies';
import { ChatService } from './chat.service';

export interface SendMessagePayload {
  conversationId: string;
  content: string;
}

export interface SendMessageAck {
  success: boolean;
  messageId?: string;
  error?: string;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001',
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

    // CA-02: avisamos al cliente que su sesión no es válida antes de cortar,
    // para distinguirlo de un servidor caído (CA-05).
    const reject = (reason: string): void => {
      this.logger.warn(`Conexión rechazada: ${reason} (${client.id})`);
      client.emit('chat:unauthorized');
      client.disconnect(true);
    };

    try {
      // 1. Token enviado por auth (si el cliente lo manda)
      let token = client.handshake.auth?.token as string | undefined;

      // 2. Si no hay, lo leemos de la cookie de sesión
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

      if (!token) {
        reject('Sin token');
        return;
      }

      // AuthenticatedContext: { actor: { id, ... }, sessionId }
      const context = await this.auth.execute(token);
      const userId = context.actor?.id;

      if (!userId) {
        reject('Sesión sin usuario');
        return;
      }

      client.data.userId = userId;
      client.join(`user_${userId}`);
      client.emit('chat:ready'); // el servidor confirma que la sesión es válida
      this.logger.log(`Cliente conectado: ${client.id} (Usuario: ${userId})`);
    } catch {
      reject('Token inválido');
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('chat:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ): Promise<SendMessageAck> {
    // El emisor sale SIEMPRE de la sesión validada, nunca del payload.
    const userId = client.data.userId as string | undefined;
    if (!userId) {
      client.emit('chat:unauthorized');
      return { success: false, error: 'No autenticado' };
    }

    try {
      const message = await this.chatService.saveMessage({
        conversationId: payload.conversationId,
        senderId: userId,
        content: payload.content,
      });

      return { success: true, messageId: message.id };
    } catch (error) {
      this.logger.error('Error al enviar mensaje', error);
      return { success: false, error: 'No se pudo enviar el mensaje' };
    }
  }
}