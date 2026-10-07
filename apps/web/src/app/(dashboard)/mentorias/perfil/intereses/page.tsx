import { PageLayout } from '@/shared/components/page-layout';
import { MentorInterestsDemo } from '@/features/mentorias/components/mentor-interests-demo';
import { MentorInterestsConnected } from '@/features/mentorias/components/mentor-interests-connected';
import '@/features/mentorias/mentor-interests.css';

export default function MentorInterestsPage({ searchParams }: { searchParams: { demo?: string } }) {
  const demo = process.env.NODE_ENV !== 'production' && searchParams.demo === '1';
  return <div className="interests-page"><main className="mentorias-shell"><PageLayout
    breadcrumb={[{ label: 'Inicio', href: '/' }, { label: 'Mentorías', href: '/mentorias' }, { label: 'Mi perfil de mentor', href: '/mentorias/perfil' }, { label: 'Áreas técnicas', href: '/mentorias/perfil/areas' }, { label: 'Configurar intereses específicos' }]}
    eyebrow="Red universitaria de desarrollo" title="Intereses específicos de mentoría"
    description="Gestiona los tópicos y herramientas clave asociados a tus áreas técnicas para orientar las consultas y solicitudes de orientación de los estudiantes.">
    {demo ? <MentorInterestsDemo /> : <MentorInterestsConnected />}
  </PageLayout></main></div>;
}
