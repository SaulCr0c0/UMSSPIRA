import { render, screen } from "@testing-library/react";
import { PortalSiteHeader } from "./portal-site-header";

const mockUsePathname = jest.fn((): string | null => null);

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("PortalSiteHeader", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue(null);
    sessionStorage.clear();
    localStorage.clear();
  });

  it("mantiene el encabezado anterior si la ruta aún no está disponible", () => {
    render(<PortalSiteHeader />);
    const logo = screen.getByRole("link", { name: /umsspira/i });
    expect(logo).toHaveAttribute("href", "/portal");
  });

  it("mantiene el encabezado anterior en las demás páginas del portal", () => {
    mockUsePathname.mockReturnValue("/portal/comunidad");
    render(<PortalSiteHeader />);
    expect(screen.getByRole("link", { name: /umsspira/i })).toHaveAttribute("href", "/portal");
    expect(screen.queryByRole("link", { name: "Iniciar sesión" })).not.toBeInTheDocument();
  });

  it.each(["/portal/institucional", "/portal/institucional/"])(
    "no renderiza encabezado en %s para evitar la doble cabecera",
    (pathname) => {
      mockUsePathname.mockReturnValue(pathname);
      const { container } = render(<PortalSiteHeader />);
      expect(container).toBeEmptyDOMElement();
    },
  );
});