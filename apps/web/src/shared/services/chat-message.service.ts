// apps/web/src/shared/services/chat-message.service.ts
import { getChatSocket } from './chat-socket';

export interface SendChatMessageInput {
  conversationId: string;
  content: string;
}

export interface SendChatMessageResult {
  messageId: string;
}

const SEND_TIMEOUT_MS = 10_000;

/**
 * Envía un mensaje por el socket del chat.
 * El servidor toma el emisor de la sesión autenticada, por eso aquí
 * NO se manda senderId.
 */
export function sendChatMessage(
  input: SendChatMessageInput,
): Promise<SendChatMessageResult> {
  return new Promise((resolve, reject) => {
    const content = input.content.trim();
    if (!content) {
      reject(new Error('El mensaje no puede estar vacío'));
      return;
    }

    const socket = getChatSocket();
    if (!socket.connected) {
      reject(new Error('Sin conexión con el chat'));
      return;
    }

    const cleanup = (): void => {
      clearTimeout(timer);
      socket.off('chat:message_sent', onSent);
      socket.off('chat:message_error', onError);
    };

    const onSent = (data: { messageId: string }): void => {
      cleanup();
      resolve({ messageId: data.messageId });
    };

    const onError = (data: { error?: string }): void => {
      cleanup();
      reject(new Error(data?.error ?? 'No se pudo enviar el mensaje'));
    };

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Tiempo de espera agotado al enviar el mensaje'));
    }, SEND_TIMEOUT_MS);

    socket.on('chat:message_sent', onSent);
    socket.on('chat:message_error', onError);
    socket.emit('chat:send', {
      conversationId: input.conversationId,
      content,
    });
  });
}