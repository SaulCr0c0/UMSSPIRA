/// <reference types="jest" />
import { decideAccess, homeFor } from "./route-access";

describe("decideAccess", () => {
  it("sin sesión redirige al login en el panel y en el área personal (CA-05.1)", () => {
    expect(decideAccess("/applications", undefined, undefined)).toEqual({
      allowed: false,
      redirectTo: "/login",
    });
    expect(decideAccess("/me", undefined, undefined)).toEqual({
      allowed: false,
      redirectTo: "/login",
    });
  });

  it("el titulado no entra al panel administrativo (CA-05.5)", () => {
    expect(decideAccess("/applications", "token", "titulado")).toEqual({
      allowed: false,
      redirectTo: "/me",
    });
  });

  it("una sesión sin rol tampoco entra al panel", () => {
    expect(decideAccess("/applications", "token", undefined)).toEqual({
      allowed: false,
      redirectTo: "/me",
    });
  });

  it("el administrador entra al panel", () => {
    expect(decideAccess("/applications", "token", "administrador")).toEqual({ allowed: true });
  });

  it("el titulado entra a su área personal", () => {
    expect(decideAccess("/me", "token", "titulado")).toEqual({ allowed: true });
  });

  it("cada rol vuelve a su pantalla al visitar el login con sesión activa", () => {
    expect(homeFor("administrador")).toBe("/applications");
    expect(homeFor("empresa")).toBe("/companies");
    expect(homeFor("titulado")).toBe("/portal");
    expect(homeFor(undefined)).toBe("/me");
  });
});