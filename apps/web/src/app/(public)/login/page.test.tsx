import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import LoginPage from './page';
import { getAccessToken } from '@/shared/services/auth-session';

const replace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

beforeEach(() => {
  jest.resetAllMocks();
  window.sessionStorage.clear();
});

it('activa el acceso de prueba y salta directamente a la pantalla de áreas', async () => {
  render(<LoginPage />);

  await waitFor(() => expect(replace).toHaveBeenCalledWith('/mentorias/perfil/areas'));
  expect(getAccessToken()).toBe('umsspira-local-mentor-test-only');
});

it('no habilita el token de prueba fuera de desarrollo', async () => {
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    render(<LoginPage />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/mentorias/perfil'));
    expect(getAccessToken()).toBeNull();
  } finally {
    process.env.NODE_ENV = originalNodeEnv;
  }
});
