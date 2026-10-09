'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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
  type LucideIcon,
} from 'lucide-react';

import Logo from './logo';

// Importamos la imagen usando la ruta correcta desde shared/assets
import logoUmss from '@/shared/assets/images/logoumsspira.jpg';

// Items del menú principal: agregar o quitar un enlace se hace aquí
interface NavItem {
  id: string;
  label: string;
  Icon: LucideIcon;
}

const navItems: NavItem[] = [
  { id: 'inicio', label: 'Inicio', Icon: Home },
  { id: 'eventos', label: 'Eventos', Icon: Calendar }, // Épica 7
  { id: 'jobs', label: 'Bolsa de trabajo', Icon: Briefcase },
  { id: 'mentorias', label: 'Mentorías', Icon: Award }, // Épica 6
  { id: 'benefits', label: 'Beneficios', Icon: Star },
  { id: 'community', label: 'Comunidad', Icon: Users },
];

export const Navbar: React.FC = () => {
  // =====================================================================
  // 🎛️ PANEL DE CONTROL DE TAMAÑOS Y DISPOSICIÓN INDEPENDIENTE
  // Modifica estos valores para mover cada elemento a tu gusto.
  // Convención: valores base = celulares grandes en horizontal (768–1023 px)
  //             prefijo lg: = escritorio (1024 px en adelante)
  // =====================================================================
  const config = {
    height: "h-16 md:h-20",                  // Altura total de la barra (más compacta en móvil)
    logoHeight: "h-10 sm:h-12 md:h-14",      // Alto del logo por breakpoint (el ancho se calcula solo)
    logoMaxWidth: "max-w-[45vw] md:max-w-[16vw] lg:max-w-[240px]", // Nunca desborda; en compacto cede espacio al menú

    // Contenedor principal: padding lateral y separación entre logo / menú / sección derecha
    containerPadding: "px-4 sm:px-6 md:px-4 lg:px-8",
    containerGap: "gap-2 lg:gap-4",

    // Menú principal: compacto entre 768 y 1023 px, completo desde 1024 px
    spacing: "gap-1 lg:gap-3",               // Espacio entre botones del menú
    textSize: "text-[11px] lg:text-base",    // Tamaño de tipografía
    itemPaddingX: "px-2 lg:px-3",            // Padding horizontal de los botones
    itemPaddingY: "py-1.5 lg:py-2",          // Padding vertical de los botones
    itemLayout: "flex-col lg:flex-row",      // Ícono arriba del texto en compacto; al lado en escritorio
    itemGap: "gap-0.5 lg:gap-2",             // Espacio entre ícono y texto
    iconSize: "w-5 h-5 lg:w-6 lg:h-6",       // Tamaño del ícono
    underlineInset: "left-2 right-2 lg:left-3 lg:right-3", // Margen de la línea naranja activa

    // 🎚️ CONTROLES INDEPENDIENTES PARA LA SECCIÓN DERECHA:
    // Puedes usar clases como "translate-x-0", "translate-x-2", "translate-x-4", "-translate-x-2", etc.
    notificationPosition: "translate-x-0", // Mueve la campanita a izq/der de forma independiente
    profilePosition: "translate-x-0",      // Mueve el avatar y su menú a izq/der de forma independiente
    rightSectionGap: "gap-1 lg:gap-4",     // Espacio base entre ambos elementos
    rightSectionPadding: "pr-0 lg:pr-2",   // Margen derecho de la sección
    bellPadding: "p-2 lg:p-2.5",           // Área de toque de la campanita
  };

  // Estado inicial en null para que al inicio NINGUNO esté seleccionado ni tenga efectos
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Estado para controlar la apertura y cierre del menú desplegable del avatar (Épica 2)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú flotante al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`w-full bg-[#0F172A] text-white shadow-md font-sans relative z-50`}>
      <div className={`max-w-7xl mx-auto ${config.containerPadding} ${config.height} flex items-center justify-between ${config.containerGap}`}>

        {/* Logo Institucional en la esquina superior izquierda */}
        <div className="flex items-center min-w-0 shrink">
          <Link href="#" className="block shrink-0">
            <Logo
              src={logoUmss}
              heightClassName={config.logoHeight}
              maxWidthClassName={config.logoMaxWidth}
            />
          </Link>
        </div>

        {/* Menú de Navegación con efectos visuales interactivos */}
        <nav className={`hidden md:flex flex-1 min-w-0 items-center justify-center ${config.spacing} ${config.textSize} font-medium`}>
          {navItems.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex shrink-0 ${config.itemLayout} items-center ${config.itemGap} ${config.itemPaddingX} ${config.itemPaddingY} rounded-xl transition-colors relative whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1E293B] text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`${config.iconSize} shrink-0`} />
                <span>{label}</span>
                {isActive && (
                  <span className={`absolute bottom-0 ${config.underlineInset} h-0.5 bg-[#FFB162] rounded-full`}></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sección Derecha con Controles de Posición Independientes */}
        <div className={`flex shrink-0 items-center ${config.rightSectionGap} ${config.rightSectionPadding}`}>

          {/* Notificaciones (Control independiente de posición) */}
          <div className={`${config.bellPadding} rounded-full hover:bg-slate-800 transition-colors relative text-slate-300 hover:text-white cursor-pointer transform ${config.notificationPosition}`}>
            <Bell className="w-6 h-6" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>

          {/* Contenedor del Avatar con Dropdown (Control independiente de posición) */}
          <div className={`relative transform ${config.profilePosition}`} ref={dropdownRef}>
            <div
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-1 lg:gap-2 pl-1 lg:pl-2 cursor-pointer group py-1"
            >
              <div className="w-9 h-9 shrink-0 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-inner group-hover:bg-slate-100 transition-colors">
                <User className="w-6 h-6 text-slate-800" />
              </div>
              <ChevronDown className={`w-5 h-5 shrink-0 text-slate-400 group-hover:text-white transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Menú Desplegable Flotante */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-3 w-72 max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-5rem)] overflow-y-auto bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-100 py-3 px-2 z-50">

                {/* Cabecera del Usuario */}
                <div className="px-3 py-2.5 border-b border-slate-100 flex items-center space-x-3">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">Usuario UMSS</p>
                    <p className="text-xs text-slate-500">Titulado / Egresado</p>
                  </div>
                </div>

                {/* Opciones del Menú (Épica 2: Mi Perfil /profile) */}
                <div className="py-2 space-y-1">
                  <Link
                    href="/profile"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700"
                  >
                    <div className="flex items-center space-x-2.5">
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Mi perfil</span>
                    </div>
                    <span className="text-slate-400">›</span>
                  </Link>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};