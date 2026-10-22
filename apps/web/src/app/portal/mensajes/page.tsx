// apps/web/src/app/portal/mensajes/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MessageSquare, Loader2, WifiOff, CheckCircle2, X, Search, Send, ChevronLeft, Clock, Lock } from 'lucide-react';
import { getChatSocket, disconnectChatSocket, retryConnection } from '@/shared/services/chat-socket';
import { sendChatMessage } from '@/shared/services/chat-message.service';

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

  const handleSendFirstMessage = async () => {
    if (!selectedUser || !firstMessage.trim()) return;
    setSendingFirstMsg(true);
    setModalError(null);
    setModalSuccess(null);

    try {
      const socket = getChatSocket();
      socket.emit('chat:request', { targetUserId: selectedUser.usuario_id, content: firstMessage });

      socket.once('chat:request_sent', (data: { conversationId: string }) => {
        setModalSuccess('¡Solicitud enviada correctamente!');
        setTimeout(() => {
          setIsModalOpen(false);
          setFirstMessage('');
          setSelectedUser(null);
          setModalSuccess(null);
          fetchData();
          router.push(`/portal/mensajes?conversation=${data.conversationId}`);
        }, 1500);
      });

      socket.once('chat:request_error', (err: any) => {
        setModalError(err.error || 'Error al enviar la solicitud');
        setSendingFirstMsg(false);
      });
    } catch (err) {
      setModalError('Error al conectar con el servidor');
      setSendingFirstMsg(false);
    }
  };

  const handleSendMessage = async () => {
    if (!activeChat || !newMessageText.trim() || status !== 'connected') return;
    const msg = newMessageText;
    setNewMessageText('');

    const result = await sendChatMessage({ conversationId: activeChat, content: msg });
    if (result.success) {
      fetchMessages(activeChat);
      setTimeout(fetchData, 500);
    }
  };

  const openModalForUser = (user: any) => {
    setSelectedUser(user);
    setFirstMessage('');
    setModalError(null);
    setModalSuccess(null);
    setIsModalOpen(true);
    setModalStep(2);
  };

  // Combinar conversaciones y contactos
  const existingUserIds = new Set(conversations.map(c => c.otherUser?.id).filter(id => id && id !== 'unknown'));
  const contactUsers = availableUsers.filter(u => !existingUserIds.has(u.usuario_id));

  const filteredConversations = conversations.filter(c => activeTab === 'all' || c.isUnread);
  const totalUnread = conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
  const currentConversation = conversations.find(c => c.id === activeChat);
  const isPending = currentConversation?.estado === 'PENDIENTE';

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-[#F8FAFC] p-4 md:p-6 gap-4 overflow-hidden relative">

      {/* CA-04, CA-05: PANTALLA DE ERROR (3 INTENTOS AGOTADOS) */}
      {status === 'disconnected' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-sm w-full mx-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <WifiOff className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No pudimos reconectar</h2>
            <p className="text-gray-500 mb-6 text-sm">Error: no se pudo reconectar en los 3 intentos. Inténtalo más tarde.</p>
            <button
              onClick={() => { retryConnection(); setStatus('connecting'); }}
              className="w-full py-3 bg-[#B45309] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#92400E] transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* CA-06: PANTALLA DE SESIÓN EXPIRADA */}
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

      {/* MODAL NUEVO CHAT (Lupa) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-[#FAFAF9] rounded-2xl shadow-xl w-full max-w-[400px] flex flex-col overflow-hidden relative min-h-[500px]">
            <div className="flex items-center justify-between p-5 pb-2">
              <div className="flex items-center gap-3">
                {modalStep === 2 && (
                  <button onClick={() => {setModalStep(1); setModalError(null); setModalSuccess(null);}} className="p-1 hover:bg-gray-200 rounded-full">
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                )}
                <h2 className="text-2xl font-bold text-[#0F172A]">
                  {modalStep === 1 ? 'Nuevo chat' : `Mensaje a ${selectedUser?.nombre || 'Usuario'}`}
                </h2>
              </div>
              <button onClick={() => { setIsModalOpen(false); setModalStep(1); setModalError(null); setModalSuccess(null); setFirstMessage(''); }} className="text-gray-500 hover:text-gray-800">
                <X className="w-6 h-6" />
              </button>
            </div>

            {modalStep === 1 && (
              <>
                <div className="px-5 mb-4">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input type="text" placeholder="Buscar contactos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {availableUsers.length === 0 ? <p className="text-center text-gray-500 text-sm mt-4">No hay contactos disponibles.</p> : availableUsers.filter(u => (u.nombre || '').toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                    <div key={user.usuario_id} onClick={() => openModalForUser(user)} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-lg shrink-0 uppercase">
                        {user.nombre?.substring(0, 2) || user.correo?.substring(0, 2) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-[#0F172A] truncate">{user.nombre || user.correo || 'Usuario'}</h3>
                        <p className="text-sm text-gray-500 capitalize">{user.rol || 'Sin rol'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {modalStep === 2 && (
              <div className="flex-1 flex flex-col p-5">
                <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-xl border border-gray-100">
                   <div className="w-12 h-12 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-lg uppercase">
                      {selectedUser?.nombre?.substring(0, 2) || selectedUser?.correo?.substring(0, 2)}
                   </div>
                   <div>
                      <h3 className="font-bold text-[#0F172A]">{selectedUser?.nombre || selectedUser?.correo}</h3>
                      <p className="text-sm text-gray-500 capitalize">{selectedUser?.rol}</p>
                   </div>
                </div>
                <textarea
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  placeholder="Escribe tu primer mensaje..."
                  className="flex-1 w-full bg-white border border-gray-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 mb-4 text-sm"
                  disabled={!!modalSuccess}
                />

                {modalError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg mb-4 border border-red-200 text-center">{modalError}</p>}
                {modalSuccess && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-center border border-green-200 flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" /> {modalSuccess}</div>}

                <button
                  onClick={handleSendFirstMessage}
                  disabled={!firstMessage.trim() || sendingFirstMsg || !!modalSuccess}
                  className="w-full py-3 bg-[#0F172A] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#1E293B] disabled:opacity-50 transition-colors"
                >
                  {sendingFirstMsg ? <Loader2 className="w-5 h-5