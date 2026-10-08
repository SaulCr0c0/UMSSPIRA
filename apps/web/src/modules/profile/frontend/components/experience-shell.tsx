import Link from "next/link";
import Image from "next/image";
import { Bell } from "lucide-react";
import type { ReactNode } from "react";

export function ExperienceShell({
  children,
  activeTab = "experiencia",
}: {
  children: ReactNode;
  activeTab?: "experiencia" | "seguimiento";
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#eee9df] text-[#202a3b]">
      <header className="border-b border-[#e4dfd6] bg-white">
        <div className="mx-auto flex min-h-[58px] max-w-[1180px] items-center justify-between gap-4 px-5">
          <Link href="/profile/experience" className="flex shrink-0 items-center gap-2">
            <Image
              alt="Escudo de la Universidad Mayor de San Simón"
              className="h-10 w-10 object-contain"
              height={567}
              priority
              src="/images/umss-logo.png"
              width={567}
            />
            <span className="leading-tight">
              <span className="block text-[12px] font-bold">UMSS</span>
              <span className="block text-[10px] text-slate-500">Vinculación Laboral</span>
            </span>
          </Link>

          <nav aria-label="Navegación principal" className="hidden items-center gap-7 text-xs md:flex">
            <Link className="text-slate-600 hover:text-[#1f2a44]" href="/profile/experience">Inicio</Link>
            <Link className="text-slate-600 hover:text-[#1f2a44]" href="/job-postings">Vacantes</Link>
            <Link className="text-slate-600 hover:text-[#1f2a44]" href="/profile/experience">Mis postulaciones</Link>
            <Link className="border-b-2 border-[#d58b43] py-5 font-semibold text-[#1f2a44]" href="/profile/experience">Perfil</Link>
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <button aria-label="Notificaciones" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
              <Bell size={15} />
            </button>
            <div className="text-right leading-tight">
              <span className="block text-[11px] font-semibold">Carlos Rojas</span>
              <span className="block text-[10px] text-slate-500">Egresado</span>
            </div>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8eee8] text-[10px] font-bold text-[#ba3434]">
              CR
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1180px] flex-1 px-5 pb-10 pt-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <Link href="/profile/experience" className="font-semibold text-[#1f2a44]">
              Vinculación Laboral
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500">Egresado</span>
          </div>
          <div className="flex items-center gap-5 border-b border-[#d9d2c8] text-xs">
            <Link
              href="/profile/experience"
              className={`flex items-center gap-2 border-b-2 px-1 pb-2 ${
                activeTab === "experiencia"
                  ? "border-[#d58b43] font-semibold text-[#1f2a44]"
                  : "border-transparent text-slate-500"
              }`}
            >
              Perfil de Vinculación
            </Link>
            <Link
              href="/profile/experience"
              className={`flex items-center gap-2 border-b-2 px-1 pb-2 ${
                activeTab === "seguimiento"
                  ? "border-[#d58b43] font-semibold text-[#1f2a44]"
                  : "border-transparent text-slate-500"
              }`}
            >
              Seguimiento
            </Link>
          </div>
        </div>

        {children}
      </div>

      <footer className="mt-auto border-t border-[#e1dcd3] bg-white py-3 text-center text-[10px] text-slate-500">
        Universidad Mayor de San Simón | UMSS Vinculación Laboral
      </footer>
    </div>
  );
}
