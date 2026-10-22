import type { BoardMetrics } from '@/modules/applications/frontend/services/applications-board.service';

interface RequestsMetricsProps {
  metrics: BoardMetrics | null;
  isLoading: boolean;
}

const METRICS: { key: keyof BoardMetrics; label: string; description: string }[] = [
  { key: 'receivedToday', label: 'Recibidas hoy', description: 'Registradas hoy en Bolivia' },
  { key: 'pending', label: 'Pendientes', description: 'Solicitudes por revisar' },
  { key: 'urgent', label: 'Urgentes (más de 48 h)', description: 'Pendientes con más de 48 horas' },
  { key: 'resolvedToday', label: 'Resueltas hoy', description: 'Dictaminadas hoy en Bolivia' },
];

export function RequestsMetrics({ metrics, isLoading }: RequestsMetricsProps) {
  return (
    <section aria-label="Indicadores de solicitudes" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {METRICS.map(({ key, label, description }) => (
        <article key={key} className="rounded-2xl border border-oatmeal bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-abyssal-blue/70">{label}</p>
          <p aria-live="polite" className="mt-2 text-3xl font-bold tabular-nums text-abyssal-blue">
            {isLoading && metrics === null ? '…' : (metrics?.[key] ?? '—')}
          </p>
          <p className="mt-1 text-xs text-abyssal-blue/60">{description}</p>
        </article>
      ))}
    </section>
  );
}
