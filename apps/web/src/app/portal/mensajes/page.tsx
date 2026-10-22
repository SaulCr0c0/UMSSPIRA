// apps/web/src/app/portal/mensajes/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getChatSocket, disconnectChatSocket } from '@/shared/services/chat-socket';

type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'unauthorized';

function MensajesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get('conversation');

  // Estados de conexión (HU-02)
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [reconnectData, setReconnectData] = useState({ attempt: 0, delay: 0 });
  const [showConnectedBanner, setShowConnectedBanner] = useState(false);

  // Estados de la App
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [firstMessage, setFirstMessage] = useState('');
  const [sendingFirstMsg, setSendingFirstMsg] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState('');

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

  // --- CONEXIÓN Y LÓGICA HU-02 ---
  useEffect(() => {
    fetchData();
    const socket = getChatSocket();

    const onConnect = () => {
      setStatus('connected');
      setShowConnectedBanner(true);
      setTimeout(() => setShowConnectedBanner(false), 3000);
    };

    const onDisconnect = () => setStatus('reconnecting');

    const onReconnectAttempting = (data: { attempt: number, delay: number }) => {
      setReconnectData(data);
      setStatus('reconnecting');
    };

    const onReconnectFailed = () => setStatus('disconnected');
    const onUnauthorized = () => setStatus('unauthorized');
    const onConnectError = () => setStatus('reconnecting');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnect_attempting', onReconnectAttempting);
    socket.on('reconnect_failed', onReconnectFailed);
    socket.on('chat:unauthorized', onUnauthorized);
    socket.on('connect_error', onConnectError);

    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('reconnect_attempting', onReconnectAttempting);
      socket.off('reconnect_failed', onReconnectFailed);
      socket.off('chat:unauthorized', onUnauthorized);
      socket.off('connect_error', onConnectError);
      disconnectChatSocket();
    };
  }, []);

  useEffect(() => {
    if (activeChat) fetchMessages(activeChat);
  }, [activeChat]);

  useEffect(() => {
    if (conversationId) setActiveChat(conversationId);
  }, [conversationId]);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-[#F8FAFC] p-4 md:p-6 gap-4 overflow-hidden relative">
      <p className="text-gray-500">Socket status: {status} · Conversaciones: {conversations.length}</p>
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