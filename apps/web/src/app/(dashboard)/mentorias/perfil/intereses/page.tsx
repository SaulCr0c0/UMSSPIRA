import Link from 'next/link';
import { PageLayout } from '@/shared/components/page-layout';
import { MentorInterestsDemo } from '@/features/mentorias/components/mentor-interests-demo';
import '@/features/mentorias/mentor-interests.css';

export default function MentorInterestsPage({ searchParams }: { searchParams: { demo?: string } }) {
  const demo = process.env.NODE_ENV !== 'production' && searchParams.demo === '1';
  return <main className="mentorias-shell"><PageLayout
    breadcrumb={[{ label: 'Inicio', href: '/' }, { label: 'Mentorías', href: '/mentorias' }, { label: 'Mi perfil de mentor', href: '/mentorias/perfil' }, { label: 'Configurar intereses específicos' }]}
    eyebrow="Red universitaria de desarrollo" title="Intereses específicos de mentoría"
    description="Gestiona los tópicos y herramientas clave asociados a tus áreas técnicas para orientar las consultas y solicitudes de orientación de los estudiantes.">
    {demo ? <MentorInterestsDemo /> : <section className="interests-summary"><div><h2>Intereses de mentoría</h2><p>La configuración de intereses aún no está disponible.</p>
      <Link href="/mentorias/perfil" className="mentor-button mentor-button-secondary">Volver a mi perfil</Link>
      {process.env.NODE_ENV !== 'production' && <p><Link href="?demo=1">Abrir vista de prueba</Link></p>}
    </div></section>}
  </PageLayout></main>;
}
