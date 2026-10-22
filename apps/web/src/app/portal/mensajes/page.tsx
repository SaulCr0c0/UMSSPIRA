'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Loader2, WifiOff, CheckCircle2, RefreshCw, Lock } from 'lucide-react';
import { getChatSocket, disconnectChatSocket } from '@/shared/services/chat-socket';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'unauthorized';

export default function MensajesPage() {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [attempt, setAttempt] = useState(0);
  const unauthorizedRef = useRef(false);

  // CA-05: el botón «Reintentar» abre una nueva conexión
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    const socket = getChatSocket();
    unauthorizedRef.current = false;
    setStatus('connecting'); // CA-03

    const onConnect = () => setStatus('connected'); // CA-04
    const onUnauthorized = () => {
      // CA-02: el servidor no me deja entrar por sesión no válida o vencida
      unauthorizedRef.current = true;
      setStatus('unauthorized');
    };
    const onConnectError = () => {
      if (!unauthorizedRef.current) setStatus('disconnected'); // CA-05
    };
    const onDisconnect = () => {
      if (!unauthorizedRef.current) setStatus('disconnected'); // CA-05
    };

    socket.on('connect', onConnect);
    socket.on('chat:unauthorized', onUnauthorized);
    socket.on('connect_error', onConnectError);
    socket.on('disconnect', onDisconnect);

    // CA-01: iniciamos la conexión
    socket.connect();

    // CA-06: al salir de la página o antes de reintentar, se cierra la conexión
    return () => {
      socket.off('connect', onConnect);
      socket.off('chat:unauthorized', onUnauthorized);
      socket.off('connect_error', onConnectError);
      socket.off('disconnect', onDisconnect);
      disconnectChatSocket();
    };
  }, [attempt]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
          <MessageSquare className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900">Mensajes</h1>

        {/* CA-02, CA-03, CA-04, CA-05: indicadores visuales */}
        <div
          className="flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-100 text-sm font-medium"
          role="status"
          aria-live="polite"
        >
          {status === 'connecting' && (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span className="text-amber-700">Conectando...</span>
            </>
          )}
          {status === 'connected' && (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-green-700">Conectado</span>
            </>
          )}
          {status === 'unauthorized' && (
            <>
              <Lock className="w-4 h-4 text-red-600" />
              <span className="text-red-700">Sesión no válida</span>
            </>
          )}
          {status === 'disconnected' && (
            <>
              <WifiOff className="w-4 h-4 text-red-600" />
              <span className="text-red-700">Desconectado</span>
            </>
          )}
        </div>

        {/* CA-02: sesión no válida, se pide iniciar sesión */}
        {status === 'unauthorized' && (
          <>
            <p className="text-slate-500 max-w-md">
              Tu sesión expiró o no es válida. Inicia sesión nuevamente.
            </p>
            <Link
              href="/login"
              className="flex items-center space-x-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <span>Ir a inicio de sesión</span>
            </Link>
          </>
        )}

        {/* CA-05: botón de reintentar si no se pudo conectar */}
        {status === 'disconnected' && (
          <button
            type="button"
            onClick={retry}
            className="flex items-center space-x-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar</span>
          </button>
        )}

        <p className="text-slate-500 max-w-md">
          Aquí aparecerá tu bandeja de entrada. (Las siguientes historias se encargarán de listar las conversaciones).
        </p>
      </div>
    </div>
  );
}