import { PageLayout } from '@/shared/components/page-layout';
import { MentorAvailabilityPage } from '@/features/mentorias/components/mentor-availability-page';

export default function MentorAvailabilityRoute() {
  return (
    <main className="mentorias-shell mentor-availability-shell">
      <PageLayout
        breadcrumb={[
          { label: 'Inicio', href: '/' },
          { label: 'Mentorías', href: '/mentorias' },
          { label: 'Mi perfil de mentor', href: '/mentorias/perfil' },
          { label: 'Configurar disponibilidad' },
        ]}
        eyebrow="Red universitaria de desarrollo"
        title="Configurar disponibilidad"
        description="Gestiona la visibilidad de tu perfil para orientar a estudiantes en el ciclo académico actual."
      >
        <MentorAvailabilityPage />
      </PageLayout>
    </main>
  );
}
