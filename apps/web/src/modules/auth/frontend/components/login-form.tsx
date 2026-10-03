"use client";


import { useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "../hooks/use-auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  email?: string;
  password?: string;
}

// Íconos en línea para no agregar dependencias nuevas
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
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

const MailIcon = () => (
  <Icon>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Icon>
);
const LockIcon = () => (
  <Icon>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Icon>
);
const EyeIcon = () => (
  <Icon>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);
const EyeOffIcon = () => (
  <Icon>
    <path d="M3 3l18 18" />
    <path d="M10.6 6.1A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.8 9.8 0 0 0 4-.8" />
  </Icon>
);

const fieldWrapper =
  "flex items-center gap-2 rounded-lg bg-[#F3ECDF] px-3 text-[#6B7280] focus-within:ring-2 focus-within:ring-[#F5A24B]";
const fieldInput =
  "w-full bg-transparent py-3 text-sm text-[#1F2A44] outline-none placeholder:text-gray-400";
const labelClass = "block text-[11px] font-bold uppercase tracking-wide text-[#1F2A44]";

export function LoginForm() {
  const { signIn, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = "Ingresa tu correo electrónico";
    else if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Ingresa un correo electrónico válido";
    if (!password) errors.password = "Ingresa tu contraseña";
    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    await signIn({ email: email.trim(), password });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className={labelClass}>
          Correo electrónico institucional o personal
        </label>
        <div className={`${fieldWrapper} ${fieldErrors.email ? "ring-2 ring-[#A35139]" : ""}`}>
          <MailIcon />
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="alumni.sistemas@umss.edu.bo"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            className={fieldInput}
          />
        </div>
        {fieldErrors.email && <p className="text-xs text-[#A35139]">{fieldErrors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className={labelClass}>
            Contraseña
          </label>
        </div>
        <div className={`${fieldWrapper} ${fieldErrors.password ? "ring-2 ring-[#A35139]" : ""}`}>
          <LockIcon />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            className={fieldInput}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="text-[#6B7280] hover:text-[#1F2A44]"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {fieldErrors.password && <p className="text-xs text-[#A35139]">{fieldErrors.password}</p>}
      </div>

      <label className="flex items-center gap-2 text-xs text-[#1F2A44]">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          className="h-4 w-4 accent-[#1F2A44]"
        />
        Recordar mi sesión en este equipo
      </label>

      {error && (
        <p role="alert" className="rounded-lg bg-[#A35139]/10 px-3 py-2 text-sm text-[#A35139]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-[#FFA94D] px-4 py-3 text-sm font-bold text-[#1F2A44] shadow-sm transition hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? "Ingresando..." : "Ingresar al Portal →"}
      </button>
    </form>
  );
}