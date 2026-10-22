// apps/web/src/features/chat/hooks/useStartDirectChat.ts
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startDirectChat } from '@/shared/services/chat-conversation.service';

export const useStartDirectChat = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const startChat = async (targetUserId: string) => {
    setLoading(true);

    try {
      const { conversationId } = await startDirectChat(targetUserId);
      router.push(`/portal/mensajes?conversation=${conversationId}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    startChat,
    loading,
  };
};