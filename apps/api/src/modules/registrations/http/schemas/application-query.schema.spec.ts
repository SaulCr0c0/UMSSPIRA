import { applicationQuerySchema } from './registrations.schemas';
 
describe('applicationQuerySchema', () => {
  it('usa la página 1 y 15 filas por defecto', () => {
    const parsed = applicationQuerySchema.parse({});
 
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(15);
  });
 
  it.each(['10', '15', '25', '50'])('acepta %s filas por página como texto de la URL (CA-08.2)', (size) => {
    const parsed = applicationQuerySchema.parse({ pageSize: size });
 
    expect(parsed.pageSize).toBe(Number(size));
  });
 
  it.each(['0', '5', '20', '99', 'abc'])('rechaza %s filas por página', (size) => {
    expect(applicationQuerySchema.safeParse({ pageSize: size }).success).toBe(false);
  });
 
  it('rechaza una página menor a 1', () => {
    expect(applicationQuerySchema.safeParse({ page: '0' }).success).toBe(false);
  });
 
  it('recorta los espacios de la búsqueda y de la carrera (CA-08.3)', () => {
    const parsed = applicationQuerySchema.parse({ search: '  rojas  ', career: ' Sistemas ' });
 
    expect(parsed.search).toBe('rojas');
    expect(parsed.career).toBe('Sistemas');
  });
 
  it('acepta solo los estados definidos', () => {
    expect(applicationQuerySchema.safeParse({ status: 'PENDING' }).success).toBe(true);
    expect(applicationQuerySchema.safeParse({ status: 'pendiente' }).success).toBe(false);
  });
 
  it('rechaza parámetros desconocidos', () => {
    expect(applicationQuerySchema.safeParse({ unknown: 'x' }).success).toBe(false);
  });
});
 
