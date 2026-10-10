import Link from "next/link";

export function PortalSiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <Link
          href="/portal"
          aria-label="Ir a la página de inicio de UMSSPIRA"
          className="text-xl font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          UMSSPIRA
        </Link>
        <nav aria-label="Principal">{/* tu <Navbar /> aquí si ya existe */}</nav>
      </div>
    </header>
  );
}
