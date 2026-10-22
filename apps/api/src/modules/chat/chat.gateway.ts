/* eslint-disable @typescript-eslint/no-require-imports */
import { Logger, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AUTHENTICATOR, type Authenticator } from '../../shared/security/ports/authenticator.port';
import { ACCESS_COOKIE } from '../../shared/http/auth/cookies/request-cookies';

// Usamos require con la regla desactivada arriba para evitar el error de CommonJS
const { WebSocketGateway, WebSocketServer } = require('@nestjs/websockets');

// Tipado para evitar el error de 'any' con la sesión
interface AuthenticatedSession {
  id?: string;
  userId?: string;
  user?: { id: string };
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'],
    credentials: true, // CA-01: Permitir cookies de sesión
  },
})
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    @Inject(AUTHENTICATOR) private readonly auth: Authenticator,
  ) {}

  // CA-01 y CA-02: Al conectarse, verificamos la sesión
  async handleConnection(client: Socket) {
    this.logger.log(`Intento de conexión: ${client.id}`);
    
    try {
      const cookies = client.handshake.headers.cookie;
      
      const token = cookies?.split('; ').find((row: string) => row.startsWith(`${ACCESS_COOKIE}=`))?.split('=')[1];

      if (!token) {
        this.logger.warn(`Conexión rechazada: Sin cookie (${client.id})`);
        client.disconnect(); // CA-02
        return;
      }

      // Casteamos el resultado para evitar el error de 'any'
      const session = (await this.auth.execute(token)) as unknown as AuthenticatedSession;
      
      const userId = session.userId || session.id || session.user?.id;

      if (!userId) {
        throw new Error('Token válido pero sin ID de usuario asociado');
      }
      
      client.data.userId = userId; 
      
      this.logger.log(`Cliente conectado: ${client.id} (Usuario: ${userId})`);
      client.join(`user_${userId}`); // Sala privada

    } catch {
      this.logger.warn(`Conexión rechazada: Token inválido o expirado (${client.id})`);
      client.disconnect(); // CA-02
    }
  }

  // CA-06: Cuando el cliente se desconecta
  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }
}