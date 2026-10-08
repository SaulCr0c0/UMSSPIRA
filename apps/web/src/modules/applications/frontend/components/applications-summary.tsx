import type { ReactNode } from "react";
import type { ApplicationsSummary } from "../services";

interface ApplicationsSummaryProps {
  summary: ApplicationsSummary | null;
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

interface SummaryCardProps {
  label: string;
  value: number | string;
  caption: string;
  icon: ReactNode;
  tone?: "default" | "critical";
  badge?: string;
}

function SummaryCard({ label, value, caption, icon, tone = "default", badge }: SummaryCardProps) {
  const critical = tone === "critical";
  return (
    <article className={`rounded-2xl p-5 shadow-lg ${critical ? "bg-red-50" : "bg-white"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-600">{label}</p>
          {badge && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
              {badge}
            </span>
          )}
        </div>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            critical ? "bg-white/70 text-red-600" : "bg-palladian text-abyssal-blue"
          }`}
        >
          {icon}
        </span>
      </div>
      <p className={`mt-3 font-display text-4xl font-bold ${critical ? "text-red-600" : "text-abyssal-blue"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-gray-600">{caption}</p>
    </article>
  );
}

export function ApplicationsSummaryCards({ summary }: ApplicationsSummaryProps) {
  const value = (amount: number | undefined) => (amount === undefined ? "—" : amount);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        label="Pendientes de revisión"
        value={value(summary?.pending)}
        caption="expedientes"
        icon={
          <Icon>
            <rect x="6" y="4" width="12" height="17" rx="2" />
            <path d="M9 4h6v3H9z" />
          </Icon>
        }
      />
      <SummaryCard
        label="Con observaciones"
        value={value(summary?.observed)}
        caption="en subsanación"
        icon={
          <Icon>
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
          </Icon>
        }
      />
      <SummaryCard
        label="Aprobadas hoy"
        value={value(summary?.approvedToday)}
        caption="Actas selladas digitalmente"
        icon={
          <Icon>
            <circle cx="12" cy="12" r="9" />
            <path d="m8 12 3 3 5-6" />
          </Icon>
        }
      />
      <SummaryCard
        label="Críticas +48 horas"
        value={value(summary?.critical)}
        caption="plazo excedido"
        tone="critical"
        badge="Urgente"
        icon={
          <Icon>
            <path d="M12 3 2 20h20L12 3Z" />
            <path d="M12 10v5M12 18h.01" />
          </Icon>
        }
      />
    </div>
  );
}