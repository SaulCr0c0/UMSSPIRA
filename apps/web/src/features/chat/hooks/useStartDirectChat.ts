// apps/web/src/features/chat/hooks/useStartDirectChat.ts
'use client';

import { useState } from 'react';

export const useStartDirectChat = () => {
  const [loading, setLoading] = useState(false);

  const startChat = async (targetUserId: string) => {
    setLoading(true);
    try {
      // TODO: llamar al servicio startDirectChat
    } finally {
      setLoading(false);
    }
  };

  return {
    startChat,
    loading,
  };
};