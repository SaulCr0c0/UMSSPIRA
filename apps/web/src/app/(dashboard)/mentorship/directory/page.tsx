import { PageLayout } from '@/shared/components/page-layout';
import { MentorDirectory } from '@/features/mentorship/components/mentor-directory';

export default function MentorDirectoryRoute() {
  return (
    <main className="mentorship-shell mentor-availability-shell">
      <PageLayout
        breadcrumb={[
          { label: 'Inicio', href: '/' },
          { label: 'Mentorías', href: '/mentorship' },
          { label: 'Directorio de mentores' },
        ]}
        eyebrow="Red universitaria de desarrollo"
        title="Directorio de mentores"
        description="Elige un mentor disponible y solicita una sesión de orientación técnica o profesional."
      >
        <MentorDirectory />
      </PageLayout>
    </main>
  );
}
