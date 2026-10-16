/**
 * Descripciones de respaldo de las áreas técnicas (mockup HU 6.3).
 * La tabla `area` todavía no tiene columna `descripcion`; cuando el backend la envíe,
 * esa descripción tiene prioridad y este catálogo deja de usarse.
 */
const AREA_DESCRIPTIONS: Record<string, string> = {
  'desarrollo web': 'Aplicaciones web, frontend y backend',
  backend: 'Servicios, APIs y lógica de servidor',
  frontend: 'Interfaces web y experiencia de usuario',
  devops: 'Integración continua, despliegue e infraestructura',
  'bases de datos': 'Diseño, modelado y consultas',
  'ciencia de datos': 'Análisis de datos, estadística y aprendizaje automático',
  'inteligencia artificial': 'Aprendizaje automático y modelos de IA',
  ciberseguridad: 'Seguridad de aplicaciones, redes y datos',
  redes: 'Configuración, protocolos y administración de redes',
  'arquitectura de software': 'Patrones, diseño de sistemas y microservicios',
  'gestion de proyectos': 'Metodologías ágiles y planificación de proyectos',
};

function normalizeAreaName(name: string): string {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLocaleLowerCase('es');
}

/** Devuelve la descripción del backend o, si no llega, la del catálogo de respaldo. */
export function getAreaDescription(name: string, apiDescription?: string | null): string {
  const fromApi = typeof apiDescription === 'string' ? apiDescription.trim() : '';
  return fromApi || AREA_DESCRIPTIONS[normalizeAreaName(name)] || '';
}
