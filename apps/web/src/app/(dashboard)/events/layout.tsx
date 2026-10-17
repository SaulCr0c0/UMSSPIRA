import type { ReactNode } from 'react';
import './events.css';

export default function EventsLayout({ children }: { children: ReactNode }) {
  return <div className="events-app">{children}</div>;
}
