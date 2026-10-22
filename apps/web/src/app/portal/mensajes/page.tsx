// apps/web/src/app/portal/mensajes/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function MensajesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get('conversation');

  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
      const resConv = await fetch(`${baseUrl}/api/v1/chat/conversations`, { credentials: 'include' });
      if (resConv.ok) setConversations(await resConv.json());

      const resUsers = await fetch(`${baseUrl}/api/v1/chat/conversations/users`, { credentials: 'include' });
      if (resUsers.ok) setAvailableUsers(await resUsers.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/v1/chat/conversations/${chatId}/messages`, { credentials: 'include' });
      if (res.ok) setMessages(await res.json());
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (activeChat) fetchMessages(activeChat); }, [activeChat]);
  useEffect(() => { if (conversationId) setActiveChat(conversationId); }, [conversationId]);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-[#F8FAFC] p-4 md:p-6 gap-4 overflow-hidden relative">
      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <p>{conversations.length} conversaciones</p>}
    </div>
  );
}

export default function MensajesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center flex justify-center items-center h-screen text-gray-500"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Cargando...</div>}>
      <MensajesContent />
    </Suspense>
  );
}