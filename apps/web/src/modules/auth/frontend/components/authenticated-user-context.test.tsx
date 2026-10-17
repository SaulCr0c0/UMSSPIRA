import { render, screen, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';

import {
  AuthenticatedUserSessionProvider,
  useAuthenticatedUserId,
} from './authenticated-user-context';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

function UserId() {
  return <p>{useAuthenticatedUserId() ?? 'sin usuario'}</p>;
}

describe('AuthenticatedUserSessionProvider', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = 'umsspira_token=test-token; path=/';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    document.cookie = 'umsspira_token=; path=/; max-age=0';
  });

  it('obtiene el identificador autenticado para las rutas administrativas de eventos', async () => {
    jest.mocked(usePathname).mockReturnValue('/events/create');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { id: 'admin-user-id', role: 'administrador' },
      }),
    }) as jest.Mock;

    render(
      <AuthenticatedUserSessionProvider>
        <UserId />
      </AuthenticatedUserSessionProvider>,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Verificando la sesión administrativa',
    );
    expect(await screen.findByText('admin-user-id')).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/me'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-token' },
      }),
    );
  });

  it('no exige una sesión administrativa para consultar el catálogo', async () => {
    jest.mocked(usePathname).mockReturnValue('/events/catalog');
    global.fetch = jest.fn();

    render(
      <AuthenticatedUserSessionProvider>
        <UserId />
      </AuthenticatedUserSessionProvider>,
    );

    expect(screen.getByText('sin usuario')).toBeInTheDocument();
    await waitFor(() => expect(global.fetch).not.toHaveBeenCalled());
  });
});
