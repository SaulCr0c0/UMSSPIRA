// apps/web/src/app/portal/mensajes/page.tsx
'use client';

import { Suspense, useState } from 'react';
import { Loader2 } from 'lucide-react';

type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'unauthorized';

function MensajesContent() {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [reconnectData, setReconnectData] = useState({ attempt: 0, delay: 0 });
  const [showConnectedBanner, setShowConnectedBanner] = useState(false);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-[#F8FAFC] p-4 md:p-6 gap-4 overflow-hidden relative">
      <p className="text-gray-500">Estado: {status}</p>
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