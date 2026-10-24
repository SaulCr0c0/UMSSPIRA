'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Vacante {
  id: string;
  titulo: string;
  modalidad: string;
  estado: 'PUBLICADA' | 'CERRADA';
  fecha_publicacion: string;
}

export default function MisVacantesPage() {
  const router = useRouter();
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vacanteACerrar, setVacanteACerrar] = useState<Vacante | null>(null);
  const [isCerrando, setIsCerrando] = useState(false);

  useEffect(() => {
    const fetchVacantes = async () => {
      setIsLoading(true);
      try {
        const mockData: Vacante[] = [
          { id: '1', titulo: 'Desarrollador Frontend', modalidad: 'REMOTO', estado: 'PUBLICADA', fecha_publicacion: '2026-10-20' },
          { id: '2', titulo: 'Analista de Datos', modalidad: 'HIBRIDO', estado: 'CERRADA', fecha_publicacion: '2026-10-15' },
          { id: '3', titulo: 'Ingeniero de Software', modalidad: 'PRESENCIAL', estado: 'PUBLICADA', fecha_publicacion: '2026-10-22' },
        ];

        const ordenadas = mockData.sort((a, b) => 
          new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime()
        );
        
        setVacantes(ordenadas);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVacantes();
  }, []);

  const handleConfirmarCierre = async () => {
    if (!vacanteACerrar) return;
    setIsCerrando(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVacantes((prev) => 
        prev.map((v) => 
          v.id === vacanteACerrar.id ? { ...v, estado: 'CERRADA' } : v
        )
      );
      setVacanteACerrar(null);
    } catch (error) {
      alert("Error al cerrar la vacante.");
    } finally {
      setIsCerrando(false);
    }
  };

  const handleEditar = (id: string) => {
    router.push(`/job-postings?edit=${id}`);
  };

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando vacantes...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--ink)' }}>Mis Vacantes</h1>
        <Link 
          href="/job-postings" 
          style={{ backgroundColor: 'var(--flame)', color: 'var(--ink)', padding: '0.5rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 'bold' }}
        >
          + Publicar Vacante
        </Link>
      </div>

      {vacantes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid var(--oatmeal)' }}>
          <p style={{ color: 'var(--ink-70)', marginBottom: '1rem' }}>Aún no tienes vacantes publicadas.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {vacantes.map((vacante) => (
            <div key={vacante.id} style={{ backgroundColor: '#fff', border: '1px solid var(--oatmeal)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--ink)' }}>{vacante.titulo}</h2>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 'bold', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '999px',
                  backgroundColor: vacante.estado === 'PUBLICADA' ? '#dcfce7' : '#f3f4f6',
                  color: vacante.estado === 'PUBLICADA' ? '#166534' : '#4b5563'
                }}>
                  {vacante.estado}
                </span>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--ink-70)', marginBottom: '1rem' }}>
                Modalidad: {vacante.modalidad} | Fecha: {vacante.fecha_publicacion}
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--palladian)' }}>
                {vacante.estado === 'PUBLICADA' ? (
                  <>
                    <button 
                      onClick={() => handleEditar(vacante.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--navy)', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => setVacanteACerrar(vacante)}
                      style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer', marginLeft: 'auto' }}
                    >
                      Cerrar Vacante
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: '0.875rem', color: 'var(--ink-70)', fontStyle: 'italic' }}>
                    Esta vacante ya no recibe postulaciones.
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {vacanteACerrar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '1rem', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--ink)' }}>
              ¿Cerrar vacante?
            </h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--ink-70)' }}>
              Estás a punto de cerrar la vacante <strong>{vacanteACerrar.titulo}</strong>. Esta acción es irreversible y no podrás recibir más postulantes.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setVacanteACerrar(null)}
                disabled={isCerrando}
                style={{ padding: '0.5rem 1rem', border: '1px solid var(--oatmeal)', backgroundColor: 'transparent', borderRadius: '0.5rem', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmarCierre}
                disabled={isCerrando}
                style={{ padding: '0.5rem 1rem', border: 'none', backgroundColor: '#dc2626', color: '#fff', borderRadius: '0.5rem', cursor: isCerrando ? 'not-allowed' : 'pointer', opacity: isCerrando ? 0.7 : 1 }}
              >
                {isCerrando ? 'Cerrando...' : 'Sí, cerrar vacante'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}