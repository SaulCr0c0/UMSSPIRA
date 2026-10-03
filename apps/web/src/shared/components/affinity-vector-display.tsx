'use client';

import React from 'react';
import { RadarChart } from './radar-chart';
import { Spinner } from './spinner';
import { ErrorAlert } from './error-alert';
import { ShieldCheck, RefreshCw, PieChart, Sparkles, CheckCircle, Activity } from 'lucide-react';
import { clampPercentage } from '../utils/percentage';

export interface AreaScore {
  area: string;
  affinity: number;
}

export interface AffinityVectorDisplayProps {
  candidateName: string;
  graduateId: string;
  areas: AreaScore[];
  topSkillsByArea?: Record<string, string[]>;
  isLoading?: boolean;
  error?: string | null;
  onRecalculate?: () => void;
  onRetry?: () => void;
  isAuthenticated?: boolean;
}

// Mandatory 6 technical areas order from HU-1 Criterion 8 & 9
export const MANDATORY_AREAS_ORDER = [
  'desarrollo de software',
  'cloud & devops',
  'ciencia de datos & ia',
  'aseguramiento de calidad (QA)',
  'ciberseguridad y redes',
  'gestion de ti & gobernanza',
] as const;

export const AffinityVectorDisplay: React.FC<AffinityVectorDisplayProps> = ({
  candidateName,
  areas,
  topSkillsByArea = {},
  isLoading = false,
  error = null,
  onRecalculate,
  onRetry,
  isAuthenticated = true,
}) => {
  // Authentication check (HU-1 Criterion 18)
  if (!isAuthenticated) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
        <ShieldCheck className="w-10 h-10 text-amber-600 mx-auto" />
        <h3 className="text-lg font-bold text-amber-900">Acceso Restringido</h3>
        <p className="text-xs text-amber-700 max-w-md mx-auto">
          Debe iniciar sesión como egresado o reclutador para visualizar el vector de afinidad técnica.
        </p>
      </div>
    );
  }

  // Ensure exact 6 areas present and strictly ordered (HU-1 Criteria 8 & 9)
  const orderedAreas = MANDATORY_AREAS_ORDER.map((mandatoryName) => {
    const found = areas.find(
      (a) => a.area.toLowerCase().trim() === mandatoryName.toLowerCase().trim()
    );

    let rawScore = found ? found.affinity : 0;
    // Apply HU-1 Criteria 2, 3, 4: Rounding, clamping 0-100%
    const cleanScore = clampPercentage(rawScore);

    return {
      area: mandatoryName,
      affinity: cleanScore,
    };
  });

  return (
    <div id="radar-section" className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Gráfico Radar & Vector de Competencias (HU-1)</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Radar de Afinidad Técnica • {candidateName}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualización gráfica en radar de 6 dimensiones calculadas independientemente a partir de su perfil.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Recalculate Button (HU-1 Criterion 19) */}
          {onRecalculate && (
            <button
              onClick={onRecalculate}
              disabled={isLoading}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Recalcular Vector</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading State (HU-1 Criterion 5) */}
      {isLoading && (
        <div className="py-12 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col items-center justify-center space-y-3" role="status">
          <Spinner size="lg" text="Actualizando radar y porcentajes de afinidad por área..." />
          <p className="text-xs text-slate-400 font-medium">Procesando las 6 áreas técnicas en menos de 2 segundos</p>
        </div>
      )}

      {/* Error State (HU-1 Criteria 6 & 7) */}
      {error && !isLoading && (
        <ErrorAlert
          title="Error al cargar el vector de afinidad"
          message={error}
          onRetry={onRetry}
          isRetrying={isLoading}
        />
      )}

      {/* Success State - Display Radar Chart + 6 Technical Areas Bars (HU-1 Criteria 1-20) */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Visual SVG Radar Chart Polygon */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-indigo-50/30 rounded-3xl p-6 border border-slate-200/80 flex flex-col items-center justify-center min-h-[380px]">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center space-x-1">
              <PieChart className="w-3.5 h-3.5 text-blue-600" />
              <span>Polígono Radar Hexagonal</span>
            </span>
            <RadarChart data={orderedAreas} size={360} />
          </div>

          {/* Right Column: 6 Area Cards & Progress Bars */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {orderedAreas.map((item) => {
                const matchedSkills = topSkillsByArea[item.area] || [];

                return (
                  <div
                    key={item.area}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 capitalize leading-tight">
                          {item.area}
                        </span>
                        <span className="text-xs font-extrabold text-blue-700 font-mono">
                          {item.affinity}%
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.affinity}%` }}
                        />
                      </div>
                    </div>

                    {matchedSkills.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap gap-1">
                        {matchedSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-blue-100/70 text-blue-800 text-[10px] font-semibold rounded-md flex items-center space-x-1"
                          >
                            <CheckCircle className="w-2.5 h-2.5 text-blue-600" />
                            <span>{s}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100/80 text-[11px] text-slate-600 flex items-center justify-between font-mono">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>6/6 Áreas técnicas normalizadas (0% a 100%)</span>
              </span>
              <span className="text-slate-400">HU-1 Cumplida</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
