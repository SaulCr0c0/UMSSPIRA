import { MapPin, Mail, Phone, Globe, Building, Users, Calendar, FileText } from "lucide-react";

interface CompanyDetailsProps {
  description?: string;
  taxId?: string;
  companySize?: string;
  foundedYear?: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
}

export function CompanyDetails({
  description = "Panificadora San Jose S.R.L. es una empresa dedicada a la elaboración y comercialización de productos de panadería y repostería de alta calidad, consolidada con más de 15 años de experiencia en el mercado local, brindando sabor y tradición en cada horneada para las familias.",
  taxId = "1023456019",
  companySize = "50 - 100 empleados",
  foundedYear = "2010",
  address = "Avenida San Martin #450, Zona Norte, Cochabamba, Bolivia",
  email = "contacto@panificadorasanjose.com",
  phone = "+591 4 4251234",
  website = "https://www.panificadorasanjose.com",
}: CompanyDetailsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Principal: Descripción e Información General (2 espacios) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Tarjeta de Descripción */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-3">
            Acerca de la empresa
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Tarjeta de Datos Detallados */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Información general
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-slate-400 font-medium text-xs">NIT / RUC</span>
                <span className="text-slate-800 font-semibold">{taxId}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-slate-400 font-medium text-xs">Tamaño de la empresa</span>
                <span className="text-slate-800 font-semibold">{companySize}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-slate-400 font-medium text-xs">Año de fundación</span>
                <span className="text-slate-800 font-semibold">{foundedYear}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600 shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-slate-400 font-medium text-xs">Sector industrial</span>
                <span className="text-slate-800 font-semibold">Alimentos y Consumo Masivo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Lateral: Contacto y Ubicación (1 espacio) */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Contacto y ubicación
          </h2>
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="block font-medium text-slate-800">Dirección</span>
                <span>{address}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="block font-medium text-slate-800">Correo electrónico</span>
                <span className="text-orange-600">{email}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="block font-medium text-slate-800">Teléfono</span>
                <span>{phone}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="block font-medium text-slate-800">Sitio web</span>
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline break-all"
                >
                  {website.replace("https://", "")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}