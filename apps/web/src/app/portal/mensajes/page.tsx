// apps/web/src/app/portal/mensajes/page.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Loader2,
  WifiOff,
  CheckCircle2,
  RefreshCw,
  Lock,
  Sparkles,
} from 'lucide-react';
import { getChatSocket, disconnectChatSocket } from '@/shared/services/chat-socket';

type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'unauthorized';

export default function MensajesPage() {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [attempt, setAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const unauthorizedRef = useRef(false);

  // CA-05: el botón «Reintentar» abre una nueva conexión
  const retry = useCallback(() => {
    setIsRetrying(true);
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    const socket = getChatSocket();
    unauthorizedRef.current = false;
    setStatus('connecting'); // CA-03

    const onConnect = () => {
      setStatus('connected'); // CA-04
      setIsRetrying(false);
    };

    const onUnauthorized = () => {
      // CA-02: el servidor no me deja entrar por sesión no válida o vencida
      unauthorizedRef.current = true;
      setStatus('unauthorized');
      setIsRetrying(false);
    };

    const onConnectError = () => {
      if (!unauthorizedRef.current) setStatus('disconnected'); // CA-05
      setIsRetrying(false);
    };

    const onDisconnect = () => {
      if (!unauthorizedRef.current) setStatus('disconnected'); // CA-05
    };

    // Extra: feedback visual mientras el servidor intenta reconectar
    const onReconnectAttempt = () => {
      if (!unauthorizedRef.current) setStatus('reconnecting');
    };

    socket.on('connect', onConnect);
    socket.on('chat:unauthorized', onUnauthorized);
    socket.on('connect_error', onConnectError);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnect_attempt', onReconnectAttempt);

    // CA-01: iniciamos la conexión
    socket.connect();

    // CA-06: al salir de la página o antes de reintentar, se cierra la conexión
    return () => {
      socket.off('connect', onConnect);
      socket.off('chat:unauthorized', onUnauthorized);
      socket.off('connect_error', onConnectError);
      socket.off('disconnect', onDisconnect);
      socket.off('reconnect_attempt', onReconnectAttempt);
      disconnectChatSocket();
    };
  }, [attempt]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center">

        {/* Ícono principal */}
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
          <MessageSquare className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Mensajes</h1>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Beta — en construcción
          </p>
        </div>

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
          {status === 'reconnecting' && (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span className="text-amber-700">Reconectando...</span>
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
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={retry}
              disabled={isRetrying}
              aria-label="Reintentar conexión con el servidor de chat"
              className="flex items-center space-x-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isRetrying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>{isRetrying ? 'Reintentando...' : 'Reintentar'}</span>
            </button>
            {attempt > 0 && (
              <p className="text-xs text-slate-400">
                Intento #{attempt}
              </p>
            )}
          </div>
        )}

        <p className="text-slate-500 max-w-md">
          Aquí aparecerá tu bandeja de entrada. (Las siguientes historias se encargarán de listar las conversaciones).
        </p>

        {/* Checklist para el equipo: deja claro qué falta */}
        <ul className="text-xs text-slate-400 space-y-1 mt-4">
          <li>• Listado de conversaciones — pendiente</li>
          <li>• Panel de chat con historial — pendiente</li>
          <li>• Modal de nuevo chat — pendiente</li>
        </ul>

      </div>
    </div>
  );
}