import { CompanyDetails } from "./company-details";

export default function CompanyProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Componente HU-03: Detalles, Descripción y Contacto */}
        <CompanyDetails />
      </div>
    </div>
  );
}