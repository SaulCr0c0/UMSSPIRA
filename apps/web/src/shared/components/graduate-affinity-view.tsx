'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { RadarChart } from './radar-chart';
import { RecalculateButton } from './recalculate-button';
import { AffinityTabs } from './affinity-tabs';
import { AffinityCustomizer } from './affinity-customizer';
import { PendingChangesDialog } from './pending-changes-dialog';
import { RadarErrorState } from './radar-error-state';
import { SuccessToast } from './success-toast';
import { useRecalculateState } from '../hooks/use-recalculate-state';
import { recalculateAffinity } from '../services/affinity-service';
import { AFFINITY_AREAS, type AffinityArea } from '@umsspira/shared-types';
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

export const GraduateAffinityView: React.FC = () => {
  const [profileState, setProfileState] = useState<'calculated' | 'customizing'>('calculated');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasRadarError, setHasRadarError] = useState<boolean>(false);
  // Distingue un radar ya calculado de los valores iniciales de referencia
  const [hasValidRadar, setHasValidRadar] = useState<boolean>(false);
  const [changeVersion, setChangeVersion] = useState<number>(0);
  const [isPendingDialogOpen, setIsPendingDialogOpen] = useState<boolean>(false);
  const [isSuccessToastOpen, setIsSuccessToastOpen] = useState<boolean>(false);
  const [candidateAreas, setCandidateAreas] = useState([
    { area: 'Desarrollo de Software', affinity: 95 },
    { area: 'Cloud/DevOps e Infraestructura', affinity: 64 },
    { area: 'Ciencia de Datos/IA', affinity: 71 },
    { area: 'Aseguramiento de Calidad (QA)', affinity: 58 },
    { area: 'Ciberseguridad y Redes', affinity: 42 },
    { area: 'Gestión de TI', affinity: 50 },
  ]);
  const isRecalculatingRef = useRef<boolean>(false);
  // El ref es la fuente de verdad del contador: se lee dentro del recálculo asíncrono
  const changeVersionRef = useRef<number>(0);

  const { hasPendingChanges, markPendingChanges, clearPendingChanges } = useRecalculateState();

  // El diálogo se abre solo cuando hay un cambio nuevo registrado, de modo que
  // "Ahora no" lo cierra sin que vuelva a aparecer hasta la próxima modificación.
  useEffect(() => {
    if (changeVersion === 0 || !hasPendingChanges) return;
    setIsPendingDialogOpen(true);
  }, [changeVersion, hasPendingChanges]);

  const handleRecalculate = useCallback(async () => {
    if (isRecalculatingRef.current) return;
    // Con error se permite reintentar aunque no haya cambios nuevos pendientes
    if (!hasPendingChanges && !hasRadarError) return;

    isRecalculatingRef.current = true;
    setIsLoading(true);
    setIsPendingDialogOpen(false);
    const versionAtStart = changeVersionRef.current;

    try {
      const result = await recalculateAffinity();
      setCandidateAreas(
        result.areas.map((a) => ({
          area: AREA_LABELS[a.area] || a.area,
          affinity: a.affinity,
        }))
      );
      // Si la versión cambió durante el recálculo, hay cambios nuevos que no se han aplicado
      if (changeVersionRef.current === versionAtStart) {
        clearPendingChanges();
      }
      // El aviso de error se retira solo cuando vuelve a existir un radar válido
      setHasRadarError(false);
      setHasValidRadar(true);
      setIsSuccessToastOpen(true);
    } catch {
      // El fallo se muestra sobre el radar; hasPendingChanges se conserva para poder reintentar
      setHasRadarError(true);
    } finally {
      isRecalculatingRef.current = false;
      setIsLoading(false);
    }
  }, [hasPendingChanges, hasRadarError, clearPendingChanges]);

  // Simula una modificación del perfil: es la única fuente de cambios pendientes
  // mientras las ponderaciones vengan de la base de datos en solo lectura.
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

  const areaIcons = AFFINITY_AREAS.map((area) => ({
    area: AREA_LABELS[area],
    score: candidateAreas.find((c) => c.area === AREA_LABELS[area])?.affinity ?? 0,
    icon: AREA_ICONS[area],
  }));

  // Sin un radar ya calculado, las etiquetas muestran --% para no presentar
  // como válido un porcentaje que nunca se ha obtenido del sistema.
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
                  <RadarChart
                    data={radarData}
                    size={320}
                    accentColor="#A35139"
                    fillColor="rgba(163, 81, 57, 0.22)"
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

              {/* En móvil los botones ocupan el ancho completo de la tarjeta */}
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
          </div>
        </div>
      ) : (
        <AffinityCustomizer />
      )}

      <PendingChangesDialog
        open={isPendingDialogOpen}
        onRecalculate={handleRecalculate}
        onDismiss={handleDismissPendingChanges}
      />
      <SuccessToast open={isSuccessToastOpen} onClose={handleCloseToast} />
    </div>
  );
};
