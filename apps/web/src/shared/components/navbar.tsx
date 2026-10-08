'use client'
import Link from 'next/link'
import { Bell, Search, Menu } from 'lucide-react'
import Logo from './logo'

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/companies', label: 'Empresas' },
  { href: '/job-postings', label: 'Ofertas' },
  { href: '/login', label: 'Iniciar sesión' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-umss-navy/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Inicio UMSSPIRA">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-umss-navy/80 transition-colors hover:bg-umss-cream hover:text-umss-navy"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full text-umss-navy hover:bg-umss-cream"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-umss-navy hover:bg-umss-cream"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-umss-orange" />
          </button>
          <button
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-umss-navy"
            aria-label="Menú"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  )
}