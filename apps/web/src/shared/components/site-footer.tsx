export function SiteFooter() {
  return (
    <footer className="w-full border-t border-gray-200 bg-gray-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-gray-600 sm:flex-row sm:justify-between">
        © {new Date().getFullYear()} UMSSPIRA
      </div>
    </footer>
  );
}