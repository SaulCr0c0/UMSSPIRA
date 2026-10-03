'use client';

import React, { useState } from 'react';
import { AffinityAreaScore } from '@umsspira/shared-types/src/affinity';
import { clampPercentage, formatPercentage } from '../utils/percentage';

// 1. Contrato estricto: Las 6 áreas en orden exacto
const AXES_ORDER = [
  'software-development',
  'cloud-devops',
  'data-ai',
  'quality-assurance',
  'cybersecurity-networks',
  'it-management',
] as const;

type AreaId = typeof AXES_ORDER[number];

const AREA_LABELS: Record<AreaId, string> = {
  'software-development': 'Desarrollo de Software',
  'cloud-devops': 'Cloud/DevOps',
  'data-ai': 'Ciencia de Datos/IA',
  'quality-assurance': 'QA',
  'cybersecurity-networks': 'Ciberseguridad',
  'it-management': 'Gestión TI',
};

// Etiquetas abreviadas para la variante miniatura
const AREA_SHORT_LABELS: Record<AreaId, string> = {
  'software-development': 'Desarrollo',
  'cloud-devops': 'Cloud',
  'data-ai': 'Datos & IA',
  'quality-assurance': 'QA & Testing',
  'cybersecurity-networks': 'Ciberseg.',
  'it-management': 'Gestión',
};

interface AffinityRadarProps {
  affinityData?: AffinityAreaScore[];
  hasData?: boolean;
  variant?: 'full' | 'mini'; // "full" = interactivo; "mini" = solo lectura para tarjetas
  highlighted?: boolean; // Solo aplica a mini: pinta el radar en rojo (tarjeta destacada)
}

