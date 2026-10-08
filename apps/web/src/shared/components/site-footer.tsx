import Link from 'next/link'
import Logo from './logo'

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-umss-navy/10 bg-umss-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="[&_span]:!text-white">
            <Logo />
          </div>
          <p className="mt-4 max-w-sm text-sm text-white/70">
            Egresados que inspiran, talento que conecta.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/80">
            Plataforma
          </h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/companies" className="hover:text-white">Empresas</Link></li>
            <li><Link href="/job-postings" className="hover:text-white">Ofertas</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/80">
            Cuenta
          </h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/login" className="hover:text-white">Iniciar sesión</Link></li>
            <li><Link href="/register" className="hover:text-white">Registrarse</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} UMSSPIRA — Titulados UMSS
      </div>
    </footer>
  )
}