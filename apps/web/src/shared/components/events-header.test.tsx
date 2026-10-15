import { fireEvent, render, screen } from '@testing-library/react';
import { EventsHeader } from './events-ui';

jest.mock('next/navigation', () => ({ usePathname: () => '/events' }));

describe('EventsHeader', () => {
  it('muestra la navegación propia de eventos sin depender del navbar compartido', () => {
    render(
      <EventsHeader>
        <p>Contenido de eventos</p>
      </EventsHeader>,
    );

    expect(screen.getByText('Contenido de eventos').parentElement)
      .toHaveClass('events-app');
    fireEvent.click(screen.getByRole('button', { name: /Eventos/ }));

    expect(screen.getByRole('menuitem', { name: 'Gestión de eventos' }))
      .toHaveAttribute('href', '/events');
    expect(screen.getByRole('menuitem', { name: 'Crear evento' }))
      .toHaveAttribute('href', '/events/create');
    expect(screen.getByRole('menuitem', { name: 'Borradores' }))
      .toHaveAttribute('href', '/events/drafts');
    expect(screen.queryByRole('menuitem', { name: 'Catálogo de eventos' }))
      .not.toBeInTheDocument();
  });
});
