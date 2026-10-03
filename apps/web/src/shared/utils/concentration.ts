import type { RadarDataPoint } from '../components/radar-chart';

export interface CandidateLike {
  graduateId: string;
  name: string;
  career: string;
  skills: string[];
  areas?: RadarDataPoint[];
  mayorConcentracion?: string;
  concentrationArea?: string;
  [key: string]: any;
}

export function computeMayorConcentracion(
  jobDescription: string,
  candidate: CandidateLike
): string {
  const query = (jobDescription || '').toLowerCase().trim();

  const areaKeywords: Record<string, string[]> = {
    'desarrollo de software': [
      'typescript', 'react', 'node.js', 'nodejs', 'postgresql', 'next.js', 'tailwind',
      'java', 'spring', 'boot', 'microservicios', 'rest', 'api', 'desarrollo', 'software',
      'frontend', 'backend', 'fullstack', 'full stack', 'web', 'programador', 'developer'
    ],
    'cloud & devops': [
      'aws', 'docker', 'kubernetes', 'ci/cd', 'cicd', 'terraform', 'linux', 'cloud',
      'infraestructura', 'devops', 'nube', 'sysadmin', 'sre', 'despliegue'
    ],
    'ciencia de datos & ia': [
      'python', 'machine', 'learning', 'sql', 'power bi', 'powerbi', 'pandas', 'tensorflow',
      'analítica', 'datos', 'ia', 'ai', 'data science', 'data', 'inteligencia artificial', 'bi'
    ],
    'aseguramiento de calidad (qa)': [
      'jest', 'cypress', 'selenium', 'pruebas', 'qa', 'junit', 'testing', 'calidad',
      'automatizadas', 'automation', 'tester'
    ],
    'ciberseguridad y redes': [
      'ethical hacking', 'firewalls', 'redes', 'cisco', 'pentesting', 'iso 27001',
      'ciberseguridad', 'seguridad', 'telecomunicaciones', 'network', 'hacking'
    ],
    'gestion de ti & gobernanza': [
      'scrum', 'itil', 'gestión', 'proyectos', 'cobit', 'jira', 'gobernanza', 'liderazgo',
      'project manager', 'gerencia', 'agile'
    ]
  };

  const defaultAreas: RadarDataPoint[] = [
    { area: 'desarrollo de software', affinity: 95 },
    { area: 'cloud & devops', affinity: 64 },
    { area: 'ciencia de datos & ia', affinity: 71 },
    { area: 'aseguramiento de calidad (QA)', affinity: 58 },
    { area: 'ciberseguridad y redes', affinity: 42 },
    { area: 'gestion de ti & gobernanza', affinity: 50 },
  ];

  const candidateAreas = candidate.areas && candidate.areas.length >= 6 ? candidate.areas : defaultAreas;

  let bestAreaKey = 'desarrollo de software';
  let maxScore = -1;

  for (const item of candidateAreas) {
    const areaKey = item.area.toLowerCase();
    const candidateBaseAffinity = item.affinity;
    const keywords = areaKeywords[areaKey] || [];

    let queryMatches = 0;
    if (query.length > 0) {
      for (const kw of keywords) {
        if (query.includes(kw.toLowerCase())) {
          queryMatches += 1;
        }
      }
    }

    const skillMatches = candidate.skills
      ? candidate.skills.filter((skill) =>
          keywords.some((kw) => skill.toLowerCase().includes(kw) || kw.includes(skill.toLowerCase()))
        ).length
      : 0;

    const queryBoost = queryMatches > 0 ? queryMatches * 50 + 100 : 0;
    const totalAreaScore = candidateBaseAffinity + skillMatches * 10 + queryBoost;

    if (totalAreaScore > maxScore) {
      maxScore = totalAreaScore;
      bestAreaKey = areaKey;
    }
  }

  switch (bestAreaKey) {
    case 'ciberseguridad y redes':
      if (query.includes('red') || query.includes('telecom')) {
        return 'Redes y Telecomunicaciones';
      }
      if (query.includes('ciber') || query.includes('hack') || query.includes('seguridad')) {
        return 'Ciberseguridad';
      }
      return 'Ciberseguridad y Redes';

    case 'aseguramiento de calidad (qa)':
      if (query.includes('qa') || query.includes('test') || query.includes('prueba')) {
        return 'QA & Testing';
      }
      return 'Aseguramiento de Calidad (QA)';

    case 'ciencia de datos & ia':
      if (query.includes('python') || query.includes('ia') || query.includes('ai') || query.includes('dato') || query.includes('data')) {
        return 'Datos & IA';
      }
      return 'Ciencia de Datos & IA';

    case 'desarrollo de software':
      if (query.includes('backend') || query.includes('api') || query.includes('microserv')) {
        return 'Desarrollo Backend & Arquitectura';
      }
      if (query.includes('front') || query.includes('ux') || query.includes('ui') || query.includes('react')) {
        return 'Desarrollo Frontend & UX';
      }
      return 'Desarrollo de Software';

    case 'cloud & devops':
      return 'Cloud & DevOps';

    case 'gestion de ti & gobernanza':
      return 'Gestión de TI & Gobernanza';

    default:
      return 'Desarrollo de Software';
  }
}
