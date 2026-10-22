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
      setTimeout(() => setShowConnectedBanner(false), 3000); // Ocultar banner verde a los 3s
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
      
      {/* ================= MODALES DE LA HU-02 ================= */}

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
                  {sendingFirstMsg ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {sendingFirstMsg ? 'Enviando...' : 'Enviar solicitud de chat'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PANEL IZQUIERDO */}
      <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0F172A]">Mensajes</h1>
            <button onClick={() => { setIsModalOpen(true); setModalStep(1); setFirstMessage(''); setModalError(null); setModalSuccess(null); }} className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Buscar personas">
              <Search className="w-5 h-5" />
            </button>
          </div>
          
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

              {activeTab === 'all' && contactUsers.length > 0 && (
                <div className="px-4 py-2 text-xs font-bold text-gray-400 bg-gray-50 uppercase tracking-wider mt-2">Personas disponibles</div>
              )}
              
              {activeTab === 'all' && contactUsers.filter(u => (u.nombre || '').toLowerCase().includes(searchQuery.toLowerCase())).map(user => (
                <div key={user.usuario_id} onClick={() => openModalForUser(user)} className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-lg uppercase shrink-0">{user.nombre?.substring(0, 2) || 'U'}</div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-[15px] font-semibold text-gray-700 truncate">{user.nombre || 'Usuario'}</h2>
                      <p className="text-sm text-gray-400 truncate capitalize">{user.rol || 'Rol'}</p>
                    </div>
                    <span className="text-gray-300">+</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div className="hidden md:flex flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex-col relative overflow-hidden">
        {activeChat && currentConversation ? (
          <div className="w-full h-full flex flex-col">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-[#FAFAF9]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-lg uppercase">{currentConversation.otherUser?.name?.substring(0, 2) || 'U'}</div>
                <div>
                  <h2 className="font-bold text-[#0F172A] text-lg">{currentConversation.otherUser?.name}</h2>
                  <p className="text-sm text-gray-500 capitalize">{currentConversation.otherUser?.role} {status === 'connected' && '· En línea'}</p>
                </div>
              </div>
            </div>

            {/* CA-01 y CA-02: BARRA AMARILLA DE RECONEXIÓN */}
            {status === 'reconnecting' && (
              <div className="bg-amber-100 text-amber-800 text-sm font-medium px-4 py-2 text-center border-b border-amber-200 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Reconectando... intento {reconnectData.attempt} de 3 · próximo en {reconnectData.delay / 1000} s
              </div>
            )}

            {/* CA-03: BARRA VERDE DE ÉXITO */}
            {showConnectedBanner && status === 'connected' && (
              <div className="bg-green-100 text-green-800 text-sm font-medium px-4 py-2 text-center border-b border-green-200 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Conectado
              </div>
            )}
            
            <div className="flex-1 bg-[#FAFAF9] p-6 overflow-y-auto flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="text-center mt-10 text-gray-400">No hay mensajes aún.</div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.emisor_id !== currentConversation.otherUser.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-2xl ${isMine ? 'bg-[#0F172A] text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none'}`}>
                        <p className="text-sm">{msg.contenido}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              {isPending ? (
                 <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <p className="text-amber-800 font-medium">Esperando a que la otra persona acepte tu solicitud...</p>
                 </div>
              ) : (
                <div className="relative">
                  <input 
                    type="text" 
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={status === 'connected' ? "Escribe un mensaje..." : "Esperando conexión..."}
                    className="w-full bg-gray-100 rounded-xl pl-5 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 disabled:opacity-50"
                    disabled={status !== 'connected'} 
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!newMessageText.trim() || status !== 'connected'}
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
             <p className="text-gray-400 text-sm max-w-xs text-center">Selecciona un contacto de la izquierda para empezar a chatear.</p>
          </div>
        )}
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