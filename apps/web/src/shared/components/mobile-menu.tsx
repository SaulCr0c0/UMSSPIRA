'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Briefcase, Award, Calendar, User } from 'lucide-react';

const links = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/empleos', label: 'Empleos', icon: Briefcase },
  { href: '/mentorias', label: 'Mentorías', icon: Award },
  { href: '/eventos', label: 'Eventos', icon: Calendar },
  { href: '/profile', label: 'Perfil', icon: User },
];

export const MobileMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  // Cerrar al cambiar de página
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Cerrar con Escape y bloquear el scroll de fondo mientras está abierto
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="md:hidden">
      {/* Botón hamburguesa */}
      <button
        type="button"
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="mobile-drawer"
        onClick={() => setOpen(true)}
        className="h-11 w-11 flex items-center justify-center rounded-lg text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFB162]"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Fondo oscuro: clic afuera cierra */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Panel lateral */}
      <aside
        id="mobile-drawer"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 flex h-full w-72 max-w-[85%] flex-col bg-[#0F172A] shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-700/60 px-4">
          <span className="font-serif text-lg font-bold text-white">
            UMSS<span className="text-[#FFB162]">PIRA</span>
          </span>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="h-11 w-11 flex items-center justify-center rounded-lg text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFB162]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Menú móvil">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              aria-current={isActive(href) ? 'page' : undefined}
              className={`flex items-center gap-3 min-h-11 px-3 rounded-xl text-base font-medium border-l-4 ${
                isActive(href)
                  ? 'bg-[#1E293B] text-white border-[#FFB162]'
                  : 'border-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
};