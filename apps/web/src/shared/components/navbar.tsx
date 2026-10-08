'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Home,
  Calendar,
  Briefcase,
  Star,
  Users,
  User,
  Bell,
  ChevronDown,
  Award,
  Menu,
  X,
} from 'lucide-react';

import logoUmss from '@/shared/assets/images/logoumsspira.jpg';

const navigationItems = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'eventos', label: 'Eventos', icon: Calendar },
  { id: 'jobs', label: 'Bolsa de trabajo', icon: Briefcase },
  { id: 'mentorias', label: 'Mentorías', icon: Award },
  { id: 'benefits', label: 'Beneficios', icon: Star },
  { id: 'community', label: 'Comunidad', icon: Users },
];

export const Navbar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] =
    useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsProfileDropdownOpen(false);
      }

      if (
        headerRef.current &&
        !headerRef.current.contains(target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      if (isProfileDropdownOpen) {
        setIsProfileDropdownOpen(false);
        profileButtonRef.current?.focus();
      } else if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        mobileButtonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen, isProfileDropdownOpen]);

  const selectTab = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className="relative z-50 w-full bg-[#0F172A] text-white shadow-md font-sans"
    >
      <div className="max-w-7xl mx-auto flex h-20 items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Ir a la página de inicio"
          className="relative block h-16 w-28 shrink-0 sm:w-36 xl:w-44"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsProfileDropdownOpen(false);
          }}
        >
          <Image
            src={logoUmss}
            alt="Logo UMSSPIRA"
            fill
            sizes="(min-width: 1280px) 176px, (min-width: 640px) 144px, 112px"
            className="object-contain object-left"
            priority
          />
        </Link>

        {/* Navegación de escritorio */}
        <nav
          aria-label="Navegación principal"
          className="hidden xl:flex items-center gap-1 text-sm font-medium"
        >
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                className={`relative flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 ${
                  isActive
                    ? 'bg-[#1E293B] text-white'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>

                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#FFB162]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Botones del encabezado */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <button
            type="button"
            aria-label="Notificaciones"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* Perfil */}
          <div ref={dropdownRef} className="relative">
            <button
              ref={profileButtonRef}
              type="button"
              aria-label="Opciones de perfil"
              aria-expanded={isProfileDropdownOpen}
              aria-controls="profile-options"
              onClick={() => {
                setIsProfileDropdownOpen((open) => !open);
                setIsMobileMenuOpen(false);
              }}
              className="flex min-h-10 items-center gap-1 rounded-lg p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900">
                <User className="h-5 w-5" aria-hidden="true" />
              </span>

              <ChevronDown
                aria-hidden="true"
                className={`hidden h-4 w-4 text-slate-400 transition-transform sm:block ${
                  isProfileDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isProfileDropdownOpen && (
              <div
                id="profile-options"
                className="absolute right-0 z-50 mt-3 w-60 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-100 bg-white px-2 py-3 text-slate-900 shadow-2xl sm:w-72"
              >
                <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <User className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold">Usuario UMSS</p>
                    <p className="text-xs text-slate-500">
                      Titulado / Egresado
                    </p>
                  </div>
                </div>

                <div className="py-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2.5">
                      <User
                        className="h-4 w-4 text-slate-500"
                        aria-hidden="true"
                      />
                      <span>Mi perfil</span>
                    </span>

                    <span aria-hidden="true">›</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Abrir o cerrar navegación móvil */}
          <button
            ref={mobileButtonRef}
            type="button"
            aria-label={
              isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => {
              setIsMobileMenuOpen((open) => !open);
              setIsProfileDropdownOpen(false);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 xl:hidden"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Navegación para móvil y tablet */}
      <nav
        id="mobile-navigation"
        aria-label="Navegación móvil"
        hidden={!isMobileMenuOpen}
        className="border-t border-slate-700 px-4 py-3 xl:hidden"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-2 sm:grid-cols-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 ${
                  isActive
                    ? 'bg-[#1E293B] text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};