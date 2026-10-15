'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { EventItem } from '@umsspira/shared-types';

import { ApiClientError } from '@/shared/services/api-client';
import { getPublishedEvent } from '@/shared/services/events-service';
import { formatPeopleCount } from '@/shared/utils/event-copy';
import { formatEventDateTime } from '@/shared/utils/event-date-time';

interface EventDetailPageProps {
  params: { id: string };
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = params;
  const isValidId = UUID_PATTERN.test(id);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState(isValidId);
  const [errorState, setErrorState] = useState<'invalid' | 'not-found' | 'unavailable' | null>(
    isValidId ? null : 'invalid',
  );

  const loadEvent = useCallback(async () => {
    if (!isValidId) return;

    setIsLoading(true);
    setErrorState(null);

    try {
      setEvent(await getPublishedEvent(id));
    } catch (error) {
      setEvent(null);
      setErrorState(
        error instanceof ApiClientError && error.status === 404
          ? 'not-found'
          : 'unavailable',
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, isValidId]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  if (isLoading) {
    return (
      <main className="hu2-detail-page">
        <p className="hu2-detail-loading" role="status">
          Cargando evento...
        </p>
      </main>
    );
  }

  if (errorState || !event) {
    const message = errorState === 'invalid'
      ? 'El identificador del evento no es válido.'
      : errorState === 'not-found'
        ? 'El evento no fue encontrado o ya no está disponible.'
        : 'No se pudo cargar el evento en este momento.';

    return (
      <main className="hu2-detail-page">
        <section className="hu2-detail-unavailable">
          <h1>Evento no disponible</h1>
          <p role="alert">{message}</p>
          <div>
            <Link
              href="/events/catalog"
              className="hu2-primary-action"
            >
              Regresar al catálogo
            </Link>
            {errorState === 'unavailable' ? (
              <button
                type="button"
                onClick={() => void loadEvent()}
                className="hu2-secondary-action"
              >
                Reintentar
              </button>
            ) : null}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="hu2-detail-page">
      <div className="hu2-detail-shell">
        <Link
          href="/events/catalog"
          className="hu2-back-link"
        >
          ← Regresar al catálogo
        </Link>

        <div className="hu2-detail-grid">
          <article className="hu2-detail-hero">
            <header
              className={`hu2-detail-cover ${event.imageUrl ? 'has-image' : ''}`}
              style={event.imageUrl ? {
                backgroundImage: `linear-gradient(90deg, rgba(22, 32, 44, .46), rgba(22, 32, 44, .1)), url("${event.imageUrl}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : undefined}
            >
              <span className="hu2-cover-accent" aria-hidden="true" />
              <span className="hu2-cover-circle hu2-cover-circle-large" aria-hidden="true" />
              <span className="hu2-cover-circle hu2-cover-circle-small" aria-hidden="true" />
              <p>Evento universitario</p>
              <strong>{event.title.toLocaleUpperCase('es')}</strong>
              <span className="hu2-detail-status">{event.status}</span>
            </header>
            <div className="hu2-detail-hero-copy">
              <h1 className="min-w-0 max-w-full break-words">
                {event.title}
              </h1>
            </div>
          </article>

          <aside className="hu2-detail-info">
            <h2>Información del evento</h2>
            <dl>
              <div><dt>Inicio</dt><dd>{formatEventDateTime(event.startDate)}</dd></div>
              <div><dt>Fin</dt><dd>{formatEventDateTime(event.endDate)}</dd></div>
              <div><dt>Ubicación</dt><dd>{event.location || 'Por definir'}</dd></div>
              <div><dt>Cupo máximo</dt><dd>{formatPeopleCount(event.maxCapacity)}</dd></div>
              <div><dt>Organiza</dt><dd>UMSSPIRA</dd></div>
            </dl>
          </aside>
        </div>

        <section className="hu2-detail-description">
          <h2>Descripción</h2>
          <p>{event.description || 'Sin descripción disponible.'}</p>
        </section>
      </div>
    </main>
  );
}
