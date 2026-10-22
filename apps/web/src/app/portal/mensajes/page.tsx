// apps/web/src/app/portal/mensajes/page.tsx
'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  MessageSquare,
  Loader2,
  WifiOff,
  CheckCircle2,
  X,
  Search,
  Send,
  ChevronLeft,
  Clock,
  Lock,
} from 'lucide-react';
import {
  getChatSocket,
  disconnectChatSocket,
  retryConnection,
} from '@/shared/services/chat-socket';
import { sendChatMessage } from '@/shared/services/chat-message.service';

// -------------------- Tipos --------------------

type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'unauthorized';

type ConversationTab = 'all' | 'unread';

type ModalStep = 1 | 2;

interface ChatUser {
  usuario_id: string;
  nombre?: string | null;
  correo?: string | null;
  rol?: string | null;
}

interface ConversationPartner {
  id: string;
  name?: string | null;
  role?: string | null;
}

interface Conversation {
  id: string;
  otherUser?: ConversationPartner | null;
  isUnread?: boolean;
  unreadCount?: number;
  estado?: 'PENDIENTE' | 'ACEPTADA' | string;
}

interface ChatMessage {
  id: string;
  emisor_id: string;
  contenido: string;
}

interface ReconnectData {
  attempt: number;
  delay: number;
}

// -------------------- Constantes --------------------

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const CONNECTED_BANNER_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 3;

// -------------------- Helpers --------------------

function getInitials(value?: string | null): string {
  return value?.substring(0, 2).toUpperCase() || 'U';
}

// -------------------- Subcomponentes de banners / modales --------------------

