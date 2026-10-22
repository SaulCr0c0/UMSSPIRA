// apps/web/src/shared/services/chat-socket.ts
import { io, Socket } from 'socket.io-client';

const CHAT_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// Una conexión por pestaña (CA-07): cada pestaña tiene su propio módulo JS,
// por lo que cerrar una no afecta a la otra.
let socket: Socket | null = null;

export const getChatSocket = (): Socket => {
  if (!socket) {
    socket = io(`${CHAT_URL}/chat`, {
      withCredentials: true,
      autoConnect: false,
      // Reintentos automáticos (HU-02 CA-02): 2s -> 4s -> 8s, sin aleatoriedad.
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 8000,
      randomizationFactor: 0,
    });
  }
  return socket;
};

// CA-06: cerrar la conexión al salir de la sección de chat.
export const disconnectChatSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Reinicia el ciclo de intentos manualmente.
export const retryConnection = (): void => {
  if (!socket) return;
  socket.disconnect();
  socket.connect();
};