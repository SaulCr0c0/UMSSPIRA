'use client';

import Link from 'next/link';
import { Info, Ticket } from 'lucide-react';

export default function MyQrPassesPage() {
  return (
    <main className="qr-passes-page">
      <div className="qr-passes-container">
        <nav className="qr-passes-tabs" aria-label="Navegación de eventos">
          <Link href="/events/catalog">Explorar</Link>
          <span>Mis eventos</span>
          <Link href="/events/catalog/passes" aria-current="page" className="active">
            Mis pases
          </Link>
        </nav>

        <header className="qr-passes-heading">
          <div className="qr-passes-heading-icon">
            <Ticket size={24} />
          </div>
          <h1>Mis pases QR</h1>
          <p>
            Tus credenciales digitales aparecerán aquí cuando tengas
            inscripciones confirmadas.
          </p>
        </header>

        <section className="qr-passes-empty">
          <Info size={44} strokeWidth={1.5} aria-hidden="true" />

          <h2>Todavía no tienes pases QR</h2>

          <p>
            Inscríbete a un evento disponible para obtener
            automáticamente tu pase digital.
          </p>

          <Link href="/events/catalog" className="qr-passes-button">
            Explorar eventos
          </Link>
        </section>
      </div>
    </main>
  );
}