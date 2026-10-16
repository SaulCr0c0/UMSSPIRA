import React from 'react';
// 1. Cambiamos la importación. Ahora llamamos a TU archivo clonado 
// que está en esta misma carpeta, no al original.
import NavbarCorporativo from './navbar-corporativo'; 

export default function PortalCorporativoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* 
        2. Usamos tu componente clonado. 
        Este Navbar ya sabe que "Inicio" y el Logo apuntan a /portal-corporativo 
      */}
      <NavbarCorporativo role="empresa" />
      
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}