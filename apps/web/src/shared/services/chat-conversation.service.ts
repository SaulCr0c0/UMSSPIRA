// apps/web/src/shared/services/chat-conversation.service.ts
export const startDirectChat = async (targetUserId: string) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

  const response = await fetch(
    `${baseUrl}/api/v1/chat/conversations/direct`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ targetUserId }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ??
        `Error ${response.status}: No se pudo iniciar el chat`,
    );
  }

  return response.json() as Promise<{ conversationId: string }>;
};

export interface ConversationSummary {
  id: string;
  otherUser: { id: string; name: string; role: string };
  lastMessage: {
    content: string;
    sentAt: string | null;
    senderId: string | null;
  } | null;
  lastActivityAt: string | null;
}

export interface ChatMessage {
  id: string;
  emisor_id: string | null;
  contenido: string | null;
  fecha_mensaje: string | null;
}

const readApiError = async (response: Response, fallback: string) => {
  const data = await response.json().catch(() => ({}));
  return data?.error?.message ?? data?.message ?? fallback;
};

export const getMyConversations = async (): Promise<ConversationSummary[]> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/v1/chat/conversations`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(await readApiError(response, 'No se pudieron cargar tus conversaciones'));
  }
  return response.json();
};

export const getConversationMessages = async (
  conversationId: string,
): Promise<ChatMessage[]> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const response = await fetch(
    `${baseUrl}/api/v1/chat/conversations/${conversationId}/messages`,
    { credentials: 'include' },
  );
  if (!response.ok) {
    throw new Error(await readApiError(response, 'No se pudieron cargar los mensajes'));
  }
  return response.json();
};