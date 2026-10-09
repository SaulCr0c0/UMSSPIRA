'use client';
import React, { useState } from 'react';

import Logo from './logo';

// Importamos la imagen usando la ruta correcta desde shared/assets
import logoUmss from '@/shared/assets/images/umsspiralogo.png';

export default function PublicNavbar() {
  // =====================================================================
  // 🎛️ PANEL DE CONTROL DE TAMAÑOS
  // Convención: valores base = celulares grandes en horizontal (768–1023 px)
  //             lg: = 1024 px en adelante | xl: = 1280 px en adelante
  // =====================================================================
  const config = {
    height: "h-16 md:h-20",
    logoMaxWidth: "max-w-[45vw] md:max-w-[14vw] lg:max-w-[180px] xl:max-w-[240px]",

    // Contenedor principal
    containerPadding: "px-4 sm:px-6 md:px-4 lg:px-8",
    containerGap: "gap-2 lg:gap-4",

    // Menú principal
    menuGap: "gap-1 xl:gap-2",
    menuTextSize: "text-[11px] lg:text-sm xl:text-base",
    menuPaddingX: "px-1.5 lg:px-2.5 xl:px-3.5",
    menuPaddingY: "py-1.5 xl:py-2",
    underlineInset: "left-1.5 right-1.5 lg:left-2.5 lg:right-2.5 xl:left-3 xl:right-3",

    // Botones de autenticación
    authGap: "gap-2 xl:gap-3",
    authText: "text-[11px] lg:text-sm",
    authPaddingX: "px-2.5 lg:px-3 xl:px-4",
    authPaddingY: "py-1.5 xl:py-2",
  };

  const [activeTab, setActiveTab] = useState<string | null>('Inicio');

  const handleItemClick = (tabName: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab(tabName);
  };

  const navItems = [
    { name: 'Inicio' },
    { name: 'Comunidad' },
    { name: 'Directorio' },
    { name: 'Carreras' },
    { name: 'Eventos' },
    { name: 'Sobre nosotros' },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-100 shadow-sm font-sans relative z-50">
      <div className={`max-w-7xl mx-auto ${config.containerPadding} ${config.height} flex items-center justify-between ${config.containerGap}`}>

        {/* Logo Institucional y Facultad */}
        <div className="flex items-center gap-3 min-w-0 shrink">
          <div className="shrink-0 cursor-pointer">
            <Logo src={logoUmss} maxWidthClassName={config.logoMaxWidth} />
          </div>
          <div className="hidden xl:block shrink-0 border-l border-slate-200 pl-3 text-[11px] text-slate-600 font-medium leading-tight">
            <span className="block font-bold text-slate-900">UMSS - FCYT</span>
            <span>INGENIERÍA INFORMÁTICA</span>
            <span className="block">INGENIERÍA DE SISTEMAS</span>
          </div>
        </div>

        {/* Menú de Navegación con efectos sobre fondo blanco */}
        <nav className={`hidden md:flex flex-1 min-w-0 items-center justify-center ${config.menuGap} ${config.menuTextSize} font-medium`}>
          {navItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={(e) => handleItemClick(item.name, e)}
                className={`flex shrink-0 items-center whitespace-nowrap ${config.menuPaddingX} ${config.menuPaddingY} rounded-xl transition-colors relative cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{item.name}</span>
                {isActive && (
                  <span className={`absolute bottom-0 ${config.underlineInset} h-0.5 bg-[#FFB162] rounded-full`}></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Botones de Autenticación (Demostrativos sin redirección por ahora) */}
        <div className={`flex shrink-0 items-center ${config.authGap}`}>
          <button
            onClick={(e) => e.preventDefault()}
            className={`shrink-0 whitespace-nowrap ${config.authPaddingX} ${config.authPaddingY} ${config.authText} font-semibold text-slate-800 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={(e) => e.preventDefault()}
            className={`shrink-0 whitespace-nowrap ${config.authPaddingX} ${config.authPaddingY} ${config.authText} font-semibold text-slate-900 bg-[#FFB162] hover:bg-[#f39c4a] rounded-xl transition-colors shadow-sm cursor-pointer`}
          >
            Registro
          </button>
        </div>

      </div>
    </header>
  );
}