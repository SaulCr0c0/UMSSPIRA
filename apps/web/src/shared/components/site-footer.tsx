export function SiteFooter() {
  return (
    <footer className="w-full border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600">
        © {new Date().getFullYear()} UMSSPIRA
      </div>
    </footer>
  );
}