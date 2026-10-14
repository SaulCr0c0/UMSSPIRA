'use client';

import { EditCompanyForm } from '@/shared/components/edit-company-form';
import type { Company } from '@umsspira/shared-types';

// 1. IMPORTA EL NAVBAR DE LA EPIC 8 AQUÍ
import { Navbar } from '@/shared/components/navbar';

export default function TestFormPage() {
  const company: Company = {
    id: '1',
    nombre: 'TechSolutions S.A.',
    nit: '123456789',
    descripcion: 'Somos una empresa de tecnologia enfocada en desarrollar soluciones de software.',
    telefono: '+591 71234567',
    correo: 'contacto@techsolutions.com',
    sitioWeb: 'https://www.techsolutions.com',
    direccion: 'Av. San Martin y Costanera, Piso 12, Cochabamba',
    tamano: '50-200 empleados',
  };

  return (
    <>
      {/* 2. COLOCA EL NAVBAR JUSTO ARRIBA DEL CONTENEDOR PRINCIPAL */}
      <Navbar role="empresa"/>
      
      <main className="min-h-screen bg-[#EEE9DF] py-6">
        <div className="max-w-7xl mx-auto px-6">
          <EditCompanyForm
            company={company}
            onSubmit={async (data) => {
              console.log('Payload:', data);
              alert('Guardado (mock)');
            }}
            onCancel={() => alert('Cancelado')}
          />
        </div>
      </main>
    </>
  );
}