import { render, screen } from "@testing-library/react";
import { PortalSiteHeader } from "./portal-site-header";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/portal",
  useSearchParams: () => new URLSearchParams(),
}));

describe("PortalSiteHeader", () => {
  it("el logo enlaza a la pagina de inicio", () => {
    render(<PortalSiteHeader />);
    const logo = screen.getByRole("link", { name: /umsspira/i });
    expect(logo).toHaveAttribute("href", "/portal");
  });
});