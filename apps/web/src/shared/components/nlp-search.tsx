'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Cpu, RefreshCw, Zap, Award } from 'lucide-react';
import type { RadarDataPoint } from './radar-chart';
import { computeMayorConcentracion } from '../utils/concentration';

export interface SearchCandidateResult {
  graduateId: string;
  name: string;
  career: string;
  graduationYear: number;
  skills: string[];
  professionalDescription: string;
  affinity: number;
  featured: boolean;
  nlpScore?: number;
  mayorConcentracion?: string;
  concentrationArea?: string;
  areas?: RadarDataPoint[];
}

interface NlpSearchProps {
  onSearchCompleted: (results: SearchCandidateResult[], query: string) => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
}

export const NlpSearch: React.FC<NlpSearchProps> = ({
  onSearchCompleted,
  isSearching,
  setIsSearching,
}) => {
  const [jobDescription, setJobDescription] = useState<string>(
    'Senior Full Stack, Cloud & Microservicios'
  );

  const handleExecuteNlpSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!jobDescription.trim()) return;

    setIsSearching(true);

    try {
      // Try backend Express endpoint at port 3002
      const response = await fetch('http://localhost:3002/api/nlp/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      });

      if (response.ok) {
        const data = await response.json();
        const results = (data.results || []).map((cand: SearchCandidateResult) => {
          const conc = computeMayorConcentracion(jobDescription, cand);
          return {
            ...cand,
            mayorConcentracion: conc,
            concentrationArea: conc,
          };
        });
        onSearchCompleted(results, jobDescription);
      } else {
        throw new Error('Backend HTTP error');
      }
    } catch {
      console.warn('[NLP Search] Using fallback vector calculation');
      const mockData = await import('../mocks/candidates-mock.json');
      const candidates = mockData.default.candidates;

      const keywords = jobDescription.toLowerCase().split(/\s+/);
      const results: SearchCandidateResult[] = candidates.map((cand) => {
        const text = `${cand.career} ${cand.skills.join(' ')} ${cand.professionalDescription}`.toLowerCase();
        let matches = 0;
        keywords.forEach((kw) => {
          if (kw.length > 2 && text.includes(kw)) matches++;
        });

        const rawScore = (matches / Math.max(3, keywords.length)) * 100 + cand.affinity * 0.4;
        const nlpScore = Number(Math.min(99.4, Math.max(48.0, rawScore)).toFixed(2));
        const conc = computeMayorConcentracion(jobDescription, cand as any);

        return {
          ...cand,
          nlpScore,
          mayorConcentracion: conc,
          concentrationArea: conc,
        };
      });

      results.sort((a, b) => (b.nlpScore ?? 0) - (a.nlpScore ?? 0));
      onSearchCompleted(results, jobDescription);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-abyssal-blue text-xs font-bold uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5 text-truffle-trouble" />
            <span>ALGORITMO DE COMPATIBILIDAD SIG-MATCH</span>
          </div>
          <h2 className="text-2xl font-black text-abyssal-blue tracking-tight uppercase">
            BUSCADOR DE TALENTO Y AFINIDAD PROFESIONAL
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Compara competencias de titulados de Sistemas e Informática mediante gráficos de afinidad calculados por NLP y valida sus respaldos académicos y certificaciones oficiales.
          </p>
        </div>

        {/* Stats Pill Card */}
        <div className="bg-blue-fantastic/5 border border-blue-fantastic/10 p-3.5 rounded-xl flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-abyssal-blue text-burning-flame flex items-center justify-center font-black text-lg">
            48
          </div>
          <div>
            <span className="text-xs font-bold text-abyssal-blue block">TITULADOS</span>
            <span className="text-[10px] text-slate-500">Con afinidad y SIS verificado</span>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleExecuteNlpSearch} className="space-y-3">
        <label className="block text-xs font-semibold text-slate-700">
          Buscar por tecnología o habilidad (ej. React, Python, Cloud, Microservicios)
        </label>

        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Senior Full Stack, Cloud & Microservicios..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burning-flame focus:border-burning-flame transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="px-7 py-2.5 bg-burning-flame hover:bg-burning-flame/90 active:bg-truffle-trouble text-abyssal-blue font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {isSearching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Calculando NLP...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Buscar</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
