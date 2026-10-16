'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMentorAreas, type MentorArea } from '../services/mentor-areas-api';
import { isUnauthorizedStatus } from '../services/mentor-error';

export function MentorSavedAreas() {
  const [areas, setAreas] = useState<MentorArea[] | null>(null);
  const [error, setError] = useState(false);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    setRequiresLogin(false);
    getMentorAreas(controller.signal).then(state => {
      if (!controller.signal.aborted) setAreas(state.areas.filter(area => state.selectedIds.includes(area.id)));
    }).catch(reason => {
      if (!controller.signal.aborted) {
        setError(true);
        setRequiresLogin(isUnauthorizedStatus(reason));
      }
    });
    return () => controller.abort();
  }, [retry]);
  return <section className="mentor-card mentor-saved-areas" aria-labelledby="saved-areas-title"><h2 id="saved-areas-title">Tus áreas técnicas</h2>
    {error ? (
      <p>
        {requiresLogin ? (
          <>Inicia sesión para consultar tus áreas. <Link href="/login">Iniciar sesión</Link></>
        ) : (
          <>No se pudieron consultar tus áreas. <button type="button" onClick={() => setRetry(value => value + 1)}>Reintentar consulta de áreas</button></>
        )}
      </p>
    )
      : areas === null ? <p>Cargando áreas guardadas…</p> : areas.length ? <ul>{areas.map(area => <li key={area.id}>{area.nombre}</li>)}</ul>
      : <p>Aún no tienes áreas técnicas guardadas.</p>}
    <Link href="/mentorship/profile/areas">Configurar áreas técnicas</Link>
  </section>;
}
