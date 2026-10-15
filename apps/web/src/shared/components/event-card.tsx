import type { EventItem } from '@umsspira/shared-types';
import Link from 'next/link';
import { formatEventCardSchedule } from '@/shared/utils/event-date-time';

export interface EventCardProps {
  event: EventItem;
}

export function EventCard({ event }: EventCardProps) {
  const eventSchedule = formatEventCardSchedule(
    event.startDate,
    event.endDate,
  );

  return (
    <article className="hu2-event-card">
      <header
        className={`hu2-event-cover ${event.imageUrl ? 'has-image' : ''}`}
        style={event.imageUrl ? {
          backgroundImage: `linear-gradient(90deg, rgba(22, 32, 44, .46), rgba(22, 32, 44, .1)), url("${event.imageUrl}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <span
          aria-hidden="true"
          className="hu2-cover-accent"
        />
        <span
          aria-hidden="true"
          className="hu2-cover-circle hu2-cover-circle-large"
        />
        <span
          aria-hidden="true"
          className="hu2-cover-circle hu2-cover-circle-small"
        />
        <span
          aria-hidden="true"
          className="hu2-cover-dot"
        />

        <div className="hu2-cover-copy">
          <p>
            Evento universitario
          </p>
          <h2>
            {event.title}
          </h2>
        </div>
      </header>

      <div className="hu2-event-card-body">
        <h3>
          {event.title}
        </h3>

        {event.description ? (
          <p className="hu2-event-description">
            {event.description}
          </p>
        ) : null}

        <div className="hu2-event-meta">
          <p className="hu2-event-schedule">
            {eventSchedule}
          </p>
          <p className="break-words">
            {event.location === null
              ? 'Ubicación no especificada'
              : `Ubicación: ${event.location}`}
          </p>
          <p>Cupo máximo: {event.maxCapacity}</p>
        </div>

        <div className="hu2-event-card-actions">
          <Link
            href={`/events/catalog/${event.id}`}
            className="hu2-detail-link"
          >
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  );
}

export default EventCard;
