// apps/web/src/shared/services/chat-socket.ts
import { io, Socket } from 'socket.io-client';

const CHAT_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
let socket: Socket | null = null;

const MAX_ATTEMPTS = 3;
const DELAYS = [2000, 4000, 8000]; // 2s, 4s y 8s (CA-02)
let attemptCount = 0;
let reconnectTimeout: NodeJS.Timeout | null = null;

export const getChatSocket = (): Socket => {
  if (!socket) {
    socket = io(`${CHAT_URL}/chat`, {
      withCredentials: true,
      autoConnect: false,
      reconnection: false, 
    });

    socket.on('connect', () => {
      attemptCount = 0;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    });

    socket.on('disconnect', (reason) => {
      if (reason === 'io client disconnect') return; // CA-07

      if (attemptCount < MAX_ATTEMPTS) {
        const delay = DELAYS[attemptCount];
        attemptCount++;
        
        // Emitimos el evento para que la UI muestre el intento actual
        socket?.emit('reconnect_attempting', { attempt: attemptCount, delay });
        
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(() => {
          socket?.connect();
        }, delay);
      } else {
        socket?.emit('reconnect_failed'); // CA-04
      }
    });
  }
  return socket;
};

export const retryConnection = () => {
  attemptCount = 0;
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  socket?.connect();
};

export const disconnectChatSocket = (): void => {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  attemptCount = 0;
};