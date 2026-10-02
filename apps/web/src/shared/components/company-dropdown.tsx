"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Agregado para cumplir CA16
import { 
  User, 
  Building2, 
  Briefcase, 
  FileText, 
  Users, 
  LogOut, 
  ChevronRight 
} from "lucide-react";

// CA14: Preparamos el componente para recibir los datos de la empresa autenticada
interface CompanyDropdownProps {
  companyName?: string;
  companyRole?: string;
}

export function CompanyDropdown({ 
  companyName = "TechSolutions S.A.", 
  companyRole = "Empresa empleadora" 
}: CompanyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter(); 

  // CA12: Cerrar el menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // CA16: Función para cerrar sesión y redirigir
  const handleLogout = () => {
    setIsOpen(false);
    // Aquí a futuro irá la limpieza del token (ej. localStorage.removeItem('token'))
    router.push("/login"); // Redirige a pantalla de no autenticados
  };

  return (
    // CA18: Contenedor relative para evitar superposición
    <div className="relative inline-block" ref={dropdownRef}>
      
      {/* CA1, CA11, CA13: Disparador del menú (Avatar) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#1B2632] hover:bg-[#EEE9DF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFB162]"
        aria-expanded={isOpen}
      >
        <User className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[300px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#EEE9DF] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="absolute -top-2 right-3 w-4 h-4 bg-white border-t border-l border-[#EEE9DF] transform rotate-45"></div>

          {/* CA2: Mostrar la identificación de la empresa */}
          <div className="relative flex items-center px-5 py-4 border-b border-[#EEE9DF] bg-white rounded-t-xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#EEE9DF] text-[#2C3B4D] mr-3 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-[#1B2632] leading-tight">
                {companyName}
              </span>
              <span className="text-[12px] font-medium text-[#1B2632]/60 mt-0.5">
                {companyRole}
              </span>
            </div>
          </div>

          {/* CA3, CA4, CA6, CA7, CA8, CA9, CA10: Enlaces y cierre al hacer clic */}
          <div className="py-2 bg-white">
            <Link
              href="/empresa/perfil"
              className="flex items-center justify-between px-5 py-2.5 hover:bg-[#EEE9DF]/50 transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center text-[#1B2632]">
                <Building2 className="w-[18px] h-[18px] mr-3 text-[#1B2632]/70 group-hover:text-[#FFB162] transition-colors" />
                <span className="text-[14px] font-medium">Perfil de Empresa</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#1B2632]/40" />
            </Link>

            <Link
              href="/empresa/vacantes/publicar"
              className="flex items-center justify-between px-5 py-2.5 hover:bg-[#EEE9DF]/50 transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center text-[#1B2632]">
                <Briefcase className="w-[18px] h-[18px] mr-3 text-[#1B2632]/70 group-hover:text-[#FFB162] transition-colors" />
                <span className="text-[14px] font-medium">Publicar Vacante</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#1B2632]/40" />
            </Link>

            <Link
              href="/empresa/vacantes"
              className="flex items-center justify-between px-5 py-2.5 hover:bg-[#EEE9DF]/50 transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center text-[#1B2632]">
                <FileText className="w-[18px] h-[18px] mr-3 text-[#1B2632]/70 group-hover:text-[#FFB162] transition-colors" />
                <span className="text-[14px] font-medium">Mis Vacantes</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#1B2632]/40" />
            </Link>

            <Link
              href="/empresa/postulantes"
              className="flex items-center justify-between px-5 py-2.5 hover:bg-[#EEE9DF]/50 transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center text-[#1B2632]">
                <Users className="w-[18px] h-[18px] mr-3 text-[#1B2632]/70 group-hover:text-[#FFB162] transition-colors" />
                <span className="text-[14px] font-medium">Postulantes</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#1B2632]/40" />
            </Link>
          </div>

          {/* CA5: Separación visual de Cerrar Sesión */}
          <div className="py-2 border-t border-[#EEE9DF] bg-white rounded-b-xl">
            <button
              className="flex w-full items-center px-5 py-2.5 hover:bg-[#EEE9DF]/50 transition-colors group"
              onClick={handleLogout}
            >
              <LogOut className="w-[18px] h-[18px] mr-3 text-[#1B2632]/70 group-hover:text-[#A35139] transition-colors" />
              <span className="text-[14px] font-medium text-[#1B2632] group-hover:text-[#A35139] transition-colors">
                Cerrar sesión
              </span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}