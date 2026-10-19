import { assertDemoEnvironment } from '../scripts/seed/demo-environment';

describe('Destino del seed de demostración', () => {
  it.each(['production', undefined])('rechaza APP_ENV=%s', (APP_ENV) => {
    expect(() => assertDemoEnvironment({ APP_ENV })).toThrow('no se permite en producción');
  });

  it.each(['epic', 'dev', 'test'])('permite el destino explícito %s', (APP_ENV) => {
    expect(() => assertDemoEnvironment({ APP_ENV })).not.toThrow();
  });
});
