import { render, screen } from "@testing-library/react";

import { AdminNavbar } from "./admin-navbar";

describe("AdminNavbar", () => {
  it("mantiene Solicitudes, ofrece el perfil profesional y ya no enlaza /me", () => {
    render(<AdminNavbar />);

    expect(screen.getByRole("link", { name: "Solicitudes" })).toHaveAttribute("href", "/applications");
    expect(screen.queryByRole("link", { name: "Mi perfil" })).not.toBeInTheDocument();
expect(document.querySelector('a[href="/me"]')).toBeNull();
    expect(screen.getByRole("link", { name: "Mi perfil profesional" })).toHaveAttribute("href", "/profile");
  });
});
