import { isUnauthorizedStatus } from './mentor-error';

describe('isUnauthorizedStatus', () => {
  it('devuelve true si el objeto tiene status 401', () => {
    expect(isUnauthorizedStatus({ status: 401 })).toBe(true);
    expect(isUnauthorizedStatus(Object.assign(new Error('Sesión vencida'), { status: 401 }))).toBe(true);
  });

  it('devuelve false para estados diferentes a 401 o errores sin status', () => {
    expect(isUnauthorizedStatus({ status: 403 })).toBe(false);
    expect(isUnauthorizedStatus({ status: 404 })).toBe(false);
    expect(isUnauthorizedStatus({ status: 500 })).toBe(false);
    expect(isUnauthorizedStatus(new Error('Fallo de red'))).toBe(false);
    expect(isUnauthorizedStatus(new TypeError('Failed to fetch'))).toBe(false);
    expect(isUnauthorizedStatus(null)).toBe(false);
    expect(isUnauthorizedStatus(undefined)).toBe(false);
    expect(isUnauthorizedStatus('error')).toBe(false);
  });
});
