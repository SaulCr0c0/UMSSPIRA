"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Añadimos el router para el botón editar

// IMPORTANTE: Ajusta estas rutas si TypeScript sigue marcando error en la importación
import { CompanyDetails } from '../../(dashboard)/companies/company-details';
import { CompanyHeader } from '../../(dashboard)/companies/company-header';

export default function MostrarPerfilPage() {
  const [company, setCompany] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const dataLocal = localStorage.getItem('mock_company_profile');
    
    if (dataLocal) {
      const datosParseados = JSON.parse(dataLocal);
      // Truco: Si le falta el NIT porque se guardó mal antes, se lo inyectamos de nuevo
      if (!datosParseados.nit) {
        datosParseados.nit = '123456789';
      }
      setCompany(datosParseados);
    } else {
      setCompany({
        nombre: 'Empresa Demo S.A.',
        eslogan: 'Innovando el futuro hoy',
        nit: '123456789',
        descripcion: 'Empresa líder en tecnología y desarrollo de software.',
        telefono: '77777777',
        correo: 'empresa@gmail.com',
        sitioWeb: 'www.demo.com',
        direccion: 'Av. Principal 123, Cochabamba',
        tamano: '1-10 empleados',
        logoUrl: '',
        bannerUrl: ''
      });
    }
  }, []);

  if (!company) return (
    <div className="min-h-screen bg-[#EEE9DF] p-8 text-sm text-[#2C3B40]">
      Cargando perfil...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#EEE9DF] p-6 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Pasamos las propiedades EXACTAMENTE como las pide tu componente original */}
        <CompanyHeader
          companyName={company.nombre}
          companySlogan={company.eslogan}
          logoUrl={company.logoUrl}
          bannerImageUrl={company.bannerUrl}
        />
        
        <CompanyDetails
          description={company.descripcion}
          taxId={company.nit}
          companySize={company.tamano}
          address={company.direccion}
          email={company.correo}
          phone={company.telefono}
          website={company.sitioWeb}
          // Usamos el router para ir a la vista de edición cuando hagan clic en tu botón
          onEdit={() => router.push('/portal-corporativo/editar-perfil')} 
        />

      </div>
    </div>
  );
}