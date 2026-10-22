// apps/web/src/shared/services/chat-socket.ts
import { io, Socket } from 'socket.io-client';

const CHAT_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

let socket: Socket | null = null;

export const getChatSocket = (): Socket => {
  if (!socket) {
    socket = io(`${CHAT_URL}/chat`, {
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 8000,
      randomizationFactor: 0,
    });
  }
  return socket;
};

export const disconnectChatSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const retryConnection = (): void => {
  if (!socket) return;
  socket.disconnect();
  socket.connect();
};