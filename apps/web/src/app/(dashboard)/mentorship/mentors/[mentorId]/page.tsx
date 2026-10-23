import Link from 'next/link';

/** Route target for the public mentor detail owned by HU 6.9. */
export default function MentorProfileDestination({ params }: {
  params: { mentorId: string };
}) {
  const { mentorId } = params;
  return <main className="mentorship-shell">
    <nav className="mentorship-breadcrumb" aria-label="Ruta de navegación">
      <ol className="breadcrumb-list">
        <li><Link href="/" className="breadcrumb-link">Inicio</Link></li>
        <li aria-hidden="true">/</li>
        <li><Link href="/mentorship" className="breadcrumb-link">Mentorías</Link></li>
        <li aria-hidden="true">/</li>
        <li><Link href="/mentorship/directory" className="breadcrumb-link">Directorio de mentores</Link></li>
        <li aria-hidden="true">/</li>
        <li className="breadcrumb-current" aria-current="page">Perfil del mentor</li>
      </ol>
    </nav>
    <section className="mentor-card" aria-labelledby="mentor-profile-title" data-mentor-id={mentorId}>
      <h1 id="mentor-profile-title" className="text-2xl font-semibold">Perfil público del mentor</h1>
      <p className="mt-3 mb-6">El detalle público del mentor se integrará con la HU 6.9.</p>
      <Link href="/mentorship/directory" className="mentor-button mentor-button-secondary">
        Volver al directorio de mentores
      </Link>
    </section>
  </main>;
}
