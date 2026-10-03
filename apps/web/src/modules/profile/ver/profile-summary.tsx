'use client';

import { Pencil } from 'lucide-react';
import Link from 'next/link';

import DownloadProfileButton from '@/modules/profile/components/download-profile-button';
import { profileHeader } from '@/modules/profile/data/profile-data';
import { useProfileStore } from '@/modules/profile/state/profile-store';
import { recordsToTimeline } from '@/modules/profile/utils/records-to-timeline';
import { sortSectionsByRecency } from '@/modules/profile/utils/sort-by-recency';
import Timeline from '@/shared/components/timeline';

// Resumen del perfil (HU-03) con la descarga en JSON (HU-05), leyendo el estado compartido del perfil
export default function ProfileSummary() {
  const { records } = useProfileStore();
  const timeline = recordsToTimeline(records);

  const validatedBackups = timeline
    .flatMap((section) => section.items)
    .filter((item) => item.status === 'verified').length;
  const experiences = records.experience.length;

  return (
    <div className="flex flex-col gap-8">
      {/* Cabecera del perfil */}
      <header className="flex flex-col gap-6 rounded-2xl border border-umss-ink/10 bg-white px-5 py-6 md:flex-row md:items-end md:justify-between md:px-8 md:py-7">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-sm font-bold uppercase tracking-[0.1em] text-umss-terracotta">
            {profileHeader.verified ? 'Perfil profesional verificado' : 'Perfil profesional'}
          </p>
          <h1 className="text-[28px] font-bold leading-tight text-umss-navy md:text-[40px]">
            {profileHeader.title} {profileHeader.name}
          </h1>
          <p className="text-base font-medium text-umss-navy/80 md:text-lg">
            {profileHeader.career} · Promoción {profileHeader.graduationYear}
          </p>
        </div>

        {/* Acciones del perfil */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* "Editar perfil" lleva a Gestionar registros (HU-04) */}
          <Link
            href="/profile/records"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-umss-orange px-6 py-3.5 text-sm font-bold text-umss-ink transition hover:brightness-95"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Editar perfil
          </Link>
          <DownloadProfileButton header={profileHeader} sections={timeline} />
        </div>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Resumen del perfil */}
        <aside className="hidden w-[300px] shrink-0 flex-col gap-4 rounded-2xl border border-umss-ink/10 bg-white p-6 lg:flex">
          <h2 className="text-xl font-bold text-umss-navy">Resumen del Perfil</h2>
          <p className="text-[13px] leading-[1.5] text-umss-navy/70">
            Este es el resumen digital de tu trayectoria académica y laboral registrada en la UMSS.
            Los respaldos documentales han sido validados por la administración de la Red de
            Egresados.
          </p>
          <ul className="flex flex-col gap-3 border-t border-umss-sand pt-4 text-xs font-semibold text-umss-navy">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0F5132]" aria-hidden="true" />
              {validatedBackups} Respaldos validados
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-umss-terracotta" aria-hidden="true" />
              {experiences} Experiencias registradas
            </li>
          </ul>
        </aside>

        {/* Línea de tiempo */}
        <section className="min-w-0 flex-1 rounded-2xl border border-umss-ink/10 bg-white px-4 py-5 md:px-7 md:py-6">
          <Timeline sections={sortSectionsByRecency(timeline)} />
        </section>
      </div>
    </div>
  );
}
