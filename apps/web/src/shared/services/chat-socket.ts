import { io, Socket } from 'socket.io-client';

const CHAT_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// Una conexión por pestaña (CA-07): cada pestaña tiene su propio módulo JS,
// por lo que cerrar una no afecta a la otra.
let socket: Socket | null = null;

export const getChatSocket = (): Socket => {
  if (!socket) {
    socket = io(CHAT_URL, {
      withCredentials: true, // el navegador envía la cookie de sesión
      autoConnect: false,    // la conexión la abre quien use el socket
      reconnection: false,   // la reconexión automática es HU-02, no HU-01
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