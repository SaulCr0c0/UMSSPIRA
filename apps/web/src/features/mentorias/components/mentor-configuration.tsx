import { BrainCogIcon, CalendarDaysIcon, ContactIcon, MessagesSquareIcon } from 'lucide-react';
import { SecondaryButton } from './mentor-button';

const options = [
  { title: 'Áreas técnicas', description: 'Define las áreas técnicas en las que puedes brindar orientación.', icon: BrainCogIcon, action: 'Configurar áreas' },
  { title: 'Intereses de mentoría', description: 'Selecciona los temas específicos sobre los que deseas orientar.', icon: MessagesSquareIcon, action: 'Configurar intereses' },
  { title: 'Disponibilidad', description: 'Indica si puedes atender nuevas solicitudes de orientación.', icon: CalendarDaysIcon, action: 'Configurar disponibilidad' },
  { title: 'Información del perfil', description: 'Presenta tu descripción, experiencia e información relevante para la mentoría.', icon: ContactIcon, action: 'Agregar información' },
];

/** Estructura visual permanente; estas acciones todavía no tienen endpoints. */
export function MentorConfiguration() {
  return <section className="active-panel-settings" aria-labelledby="mentor-configuration-title">
    <h3 id="mentor-configuration-title" className="active-panel-section-title">Configuración del perfil</h3>
    <div className="active-panel-options">
      {options.map(({ title, description, icon: Icon, action }) => <article key={title} className="active-panel-option">
        <div className="active-panel-option-top">
          <span aria-hidden="true" className="active-panel-option-icon"><Icon /></span>
          <span className="active-panel-option-status">Próximamente</span>
        </div>
        <h4 className="active-panel-option-title">{title}</h4>
        <p className="active-panel-option-description">{description}</p>
        <div className="active-panel-option-action"><SecondaryButton disabled>{action}</SecondaryButton></div>
      </article>)}
    </div>
  </section>;
}
