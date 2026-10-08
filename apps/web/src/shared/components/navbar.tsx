'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Calendar, Briefcase, Star, Users, User, Bell, ChevronDown, Award } from 'lucide-react';

// Importamos la imagen usando la ruta correcta desde shared/assets
import logoUmss from '@/shared/assets/images/logoumsspira.jpg';

export const Navbar: React.FC = () => {
  // =====================================================================
  // 🎛️ PANEL DE CONTROL DE TAMAÑOS Y DISPOSICIÓN INDEPENDIENTE
  // Modifica estos valores para mover cada elemento a tu gusto:
  // =====================================================================
  const config = {
    height: "h-20",            // Altura total de la barra
    logoWidth: "w-44",         // Ancho del logo
    logoHeight: "h-20",        // Alto del logo
    spacing: "space-x-3",      // Espacio del menú principal
    textSize: "text-base",     // Tamaño de tipografía
    itemPaddingX: "px-3",      // Padding horizontal de los botones
    itemPaddingY: "py-2",      // Padding vertical de los botones

    // 🎚️ CONTROLES INDEPENDIENTES PARA LA SECCIÓN DERECHA:
    // Puedes usar clases como "translate-x-0", "translate-x-2", "translate-x-4", "-translate-x-2", etc.
    notificationPosition: "translate-x-0", // Mueve la campanita a izq/der de forma independiente
    profilePosition: "translate-x-0",      // Mueve el avatar y su menú a izq/der de forma independiente
    rightSectionGap: "space-x-4",          // Espacio base entre ambos elementos
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
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${config.height} flex items-center justify-between`}>
        
        {/* Logo Institucional en la esquina superior izquierda */}
        <div className="flex items-center">
          <Link href="#" className={`relative block ${config.logoWidth} ${config.logoHeight}`}>
            <Image 
              src={logoUmss} 
              alt="Logo UMSSPIRA" 
              fill 
              className="object-contain object-left"
              priority
            />
          </Link>
        </div>

        {/* Menú de Navegación con efectos visuales interactivos */}
        <nav className={`hidden md:flex items-center ${config.spacing} ${config.textSize} font-medium`}>
          
          {/* Inicio */}
          <button 
            onClick={() => setActiveTab('inicio')}
            className={`flex items-center space-x-2 ${config.itemPaddingX} ${config.itemPaddingY} rounded-xl transition-all relative ${
              activeTab === 'inicio' 
                ? 'bg-[#1E293B] text-white' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Home className="w-6 h-6" />
            <span>Inicio</span>
            {activeTab === 'inicio' && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#FFB162] rounded-full"></span>
            )}
          </button>

          {/* Eventos (Épica 7) */}
          <button 
            onClick={() => setActiveTab('eventos')}
            className={`flex items-center space-x-2 ${config.itemPaddingX} ${config.itemPaddingY} rounded-xl transition-all relative ${
              activeTab === 'eventos' 
                ? 'bg-[#1E293B] text-white' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-6 h-6" />
            <span>Eventos</span>
            {activeTab === 'eventos' && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#FFB162] rounded-full"></span>
            )}
          </button>

          {/* Bolsa de trabajo */}
          <button 
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center space-x-2 ${config.itemPaddingX} ${config.itemPaddingY} rounded-xl transition-all relative ${
              activeTab === 'jobs' 
                ? 'bg-[#1E293B] text-white' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Briefcase className="w-6 h-6" />
            <span>Bolsa de trabajo</span>
            {activeTab === 'jobs' && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#FFB162] rounded-full"></span>
            )}
          </button>

          {/* Mentorías (Épica 6) */}
          <button 
            onClick={() => setActiveTab('mentorias')}
            className={`flex items-center space-x-2 ${config.itemPaddingX} ${config.itemPaddingY} rounded-xl transition-all relative ${
              activeTab === 'mentorias' 
                ? 'bg-[#1E293B] text-white' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-6 h-6" />
            <span>Mentorías</span>
            {activeTab === 'mentorias' && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#FFB162] rounded-full"></span>
            )}
          </button>

          {/* Beneficios */}
          <button 
            onClick={() => setActiveTab('benefits')}
            className={`flex items-center space-x-2 ${config.itemPaddingX} ${config.itemPaddingY} rounded-xl transition-all relative ${
              activeTab === 'benefits' 
                ? 'bg-[#1E293B] text-white' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Star className="w-6 h-6" />
            <span>Beneficios</span>
            {activeTab === 'benefits' && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#FFB162] rounded-full"></span>
            )}
          </button>

          {/* Comunidad */}
          <button 
            onClick={() => setActiveTab('community')}
            className={`flex items-center space-x-2 ${config.itemPaddingX} ${config.itemPaddingY} rounded-xl transition-all relative ${
              activeTab === 'community' 
                ? 'bg-[#1E293B] text-white' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-6 h-6" />
            <span>Comunidad</span>
            {activeTab === 'community' && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#FFB162] rounded-full"></span>
            )}
          </button>

        </nav>

        {/* Sección Derecha con Controles de Posición Independientes */}
        <div className={`flex items-center ${config.rightSectionGap} pr-2`}>
          
          {/* Notificaciones (Control independiente de posición) */}
          <div className={`p-2.5 rounded-full hover:bg-slate-800 transition-colors relative text-slate-300 hover:text-white cursor-pointer transform ${config.notificationPosition}`}>
            <Bell className="w-6 h-6" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
          
          {/* Contenedor del Avatar con Dropdown (Control independiente de posición) */}
          <div className={`relative transform ${config.profilePosition}`} ref={dropdownRef}>
            <div 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-2 pl-2 cursor-pointer group py-1"
            >
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-inner group-hover:bg-slate-100 transition-colors">
                <User className="w-6 h-6 text-slate-800" />
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 group-hover:text-white transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Menú Desplegable Flotante */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-100 py-3 px-2 z-50">
                
                {/* Cabecera del Usuario */}
                <div className="px-3 py-2.5 border-b border-slate-100 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
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