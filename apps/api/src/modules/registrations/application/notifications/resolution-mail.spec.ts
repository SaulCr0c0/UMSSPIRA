import { buildResolutionMail } from './resolution-mail';

const base = {
  applicationId: '0b0f6b0e-6a43-4c53-9a0e-2f8f7d6c9a11',
  fullName: 'María Pérez',
};

describe('buildResolutionMail', () => {
  it('informa la activación con el código y sin código TIT', () => {
    const mail = buildResolutionMail({ ...base, decision: 'APPROVED', code: '123456' });
    expect(mail.type).toBe('aprobacion');
    expect(mail.text).toContain('123456');
    expect(mail.text).toContain(base.applicationId);
    expect(mail.text).toContain('24 horas');
    expect(mail.text).not.toContain('TIT-');
  });

  it('exige el código para un dictamen aprobado', () => {
    expect(() => buildResolutionMail({ ...base, decision: 'APPROVED' })).toThrow();
  });

  it('muestra categoría y explicación de una observación, y el enlace solo si existe', () => {
    const input = {
      ...base,
      decision: 'OBSERVED' as const,
      category: 'Documento ilegible',
      note: 'Sube una copia más nítida del certificado',
    };
    const without = buildResolutionMail(input);
    expect(without.type).toBe('observacion');
    expect(without.text).toContain('Documento ilegible');
    expect(without.text).toContain('Sube una copia más nítida del certificado');
    expect(without.text).not.toContain('https://');
    const withLink = buildResolutionMail({ ...input, correctionUrl: 'https://umsspira.test/c/1' });
    expect(withLink.text).toContain('https://umsspira.test/c/1');
  });

  it('explica el motivo de un rechazo y la posibilidad de un nuevo registro', () => {
    const mail = buildResolutionMail({
      ...base,
      decision: 'REJECTED',
      category: 'Datos no coinciden',
      note: 'El C.I. no corresponde al certificado',
    });
    expect(mail.type).toBe('rechazo');
    expect(mail.text).toContain('Datos no coinciden');
    expect(mail.text).toContain('nuevo registro');
    expect(mail.text).not.toContain('TIT-');
  });
});