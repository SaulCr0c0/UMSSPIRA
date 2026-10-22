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