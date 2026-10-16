"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Ajusta esta ruta si es necesario para importar tu formulario
import { EditCompanyForm } from '@/shared/components/edit-company-form';

export default function EditarPerfilPage() {
  const router = useRouter();
  const [companyData, setCompanyData] = useState<any>(null);

  useEffect(() => {
    // Leemos los datos actuales antes de editar
    const dataGuardada = localStorage.getItem('mock_company_profile');
    if (dataGuardada) {
      setCompanyData(JSON.parse(dataGuardada));
    }
  }, []);

  if (!companyData) {
    return (
      <div className="min-h-screen bg-[#EEE9DF] p-8 text-sm text-[#2C3B40]">
        Cargando formulario...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEE9DF] p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <EditCompanyForm
          company={companyData}
          onSubmit={async (formData) => {
            // Fusionamos los datos viejos (que tienen el NIT) con los nuevos del formulario
            const datosCompletos = { 
              ...companyData, 
              ...formData,
              // Por si ya se había borrado, forzamos a que lo recupere
              nit: companyData?.nit || '123456789' 
            };
            
            // Guardamos el objeto completo
            localStorage.setItem('mock_company_profile', JSON.stringify(datosCompletos));
            
            alert('¡Perfil actualizado con éxito!');
            router.push('/portal-corporativo/perfil');
          }}
          onCancel={() => {
            router.push('/portal-corporativo/perfil');
          }}
        />
      </div>
    </div>
  );
}