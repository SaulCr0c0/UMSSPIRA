import { io, Socket } from 'socket.io-client';

// Variable para guardar la conexión y no crear múltiples
let socket: Socket | null = null;

export const getChatSocket = (): Socket => {
  if (!socket) {
    // CA-01: Conectamos al backend. El withCredentials es vital para enviar la cookie de sesión.
    socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket'],
      autoConnect: false, // No conectar automáticamente, lo haremos manualmente en la página
    });
  }
  return socket;
};

export const disconnectChatSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};