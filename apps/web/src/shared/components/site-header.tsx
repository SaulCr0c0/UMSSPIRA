export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <span className="text-xl font-bold">UMSSPIRA</span>
        <nav aria-label="Principal">{/* tu <Navbar /> aquí si ya existe */}</nav>
      </div>
    </header>
  );
}