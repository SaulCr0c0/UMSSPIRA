'use client';

import { KpiCard } from '../../../modules/reports/components/kpi-card';
import { GraduatesTable } from '../../../modules/reports/components/graduates-table';
import { useDashboardIndicators } from '../../../modules/reports/hooks/useDashboardIndicators';
import { useGraduates } from '../../../modules/reports/hooks/use-graduates';

export default function ReportsPage() {
  const { data: indicators, loading: loadingIndicators, error: errorIndicators } = useDashboardIndicators();
  const { data: graduates, loading: loadingGraduates } = useGraduates();

  if (loadingIndicators || loadingGraduates) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Cargando módulo de reportes...</p>
      </div>
    );
  }

  return (
    <main className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Indicadores</h1>
      </div>

      {errorIndicators ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {errorIndicators}
        </div>
      ) : (
        indicators && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard title="Titulados registrados" value={indicators.totalGraduates} />
            <KpiCard title="Titulados verificados" value={indicators.verifiedGraduates} />
            <KpiCard title="Titulados observados" value={indicators.observedGraduates} />
            <KpiCard title="Mentores activos" value={indicators.activeMentors} />
          </div>
        )
      )}

      <div>
        <GraduatesTable graduates={graduates} />
      </div>
    </main>
  );
}