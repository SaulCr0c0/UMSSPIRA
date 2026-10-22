import Link from 'next/link';

/**
 * HU-004: punto de navegación administrativo.
 * La visualización y los datos de encuestas se integrarán desde las HU-002/HU-003.
 * No mostrar resultados de ejemplo como si provinieran de la base de datos.
 */
export default function EmploymentSurveyReportsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <div className="rounded-xl border border-oatmeal bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-truffle-trouble">
          Módulo administrativo
        </p>
        <h1 className="mt-2 font-display text-3xl text-abyssal-blue">
          Encuestas de Empleabilidad
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-abyssal-blue/75">
          El acceso institucional ya está habilitado. La consulta de respuestas
          estará disponible cuando el equipo integre el módulo de encuestas
          con los registros reales de la base de datos.
        </p>
        <Link
          href="/reports"
          className="mt-5 inline-flex rounded-md bg-abyssal-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Volver a Reportes Institucionales
        </Link>
      </div>
    </main>
  );
}
