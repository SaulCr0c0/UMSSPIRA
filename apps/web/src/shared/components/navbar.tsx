'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Calendar, Briefcase, Star, Users, User, Bell, ChevronDown, Award } from 'lucide-react';

import logoUmss from '@/shared/assets/images/logoumsspira.jpg';

export const Navbar: React.FC = () => {
  const config = {
    height: "h-20",
    logoWidth: "w-44",
    logoHeight: "h-20",
    spacing: "space-x-3",
    textSize: "text-base",
    itemPaddingX: "px-3",
    itemPaddingY: "py-2",
    notificationPosition: "translate-x-0",
    profilePosition: "translate-x-0",
    rightSectionGap: "space-x-4",
  };

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <header className={`w-full bg-umss-navy text-white shadow-md font-sans relative z-50`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${config.height} flex items-center justify-between`}>
        
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

        <nav className={`hidden md:flex items-center ${config.spacing} ${config.textSize} font-medium`}>
          
          <button 
            onClick={() => setActiveTab('inicio')}
            className={`flex items-center space-x-2 ${config.itemPaddingX} ${config.itemPaddingY} rounded-xl transition-all relative ${
              activeTab === 'inicio' 
                ? 'bg-umss-navy/80 text-white' 
                : 'text-white/70 hover:text-white hover:bg-umss-navy/50'
            }`}
          >
            <Home className="w-6 h-6" />
            <span>Inicio</span>
            {activeTab === 'inicio' && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-umss-orange rounded-full"></span>}
          </button>

          <button 
            onClick={() => setActiveTab('eventos')}
            className={`flex items-center space-x-2 ${config.itemPaddingX} ${config.itemPaddingY} rounded-xl transition-all relative ${
              activeTab === 'eventos' ? 'bg-umss-navy/80 text-white' : 'text-white/70 hover:text-white hover:bg-umss-navy/50'
            }`}
          >
            <Calendar className="w-6 h-6" />
            <span>Eventos</span>
            {activeTab === 'eventos' && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-umss-orange rounded-full"></span>}
          </button>

          <button 
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center space-x-2 ${config.itemPaddingX} ${config.itemPaddingY} rounded-xl transition-all relative ${
              activeTab === 'jobs' ? 'bg-umss-navy/80 text-white' : 'text-white/70 hover:text-white hover:bg-umss-navy/50'
            }`}
          >
            <Briefcase className="w-6 h-6" />
            <span>Bolsa de trabajo</span>
            {activeTab === 'jobs' && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-umss-orange rounded-full"></span>}
          </button>

          <button 
            onClick={() => setActiveTab('mentorias')}
            className={`flex items-center space-x-2 ${config.itemPaddingX} ${config.itemPaddingY} rounded-xl transition-all relative ${
              activeTab === 'mentorias' ? 'bg-umss-navy/80 text-white' : 'text-white/70 hover:text-white hover:bg-umss-navy/50'
            }`}
          >
            <Award className="w-6 h-6" />
            <span>Mentorías</span>
            {activeTab === 'mentorias' && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-umss-orange rounded-full"></span>}
          </button>

          <button 
            onClick={() => setActiveTab('benefits')}
            className={`flex items-center space-x-2 ${config.itemPaddingX} ${config.itemPaddingY} rounded-xl transition-all relative ${
              activeTab === 'benefits' ? 'bg-umss-navy/80 text-white' : 'text-white/70 hover:text-white hover:bg-umss-navy/50'
            }`}
          >
            <Star className="w-6 h-6" />
            <span>Beneficios</span>
            {activeTab === 'benefits' && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-umss-orange rounded-full"></span>}
          </button>

          <button 
            onClick={() => setActiveTab('community')}
            className={`flex items-center space-x-2 ${config.itemPaddingX} ${config.itemPaddingY} rounded-xl transition-all relative ${
              activeTab === 'community' ? 'bg-umss-navy/80 text-white' : 'text-white/70 hover:text-white hover:bg-umss-navy/50'
            }`}
          >
            <Users className="w-6 h-6" />
            <span>Comunidad</span>
            {activeTab === 'community' && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-umss-orange rounded-full"></span>}
          </button>

        </nav>

        <div className={`flex items-center ${config.rightSectionGap} pr-2`}>
          
          <div className={`p-2.5 rounded-full hover:bg-umss-navy/50 transition-colors relative text-white/70 hover:text-white cursor-pointer transform ${config.notificationPosition}`}>
            <Bell className="w-6 h-6" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-umss-orange rounded-full"></span>
          </div>
          
          <div className={`relative transform ${config.profilePosition}`} ref={dropdownRef}>
            <div 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-2 pl-2 cursor-pointer group py-1"
            >
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-umss-navy shadow-inner group-hover:bg-umss-cream transition-colors">
                <User className="w-6 h-6 text-umss-navy" />
              </div>
              <ChevronDown className={`w-5 h-5 text-white/70 group-hover:text-white transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white text-umss-dark rounded-2xl shadow-2xl border border-umss-navy/10 py-3 px-2 z-50">
                
                <div className="px-3 py-2.5 border-b border-umss-navy/10 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-umss-cream text-umss-orange flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-umss-dark">Usuario UMSS</p>
                    <p className="text-xs text-umss-navy/60">Titulado / Egresado</p>
                  </div>
                </div>

                <div className="py-2 space-y-1">
                  <Link 
                    href="/profile" 
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-umss-cream/50 transition-colors text-xs font-semibold text-umss-dark"
                  >
                    <div className="flex items-center space-x-2.5">
                      <User className="w-4 h-4 text-umss-navy/60" />
                      <span>Mi perfil</span>
                    </div>
                    <span className="text-umss-navy/40">›</span>
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