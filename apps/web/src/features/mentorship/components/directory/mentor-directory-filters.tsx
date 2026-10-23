'use client';

import { useEffect, useState } from 'react';
import { SlidersHorizontalIcon } from 'lucide-react';
import { emptyDirectoryFilters } from '../../model/mentor-directory';
import { sameConfiguration, type InterestArea, type InterestConfiguration } from '../../model/mentor-interests';

export function MentorDirectoryFilters({ catalog, applied, interestsSupported, disabled, onApply }: {
  catalog: InterestArea[];
  applied: InterestConfiguration;
  interestsSupported: boolean;
  disabled: boolean;
  onApply: (filters: InterestConfiguration) => void;
}) {
  const [draft, setDraft] = useState(applied);
  const [expandedInterests, setExpandedInterests] = useState(false);
  useEffect(() => { setDraft(applied); }, [applied]);
  const dirty = !sameConfiguration(draft, applied);
  const toggleArea = (id: string) => {
    setDraft(current => {
      const areaIds = current.areaIds.includes(id) ? current.areaIds.filter(value => value !== id) : [...current.areaIds, id];
      const allowed = new Set(catalog.filter(area => !areaIds.length || areaIds.includes(area.id)).flatMap(area => area.topics.map(topic => topic.id)));
      return { areaIds, topicIds: current.topicIds.filter(value => allowed.has(value)) };
    });
  };
  const toggleTopic = (id: string) => setDraft(current => ({ ...current,
    topicIds: current.topicIds.includes(id) ? current.topicIds.filter(value => value !== id) : [...current.topicIds, id],
  }));
  const clear = () => { const empty = emptyDirectoryFilters(); setDraft(empty); onApply(empty); };
  const groups = catalog.filter(area => !draft.areaIds.length || draft.areaIds.includes(area.id));
  const visibleGroups = expandedInterests || draft.areaIds.length ? groups : groups.slice(0, 3);

  return <aside className="directory-filters" aria-label="Filtros de mentores">
    <details open><summary><SlidersHorizontalIcon className="icon" aria-hidden="true" />Filtrar mentores</summary>
      <form onSubmit={event => { event.preventDefault(); if (dirty && !disabled) onApply(draft); }}>
        <fieldset disabled={disabled}><legend>Áreas técnicas <span>· selección múltiple</span></legend>
          {!catalog.length && <p className="directory-muted">{disabled ? 'Cargando áreas…' : 'Las áreas se mostrarán al cargar el directorio.'}</p>}
          {catalog.map(area => <label className="directory-area-option" key={area.id}>
            <input type="checkbox" checked={draft.areaIds.includes(area.id)} onChange={() => toggleArea(area.id)} />{area.name}
          </label>)}
        </fieldset>
        <fieldset disabled={disabled || !interestsSupported} className="directory-topic-fieldset"><legend>Intereses de mentoría <span>· selección múltiple</span></legend>
          {interestsSupported ? <>
            <p className="directory-muted">Catálogo general. Elige un área para ver solo sus intereses.</p>
            <div id="directory-interest-groups">{visibleGroups.map(area => <div className="directory-topic-group" key={area.id}>
              <h3>{area.name}</h3><div className="directory-topic-options">{area.topics.map(topic => <label key={topic.id} className={`directory-topic ${draft.topicIds.includes(topic.id) ? 'is-selected' : ''}`}>
                <input type="checkbox" checked={draft.topicIds.includes(topic.id)} onChange={() => toggleTopic(topic.id)} />{topic.name}
              </label>)}</div>
            </div>)}</div>
            {!expandedInterests && !draft.areaIds.length && groups.length > 3 && <button type="button" className="mentor-button mentor-button-secondary directory-expand-interests" aria-controls="directory-interest-groups" onClick={() => setExpandedInterests(true)}>Cargar más intereses</button>}
          </> : <p className="directory-muted">Los intereses se mostrarán cuando estén disponibles.</p>}
        </fieldset>
        <div className="directory-filter-actions">
          <button className="mentor-button mentor-button-primary" type="submit" disabled={disabled || !dirty}>Aplicar filtros</button>
          <button className="mentor-button mentor-button-secondary" type="button" disabled={disabled || (!draft.areaIds.length && !draft.topicIds.length && !applied.areaIds.length && !applied.topicIds.length)} onClick={clear}>Limpiar filtros</button>
        </div>
      </form>
    </details>
  </aside>;
}
