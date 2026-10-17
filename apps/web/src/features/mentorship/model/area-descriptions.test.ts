import { getAreaDescription } from './area-descriptions';

it('usa la descripción enviada por el backend cuando existe', () => {
  expect(getAreaDescription('DevOps', 'Descripción del catálogo')).toBe('Descripción del catálogo');
});

it('usa la descripción de respaldo si el backend no la envía', () => {
  expect(getAreaDescription('DevOps')).toBe('Integración continua, despliegue e infraestructura');
  expect(getAreaDescription('Bases de Datos', null)).toBe('Diseño, modelado y consultas');
  expect(getAreaDescription('Desarrollo Web', '   ')).toBe('Aplicaciones web, frontend y backend');
});

it('reconoce el nombre del área sin importar mayúsculas, tildes ni espacios', () => {
  expect(getAreaDescription('  CIENCIA DE DATOS ')).toBe('Análisis de datos, estadística y aprendizaje automático');
  expect(getAreaDescription('Gestión de proyectos')).toBe('Metodologías ágiles y planificación de proyectos');
});

it('devuelve un texto vacío para un área desconocida', () => {
  expect(getAreaDescription('Área nueva')).toBe('');
});
