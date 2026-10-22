// apps/web/src/features/chat/components/StartChatButton.tsx
'use client';

interface Props {
  targetUserId: string;
  targetName?: string;
  className?: string;
}

export const StartChatButton = ({ targetUserId, targetName, className }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className={
          className ??
          'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F172A] text-white text-sm font-medium hover:bg-[#1E293B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        }
      >
        Enviar mensaje
      </button>
    </div>
  );
};