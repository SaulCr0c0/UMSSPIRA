'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, CheckIcon, PlusIcon } from 'lucide-react';
import { setAccessToken } from '@/shared/services/auth-session';
import { SecondaryButton } from './mentor-button';
import { getMentorAreas, updateMentorAreas, type MentorArea } from '../services/mentor-areas-api';

const MAX_AREAS = 5;
const LOCAL_MENTOR_TEST_TOKEN = 'umsspira-local-mentor-test-only';
const DEFAULT_AREAS: MentorArea[] = [
  { id: '30000000-0000-4000-8000-000000000001', nombre: 'Desarrollo web', descripcion: 'Frontend, backend, UX/UI.' },
  { id: '30000000-0000-4000-8000-000000000002', nombre: 'Desarrollo móvil', descripcion: 'Android, iOS, Flutter, React Native.' },
  { id: '30000000-0000-4000-8000-000000000003', nombre: 'Arquitectura y diseño de software', descripcion: 'Patrones, microservicios, diseño de sistemas.' },
  { id: '30000000-0000-4000-8000-000000000004', nombre: 'Bases de datos', descripcion: 'Modelado, SQL, NoSQL, optimización.' },
  { id: '30000000-0000-4000-8000-000000000005', nombre: 'Ciencia de datos e IA', descripcion: 'Analítica, machine learning, NLP, visión por computador.' },
  { id: '30000000-0000-4000-8000-000000000006', nombre: 'Ciberseguridad', descripcion: 'Seguridad de aplicaciones y redes, hacking ético.' },
  { id: '30000000-0000-4000-8000-000000000007', nombre: 'Computación en la nube', descripcion: 'AWS, Azure, GCP, despliegue y servicios cloud.' },
  { id: '30000000-0000-4000-8000-000000000008', nombre: 'DevOps', descripcion: 'CI/CD, Docker, automatización de infraestructura.' },
  { id: '30000000-0000-4000-8000-000000000009', nombre: 'Redes y telecomunicaciones', descripcion: 'Configuración, protocolos, administración.' },
  { id: '30000000-0000-4000-8000-000000000010', nombre: 'Calidad de software y testing', descripcion: 'Pruebas manuales y automatizadas, QA.' },
  { id: '30000000-0000-4000-8000-000000000011', nombre: 'Gestión de proyectos TI y desarrollo profesional', descripcion: 'Metodologías ágiles, análisis de sistemas, CV, entrevistas técnicas, portafolio.' },
];