function DisconnectedOverlay({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-sm w-full mx-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <WifiOff className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          No pudimos reconectar
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          Error: no se pudo reconectar en los {MAX_RECONNECT_ATTEMPTS} intentos.
          Inténtalo más tarde.
        </p>
        <button
          onClick={onRetry}
          className="w-full py-3 bg-[#B45309] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#92400E] transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

function UnauthorizedOverlay({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-sm w-full mx-4">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Tu sesión expiró
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          Para volver al chat, inicia sesión nuevamente.
        </p>
        <button
          onClick={onLogin}
          className="w-full py-3 bg-[#B45309] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#92400E] transition-colors"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const baseClasses =
    'text-xs flex items-center gap-1 font-medium bg-gray-50 px-3 py-1.5 rounded-full';

  switch (status) {
    case 'connected':
      return (
        <div className={baseClasses}>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-green-700">Conectado</span>
        </div>
      );
    case 'connecting':
      return (
        <div className={baseClasses}>
          <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
          <span className="text-amber-700">Conectando...</span>
        </div>
      );
    case 'reconnecting':
      return (
        <div className={baseClasses}>
          <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
          <span className="text-amber-700">Reconectando...</span>
        </div>
      );
    case 'disconnected':
      return (
        <div className={baseClasses}>
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-red-700">Desconectado</span>
        </div>
      );
    case 'unauthorized':
      return (
        <div className={baseClasses}>
          <Lock className="w-3 h-3 text-red-600" />
          <span className="text-red-700">Sesión expirada</span>
        </div>
      );
  }
}

// -------------------- Componente principal --------------------

function MensajesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationIdFromQuery = searchParams.get('conversation');

  // Conexión (HU-02)
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('connecting');
  const [reconnectData, setReconnectData] = useState<ReconnectData>({
    attempt: 0,
    delay: 0,
  });
  const [showConnectedBanner, setShowConnectedBanner] = useState(false);

  // Chat / listas
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ConversationTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal "nuevo chat"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>(1);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [firstMessageText, setFirstMessageText] = useState('');
  const [isSendingFirstMessage, setIsSendingFirstMessage] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState('');

  // -------------------- Fetch --------------------

  const handleFetchData = useCallback(async () => {
    try {
      const [conversationsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/chat/conversations`, {
          credentials: 'include',
        }),
        fetch(`${API_URL}/api/v1/chat/conversations/users`, {
          credentials: 'include',
        }),
      ]);

      if (conversationsRes.ok) {
        setConversations(await conversationsRes.json());
      }
      if (usersRes.ok) {
        setAvailableUsers(await usersRes.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFetchMessages = useCallback(async (chatId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/chat/conversations/${chatId}/messages`,
        { credentials: 'include' },
      );
      if (response.ok) {
        setMessages(await response.json());
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  // -------------------- Efectos --------------------

  useEffect(() => {
    handleFetchData();

    const socket = getChatSocket();

    const handleConnect = () => {
      setConnectionStatus('connected');
      setShowConnectedBanner(true);
      setTimeout(() => setShowConnectedBanner(false), CONNECTED_BANNER_MS);
    };

    const handleDisconnect = () => setConnectionStatus('reconnecting');

    const handleReconnectAttempting = (data: ReconnectData) => {
      setReconnectData(data);
      setConnectionStatus('reconnecting');
    };

    const handleReconnectFailed = () => setConnectionStatus('disconnected');
    const handleUnauthorized = () => setConnectionStatus('unauthorized');
    const handleConnectError = () => setConnectionStatus('reconnecting');

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect_attempting', handleReconnectAttempting);
    socket.on('reconnect_failed', handleReconnectFailed);
    socket.on('chat:unauthorized', handleUnauthorized);
    socket.on('connect_error', handleConnectError);

    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect_attempting', handleReconnectAttempting);
      socket.off('reconnect_failed', handleReconnectFailed);
      socket.off('chat:unauthorized', handleUnauthorized);
      socket.off('connect_error', handleConnectError);
      disconnectChatSocket();
    };
  }, [handleFetchData]);

  useEffect(() => {
    if (activeChatId) {
      handleFetchMessages(activeChatId);
    }
  }, [activeChatId, handleFetchMessages]);

  useEffect(() => {
    if (conversationIdFromQuery) {
      setActiveChatId(conversationIdFromQuery);
    }
  }, [conversationIdFromQuery]);

  // -------------------- Handlers --------------------

  const handleSendFirstMessage = async () => {
    if (!selectedUser || !firstMessageText.trim()) return;

    setIsSendingFirstMessage(true);
    setModalError(null);
    setModalSuccess(null);

    try {
      const socket = getChatSocket();
      socket.emit('chat:request', {
        targetUserId: selectedUser.usuario_id,
        content: firstMessageText,
      });

      socket.once(
        'chat:request_sent',
        (data: { conversationId: string }) => {
          setModalSuccess('¡Solicitud enviada correctamente!');
          setTimeout(() => {
            setIsModalOpen(false);
            setFirstMessageText('');
            setSelectedUser(null);
            setModalSuccess(null);
            handleFetchData();
            router.push(`/portal/mensajes?conversation=${data.conversationId}`);
          }, 1500);
        },
      );

      socket.once('chat:request_error', (error: { error?: string }) => {
        setModalError(error.error ?? 'Error al enviar la solicitud');
        setIsSendingFirstMessage(false);
      });
    } catch {
      setModalError('Error al conectar con el servidor');
      setIsSendingFirstMessage(false);
    }
  };

  const handleSendMessage = async () => {
    if (
      !activeChatId ||
      !newMessageText.trim() ||
      connectionStatus !== 'connected'
    ) {
      return;
    }

    const content = newMessageText;
    setNewMessageText('');

    const result = await sendChatMessage({
      conversationId: activeChatId,
      content,
    });

    if (result.success) {
      handleFetchMessages(activeChatId);
      setTimeout(handleFetchData, 500);
    }
  };

  const handleOpenModalForUser = (user: ChatUser) => {
    setSelectedUser(user);
    setFirstMessageText('');
    setModalError(null);
    setModalSuccess(null);
    setIsModalOpen(true);
    setModalStep(2);
  };

  const handleOpenNewChatModal = () => {
    setIsModalOpen(true);
    setModalStep(1);
    setFirstMessageText('');
    setModalError(null);
    setModalSuccess(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalStep(1);
    setModalError(null);
    setModalSuccess(null);
    setFirstMessageText('');
  };

  const handleRetryConnection = () => {
    retryConnection();
    setConnectionStatus('connecting');
  };

  const handleGoToLogin = () => router.push('/login');

  // -------------------- Derivados --------------------

  const existingUserIds = useMemo(
    () =>
      new Set(
        conversations
          .map((conversation) => conversation.otherUser?.id)
          .filter((id): id is string => !!id && id !== 'unknown'),
      ),
    [conversations],
  );

  const contactUsers = useMemo(
    () =>
      availableUsers.filter(
        (user) => !existingUserIds.has(user.usuario_id),
      ),
    [availableUsers, existingUserIds],
  );

  const filteredConversations = useMemo(
    () =>
      conversations.filter(
        (conversation) =>
          activeTab === 'all' || conversation.isUnread === true,
      ),
    [conversations, activeTab],
  );

  const totalUnread = useMemo(
    () =>
      conversations.reduce(
        (acc, conversation) => acc + (conversation.unreadCount ?? 0),
        0,
      ),
    [conversations],
  );

  const currentConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeChatId),
    [conversations, activeChatId],
  );

  const isPendingRequest = currentConversation?.estado === 'PENDIENTE';

  const filteredSearchUsers = useMemo(() => {
    const term = searchQuery.toLowerCase();
    return availableUsers.filter((user) =>
      (user.nombre ?? '').toLowerCase().includes(term),
    );
  }, [availableUsers, searchQuery]);

  const filteredContactUsers = useMemo(() => {
    const term = searchQuery.toLowerCase();
    return contactUsers.filter((user) =>
      (user.nombre ?? '').toLowerCase().includes(term),
    );
  }, [contactUsers, searchQuery]);

  // -------------------- Render --------------------

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-[#F8FAFC] p-4 md:p-6 gap-4 overflow-hidden relative">
      {/* Overlays de conexión (HU-02) */}
      {connectionStatus === 'disconnected' && (
        <DisconnectedOverlay onRetry={handleRetryConnection} />
      )}

      {connectionStatus === 'unauthorized' && (
        <UnauthorizedOverlay onLogin={handleGoToLogin} />
      )}

      {/* Modal nuevo chat */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-[#FAFAF9] rounded-2xl shadow-xl w-full max-w-[400px] flex flex-col overflow-hidden relative min-h-[500px]">
            <div className="flex items-center justify-between p-5 pb-2">
              <div className="flex items-center gap-3">
                {modalStep === 2 && (
                  <button
                    onClick={() => {
                      setModalStep(1);
                      setModalError(null);
                      setModalSuccess(null);
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                )}
                <h2 className="text-2xl font-bold text-[#0F172A]">
                  {modalStep === 1
                    ? 'Nuevo chat'
                    : `Mensaje a ${selectedUser?.nombre ?? 'Usuario'}`}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {modalStep === 1 && (
              <>
                <div className="px-5 mb-4">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar contactos..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {availableUsers.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm mt-4">
                      No hay contactos disponibles.
                    </p>
                  ) : (
                    filteredSearchUsers.map((user) => (
                      <div
                        key={user.usuario_id}
                        onClick={() => handleOpenModalForUser(user)}
                        className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-lg shrink-0 uppercase">
                          {getInitials(user.nombre ?? user.correo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-[#0F172A] truncate">
                            {user.nombre ?? user.correo ?? 'Usuario'}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">
                            {user.rol ?? 'Sin rol'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {modalStep === 2 && (
              <div className="flex-1 flex flex-col p-5">
                <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-xl border border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-lg uppercase">
                    {getInitials(selectedUser?.nombre ?? selectedUser?.correo)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0F172A]">
                      {selectedUser?.nombre ?? selectedUser?.correo}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {selectedUser?.rol}
                    </p>
                  </div>
                </div>
                <textarea
                  value={firstMessageText}
                  onChange={(event) =>
                    setFirstMessageText(event.target.value)
                  }
                  placeholder="Escribe tu primer mensaje..."
                  className="flex-1 w-full bg-white border border-gray-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 mb-4 text-sm"
                  disabled={!!modalSuccess}
                />

                {modalError && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg mb-4 border border-red-200 text-center">
                    {modalError}
                  </p>
                )}
                {modalSuccess && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-center border border-green-200 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> {modalSuccess}
                  </div>
                )}

                <button
                  onClick={handleSendFirstMessage}
                  disabled={
                    !firstMessageText.trim() ||
                    isSendingFirstMessage ||
                    !!modalSuccess
                  }
                  className="w-full py-3 bg-[#0F172A] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#1E293B] disabled:opacity-50 transition-colors"
                >
                  {isSendingFirstMessage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {isSendingFirstMessage
                    ? 'Enviando...'
                    : 'Enviar solicitud de chat'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Panel izquierdo */}
      <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0F172A]">Mensajes</h1>
            <button
              onClick={handleOpenNewChatModal}
              className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title="Buscar personas"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          <ConnectionBadge status={connectionStatus} />
        </div>

        <div className="flex px-5 gap-6 border-b border-gray-200 bg-[#FAFAF9]">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 pt-2 text-sm font-bold ${
              activeTab === 'all'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`pb-3 pt-2 text-sm font-bold flex items-center gap-2 ${
              activeTab === 'unread'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500'
            }`}
          >
            No leídos{' '}
            {totalUnread > 0 && (
              <span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">
                {totalUnread}
              </span>
            )}
          </button>
        </div>

        <div className="overflow-y-auto flex-1 bg-white">
          {isLoading ? (
            <div className="flex justify-center p-6 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <>
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setActiveChatId(conversation.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    activeChatId === conversation.id
                      ? 'bg-blue-50/50 border-l-4 border-l-[#0F172A]'
                      : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-lg uppercase shrink-0">
                      {getInitials(conversation.otherUser?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h2
                          className={`text-[15px] truncate ${
                            conversation.isUnread
                              ? 'font-bold text-[#0F172A]'
                              : 'font-semibold text-gray-800'
                          }`}
                        >
                          {conversation.otherUser?.name ?? 'Usuario'}
                        </h2>
                        {(conversation.unreadCount ?? 0) > 0 && (
                          <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate capitalize">
                        {conversation.otherUser?.role ?? 'Rol'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {activeTab === 'all' && contactUsers.length > 0 && (
                <div className="px-4 py-2 text-xs font-bold text-gray-400 bg-gray-50 uppercase tracking-wider mt-2">
                  Personas disponibles
                </div>
              )}

              {activeTab === 'all' &&
                filteredContactUsers.map((user) => (
                  <div
                    key={user.usuario_id}
                    onClick={() => handleOpenModalForUser(user)}
                    className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-lg uppercase shrink-0">
                        {getInitials(user.nombre)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-[15px] font-semibold text-gray-700 truncate">
                          {user.nombre ?? 'Usuario'}
                        </h2>
                        <p className="text-sm text-gray-400 truncate capitalize">
                          {user.rol ?? 'Rol'}
                        </p>
                      </div>
                      <span className="text-gray-300">+</span>
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>

      {/* Panel derecho */}
      <div className="hidden md:flex flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex-col relative overflow-hidden">
        {activeChatId && currentConversation ? (
          <div className="w-full h-full flex flex-col">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-[#FAFAF9]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-lg uppercase">
                  {getInitials(currentConversation.otherUser?.name)}
                </div>
                <div>
                  <h2 className="font-bold text-[#0F172A] text-lg">
                    {currentConversation.otherUser?.name}
                  </h2>
                  <p className="text-sm text-gray-500 capitalize">
                    {currentConversation.otherUser?.role}{' '}
                    {connectionStatus === 'connected' && '· En línea'}
                  </p>
                </div>
              </div>
            </div>

            {/* CA-01 y CA-02: barra amarilla de reconexión */}
            {connectionStatus === 'reconnecting' && (
              <div className="bg-amber-100 text-amber-800 text-sm font-medium px-4 py-2 text-center border-b border-amber-200 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Reconectando... intento {reconnectData.attempt} de{' '}
                {MAX_RECONNECT_ATTEMPTS} · próximo en{' '}
                {reconnectData.delay / 1000} s
              </div>
            )}

            {/* CA-03: barra verde de éxito */}
            {showConnectedBanner && connectionStatus === 'connected' && (
              <div className="bg-green-100 text-green-800 text-sm font-medium px-4 py-2 text-center border-b border-green-200 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Conectado
              </div>
            )}

            <div className="flex-1 bg-[#FAFAF9] p-6 overflow-y-auto flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="text-center mt-10 text-gray-400">
                  No hay mensajes aún.
                </div>
              ) : (
                messages.map((message) => {
                  // ⚠️ Revisá esta comparación: normalmente debería ser
                  // `message.emisor_id === currentUserId`
                  const isMine =
                    message.emisor_id !== currentConversation.otherUser?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isMine ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl ${
                          isMine
                            ? 'bg-[#0F172A] text-white rounded-br-none'
                            : 'bg-white border text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{message.contenido}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              {isPendingRequest ? (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <p className="text-amber-800 font-medium">
                    Esperando a que la otra persona acepte tu solicitud...
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={newMessageText}
                    onChange={(event) =>
                      setNewMessageText(event.target.value)
                    }
                    onKeyDown={(event) =>
                      event.key === 'Enter' && handleSendMessage()
                    }
                    placeholder={
                      connectionStatus === 'connected'
                        ? 'Escribe un mensaje...'
                        : 'Esperando conexión...'
                    }
                    className="w-full bg-gray-100 rounded-xl pl-5 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 disabled:opacity-50"
                    disabled={connectionStatus !== 'connected'}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={
                      !newMessageText.trim() ||
                      connectionStatus !== 'connected'
                    }
                    className="absolute right-2 top-2 p-2 bg-[#0F172A] text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-4 w-full bg-[#FAFAF9]">
            <MessageSquare className="w-16 h-16 text-gray-300" />
            <p className="text-gray-500 text-lg font-medium">Tus mensajes</p>
            <p className="text-gray-400 text-sm max-w-xs text-center">
              Selecciona un contacto de la izquierda para empezar a chatear.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MensajesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center flex justify-center items-center h-screen text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando...
        </div>
      }
    >
      <MensajesContent />
    </Suspense>
  );
}