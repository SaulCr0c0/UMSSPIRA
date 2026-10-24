'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, Eye, Pencil, MoreHorizontal, 
  Monitor, MapPin, Building, ChevronDown, FileText 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Vacante {
  id: string;
  titulo: string;
  tecnologias: string[];
  modalidad: 'Remoto' | 'Híbrido' | 'Presencial';
  nivel_experiencia: string;
  estado: 'Activa' | 'Pausada' | 'Cerrada' | 'Borrador';
  fecha_publicacion: string;
}

export default function MisVacantesPage() {
  const router = useRouter();
  
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Todos');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Lógica de cierre (adaptada a "Desactivar")
  const [vacanteACerrar, setVacanteACerrar] = useState<Vacante | null>(null);
  const [isCerrando, setIsCerrando] = useState(false);

  useEffect(() => {
    const fetchVacantes = async () => {
      setIsLoading(true);
      try {
        const mockData: Vacante[] = [
          { id: '1', titulo: 'Desarrollador Backend', tecnologias: ['Python', 'Docker', 'REST APIs'], modalidad: 'Remoto', nivel_experiencia: 'Semi-Senior', estado: 'Activa', fecha_publicacion: '2025-09-10' },
          { id: '2', titulo: 'Analista de Datos', tecnologias: ['SQL', 'Power BI', 'ETL'], modalidad: 'Híbrido', nivel_experiencia: 'Junior', estado: 'Pausada', fecha_publicacion: '2025-09-08' },
          { id: '3', titulo: 'QA Automation', tecnologias: ['Selenium', 'Java', 'CI/CD'], modalidad: 'Presencial', nivel_experiencia: 'Senior', estado: 'Activa', fecha_publicacion: '2025-09-05' },
          { id: '4', titulo: 'Desarrollador Frontend', tecnologias: ['React', 'TypeScript', 'Tailwind'], modalidad: 'Remoto', nivel_experiencia: 'Junior', estado: 'Activa', fecha_publicacion: '2025-09-01' },
          { id: '5', titulo: 'Ingeniero DevOps', tecnologias: ['AWS', 'Docker', 'Kubernetes'], modalidad: 'Híbrido', nivel_experiencia: 'Semi-Senior', estado: 'Cerrada', fecha_publicacion: '2025-08-28' },
          { id: '6', titulo: 'UI/UX Designer', tecnologias: ['Figma', 'Design System', 'UX Research'], modalidad: 'Remoto', nivel_experiencia: 'Junior', estado: 'Borrador', fecha_publicacion: '2025-08-15' },
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
          v.id === vacanteACerrar.id ? { ...v, estado: 'Cerrada' } : v
        )
      );
      setVacanteACerrar(null);
      setOpenDropdownId(null);
    } catch (error) {
      alert("Error al desactivar la vacante.");
    } finally {
      setIsCerrando(false);
    }
  };

  // Lógica de filtrado
  const vacantesFiltradas = vacantes.filter(v => {
    const matchSearch = v.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTab = activeTab === 'Todos' || v.estado === activeTab;
    return matchSearch && matchTab;
  });

  const getEstadoColor = (estado: string) => {
    switch(estado) {
      case 'Activa': return { bg: '#dcfce7', text: '#166534', dot: '#22c55e' };
      case 'Pausada': return { bg: '#fef08a', text: '#854d0e', dot: '#eab308' };
      case 'Cerrada': return { bg: '#f3f4f6', text: '#4b5563', dot: '#9ca3af' };
      case 'Borrador': return { bg: '#e0f2fe', text: '#0369a1', dot: '#0ea5e9' };
      default: return { bg: '#f3f4f6', text: '#4b5563', dot: '#9ca3af' };
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando vacantes...</div>;

  return (
    <div style={{ padding: '2rem', backgroundColor: '#F8F5F1', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header */}
      <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1B2632', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
        <ArrowLeft size={16} /> Volver
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#FFB162', padding: '0.5rem', borderRadius: '0.5rem', color: 'white' }}>
          <FileText size={24} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1B2632', margin: 0 }}>Mis vacantes publicadas</h1>
      </div>

      {/* Filtros Superiores */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#8C827A' }} />
          <input 
            type="text" 
            placeholder="Buscar por título" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #C9C1B1', outline: 'none' }}
          />
        </div>
        
        {['Estado', 'Modalidad', 'Nivel de experiencia'].map(filter => (
          <button key={filter} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #C9C1B1', backgroundColor: 'white', color: '#1B2632', cursor: 'pointer', fontSize: '0.875rem' }}>
            {filter} <ChevronDown size={14} />
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #E5E0D8', paddingBottom: '0.5rem' }}>
        {['Todos', 'Activa', 'Pausada', 'Cerrada', 'Borrador'].map(tab => {
          const count = tab === 'Todos' ? vacantes.length : vacantes.filter(v => v.estado === tab).length;
          return (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: '2rem', 
                border: 'none',
                backgroundColor: activeTab === tab ? '#E6DFD5' : 'transparent',
                color: activeTab === tab ? '#1B2632' : '#6B7280',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: tab === 'Activa' ? '#22c55e' : tab === 'Pausada' ? '#eab308' : tab === 'Cerrada' ? '#9ca3af' : tab === 'Borrador' ? '#0ea5e9' : '#6B7280' }}></div>
              {tab === 'Todos' ? 'Todos' : tab + 's'} ({count})
            </button>
          );
        })}
      </div>

      {/* Tabla */}
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'visible', border: '1px solid #E5E0D8' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead style={{ backgroundColor: '#F8F5F1', borderBottom: '1px solid #E5E0D8', color: '#1B2632' }}>
            <tr>
              <th style={{ padding: '1rem', width: '40px' }}><input type="checkbox" /></th>
              <th style={{ padding: '1rem', fontWeight: 'bold' }}>Título</th>
              <th style={{ padding: '1rem', fontWeight: 'bold' }}>Modalidad</th>
              <th style={{ padding: '1rem', fontWeight: 'bold' }}>Nivel de experiencia</th>
              <th style={{ padding: '1rem', fontWeight: 'bold' }}>Estado</th>
              <th style={{ padding: '1rem', fontWeight: 'bold' }}>Fecha de publicación</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vacantesFiltradas.map((vacante) => (
              <tr key={vacante.id} style={{ borderBottom: '1px solid #E5E0D8', color: '#1B2632' }}>
                <td style={{ padding: '1rem' }}><input type="checkbox" /></td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 'bold' }}>{vacante.titulo}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>{vacante.tecnologias.join(' · ')}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    {vacante.modalidad === 'Remoto' ? <Monitor size={14} color="#6B7280"/> : <MapPin size={14} color="#6B7280"/>}
                    {vacante.modalidad}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Building size={14} color="#6B7280"/>
                    {vacante.nivel_experiencia}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem', 
                    padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold',
                    backgroundColor: getEstadoColor(vacante.estado).bg,
                    color: getEstadoColor(vacante.estado).text
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getEstadoColor(vacante.estado).dot }}></span>
                    {vacante.estado}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: '#6B7280' }}>
                  {new Date(vacante.fecha_publicacion).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </td>
                <td style={{ padding: '1rem', textAlign: 'center', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><Eye size={18}/></button>
                    <button onClick={() => router.push(`/job-postings?edit=${vacante.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><Pencil size={18}/></button>
                    
                    {/* Menú de 3 puntitos */}
                    <button 
                      onClick={() => setOpenDropdownId(openDropdownId === vacante.id ? null : vacante.id)}
                      style={{ background: openDropdownId === vacante.id ? '#F3F4F6' : 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '0.25rem', borderRadius: '0.25rem' }}
                    >
                      <MoreHorizontal size={18}/>
                    </button>

                    {/* Dropdown Menu */}
                    {openDropdownId === vacante.id && (
                      <div style={{ position: 'absolute', right: '1rem', top: '2.5rem', backgroundColor: 'white', border: '1px solid #E5E0D8', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, width: '150px', display: 'flex', flexDirection: 'column', padding: '0.5rem 0' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#1B2632', textAlign: 'left' }}><Eye size={14}/> Ver detalle</button>
                        <button onClick={() => router.push(`/job-postings?edit=${vacante.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#1B2632', textAlign: 'left' }}><Pencil size={14}/> Editar</button>
                        
                        {vacante.estado === 'Activa' && (
                          <button onClick={() => setVacanteACerrar(vacante)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#dc2626', textAlign: 'left' }}><Monitor size={14}/> Desactivar</button>
                        )}
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#dc2626', textAlign: 'left' }}><FileText size={14}/> Eliminar</button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Confirmación (CA9) */}
      {vacanteACerrar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '1rem', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1B2632' }}>
              ¿Desactivar vacante?
            </h3>
            <p style={{ marginBottom: '1.5rem', color: '#6B7280', fontSize: '0.875rem' }}>
              Estás a punto de desactivar la vacante <strong>{vacanteACerrar.titulo}</strong>. Esta acción detendrá la recepción de postulantes.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setVacanteACerrar(null)} disabled={isCerrando} style={{ padding: '0.5rem 1rem', border: '1px solid #C9C1B1', backgroundColor: 'transparent', borderRadius: '0.5rem', cursor: 'pointer', color: '#1B2632' }}>
                Cancelar
              </button>
              <button onClick={handleConfirmarCierre} disabled={isCerrando} style={{ padding: '0.5rem 1rem', border: 'none', backgroundColor: '#dc2626', color: '#fff', borderRadius: '0.5rem', cursor: isCerrando ? 'not-allowed' : 'pointer', opacity: isCerrando ? 0.7 : 1 }}>
                {isCerrando ? 'Desactivando...' : 'Sí, desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}