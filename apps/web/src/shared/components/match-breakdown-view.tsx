"use client";

import { Applicant } from "../types/applicant";

export function MatchBreakdownView({
  applicant,
  onBack,
}: {
  applicant: Applicant;
  onBack: () => void;
}) {
  const initials = applicant.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="space-y-6">
      {/* Botón Volver */}
      <button
        onClick={onBack}
        className="text-sm font-semibold text-[#1B2632] hover:underline flex items-center gap-1"
      >
        ← Volver
      </button>

      {/* Cabecera del Candidato */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EEE9DF] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#EEE9DF] text-[#1B2632] font-bold flex items-center justify-center text-xl shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1B2632]">{applicant.name}</h2>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                {applicant.experienceLevel}
              </span>
            </div>
            <p className="text-sm text-gray-500">{applicant.email}</p>
            <p className="text-sm text-gray-500">{applicant.location}</p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
            ✓
          </div>
          <div>
            <span className="text-lg font-bold text-emerald-700">
              {applicant.matchPercentage}%
            </span>
            <p className="text-[11px] text-emerald-600 font-medium">Coincidencia técnica</p>
          </div>
        </div>
      </div>

      {/* Desglose Gráfico */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EEE9DF] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Dona Visual de Match */}
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl">
            <h3 className="text-sm font-bold text-[#1B2632] mb-4">
              Resultado de coincidencia técnica
            </h3>
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${applicant.matchPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-[#1B2632]">
                  {applicant.matchPercentage}%
                </span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase">
                  Coincidencia Alta
                </span>
              </div>
            </div>
          </div>

          {/* Barras por Habilidad */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#1B2632] mb-2">Desglose por habilidades</h3>
            {applicant.skills.map((s) => (
              <div key={s.skill} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-[#1B2632]">
                  <span>{s.skill}</span>
                  <span>{s.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recomendación */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-sm">
          <span className="font-bold">✓</span>
          <p>
            El candidato cumple con el <strong>{applicant.matchPercentage}%</strong> de los
            requisitos técnicos de la vacante. Se recomienda considerarlo para la siguiente
            etapa del proceso.
          </p>
        </div>
      </div>
    </div>
  );
}