'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { sendChatMessage } from '@/shared/services/chat-message.service';
import {
  getConversationMessages,
  type ChatMessage,
  type ConversationSummary,
} from '@/shared/services/chat-conversation.service';
import { formatChatTime, getInitials } from '../utils/format';

interface Props {
  conversation: ConversationSummary;
  onBack: () => void;
}

export const ConversationPanel = ({ conversation, onBack }: Props) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const sendingRef = useRef(false);
  const requestVersionRef = useRef(0);

  const { otherUser } = conversation;

  useEffect(() => {
    const version = ++requestVersionRef.current;

    setMessages([]);
    setLoading(true);
    setError(null);
    setDraft('');
    setSending(false);
    setSendError(null);
    sendingRef.current = false;

    getConversationMessages(conversation.id)
      .then((data) => {
        if (requestVersionRef.current === version) {
          setMessages(data);
        }
      })
      .catch((err: unknown) => {
        if (requestVersionRef.current === version) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudieron cargar los mensajes',
          );
        }
      })
      .finally(() => {
        if (requestVersionRef.current === version) {
          setLoading(false);
        }
      });

    return () => {
      requestVersionRef.current++;
    };
  }, [conversation.id]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const content = draft.trim();

    if (!content || sendingRef.current || loading || error) {
      return;
    }

    const version = requestVersionRef.current;
    const conversationId = conversation.id;

    sendingRef.current = true;
    setSending(true);
    setSendError(null);

    try {
      const result = await sendChatMessage({
        conversationId,
        content,
      });

      if (requestVersionRef.current !== version) return;

      if (!result.success) {
        setSendError(result.error ?? 'No se pudo enviar el mensaje');
        return;
      }

      setDraft('');

      try {
        const updatedMessages =
          await getConversationMessages(conversationId);

        if (requestVersionRef.current === version) {
          setMessages(updatedMessages);
        }
      } catch {
        if (requestVersionRef.current === version) {
          setSendError(
            'El mensaje se envió, pero no se pudo actualizar el historial. Abre nuevamente la conversación.',
          );
        }
      }
    } catch {
      if (requestVersionRef.current === version) {
        setSendError(
          'No se pudo confirmar el envío. Revisa la conversación antes de reintentar.',
        );
      }
    } finally {
      if (requestVersionRef.current === version) {
        sendingRef.current = false;
        setSending(false);
      }
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver a mis conversaciones"
          className="rounded-lg p-2 text-slate-600 md:hidden"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>

        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-xs font-semibold text-white">
          {getInitials(otherUser.name)}
        </span>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {otherUser.name}
          </p>
          <p className="text-xs capitalize text-slate-500">
            {otherUser.role}
          </p>
        </div>
      </header>

      <div
        aria-label="Historial de mensajes"
        aria-busy={loading}
        className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4"
      >
        {loading && (
          <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            />
            Cargando mensajes...
          </div>
        )}

        {error && (
          <p role="alert" className="text-center text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && messages.length === 0 && (
          <p className="text-center text-sm text-slate-500">
            Aún no hay mensajes. Inicia la conversación.
          </p>
        )}

        {messages.map((message) => {
          const mine = message.emisor_id !== otherUser.id;

          return (
            <div
              key={message.id}
              className={`flex ${
                mine ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  mine
                    ? 'bg-[#0F172A] text-white'
                    : 'border border-slate-200 bg-white text-slate-800'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">
                  {message.contenido}
                </p>

                <p
                  className={`mt-1 text-[10px] ${
                    mine ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >



                  {message.fecha_mensaje
                    ? new Date(message.fecha_mensaje).toLocaleString('es-BO', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })
                    : 'Sin fecha'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={handleSend}
        className="shrink-0 border-t border-slate-200 bg-white p-4"
      >
        {sendError && (
          <p role="alert" className="mb-2 text-sm text-red-700">
            {sendError}
          </p>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            aria-label="Escribir mensaje"
            placeholder="Escribe un mensaje..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={sending || loading || Boolean(error)}
            className="min-h-11 min-w-0 flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60"
          />

          <button
            type="submit"
            aria-label={sending ? 'Enviando mensaje' : 'Enviar mensaje'}
            disabled={
              sending || loading || Boolean(error) || !draft.trim()
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F172A] text-white transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <Loader2
                className="h-5 w-5 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Send className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};