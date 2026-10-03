import Link from 'next/link';
import type { Requirements } from '@umsspira/shared-types';
import { ArrowLeftIcon, AwardIcon, CirclePauseIcon } from 'lucide-react';
import { ApprovedChip } from './approved-chip';
import { StatusBadge } from './status-badge';
import { MentorConfiguration } from './mentor-configuration';

export function ActivePanel({ requirements, onDeactivate }: { requirements: Requirements; onDeactivate: () => void }) {
  return <section aria-labelledby="active-title" className="active-panel-card">
    <div className="active-panel-content">
      <div className="active-panel-topbar"><StatusBadge variant="active">Activo</StatusBadge><ApprovedChip approved={requirements.egresado} /></div>
      <div className="active-panel-hero">
        <span aria-hidden="true" className="active-panel-hero-icon"><AwardIcon /></span>
        <h2 id="active-title" className="active-panel-title">Tu participación como mentor está activa</h2>
        <p className="active-panel-intro">Tu participación está habilitada. La configuración de áreas, intereses y disponibilidad estará disponible próximamente.</p>
      </div>
      <MentorConfiguration />
    </div>
    <div className="active-panel-footer inactive-footer">
      <Link href="/mentorias" className="inactive-back"><ArrowLeftIcon className="icon" aria-hidden="true" />Volver a Mentorías</Link>
      <button type="button" className="active-panel-deactivate" onClick={onDeactivate}><CirclePauseIcon aria-hidden="true" />Desactivar participación</button>
    </div>
  </section>;
}
