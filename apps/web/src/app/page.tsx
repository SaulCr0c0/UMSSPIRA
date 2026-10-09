import React from 'react';
import { Navbar } from '@/shared/components/navbar';
import { NavbarMovil } from '@/shared/components/movil/navbar-movil';
import Image from 'next/image';
import {
  Search,
  Calendar,
  Briefcase,
  Star,
  Users,
  ChevronRight,
  Bookmark,
} from 'lucide-react';

import umssBg from '@/shared/assets/images/14sept.webp';
import eventImg1 from '@/shared/assets/images/reencuentro.jpg';
import eventImg2 from '@/shared/assets/images/networking.jpg';
import eventImg3 from '@/shared/assets/images/beneficios.jpg';

const shortcuts = [
  {
    title: 'Eventos',
    description: 'Participa en los próximos eventos y actividades.',
    icon: Calendar,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'Bolsa de trabajo',
    description: 'Encuentra nuevas oportunidades laborales.',
    icon: Briefcase,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Beneficios',
    description: 'Accede a descuentos y convenios exclusivos.',
    icon: Star,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'Comunidad',
    description: 'Conecta con otros egresados.',
    icon: Users,
    color: 'bg-slate-100 text-slate-700',
  },
];

const events = [
  {
    title: 'Reencuentro de Egresados',
    image: eventImg1,
    day: '12',
    month: 'OCT',
    location: 'Auditorio UMSS',
    time: '8:00 p.m. - 12:00 p.m.',
  },
  {
    title: 'Charla de Networking',
    image: eventImg2,
    day: '25',
    month: 'OCT',
    location: 'Aula Magna',
    time: '8:00 p.m. - 7:00 p.m.',
  },
  {
    title: 'Feria de Beneficios',
    image: eventImg3,
    day: '08',
    month: 'NOV',
    location: 'Campus UMSS',
    time: '9:30 p.m. - 4:00 p.m.',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-[#FDFBF7] font-sans text-slate-900 antialiased selection:bg-amber-500 selection:text-white">
      {/* Navegación de escritorio */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Navegación móvil */}
      <div className="md:hidden">
        <NavbarMovil />
      </div>

      {/* Contenido principal */}
      <main className="mx-auto w-full min-w-0 max-w-[1440px] flex-1 space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        {/* Banner principal */}
        <section className="relative w-full overflow-hidden rounded-2xl bg-[#111827] p-6 text-white shadow-lg sm:rounded-3xl sm:p-10 md:p-12">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <Image
              src={umssBg}
              alt="Fondo Institucional UMSS"
              fill
              sizes="(max-width: 1440px) 100vw, 1440px"
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-[#0F172A]/60" />
          </div>

          <div className="relative z-10 w-full min-w-0 max-w-2xl space-y-4">
            <h3 className="text-xs font-medium tracking-wide text-slate-300 sm:text-sm">
              Bienvenido a
            </h3>

            <h1 className="break-words font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              UMSS<span className="text-amber-500">PIRA</span>
            </h1>

            <p className="text-sm font-normal text-slate-300 sm:text-base">
              Tu comunidad, siempre conectada.
            </p>

            {/* Buscador adaptable */}
            <div className="pt-2">
              <label
                htmlFor="home-search"
                className="mb-2 block text-sm font-medium text-white"
              >
                Buscar eventos, beneficios y empleos
              </label>

              <div className="relative w-full min-w-0 max-w-xl">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="home-search"
                  name="search"
                  type="search"
                  placeholder="Buscar..."
                  className="block min-h-11 w-full min-w-0 rounded-xl bg-white py-3 pl-10 pr-3 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Tarjetas de navegación rápida */}
        <section
          aria-label="Secciones de la plataforma"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
        >
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;

            return (
              <div
                key={shortcut.title}
                className="group flex min-w-0 flex-col justify-between space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${shortcut.color}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h3 className="break-words text-base font-bold text-slate-900">
                    {shortcut.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {shortcut.description}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Próximos eventos */}
        <section aria-labelledby="events-title" className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="events-title"
              className="font-serif text-lg font-bold text-slate-900 sm:text-xl"
            >
              Próximos eventos
            </h2>

            <a
              href="#all-events"
              className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-amber-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
            >
              <span>Ver todos</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div
            id="all-events"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {events.map((event) => (
              <article
                key={event.title}
                className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative h-36 bg-slate-200 sm:h-32">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1440px) 33vw, 480px"
                    className="object-cover"
                  />

                  <div className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 text-slate-700 shadow">
                    <Bookmark className="h-4 w-4" aria-hidden="true" />
                  </div>
                </div>

                <div className="relative flex flex-1 flex-col justify-between space-y-4 p-4 sm:p-5">
                  <div className="absolute -top-6 left-4 z-10 rounded-xl bg-[#A34739] px-3 py-1.5 text-center text-white shadow">
                    <span className="block text-base font-bold leading-none">
                      {event.day}
                    </span>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider">
                      {event.month}
                    </span>
                  </div>

                  <div className="pt-3">
                    <h3 className="break-words text-sm font-bold text-slate-900 sm:text-base">
                      {event.title}
                    </h3>

                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      <p className="flex items-start gap-1.5">
                        <span aria-hidden="true" className="shrink-0">
                          📍
                        </span>
                        <span className="min-w-0 break-words">
                          {event.location}
                        </span>
                      </p>

                      <p className="flex items-start gap-1.5">
                        <span aria-hidden="true" className="shrink-0">
                          ⏰
                        </span>
                        <span className="min-w-0 break-words">
                          {event.time}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Pie de página */}
      <footer className="w-full shrink-0 border-t border-slate-200 bg-[#0F172A] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="text-sm font-semibold">
            UMSSPIRA — Egresados UMSS
          </p>

          <p className="text-sm text-slate-300">
            Universidad Mayor de San Simón
          </p>
        </div>
      </footer>
    </div>
  );
}