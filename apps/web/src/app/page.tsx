import Link from 'next/link'
import { Calendar, Briefcase, Gift, Users, Search, GraduationCap, PartyPopper, MessageSquare } from 'lucide-react'
import Badge from '@/shared/components/badge'
import FeatureCard from '@/shared/components/feature-card'
import Button from '@/shared/components/button'

export default function HomePage() {
  return (
    <div className="bg-umss-cream/40">
      <section className="bg-umss-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <Badge variant="orange" className="mb-4">Bienvenido a</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            UMSS<span className="text-umss-orange">PIRA</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Egresados que inspiran, talento que conecta.
          </p>

          <div className="mt-8 flex max-w-2xl items-center gap-2 rounded-xl bg-white p-2 shadow-umss-lg">
            <Search className="ml-2 h-5 w-5 text-umss-navy/50" />
            <input
              type="search"
              placeholder="Buscar empresas, ofertas, eventos..."
              className="h-10 flex-1 bg-transparent text-sm text-umss-dark placeholder:text-umss-navy/40 focus:outline-none"
            />
            <Button variant="secondary">Buscar</Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={Calendar} title="Eventos" description="Próximos eventos de la comunidad" />
          <FeatureCard icon={Briefcase} title="Bolsa de trabajo" description="Ofertas exclusivas para egresados" />
          <FeatureCard icon={Gift} title="Beneficios" description="Descuentos y convenios" />
          <FeatureCard icon={Users} title="Comunidad" description="Conecta con otros titulados" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-umss-navy">Próximos eventos destacados</h2>
            <p className="text-sm text-umss-navy/70">No te pierdas lo que viene</p>
          </div>
          <Link href="/events" className="text-sm font-semibold text-umss-orange hover:underline">
            Ver todos
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: 'Reencuentro de Egresados', d: '15 Nov 2026 · 18:00', i: PartyPopper },
            { t: 'Charla de Networking', d: '22 Nov 2026 · 19:00', i: MessageSquare },
            { t: 'Feria de Beneficios', d: '30 Nov 2026 · 10:00', i: Gift },
          ].map((e) => (
            <article key={e.t} className="overflow-hidden rounded-2xl border border-umss-navy/10 bg-white shadow-umss">
              <div className="flex h-40 items-center justify-center bg-umss-navy/90 text-white">
                <e.i className="h-12 w-12" />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-umss-navy">{e.t}</h3>
                <p className="mt-1 text-sm text-umss-navy/70">{e.d}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-umss-navy p-8 text-white sm:p-12">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <GraduationCap className="h-10 w-10 text-umss-orange" />
              <div>
                <h3 className="text-xl font-bold">Digitaliza tu título de UMSSPIRA</h3>
                <p className="text-white/70">Accede a tu credencial digital verificable.</p>
              </div>
            </div>
            <Button variant="secondary" size="lg">Solicitar ahora</Button>
          </div>
        </div>
      </section>
    </div>
  )
}