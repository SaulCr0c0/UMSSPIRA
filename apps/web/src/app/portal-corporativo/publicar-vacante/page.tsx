"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
// Ajusta esta ruta según dónde esté tu componente
import { PublishVacancyForm } from "@/shared/components/publish-vacancy-form"; 

export default function PublicarVacanteSeguraPage() {
  const router = useRouter();

  const handleGuardarVacanteLocal = (datosVacante: any) => {
    const vacantesPrevias = JSON.parse(localStorage.getItem("mock_vacantes") || "[]");
    const nuevasVacantes = [...vacantesPrevias, { ...datosVacante, id: Date.now() }];
    
    localStorage.setItem("mock_vacantes", JSON.stringify(nuevasVacantes));
    alert("¡Vacante publicada exitosamente!");
    
    // Te devuelve al perfil (o puedes cambiarlo a /portal-corporativo/mis-vacantes si ya existe)
    router.push("/portal-corporativo/perfil"); 
  };

  return (
    // Agregamos el mismo fondo gris/arena para que combine perfectamente
    <div className="min-h-screen bg-[#EEE9DF] py-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <PublishVacancyForm onSubmit={handleGuardarVacanteLocal} />
      </div>
    </div>
  );
}