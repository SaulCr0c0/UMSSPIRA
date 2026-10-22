// apps/web/src/app/portal/mensajes/page.tsx
'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, WifiOff, Lock } from 'lucide-react';
import { getChatSocket, disconnectChatSocket, retryConnection } from '@/shared/services/chat-socket';

type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'unauthorized';

function MensajesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get('conversation');

  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [reconnectData, setReconnectData] = useState({ attempt: 0, delay: 0 });
  const [countdown, setCountdown] = useState(0);
  const [showConnectedBanner, setShowConnectedBanner] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const countdownRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    fetchData();
    const socket = getChatSocket();

    const onConnect = () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setStatus('connected');
      setIsRetrying(false);
      setShowConnectedBanner(true);
      setTimeout(() => setShowConnectedBanner(false), 3000);
    };
    const onDisconnect = () => { setStatus('reconnecting'); };
    const onUnauthorized = () => { setStatus('unauthorized'); };
    const onReconnectAttempt = (attempt: number) => {
      const delay = attempt === 1 ? 2000 : attempt === 2 ? 4000 : 8000;
      setReconnectData({ attempt, delay });
      setStatus('reconnecting');
      setIsRetrying(false);
      if (countdownRef.current) clearInterval(countdownRef.current);
      setCountdown(delay / 1000);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };
    const onReconnectFailed = () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setStatus('disconnected');
      setIsRetrying(false);
    };

    if (socket.connected) onConnect();
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('chat:unauthorized', onUnauthorized);
    socket.on('reconnect_attempt', onReconnectAttempt);
    socket.on('reconnect_failed', onReconnectFailed);
    if (!socket.connected) socket.connect();

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('chat:unauthorized', onUnauthorized);
      socket.off('reconnect_attempt', onReconnectAttempt);
      socket.off('reconnect_failed', onReconnectFailed);
      disconnectChatSocket();
    };
  }, []);

  useEffect(() => { if (activeChat) fetchMessages(activeChat); }, [activeChat]);
  useEffect(() => { if (conversationId) setActiveChat(conversationId); }, [conversationId]);

  const handleManualRetry = () => {
    setIsRetrying(true);
    setStatus('connecting');
    retryConnection();
  };

  const filteredConversations = conversations.filter(c => activeTab === 'all' || c.isUnread);
  const totalUnread = conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-[#F8FAFC] p-4 md:p-6 gap-4 overflow-hidden relative">

      {status === 'disconnected' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-sm w-full mx-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              {isRetrying ? <Loader2 className="w-8 h-8 text-red-600 animate-spin" /> : <WifiOff className="w-8 h-8 text-red-600" />}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isRetrying ? 'Iniciando nuevo ciclo...' : 'No pudimos reconectar'}
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              {isRetrying ? 'Intentando conectar con el servidor nuevamente.' : 'Error: no se pudo reconectar en los 3 intentos. Inténtalo más tarde.'}
            </p>
            <button
              onClick={handleManualRetry}
              disabled={isRetrying}
              className="w-full py-3 bg-[#B45309] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#92400E] transition-colors disabled:opacity-70"
            >
              {isRetrying ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isRetrying ? 'Reintentando...' : 'Reintentar'}
            </button>
          </div>
        </div>
      )}

      {status === 'unauthorized' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-sm w-full mx-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Tu sesión expiró</h2>
            <p className="text-gray-500 mb-6 text-sm">Para volver al chat, inicia sesión nuevamente.</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-[#B45309] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#92400E] transition-colors"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      )}

      {/* PANEL IZQUIERDO */}
      <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#0F172A]">Mensajes</h1>
          <div className="text-xs flex items-center gap-1 font-medium bg-gray-50 px-3 py-1.5 rounded-full">
            {status === 'connected' && <><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span><span className="text-green-700">Conectado</span></>}
            {status === 'connecting' && <><Loader2 className="w-3 h-3 animate-spin text-amber-600"/><span className="text-amber-700">Conectando...</span></>}
            {status === 'reconnecting' && <><Loader2 className="w-3 h-3 animate-spin text-amber-600"/><span className="text-amber-700">Reconectando...</span></>}
            {status === 'disconnected' && <><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span><span className="text-red-700">Desconectado</span></>}
            {status === 'unauthorized' && <><Lock className="w-3 h-3 text-red-600"/><span className="text-red-700">Sesión expirada</span></>}
          </div>
        </div>

        <div className="flex px-5 gap-6 border-b border-gray-200 bg-[#FAFAF9]">
          <button onClick={() => setActiveTab('all')} className={`pb-3 pt-2 text-sm font-bold ${activeTab === 'all' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}>Todos</button>
          <button onClick={() => setActiveTab('unread')} className={`pb-3 pt-2 text-sm font-bold flex items-center gap-2 ${activeTab === 'unread' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}>
            No leídos {totalUnread > 0 && <span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">{totalUnread}</span>}
          </button>
        </div>

        <div className="overflow-y-auto flex-1 bg-white">
          {loading ? <div className="flex justify-center p-6 text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div> : (
            <>
              {filteredConversations.map((conv) => (
                <div key={conv.id} onClick={() => setActiveChat(conv.id)} className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${activeChat === conv.id ? 'bg-blue-50/50 border-l-4 border-l-[#0F172A]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-lg uppercase shrink-0">{conv.otherUser?.name?.substring(0, 2) || 'U'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h2 className={`text-[15px] truncate ${conv.isUnread ? 'font-bold text-[#0F172A]' : 'font-semibold text-gray-800'}`}>{conv.otherUser?.name || 'Usuario'}</h2>
                        {conv.unreadCount > 0 && <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{conv.unreadCount}</span>}
                      </div>
                      <p className="text-sm text-gray-500 truncate capitalize">{conv.otherUser?.role || 'Rol'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
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