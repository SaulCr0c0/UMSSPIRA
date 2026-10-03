import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AffinityRadar from './affinity-radar';

// Mock de las funciones reales de porcentaje
jest.mock('../utils/percentage', () => ({
  clampPercentage: (val: number) => Math.min(Math.max(Math.round(val), 0), 100),
  formatPercentage: (val: number) => `${Math.min(Math.max(Math.round(val), 0), 100)}%`,
}));

const mockData = [
  { area: 'software-development', affinity: 85.5 }, // Debería redondear a 86%
  { area: 'cloud-devops', affinity: 70 },
  { area: 'data-ai', affinity: 90 },
  { area: 'quality-assurance', affinity: 60 },
  { area: 'cybersecurity-networks', affinity: 45 },
  { area: 'it-management', affinity: 80 },
];

describe('AffinityRadar Component', () => {
  // --- TUS TESTS ORIGINALES (Intactos) ---
  it('renderiza las 6 áreas en el orden fijo', () => {
    render(<AffinityRadar affinityData={mockData as any} hasData={true} />);

    expect(screen.getByText('Desarrollo de Software')).toBeInTheDocument();
    expect(screen.getByText('Cloud/DevOps')).toBeInTheDocument();
    expect(screen.getByText('Ciencia de Datos/IA')).toBeInTheDocument();
    expect(screen.getByText('QA')).toBeInTheDocument();
    expect(screen.getByText('Ciberseguridad')).toBeInTheDocument();
    expect(screen.getByText('Gestión TI')).toBeInTheDocument();
  });

  it('muestra los detalles correctos al hacer clic en un área y reemplaza la selección', () => {
    render(<AffinityRadar affinityData={mockData as any} hasData={true} />);

    // Verificar estado inicial vacío
    expect(screen.getByText('Selecciona un área en el radar para ver el detalle de afinidad del titulado.')).toBeInTheDocument();

    // Clic en la primera área (Desarrollo de Software)
    const softwareDevLabel = screen.getByText('Desarrollo de Software');
    fireEvent.click(softwareDevLabel);

    // Debe mostrar la etiqueta correcta y el porcentaje redondeado formateado
    expect(screen.getByText('ÁREA SELECCIONADA (CLICK)')).toBeInTheDocument();
    expect(screen.getByText('86%')).toBeInTheDocument(); 

    // Clic en la segunda área (Cloud/DevOps)
    const cloudDevopsLabel = screen.getByText('Cloud/DevOps');
    fireEvent.click(cloudDevopsLabel);

    // Debe reemplazar el 86% anterior por el 70% de Cloud
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.queryByText('86%')).not.toBeInTheDocument();
  });

  // --- NUEVOS TESTS SOLICITADOS EN LA REVISIÓN ---
  it('no debe renderizar el polígono ni el panel inferior cuando hasData={false}', () => {
    const { container } = render(<AffinityRadar affinityData={mockData as any} hasData={false} />);

    // Verifica que NO exista el polígono de datos
    expect(container.querySelector('polygon.fill-blue-500\\/30')).not.toBeInTheDocument();
    // Verifica que NO exista el panel inferior interactivo
    expect(screen.queryByText(/ÁREA SELECCIONADA/i)).not.toBeInTheDocument();
    
    // Verifica que las etiquetas de los ejes sigan mostrándose (sin porcentajes, CA-HU2-05)
    expect(screen.getByText('Desarrollo de Software')).toBeInTheDocument();
  });

  it('no debe renderizar el polígono ni el panel inferior cuando affinityData está vacío', () => {
    const { container } = render(<AffinityRadar affinityData={[]} hasData={true} />);

    expect(container.querySelector('polygon.fill-blue-500\\/30')).not.toBeInTheDocument();
    expect(screen.queryByText(/ÁREA SELECCIONADA/i)).not.toBeInTheDocument();
    
    // Los ejes base de la telaraña deben seguir ahí
    expect(screen.getByText('Desarrollo de Software')).toBeInTheDocument();
  });
});

// Para el radar miniatura
describe('AffinityRadar variante mini', () => {
  it('no muestra el panel de area seleccionada', () => {
    render(<AffinityRadar affinityData={mockData as any} variant="mini" />);

    expect(screen.queryByText('ÁREA SELECCIONADA (CLICK)')).not.toBeInTheDocument();
  });

  it('muestra etiquetas cortas con porcentaje', () => {
    render(<AffinityRadar affinityData={mockData as any} variant="mini" />);

    expect(screen.getByText('Desarrollo (86%)')).toBeInTheDocument();
    expect(screen.getByText('Cloud (70%)')).toBeInTheDocument();
    expect(screen.getByText('Datos & IA (90%)')).toBeInTheDocument();
    expect(screen.getByText('QA & Testing (60%)')).toBeInTheDocument();
    expect(screen.getByText('Ciberseg. (45%)')).toBeInTheDocument();
    expect(screen.getByText('Gestión (80%)')).toBeInTheDocument();
  });

  it('es de solo lectura: no responde a clics', () => {
    const { container } = render(
      <AffinityRadar affinityData={mockData as any} variant="mini" />
    );

    expect(container.querySelector('.cursor-pointer')).toBeNull();

    fireEvent.click(screen.getByText('Desarrollo (86%)'));
    expect(screen.queryByText('ÁREA SELECCIONADA (CLICK)')).not.toBeInTheDocument();
  });

  it('pinta el radar en rojo solo cuando esta destacado', () => {
    const { container, rerender } = render(
      <AffinityRadar affinityData={mockData as any} variant="mini" />
    );
    expect(container.querySelector('polygon.stroke-red-700')).toBeNull();

    rerender(<AffinityRadar affinityData={mockData as any} variant="mini" highlighted />);
    expect(container.querySelector('polygon.stroke-red-700')).not.toBeNull();
  });

  it('en estado vacío muestra solo la cuadrícula, sin polígono ni porcentajes', () => {
    const expectOnlyGrid = (container: HTMLElement) => {
      // Solo los 5 polígonos de la cuadrícula, ninguno de datos
      expect(container.querySelectorAll('polygon')).toHaveLength(5);
      expect(container.querySelector('polygon.stroke-red-700')).toBeNull();
      expect(container.querySelector('polygon.stroke-slate-800')).toBeNull();
      // Sin vértices
      expect(container.querySelectorAll('circle')).toHaveLength(0);
      // Sin etiquetas ni porcentajes
      expect(container.querySelectorAll('text')).toHaveLength(0);
      expect(screen.queryByText(/%/)).not.toBeInTheDocument();
      expect(screen.queryByText('ÁREA SELECCIONADA (CLICK)')).not.toBeInTheDocument();
    };

    // Caso 1: hasData en false (aunque haya datos)
    const { container, rerender } = render(
      <AffinityRadar affinityData={mockData as any} hasData={false} variant="mini" highlighted />
    );
    expectOnlyGrid(container);

    // Caso 2: affinityData vacío
    rerender(<AffinityRadar affinityData={[]} hasData={true} variant="mini" highlighted />);
    expectOnlyGrid(container);
  });
});