export default function AffinityRadar({ 
  affinityData = [], 
  hasData = true,
  variant = 'full',
  highlighted = false,
}: AffinityRadarProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const isMini = variant === 'mini';

  // Único criterio de estado vacío
  const isRadarEmpty = !hasData || affinityData.length === 0;

  // Mapear los datos al orden fijo y aplicar utilidades de porcentaje
  const chartData = AXES_ORDER.map((id) => {
    const found = affinityData.find((a) => a.area === id);
    const rawValue = found ? found.affinity : 0;
    
    return {
      id,
      label: AREA_LABELS[id],
      shortLabel: AREA_SHORT_LABELS[id],
      value: clampPercentage(rawValue), // Número para calcular coordenadas en el SVG
      displayValue: formatPercentage(rawValue), // Texto "XX%" para mostrar en la UI
    };
  });

  const size = 400;
  const center = size / 2;
  const radius = (size / 2) - 60;
  const angleStep = (Math.PI * 2) / AXES_ORDER.length;

  const getCoordinatesForValue = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Puntos del polígono de afinidad
  const polygonPoints = chartData
    .map((data, i) => {
      const { x, y } = getCoordinatesForValue(data.value, i);
      return `${x},${y}`;
    })
    .join(' ');

  const selectedData = chartData.find((d) => d.id === selectedArea);
  // La variante mini ensancha el viewBox para que quepan las etiquetas laterales
  const viewBox = isMini ? `-100 -20 ${size + 200} ${size + 40}` : `0 0 ${size} ${size}`;

  return (
    <div
      className={
        isMini
          ? 'flex flex-col items-center justify-center w-full max-w-[280px] mx-auto'
          : 'flex flex-col items-center justify-center w-full max-w-md mx-auto p-4'
      }
    >
      <div className="relative w-full aspect-square">
        <svg viewBox={viewBox} className="w-full h-full overflow-visible">
          {/* Ejes de fondo (telaraña) */}
          {[20, 40, 60, 80, 100].map((level) => (
            <polygon
              key={`grid-${level}`}
              points={chartData
                .map((_, i) => {
                  const { x, y } = getCoordinatesForValue(level, i);
                  return `${x},${y}`;
                })
                .join(' ')}
              className="fill-none stroke-gray-200 stroke-1"
            />
          ))}

          {/* Líneas de los ejes */}
          {chartData.map((_, i) => {
            const { x, y } = getCoordinatesForValue(100, i);
            return (
              <line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                className="stroke-gray-300 stroke-1"
              />
            );
          })}

          {/* Polígono de datos (solo si hay datos) */}
          {!isRadarEmpty && (
            <polygon
              points={polygonPoints}
              className={
                isMini
                  ? highlighted
                    ? 'fill-red-700/20 stroke-red-700 stroke-2 transition-all duration-500'
                    : 'fill-amber-800/15 stroke-slate-800 stroke-2 transition-all duration-500'
                  : 'fill-blue-500/30 stroke-blue-600 stroke-2 transition-all duration-500'
              }
            />
          )}

          {/* Vértices interactivos solo en la variante completa (solo si hay datos) */}
          {!isRadarEmpty &&
            chartData.map((data, i) => {
              const { x, y } = getCoordinatesForValue(data.value, i);
              const isSelected = selectedArea === data.id;

              if (isMini) {
                return (
                  <circle
                    key={`point-${data.id}`}
                    cx={x}
                    cy={y}
                    r={5}
                    strokeWidth={3}
                    className={highlighted ? 'fill-white stroke-red-700' : 'fill-white stroke-slate-800'}
                  />
                );
              }

              return (
                <g
                  key={`point-${data.id}`}
                  className="cursor-pointer"
                  onClick={() => setSelectedArea(data.id)}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                >
                  {/* Área de clic expandida transparente */}
                  <circle cx={x} cy={y} r={15} fill="transparent" />
                  <circle
                    cx={x}
                    cy={y}
                    r={5}
                    className={`transition-transform duration-200 ${
                      isSelected ? 'fill-blue-700 scale-125' : 'fill-blue-500 hover:scale-125'
                    }`}
                  />
                </g>
              );
            })}

          {/* Etiquetas (Labels) */}
          {chartData.map((data, i) => {
            if (isMini) {
              // Mini vacía: solo cuadrícula, sin etiquetas ni porcentajes (CA-HU2-05)
              if (isRadarEmpty) return null;

              const { x, y } = getCoordinatesForValue(118, i);
              let textAnchor: 'start' | 'middle' | 'end' = 'middle';
              if (x > center + 12) textAnchor = 'start';
              if (x < center - 12) textAnchor = 'end';

              return (
                <text
                  key={`label-${data.id}`}
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  dominantBaseline="middle"
                  fontSize={18}
                  className="font-medium fill-slate-700"
                >
                  {`${data.shortLabel} (${data.displayValue})`}
                </text>
              );
            }

            const { x, y } = getCoordinatesForValue(115, i);
            const isSelected = selectedArea === data.id;

            return (
              <text
                key={`label-${data.id}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-xs md:text-sm font-medium cursor-pointer transition-colors ${
                  isSelected ? 'fill-blue-700 font-bold' : 'fill-gray-600 hover:fill-blue-500'
                }`}
                onClick={() => setSelectedArea(data.id)}
              >
                {data.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Sección inferior (solo full y con datos) */}
      {!isMini && !isRadarEmpty && (
        <div className="mt-6 w-full min-h-[100px] bg-slate-50 rounded-lg p-4 flex flex-col items-center justify-center text-center border border-slate-100">
          <p className="text-xs text-slate-500 font-semibold mb-1 tracking-wider">
            ÁREA SELECCIONADA (CLICK)
          </p>
          {selectedData ? (
            <>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-lg font-bold text-slate-800">{selectedData.label}</h3>
              </div>
              <p className="text-2xl font-black text-blue-600 mt-2">
                {selectedData.displayValue}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400 mt-2 italic">
              Selecciona un área en el radar para ver el detalle de afinidad del titulado.
            </p>
          )}
        </div>
      )}
    </div>
  );
}