import React from 'react';
import { render, screen } from '@testing-library/react';
import { CandidateCard } from './candidate-card';
import { computeMayorConcentracion } from '../utils/concentration';

describe('CandidateCard Component (HU4)', () => {
  const mockCandidate = {
    graduateId: '00000000-0000-0000-0000-000000000001',
    name: 'Carlos Mendoza',
    career: 'Ingeniería de Sistemas',
    graduationYear: 2024,
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    professionalDescription: 'Desarrollador de software web.',
    affinity: 92.5,
    areas: [
      { area: 'desarrollo de software', affinity: 95 },
      { area: 'cloud & devops', affinity: 64 },
      { area: 'ciencia de datos & ia', affinity: 71 },
      { area: 'aseguramiento de calidad (QA)', affinity: 58 },
      { area: 'ciberseguridad y redes', affinity: 42 },
      { area: 'gestion de ti & gobernanza', affinity: 50 },
    ],
  };

  it('renders "Ver Detalle" button instead of "Ver Perfil"', () => {
    render(<CandidateCard {...mockCandidate} mayorConcentracion="Redes y Telecomunicaciones" />);

    expect(screen.getByText('Ver Detalle')).toBeInTheDocument();
    expect(screen.queryByText('Ver Perfil')).not.toBeInTheDocument();
  });

  it('renders dynamic mayorConcentracion passed via prop', () => {
    render(<CandidateCard {...mockCandidate} mayorConcentracion="Redes y Telecomunicaciones" />);

    expect(screen.getByText('Mayor concentración:')).toBeInTheDocument();
    expect(screen.getByText('Redes y Telecomunicaciones')).toBeInTheDocument();
  });

  it('computes concentration dynamically based on recruiter search query', () => {
    const concRedes = computeMayorConcentracion('senior en redes', mockCandidate);
    expect(concRedes).toBe('Redes y Telecomunicaciones');

    const concCiber = computeMayorConcentracion('especialista en ciberseguridad', mockCandidate);
    expect(concCiber).toBe('Ciberseguridad');

    const concQA = computeMayorConcentracion('QA y testing', mockCandidate);
    expect(concQA).toBe('QA & Testing');

    const concData = computeMayorConcentracion('Python y ciencia de datos', mockCandidate);
    expect(concData).toBe('Datos & IA');

    const concBackend = computeMayorConcentracion('desarrollo backend', mockCandidate);
    expect(concBackend).toBe('Desarrollo Backend & Arquitectura');

    const concCloud = computeMayorConcentracion('cloud y devops', mockCandidate);
    expect(concCloud).toBe('Cloud & DevOps');
  });
});
