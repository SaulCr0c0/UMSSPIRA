import { LoginForm } from "../../../modules/auth/frontend/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Panel izquierdo: foto institucional (solo en pantallas grandes) */}
      <aside
        className="relative hidden flex-col justify-between bg-[#1B2B4B] bg-cover bg-center p-8 text-white lg:flex"
        style={{ backgroundImage: "url('/images/login-facultad.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A33]/90 via-[#0F1A33]/20 to-[#0F1A33]/40" />

        <div className="relative flex gap-2 text-xs">
          <span className="rounded-full bg-black/40 px-3 py-1">UMSS • FCYT</span>
          <span className="rounded-full bg-black/40 px-3 py-1">Acreditación Oficial</span>
        </div>

        <div className="relative space-y-3">
          <div className="h-0.5 w-10 bg-[#FFA94D]" />
          <p className="font-serif text-sm italic">
            &ldquo;Conectando el talento de San Simón con el futuro tecnológico y profesional de Bolivia.&rdquo;
          </p>
          <p className="text-xs text-white/80">
            Facultad de Ciencias y Tecnología • Carrera de Ingeniería de Sistemas. Red alumni integrada para
            seguimiento curricular, convenios y validación digital.
          </p>
          <div className="flex gap-4 text-[11px] text-white/70">
            <span>Cifrado SSL 256-bit</span>
            <span>Servidores DTI UMSS</span>
          </div>
        </div>
      </aside>

      {/* Panel derecho: tarjeta de acceso */}
      <section className="flex flex-col items-center justify-center gap-6 bg-[#EEE8DC] p-6">
        <div className="flex w-full max-w-md items-center justify-between">
          <div>
            <p className="text-xl font-extrabold leading-none text-[#1F2A44]">UMSSPIRA</p>
            <p className="text-[10px] font-semibold text-[#1F2A44]">UMSS</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="h-2 w-2 rounded-full bg-green-600" />
            Portal Seguro HU-10
          </span>
        </div>

        <div className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-lg">
          <div className="grid grid-cols-1 gap-1 rounded-lg bg-[#F3ECDF] p-1 text-sm font-semibold">
            <span className="rounded-md bg-[#1F2A44] py-2 text-center text-white">Iniciar Sesión</span>
          </div>

          <div className="space-y-1">
            <h1 className="font-serif text-3xl font-bold text-[#1F2A44]">Bienvenido de vuelta</h1>
            <p className="text-sm text-gray-600">
              Accede al portal oficial de egresados y red profesional de Ingeniería de Sistemas.
            </p>
          </div>

          <LoginForm />
        </div>

        <p className="text-center text-[11px] text-gray-500">
          UNIVERSIDAD MAYOR DE SAN SIMÓN • DTI &amp; DPA
          <br />
          Mesa de ayuda: soporte.egresados@umss.edu.bo
        </p>
      </section>
    </main>
  );
}