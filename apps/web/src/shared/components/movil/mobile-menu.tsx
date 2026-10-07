'use client';

import React from 'react';
import { Menu } from 'lucide-react';

export const MobileMenu: React.FC = () => {
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Abrir menú"
        className="h-11 w-11 flex items-center justify-center rounded-lg text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFB162]"
      >
        <Menu className="w-6 h-6" />
      </button>
    </div>
  );
};