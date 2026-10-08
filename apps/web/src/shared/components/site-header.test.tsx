import { render, screen } from "@testing-library/react";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("el logo enlaza a la pagina de inicio", () => {
    render(<SiteHeader />);
    const logo = screen.getByRole("link", { name: /umsspira/i });
    expect(logo).toHaveAttribute("href", "/");
  });
});