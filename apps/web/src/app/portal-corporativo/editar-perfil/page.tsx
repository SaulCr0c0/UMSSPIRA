"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EditCompanyForm } from '@/shared/components/edit-company-form';

// Datos por defecto por si el localStorage está vacío la primera vez
const DEFAULT_MOCK_DATA = {
  id: 'mock-1',
  nombre: 'TechSolutions S.A.',
  nit: '123456789',
  descripcion: 'Somos una empresa de tecnología enfocada en desarrollar soluciones de software.',
  telefono: '+591 71234567',
  correo: 'contacto@techsolutions.gmail.com',
  sitioWeb: 'https://www.techsolutions.com',
  direccion: 'Av. San Martin y Costanera, Piso 12, Cochabamba',
  tamano: '50-200 empleados',
  eslogan: 'Innovando el futuro',
};

export default function EditarPerfilPage() {
  const router = useRouter();
  const [companyData, setCompanyData] = useState<any>(null);

  useEffect(() => {
    const dataGuardada = localStorage.getItem('mock_company_profile');
    if (dataGuardada) {
      setCompanyData(JSON.parse(dataGuardada));
    } else {
      setCompanyData(DEFAULT_MOCK_DATA);
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
            // Simulamos el tiempo de carga a la "base de datos"
            await new Promise(resolve => setTimeout(resolve, 500));

            // Fusionamos y guardamos los datos
            const datosCompletos = { 
              ...companyData, 
              ...formData,
              nit: companyData?.nit || '123456789' 
            };
            localStorage.setItem('mock_company_profile', JSON.stringify(datosCompletos));
            
            // ==========================================
            // ALERTA NATIVA DEL NAVEGADOR
            // ==========================================
            alert('¡Perfil guardado exitosamente!');
            
            // Redirigimos al perfil justo después de que el usuario haga clic en "Aceptar"
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