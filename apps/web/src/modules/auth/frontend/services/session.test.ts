/// <reference types="jest" />
import { clearSession, saveSession } from "./session";

describe("sesión segura", () => {
  const originalFetch = global.fetch;
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;
  });

  afterEach(async () => {
    await clearSession();
    global.fetch = originalFetch;
  });
  it("borra la sesión al cerrarla", () => {
    saveSession("token-de-prueba", "titulado", true);
    window.sessionStorage.setItem("umsspira.access-token", "token-de-prueba");

  it("envía el token y rol al servidor para guardarlos como cookies HttpOnly", async () => {
    await saveSession("token-de-prueba", "administrador", false);

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/session", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ token: "token-de-prueba", role: "administrador", remember: false }),
    }));
    expect(document.cookie).not.toContain("umsspira_token");
    expect(document.cookie).not.toContain("umsspira_role");
    expect(window.localStorage.getItem("token")).toBeNull();
    expect(window.sessionStorage.getItem("umsspira.access-token")).toBeNull();
  });

  it("replica el token en localStorage para la Epic 4", () => {
    saveSession("token-de-prueba", "empresa", false);

    expect(window.localStorage.getItem("token")).toBe("token-de-prueba");
  });

  it("solicita al servidor borrar las cookies HttpOnly al cerrar sesión", async () => {
    await clearSession();
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/session", { method: "DELETE" });
  });
});