function sortedUniqueAreas(areas: MentorArea[]): MentorArea[] {
  const unique = new Map<string, MentorArea>();
  for (const area of areas) {
    const key = area.nombre.trim().toLocaleLowerCase('es');
    if (key && !unique.has(key)) unique.set(key, area);
  }
  return Array.from(unique.values()).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

export function MentorAreasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [areas, setAreas] = useState<MentorArea[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [catalogFromDatabase, setCatalogFromDatabase] = useState(false);

  async function loadAreas() {
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      const state = await getMentorAreas();
      setAreas(sortedUniqueAreas(state.areas));
      setSavedIds(state.selectedIds);
      setSelectedIds(state.selectedIds);
      setCatalogFromDatabase(true);
    } catch (reason) {
      setAreas(DEFAULT_AREAS);
      setSavedIds([]);
      setSelectedIds([]);
      setCatalogFromDatabase(false);
      setError(reason instanceof Error ? reason.message : 'No se pudo cargar el catálogo de áreas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAreas();
  }, []);

  function cancel() {
    setSelectedIds(savedIds);
    setError('');
    setSaved(false);
    router.push('/mentorias/perfil');
  }

  function toggleArea(id: string) {
    setSaved(false);
    setSelectedIds(current => {
      if (current.includes(id)) return current.filter(selectedId => selectedId !== id);
      if (current.length >= MAX_AREAS) return current;
      return [...current, id];
    });
  }

  async function save() {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const state = await updateMentorAreas(selectedIds);
      setAreas(sortedUniqueAreas(state.areas));
      setSavedIds(state.selectedIds);
      setSelectedIds(state.selectedIds);
      setSaved(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudieron guardar las áreas.');
    } finally {
      setSaving(false);
    }
  }

  async function enterAsTestMentor() {
    setAccessToken(LOCAL_MENTOR_TEST_TOKEN);
    await loadAreas();
  }

  return (
    <main className="mentorias-shell mentor-areas-page">
      <nav aria-label="Ruta de navegación" className="mentorias-breadcrumb">
        <ol className="breadcrumb-list">
          <li><Link href="/" className="breadcrumb-link">Inicio</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/mentorias" className="breadcrumb-link">Mentorías</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/mentorias/perfil" className="breadcrumb-link">Mi perfil de mentor</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="breadcrumb-current">Configurar áreas técnicas</li>
        </ol>
      </nav>

      <p className="page-eyebrow">Red universitaria de desarrollo</p>
      <h1 className="page-title page-title-with-eyebrow mentor-areas-page-title">Áreas técnicas de especialidad</h1>
      <p className="page-description">
        Selecciona las áreas técnicas en las que tienes experiencia para indicar los campos en los que puedes brindar orientación técnica en la red de mentorías.
      </p>

      <section className="mentor-areas-page-card" aria-labelledby="mentor-areas-page-heading">
        <div className="mentor-areas-page-banner">
          <span className="mentor-areas-page-banner-badge">Catálogo oficial</span>
          <h2 id="mentor-areas-page-heading">Define tus especialidades para el directorio de mentorías</h2>
          <p>Las áreas técnicas provienen del catálogo aprobado de la UMSS. Debes seleccionar al menos un área técnica.</p>
        </div>

        <div className="mentor-areas-page-list-heading">
          <h2>Catálogo de especialidades técnicas (selección múltiple)</h2>
          <span className="mentor-areas-count" aria-live="polite">
            {selectedIds.length} de {MAX_AREAS} áreas seleccionadas
          </span>
        </div>

        {loading && <p className="mentor-areas-message" role="status">Cargando catálogo…</p>}
        {error && <div className="mentor-areas-error" role="alert">
          <p>{error}</p>
          {!error.startsWith('Inicia sesión') && (
            <p>Mostrando el catálogo predeterminado. Para guardar, conecta la API con la base de datos y aplica las migraciones del catálogo.</p>
          )}
          {error.startsWith('Inicia sesión') && process.env.NODE_ENV !== 'production' && (
            <SecondaryButton onClick={() => { void enterAsTestMentor(); }}>Entrar como mentor de prueba</SecondaryButton>
          )}
        </div>}
        {!loading && catalogFromDatabase && !error && areas.length === 0 && <p className="mentor-areas-message">No hay áreas activas disponibles.</p>}
        {!loading && areas.length > 0 && (
          <ul className="mentor-areas-list" aria-label="Catálogo de áreas técnicas">
            {areas.map(area => {
              const selected = selectedIds.includes(area.id);
              const limitReached = selectedIds.length >= MAX_AREAS;
              return (
                <li key={area.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    className={`mentor-area-option${selected ? ' is-selected' : ''}`}
                    onClick={() => toggleArea(area.id)}
                    disabled={!selected && limitReached}
                  >
                    <span className="mentor-area-option-copy">
                      <span className="mentor-area-name">{area.nombre}</span>
                      {area.descripcion && <span className="mentor-area-description">{area.descripcion}</span>}
                    </span>
                    <span className="mentor-area-option-state">
                      {selected
                        ? <><CheckIcon aria-hidden="true" className="icon-small" /> Seleccionada</>
                        : <><PlusIcon aria-hidden="true" className="icon-small" /> Agregar</>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {saved && <p role="status" className="mentor-areas-saved">Especialidades guardadas correctamente.</p>}

        <div className="mentor-areas-page-actions">
          <Link href="/mentorias/perfil" className="mentor-areas-back">
            <ArrowLeftIcon aria-hidden="true" className="icon-small" /> Volver a Mi perfil
          </Link>
          <div className="mentor-areas-actions">
            <SecondaryButton onClick={cancel} disabled={saving || loading}>Cancelar</SecondaryButton>
            <SecondaryButton onClick={() => { void save(); }} disabled={loading || saving || !!error || !catalogFromDatabase || areas.length === 0}>
              {saving ? 'Guardando…' : 'Guardar'}
            </SecondaryButton>
          </div>
        </div>
      </section>
    </main>
  );
}
