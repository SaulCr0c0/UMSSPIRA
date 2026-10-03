'use client';

import React from 'react';

export interface RadarDataPoint {
  area: string;
  affinity: number; // Porcentaje entero de 0 a 100
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  selectedArea?: string;
  onAreaClick?: (area: string) => void;
  accentColor?: string;
  fillColor?: string;
  isLoading?: boolean;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 280,
  accentColor = '#A35139', // Color de acento por defecto (Truffle Trouble)
  fillColor = 'rgba(163, 81, 57, 0.25)',
  isLoading = false,
}) => {
  const center = size / 2;
  const radius = (size - 90) / 2;
  const totalAxes = 6;

  // Niveles de la rejilla (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Angulo del eje i: el primer eje apunta hacia arriba (-90 grados)
  const getAngle = (index: number) => {
    return (Math.PI * 2 * index) / totalAxes - Math.PI / 2;
  };

  // Coordenadas cartesianas (x, y) de un punto del hexagono
  const getCoordinates = (index: number, ratio: number) => {
    const angle = getAngle(index);
    const r = radius * Math.min(1.0, Math.max(0.0, ratio));
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Lista de puntos del poligono en formato SVG
  const getPolygonPoints = (ratios: number[]) => {
    return ratios
      .map((ratio, i) => {
        const { x, y } = getCoordinates(i, ratio);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const dataRatios = data.map((d) => (d.affinity || 0) / 100);
  const dataPointsString = getPolygonPoints(dataRatios);

  return (
    <div className={`flex flex-col items-center justify-center p-1 select-none transition-all duration-500 ${isLoading ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        <defs>
          <radialGradient id="hexGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C9C1B1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#EEE9DF" stopOpacity="0.0" />
          </radialGradient>
        </defs>

        {/* Relleno de fondo del hexagono */}
        <polygon
          points={getPolygonPoints(Array(totalAxes).fill(1.0))}
          fill="url(#hexGlow)"
        />

        {/* Rejilla concentrica */}
        {gridLevels.map((level, idx) => (
          <polygon
            key={idx}
            points={getPolygonPoints(Array(totalAxes).fill(level))}
            fill="none"
            stroke="#C9C1B1"
            strokeWidth={level === 1.0 ? '1.5' : '1.0'}
            strokeDasharray={level < 1.0 ? '2,2' : undefined}
          />
        ))}

        {/* Radios del eje */}
        {Array.from({ length: totalAxes }).map((_, i) => {
          const outer = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#C9C1B1"
              strokeWidth="1"
            />
          );
        })}

        {/* Poligono con los datos */}
        <polygon
          points={dataPointsString}
          fill={fillColor}
          stroke={accentColor}
          strokeWidth="2"
          className="transition-all duration-500 ease-out"
        />

        {/* Vertices del poligono */}
        {data.map((item, i) => {
          const ratio = (item.affinity || 0) / 100;
          const { x, y } = getCoordinates(i, ratio);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="#FFFFFF"
              stroke={accentColor}
              strokeWidth="2"
              className="transition-all duration-500 ease-out"
            />
          );
        })}

        {/* Etiquetas de cada eje alrededor del hexagono */}
        {data.map((item, i) => {
          const labelCoords = getCoordinates(i, 1.28);
          const cleanScore = Math.min(100, Math.max(0, Math.round(item.affinity || 0)));

          let textAnchor: 'middle' | 'start' | 'end' = 'middle';
          if (labelCoords.x > center + 12) textAnchor = 'start';
          if (labelCoords.x < center - 12) textAnchor = 'end';

          // Nombre abreviado para que quepa en la tarjeta
          let shortName = item.area;
          if (shortName.toLowerCase().includes('desarrollo')) shortName = 'Desarrollo';
          else if (shortName.toLowerCase().includes('cloud')) shortName = 'Cloud/DevOps';
          else if (shortName.toLowerCase().includes('ciencia')) shortName = 'Datos & IA';
          else if (shortName.toLowerCase().includes('calidad')) shortName = 'QA & Testing';
          else if (shortName.toLowerCase().includes('ciberseguridad')) shortName = 'Ciberseguridad';
          else if (shortName.toLowerCase().includes('gestion')) shortName = 'Gestión TI';

          return (
            <g key={i}>
              <text
                x={labelCoords.x}
                y={labelCoords.y - 3}
                textAnchor={textAnchor}
                className="text-[10px] font-semibold fill-slate-700 font-sans tracking-tight"
              >
                {shortName}
              </text>
              <text
                x={labelCoords.x}
                y={labelCoords.y + 9}
                textAnchor={textAnchor}
                className="text-[10px] font-bold fill-abyssal-blue font-mono"
              >
                {cleanScore}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
