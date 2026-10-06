'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon, SaveIcon, Trash2Icon, Undo2Icon, LockKeyholeIcon } from 'lucide-react';
import { ConfirmModal } from '@/shared/components/confirm-modal';
import { PrimaryButton, SecondaryButton } from './mentor-button';
import { normalizeInterests, sameConfiguration, type InterestArea, type InterestConfiguration } from '../model/mentor-interests';

interface Props {
  catalog: InterestArea[];
  initialConfiguration: InterestConfiguration;
  onSave: (configuration: InterestConfiguration) => Promise<InterestConfiguration>;
  areasHref?: string;
  onNavigate?: (href: string) => void;
}

export function MentorInterests({ catalog, initialConfiguration, onSave, areasHref = '/mentorias/perfil/areas', onNavigate }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(() => normalizeInterests(catalog, initialConfiguration));
  const [draft, setDraft] = useState(saved);
  const [dialog, setDialog] = useState<'save' | 'discard' | 'leave' | string | null>(null);
  const [destination, setDestination] = useState(areasHref);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const dirty = !sameConfiguration(saved, draft);
  const added = draft.topicIds.filter(id => !saved.topicIds.includes(id));
  const removed = saved.topicIds.filter(id => !draft.topicIds.includes(id));
  const topicName = (id: string) => catalog.flatMap(area => area.topics).find(topic => topic.id === id)?.name || id;
  const removingArea = catalog.find(area => dialog === `area:${area.id}`);
  const affectedTopics = removingArea?.topics.filter(topic => draft.topicIds.includes(topic.id)) || [];
  const navigate = (href: string) => onNavigate ? onNavigate(href) : router.push(href);

  useEffect(() => {
    if (!dirty) return;
    const prevent = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', prevent);
    return () => window.removeEventListener('beforeunload', prevent);
  }, [dirty]);

  function change(next: InterestConfiguration) {
    setDraft(normalizeInterests(catalog, next));
    setSuccess(false);
    setError('');
  }
  function leave(href: string) {
    if (savingRef.current) return;
    if (!dirty) navigate(href);
    else { setDestination(href); setDialog('leave'); }
  }
  async function save() {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError('');
    try {
      const confirmed = normalizeInterests(catalog, await onSave({ areaIds: [...draft.areaIds], topicIds: [...draft.topicIds] }));
      setSaved(confirmed);
      setDraft(confirmed);
      setSuccess(true);
      setDialog(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudieron guardar los intereses. Vuelve a intentar.');
    } finally { setSaving(false); savingRef.current = false; }
  }

  return <div className="interests-editor">
    <section className="interests-summary" aria-label="Áreas técnicas guardadas">
      <div><strong>Intereses de mentoría</strong><p>{draft.areaIds.length} áreas seleccionadas · {draft.topicIds.length} intereses</p>
        <p>Tus áreas técnicas guardadas determinan el catálogo disponible de intereses para orientación individual y de equipo.</p></div>
      <SecondaryButton disabled={saving} onClick={() => leave(areasHref)}>Modificar áreas técnicas</SecondaryButton>
    </section>
    {success && <div role="status" className="interests-success">Intereses guardados correctamente. Guardaste {saved.topicIds.length} intereses de mentoría.</div>}
    <div className="interests-section-heading"><h2>Catálogo de tópicos por área</h2><p>Toca un tópico para agregarlo o quitarlo de tu perfil.</p></div>
    {!catalog.length && <p>No hay tópicos disponibles. Configura tus áreas técnicas para comenzar.</p>}
    <div className="interests-grid">{catalog.map(area => {
      const enabled = draft.areaIds.includes(area.id);
      const selected = area.topics.filter(topic => draft.topicIds.includes(topic.id));
      return <section key={area.id} aria-labelledby={`area-${area.id}`} className={`interest-area${enabled ? '' : ' interest-area-locked'}`}>
        <div className="interest-area-heading"><h3 id={`area-${area.id}`}>{area.name}</h3><span>{enabled ? 'Área seleccionada' : <><LockKeyholeIcon size={14} aria-hidden="true" /> Bloqueada</>}</span></div>
        <p>{area.description}</p>
        {enabled ? <>
          <h4>En tu perfil · {selected.length} tópicos</h4>
          {selected.length === 0 && <p>Aún no seleccionaste intereses en esta área.</p>}
          <div className="interest-topics">{selected.map(topic => <button key={topic.id} type="button" aria-pressed="true" disabled={saving} onClick={() => change({ ...draft, topicIds: draft.topicIds.filter(id => id !== topic.id) })}><CheckIcon size={14} aria-hidden="true" />{topic.name}</button>)}</div>
          <h4>Sugeridos</h4>
          <div className="interest-topics">{area.topics.filter(topic => !draft.topicIds.includes(topic.id)).map(topic => <button key={topic.id} type="button" aria-pressed="false" disabled={saving} onClick={() => change({ ...draft, topicIds: [...draft.topicIds, topic.id] })}>{topic.name}</button>)}</div>
          <div className="interest-area-footer"><span>{selected.length} de {area.topics.length} seleccionados</span><button type="button" disabled={saving} onClick={() => setDialog(`area:${area.id}`)}>Quitar área</button></div>
        </> : <>
          <p>Área no incluida en tu selección técnica. Para seleccionar estos tópicos, primero debes agregar esta área en Áreas técnicas.</p>
          <div className="interest-topics">{area.topics.map(topic => <button key={topic.id} type="button" disabled>{topic.name}</button>)}</div>
          <SecondaryButton disabled={saving} onClick={() => leave(areasHref)}>Activar esta área técnica</SecondaryButton>
        </>}
      </section>;
    })}</div>
    <p>Solo puedes seleccionar tópicos de tus áreas técnicas.</p>
    <section className="interests-progress" aria-label="Configuración del perfil"><h2>Completa tu perfil de mentor</h2><ol><li>1. Áreas técnicas</li><li aria-current="step">2. Intereses de mentoría · En edición</li><li>3. Disponibilidad</li></ol></section>
    <footer className="interests-actions"><SecondaryButton disabled={saving} onClick={() => leave(areasHref)}>Volver a Áreas técnicas</SecondaryButton>
      <span role="status">{dirty ? 'Cambios sin guardar' : 'Sin cambios pendientes'}</span>
      <SecondaryButton disabled={!dirty || saving} onClick={() => setDialog('discard')}>Descartar cambios</SecondaryButton>
      <PrimaryButton disabled={!dirty} loading={saving} onClick={() => setDialog('save')}>Guardar configuración ({draft.topicIds.length})</PrimaryButton>
      {success && <SecondaryButton onClick={() => leave('/mentorias/perfil')}>Volver a mi perfil</SecondaryButton>}
    </footer>
    <ConfirmModal open={dialog === 'save'} icon={SaveIcon} title="¿Guardar cambios en tus intereses?" description={`Tu perfil quedará con ${draft.topicIds.length} intereses de mentoría.`} cancelLabel="Seguir editando" confirmLabel="Guardar cambios" confirming={saving} onCancel={() => { setDialog(null); setError(''); }} onConfirm={() => void save()}>
      <p>Se agregarán ({added.length}): {added.map(topicName).join(', ') || 'Ninguno'}.</p><p>Se quitarán ({removed.length}): {removed.map(topicName).join(', ') || 'Ninguno'}.</p>
      {saved.areaIds.some(id => !draft.areaIds.includes(id)) && <p>También se actualizarán las áreas técnicas que quitaste.</p>}
      {error && <p role="alert">{error}</p>}
    </ConfirmModal>
    <ConfirmModal open={dialog === 'discard' || dialog === 'leave'} icon={Undo2Icon} title="¿Descartar los cambios?" description="Tu selección volverá a los últimos intereses guardados." cancelLabel="Seguir editando" confirmLabel="Descartar cambios" onCancel={() => setDialog(null)} onConfirm={() => { setDraft(saved); setDialog(null); setSuccess(false); if (dialog === 'leave') navigate(destination); }} />
    <ConfirmModal open={!!removingArea} icon={Trash2Icon} title="Esta área tiene tópicos asociados" description={`Si quitas ${removingArea?.name || ''}, también se quitarán sus tópicos de tu perfil al guardar.`} confirmLabel="Quitar de todos modos" onCancel={() => setDialog(null)} onConfirm={() => { if (removingArea) change({ ...draft, areaIds: draft.areaIds.filter(id => id !== removingArea.id) }); setDialog(null); }}>
      <h3>Tópicos que se quitarán</h3><p>{affectedTopics.map(topic => topic.name).join(', ') || 'No hay tópicos seleccionados en esta área.'}</p>
    </ConfirmModal>
  </div>;
}
