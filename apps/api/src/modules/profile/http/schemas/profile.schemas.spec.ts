import { experienceSchema } from './profile.schemas';

const base = { empresa: 'Jalasoft', cargo: 'Desarrollador Backend' };

function messages(data: object): string[] {
  const result = experienceSchema.safeParse({ ...base, ...data });
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe('Fecha mínima de experiencia laboral (BUG-HU2-008)', () => {
  it('rechaza fechas de inicio y fin anteriores a 1950', () => {
    expect(messages({ fechaInicio: '1780-12-21', fechaFin: '1789-11-21' })).toEqual([
      'La fecha no puede ser anterior a 1950',
      'La fecha no puede ser anterior a 1950',
    ]);
  });

  it('acepta fechas desde el 01/01/1950', () => {
    expect(messages({ fechaInicio: '1950-01-01', fechaFin: '2023-06-30' })).toEqual([]);
  });

  it('acepta un trabajo actual sin fecha de fin', () => {
    expect(messages({ fechaInicio: '2020-03-01', fechaFin: null })).toEqual([]);
  });
});
