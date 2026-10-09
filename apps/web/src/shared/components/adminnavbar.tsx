'use client';
import React from 'react';
import { 
  Home, ShieldAlert, FileText, Edit3, BarChart2, Calendar as CalendarIcon, 
  Settings 
} from 'lucide-react';

import Logo from './logo';

// Importamos la imagen única que ocupará todo ese lugar en el sidebar
import logoCompleto from '../assets/images/logoumsspira.jpg'; // Reemplaza con el nombre de tu archivo

interface AdminNavbarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
} 

export default function AdminNavbar({ activeNav, setActiveNav }: AdminNavbarProps) {
  return (
    <aside className="w-56 sm:w-64 bg-[#0F172A] text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 select-none">
      
      {/* Cabecera del Sidebar con la Imagen Única */}
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center min-w-0">
          <Logo
            src={logoCompleto}
            maxWidthClassName="max-w-full"
            sizes="(max-width: 640px) 200px, 220px"
          />
        </div>

        {/* Menú de Navegación del Sidebar */}
        <nav aria-label="Navegación de administración" className="space-y-1.5 pt-2 text-sm font-medium">
          
          <button 
            type="button"
            onClick={() => setActiveNav('Inicio')}
            aria-current={activeNav === 'Inicio' ? 'page' : undefined}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB162] ${
              activeNav === 'Inicio' ? 'bg-[#1E293B] text-white font-semibold' : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" aria-hidden="true" />
            <span>Inicio</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveNav('Auditoría')}
            aria-current={activeNav === 'Auditoría' ? 'page' : undefined}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB162] ${
              activeNav === 'Auditoría' ? 'bg-[#1E293B] text-white font-semibold' : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-5 h-5" aria-hidden="true" />
            <span>Auditoria</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveNav('Reportes')}
            aria-current={activeNav === 'Reportes' ? 'page' : undefined}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB162] ${
              activeNav === 'Reportes' ? 'bg-[#1E293B] text-white font-semibold shadow-sm' : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-5 h-5 text-amber-400" aria-hidden="true" />
            <span>Reportes</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveNav('Encuestas')}
            aria-current={activeNav === 'Encuestas' ? 'page' : undefined}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB162] ${
              activeNav === 'Encuestas' ? 'bg-[#1E293B] text-white font-semibold' : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-5 h-5" aria-hidden="true" />
            <span>Encuestas</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveNav('Analítica')}
            aria-current={activeNav === 'Analítica' ? 'page' : undefined}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB162] ${
              activeNav === 'Analítica' ? 'bg-[#1E293B] text-white font-semibold' : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-5 h-5" aria-hidden="true" />
            <span>Analítica</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveNav('Eventos')}
            aria-current={activeNav === 'Eventos' ? 'page' : undefined}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB162] ${
              activeNav === 'Eventos' ? 'bg-[#1E293B] text-white font-semibold' : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-5 h-5" aria-hidden="true" />
            <span>Eventos</span>
          </button>

        </nav>
      </div>

      {/* Footer del Sidebar (Configuración) */}
      <div className="p-4 sm:p-6 border-t border-slate-800">
        <button
          type="button"
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors text-sm font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB162]"
        >
          <Settings className="w-5 h-5" aria-hidden="true" />
          <span>Configuración</span>
        </button>
      </div>

    </aside>
  );
}