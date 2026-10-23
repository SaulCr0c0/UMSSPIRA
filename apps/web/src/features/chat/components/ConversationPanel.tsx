// apps/web/src/features/chat/components/ConversationPanel.tsx
'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
  const { otherUser } = conversation;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getConversationMessages(conversation.id)
      .then((data) => {
        if (active) setMessages(data);
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar los mensajes');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [conversation.id]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver a mis conversaciones"
          className="md:hidden p-1 text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="w-9 h-9 rounded-full bg-[#0F172A] text-white text-xs font-semibold flex items-center justify-center">
          {getInitials(otherUser.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{otherUser.name}</p>
          <p className="text-xs text-slate-500 capitalize">{otherUser.role}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading && (
          <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando mensajes...
          </div>
        )}

        {error && <p className="text-sm text-red-700 text-center">{error}</p>}

        {!loading && !error && messages.length === 0 && (
          <p className="text-sm text-slate-500 text-center">
            Aún no hay mensajes. Inicia la conversación.
          </p>
        )}

        {messages.map((message) => {
          // Si no lo escribió la otra persona, lo escribí yo
          const mine = message.emisor_id !== otherUser.id;
          return (
            <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  mine
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-white border border-slate-200 text-slate-800'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.contenido}</p>
                <p className={`mt-1 text-[10px] ${mine ? 'text-slate-300' : 'text-slate-400'}`}>
                  {formatChatTime(message.fecha_mensaje)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};