import type { ReactNode } from "react";

/* ---------- Botones (doc oficial: 44px de alto, radio 8px, texto 14px) ---------- */
const btnBase =
  "inline-flex h-11 items-center justify-center rounded-lg px-6 text-[14px] leading-5 transition disabled:cursor-not-allowed disabled:opacity-50";

// Primario: Blue Fantastic, texto blanco
export const btnPrimary = `${btnBase} bg-[#2C3B4D] font-bold text-white`;
// Primario con acento: Burning Flame, texto #1B2632
export const btnAccent = `${btnBase} bg-[#FFB162] font-bold text-[#1B2632]`;
// Acción destructiva (Rechazar): Truffle Trouble, como en el diseño de Figma
export const btnDanger = `${btnBase} bg-[#A35139] font-bold text-white`;
// Secundario: Palladian, borde 1px Oatmeal, texto #1B2632
export const btnSecondary = `${btnBase} border border-[#C9C1B1] bg-[#EEE9DF] font-semibold text-[#1B2632]`;

/* ---------- Inputs (reposo, foco y error según la matriz de estados) ---------- */
export function fieldClass(invalid: boolean) {
  const base =
    "w-full rounded-lg p-3 text-[14px] leading-5 text-[#1B2632] outline-none placeholder:text-gray-500 disabled:opacity-60";
  return invalid
    ? `${base} border-2 border-[#A35139] bg-[#EEE9DF]`
    : `${base} border border-[#C9C1B1] bg-[#EEE9DF] focus:border-2 focus:border-[#2C3B4D] focus:bg-white`;
}

type FieldLabelProps = {
  htmlFor: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
};

// Label 13px SemiBold; asterisco en Truffle Trouble si es obligatorio
export function FieldLabel({
  htmlFor,
  required,
  optional,
  children,
}: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[13px] font-semibold text-[#1B2632]"
    >
      {children}
      {required && <span className="text-[#A35139]"> *</span>}
      {optional && <span className="font-medium"> (Opcional)</span>}
    </label>
  );
}

// Mensaje de error: 11px Medium, #A35139
export function FieldError({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 text-[11px] font-medium leading-4 text-[#A35139]">
      {children}
    </p>
  );
}

// Texto de ayuda: 11px Medium, gris
export function FieldHint({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 text-[11px] font-medium leading-4 text-[#2C3B4D]">
      {children}
    </p>
  );
}

/* ---------- Caja informativa ---------- */
export function InfoBox({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "danger";
  children: ReactNode;
}) {
  const styles =
    tone === "danger"
      ? "border-[#A35139] bg-[#A35139]/10 font-semibold text-[#A35139]"
      : "border-[#C9C1B1] bg-[#EEE9DF] text-[#1B2632]";
  return (
    <div
      className={`rounded-lg border p-3 text-[14px] leading-5 ${styles}`}
    >
      {children}
    </div>
  );
}

/* ---------- Checkbox con texto ---------- */
type CheckboxRowProps = {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  invalid?: boolean;
  children: ReactNode;
};

export function CheckboxRow({
  id,
  checked,
  onChange,
  disabled,
  invalid,
  children,
}: CheckboxRowProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className={`flex cursor-pointer items-start gap-3 rounded-lg bg-[#EEE9DF] p-3 text-[13px] leading-5 text-[#1B2632] ${
          invalid ? "border-2 border-[#A35139]" : "border border-[#C9C1B1]"
        }`}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#2C3B4D]"
        />
        <span>{children}</span>
      </label>
    </div>
  );
}

/* ---------- Cáscara común de los 3 modales ---------- */
type ModalShellProps = {
  titleId: string;
  title: string;
  subtitle?: string;
  badge?: string;
  onClose: () => void;
  children: ReactNode;
};

export function ModalShell({
  titleId,
  title,
  subtitle,
  badge,
  onClose,
  children,
}: ModalShellProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B2632]/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="max-h-full w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {badge && (
              <span className="inline-block rounded bg-[#1B2632] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                {badge}
              </span>
            )}
            <h2
              id={titleId}
              className="text-[24px] font-semibold leading-8 text-[#1B2632]"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="font-mono text-[12px] font-medium leading-4 text-[#2C3B4D]">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded px-2 text-[24px] leading-none text-[#2C3B4D] hover:bg-[#EEE9DF]"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}