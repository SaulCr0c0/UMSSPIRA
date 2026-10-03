'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import AffinityRadar from '@/shared/components/affinity-radar';
import { RecalculateButton } from './recalculate-button';
import { AffinityTabs } from './affinity-tabs';
import { AffinityCustomizer } from './affinity-customizer';
import { PendingChangesDialog } from './pending-changes-dialog';
import { RadarErrorState } from './radar-error-state';
import { SuccessToast } from './success-toast';
import { useRecalculateState } from '../hooks/use-recalculate-state';
import { recalculateAffinity, getAffinityVector } from '../services/affinity-service';
import { AFFINITY_AREAS, type AffinityArea } from '@umsspira/shared-types/src/affinity';
import { ArrowLeft, Code, Database, Cloud, ShieldAlert, Lock, Target, AlertTriangle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const AREA_ICONS: Record<AffinityArea, React.ElementType> = {
  'software-development': Code,
  'cloud-devops': Cloud,
  'data-ai': Database,
  'quality-assurance': Target,
  'cybersecurity-networks': Lock,
  'it-management': ShieldAlert,
};

const AREA_LABELS: Record<AffinityArea, string> = {
  'software-development': 'Desarrollo de Software',
  'cloud-devops': 'Cloud/DevOps e Infraestructura',
  'data-ai': 'Ciencia de Datos/IA',
  'quality-assurance': 'Aseguramiento de Calidad (QA)',
  'cybersecurity-networks': 'Ciberseguridad y Redes',
  'it-management': 'Gestión de TI',
};

// Mapeo inverso de etiqueta legible a clave técnica del sistema
const REVERSE_AREA_LABELS: Record<string, string> = {
  'Desarrollo de Software': 'software-development',
  'Cloud/DevOps e Infraestructura': 'cloud-devops',
  'Ciencia de Datos/IA': 'data-ai',
  'Aseguramiento de Calidad (QA)': 'quality-assurance',
  'Ciberseguridad y Redes': 'cybersecurity-networks',
  'Gestión de TI': 'it-management',
};

export const GraduateAffinityView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileState, setProfileState] = useState<'calculated' | 'customizing'>('calculated');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasRadarError, setHasRadarError] = useState<boolean>(false);
  const [hasValidRadar, setHasValidRadar] = useState<boolean>(false);
  const [changeVersion, setChangeVersion] = useState<number>(0);
  const [isPendingDialogOpen, setIsPendingDialogOpen] = useState<boolean>(false);
  const [isSuccessToastOpen, setIsSuccessToastOpen] = useState<boolean>(false);
  
  // Estado para los IDs de áreas modificadas (Punto 3)
  const [changedAreaIds, setChangedAreaIds] = useState<string[]>([]);

  const [candidateAreas, setCandidateAreas] = useState([
    { area: 'Desarrollo de Software', affinity: 95 },
    { area: 'Cloud/DevOps e Infraestructura', affinity: 64 },
    { area: 'Ciencia de Datos/IA', affinity: 71 },
    { area: 'Aseguramiento de Calidad (QA)', affinity: 58 },
    { area: 'Ciberseguridad y Redes', affinity: 42 },
    { area: 'Gestión de TI', affinity: 50 },
  ]);

  const isRecalculatingRef = useRef<boolean>(false);
  const changeVersionRef = useRef<number>(0);

  const { hasPendingChanges, markPendingChanges, clearPendingChanges } = useRecalculateState();

  useEffect(() => {
    if (changeVersion === 0 || !hasPendingChanges) return;
    setIsPendingDialogOpen(true);
  }, [changeVersion, hasPendingChanges]);

  useEffect(() => {
    async function loadInitialVector() {
      try {
        setIsLoading(true);
        const result = await getAffinityVector();
        setCandidateAreas(
          result.areas.map((a) => ({
            area: AREA_LABELS[a.area as keyof typeof AREA_LABELS] || a.area,
            affinity: a.affinity,
          }))
        );
        setHasValidRadar(true);
        setHasRadarError(false);
      } catch {
        setHasRadarError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialVector();
  }, []);

  const handleRecalculate = useCallback(async () => {
    if (isRecalculatingRef.current) return;
    if (!hasPendingChanges && !hasRadarError) return;

    isRecalculatingRef.current = true;
    setIsLoading(true);
    setIsPendingDialogOpen(false);
    const versionAtStart = changeVersionRef.current;

    try {
      // Guardamos el estado anterior para comparar porcentajes
      const previousAreas = [...candidateAreas];

      const result = await recalculateAffinity();
      const newAreasMapped = result.areas.map((a) => ({
        area: a.area,
        affinity: a.affinity,
      }));

      // Detectar qué áreas cambiaron su porcentaje respecto al radar anterior (Punto 3)
      const modifiedIds: string[] = [];
      result.areas.forEach((newAreaItem) => {
        const technicalKey = newAreaItem.area;
        const readableLabel = AREA_LABELS[technicalKey as keyof typeof AREA_LABELS] || technicalKey;
        
        const oldItem = previousAreas.find((p) => p.area === technicalKey);
        if (!oldItem || oldItem.affinity !== newAreaItem.affinity) {
          modifiedIds.push(technicalKey);
        }
      });

      setChangedAreaIds(modifiedIds);
      setCandidateAreas(newAreasMapped);

      if (changeVersionRef.current === versionAtStart) {
        clearPendingChanges();
      }
      setHasRadarError(false);
      setHasValidRadar(true);
      setIsSuccessToastOpen(true);
    } catch {
      setHasRadarError(true);
    } finally {
      isRecalculatingRef.current = false;
      setIsLoading(false);
    }
  }, [hasPendingChanges, hasRadarError, clearPendingChanges, candidateAreas]);

  const handleProfileChange = useCallback(() => {
    changeVersionRef.current += 1;
    setChangeVersion(changeVersionRef.current);
    markPendingChanges();
  }, [markPendingChanges]);

  const handleDismissPendingChanges = useCallback(() => {
    setIsPendingDialogOpen(false);
  }, []);

  const handleCloseToast = useCallback(() => {
    setIsSuccessToastOpen(false);
  }, []);

  const triggerTimeoutSimulation = useCallback(async () => {
    setIsLoading(true);
    setHasRadarError(false);
    await new Promise((resolve) => setTimeout(resolve, 7000));
    setHasRadarError(true);
    setIsLoading(false);
  }, []);

  const areaIcons = AFFINITY_AREAS.map((area) => {
    const technicalKey = area; // ej: 'software-development'
    const readableLabel = AREA_LABELS[area]; // ej: 'Desarrollo de Software'

    // Buscamos de forma flexible ya sea que candidateAreas tenga la clave técnica o el texto legible
    const foundItem = candidateAreas.find(
      (c) => c.area === technicalKey || c.area === readableLabel || c.area?.toLowerCase() === readableLabel.toLowerCase()
    );

    return {
      area: readableLabel,
      score: foundItem ? foundItem.affinity : 0,
      icon: AREA_ICONS[area],
    };
  });
  
  const radarData =
    hasRadarError && !hasValidRadar
      ? candidateAreas.map((item) => ({ ...item, affinity: Number.NaN }))
      : candidateAreas;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <a
            href="#"
            className="text-[13px] font-semibold text-truffle-trouble hover:underline flex items-center space-x-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a mi perfil</span>
          </a>
          <h1 className="text-[22px] sm:text-[32px] font-bold text-abyssal-blue tracking-tight">
            Tu afinidad profesional
          </h1>
          <p className="text-[13px] sm:text-sm text-blue-fantastic mt-1 max-w-xl">
            Visualiza las áreas profesionales que más se relacionan con tu perfil académico y experiencia.
          </p>
        </div>

        <AffinityTabs activeTab={profileState} onTabChange={setProfileState} />
      </div>

      {profileState === 'calculated' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-oatmeal flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-palladian pb-4 mb-4">
                <h3 className="font-bold text-abyssal-blue text-base">Gráfico de afinidad</h3>
                <span className="text-xs font-mono font-semibold text-truffle-trouble bg-palladian px-2.5 py-1 rounded-md border border-oatmeal flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-truffle-trouble" />
                  <span>Vector Calculado NLP</span>
                </span>
              </div>

              <div className="relative py-4 flex flex-col items-center justify-center bg-palladian/40 rounded-xl border border-oatmeal/60">
                <div className={hasRadarError && hasValidRadar ? 'opacity-40' : undefined}>
                  <AffinityRadar
                    affinityData={radarData as any}
                    hasData={hasValidRadar}
                    variant="full"
                    isLoading={isLoading}
                    changedAreaIds={changedAreaIds}
                  />
                </div>

                {hasRadarError && (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <RadarErrorState onRetry={handleRecalculate} isRetrying={isLoading} />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-palladian mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[13px] text-blue-fantastic">
                Áreas profesionales, porcentaje de afinidad y palabras clave relacionadas con tu perfil.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={handleProfileChange}
                  className="h-11 px-4 rounded-lg border border-oatmeal bg-white text-blue-fantastic text-sm font-semibold hover:bg-palladian transition-colors"
                >
                  Simular cambio en el perfil
                </button>

                <RecalculateButton
                  hasPendingChanges={hasPendingChanges}
                  isLoading={isLoading}
                  onRecalculate={handleRecalculate}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-oatmeal flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-palladian pb-4">
                <h3 className="font-bold text-abyssal-blue text-base">Resumen de tu afinidad</h3>
                <span className="px-3 py-1 rounded-full bg-palladian text-truffle-trouble border border-oatmeal text-xs font-semibold flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-truffle-trouble" />
                  <span>Verificado</span>
                </span>
              </div>

              <p className="text-[13px] text-blue-fantastic">
                Porcentajes de afinidad por área a partir de las palabras clave de tu perfil:
              </p>

              <div className="space-y-2.5">
                {areaIcons.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-palladian/50 border border-oatmeal/80 hover:border-oatmeal transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-white border border-oatmeal text-blue-fantastic">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[13px] font-semibold text-abyssal-blue">{item.area}</span>
                      </div>

                      <span className="text-[13px] font-bold text-truffle-trouble font-mono">
                        {item.score}%
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl bg-palladian/70 border border-oatmeal/70 text-[13px] text-blue-fantastic space-y-1">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-truffle-trouble shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-xs">
                    Los resultados se actualizarán automáticamente cada vez que agregues nuevos títulos académicos, experiencia laboral o certificaciones oficiales.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button className="w-full py-3 bg-burning-flame hover:bg-burning-flame/90 text-abyssal-blue font-semibold text-sm rounded-lg transition-all flex items-center justify-center space-x-2 h-11">
                <span>Completar perfil</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-end pt-3 border-t border-dashed border-oatmeal mt-3">  
            </div>
          </div>
          <button
            type="button"
            onClick={triggerTimeoutSimulation}
            className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Simular Timeout (7s)
          </button>
        </div>
      ) : (
        <AffinityCustomizer />
      )}
      <div className="mt-6 flex justify-start">
        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
          }}
          className="px-6 py-2.5 bg-[#FFB054] hover:bg-[#e09843] text-slate-900 font-semibold text-sm rounded-full flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
        >
          <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Añadir certificaciones</span>
        </button>
      </div>

      <PendingChangesDialog
        open={isPendingDialogOpen}
        onRecalculate={handleRecalculate}
        onDismiss={handleDismissPendingChanges}
      />
      <SuccessToast open={isSuccessToastOpen} onClose={handleCloseToast} />
      
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 border border-slate-100">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">Añadir nueva certificación</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Simula el ingreso de una certificación oficial para actualizar los vectores de afinidad mediante NLP.
            </p>

            <div className="pt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  handleProfileChange();
                  handleRecalculate();
                  setIsModalOpen(false);
                }}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Simular cambio en el perfil</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};