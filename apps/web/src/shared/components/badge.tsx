import type { HTMLAttributes } from "react";

export type RequestStatus = "pending" | "observed" | "approved" | "rejected";

type BadgeVariant = RequestStatus | "neutral" | "alert";

const BASE_CLASSES =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5 whitespace-nowrap";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  pending:
    "border-yellow-300 bg-yellow-100 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200",
  observed:
    "border-orange-300 bg-orange-100 text-orange-900 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-200",
  approved:
    "border-green-300 bg-green-100 text-green-900 dark:border-green-700 dark:bg-green-950 dark:text-green-200",
  rejected:
    "border-red-300 bg-red-100 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200",
  neutral:
    "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200",
  alert: "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-500",
};

function joinClasses(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={joinClasses(BASE_CLASSES, VARIANT_CLASSES[variant], className)}
      {...props}
    />
  );
}

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "Pendiente",
  observed: "Observado",
  approved: "Aprobado",
  rejected: "Rechazado",
};

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: RequestStatus;
}

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
  return (
    <Badge variant={status} {...props}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

const HOUR_IN_MS = 60 * 60 * 1000;

interface AgeBadgeProps extends Omit<BadgeProps, "variant"> {
  submittedAt: Date | string;
  thresholdHours?: number;
  now?: Date;
}

export function AgeBadge({
  submittedAt,
  thresholdHours = 48,
  now = new Date(),
  ...props
}: AgeBadgeProps) {
  const elapsedHours = Math.max(
    0,
    Math.floor((now.getTime() - new Date(submittedAt).getTime()) / HOUR_IN_MS),
  );
  const isOverdue = elapsedHours >= thresholdHours;

  const label = isOverdue
    ? `Más de ${thresholdHours} h`
    : elapsedHours < 1
      ? "Menos de 1 h"
      : `${elapsedHours} h`;

  return (
    <Badge
      variant={isOverdue ? "alert" : "neutral"}
      aria-label={
        isOverdue
          ? `Sin dictamen hace más de ${thresholdHours} horas`
          : `Enviada hace ${label}`
      }
      {...props}
    >
      {label}
    </Badge>
  );
}
