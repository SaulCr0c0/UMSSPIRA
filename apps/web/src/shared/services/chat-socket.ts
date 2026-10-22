// apps/web/src/shared/services/chat-socket.ts
import { io, Socket } from 'socket.io-client';

const CHAT_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
let socket: Socket | null = null;

export const getChatSocket = (): Socket => {
  if (!socket) {
    socket = io(`${CHAT_URL}/chat`, {
      withCredentials: true,
      autoConnect: false,
      // Configuración de reintentos (HU-02 CA-02)
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,    // Empieza en 2s
      reconnectionDelayMax: 8000, // Llega a 8s (2s -> 4s -> 8s)
      randomizationFactor: 0,     // Sin aleatoriedad para que los tiempos sean exactos
    });
  }
  return socket;
};

export const retryConnection = () => {
  if (socket) {
    socket.disconnect();
    socket.connect(); // Reinicia el ciclo de intentos
  }
};

export const disconnectChatSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};