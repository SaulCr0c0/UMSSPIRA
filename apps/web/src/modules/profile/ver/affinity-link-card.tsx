import Link from 'next/link';

import { AFFINITY_ROUTE } from '@/modules/profile/data/affinity-route';

// Tarjeta del resumen del perfil con el acceso a la afinidad profesional (Épica 3)
export default function AffinityLinkCard() {
  return (
    <section
      aria-labelledby="affinity-card-title"
      className="flex w-full flex-col gap-4 rounded-2xl border border-umss-ink/10 bg-white p-6"
    >
      <h2 id="affinity-card-title" className="text-xl font-bold text-umss-navy">
        Afinidad profesional
      </h2>
      <p className="text-[13px] leading-[1.5] text-umss-navy/70">
        Descubre qué tan bien encaja tu perfil con las oportunidades laborales de la Red.
      </p>
      <Link
        href={AFFINITY_ROUTE}
        className="inline-flex items-center justify-center rounded-lg bg-umss-orange px-6 py-3.5 text-sm font-bold text-umss-ink transition hover:brightness-95"
      >
        Ver mi afinidad
      </Link>
    </section>
  );
}
